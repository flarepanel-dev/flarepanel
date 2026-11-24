import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import type { Logger } from '../../../logger';
import {
  CHAT_BURST_LIMIT,
  CHAT_MESSAGES_PER_DAY,
} from '../assistant.constants';
import {
  type ChatLimitStore,
  chatCostMicros,
  chatMonthlyBudgetMicros,
  checkChatLimits,
  readChatUsageToday,
  recordChatSpend,
  resolveChatTier,
} from './limits';

const NOW = new Date('2026-10-20T10:00:00Z');
const FUTURE = new Date('2036-01-01T00:00:00Z');
const PAST = new Date('2020-01-01T00:00:00Z');

function organization(
  overrides: Partial<Parameters<typeof resolveChatTier>[0]> = {}
) {
  return {
    subscriptionStatus: 'active',
    subscriptionCanceledAt: null,
    subscriptionEndsAt: FUTURE,
    subscriptionPauseAtPeriodEnd: false,
    subscriptionPeriodEventsLimit: 10_000,
    ...overrides,
  };
}

describe('resolveChatTier', () => {
  // The test preload pins SELF_HOSTED=true; the Cloud bands need it off.
  let selfHostedEnv: string | undefined;
  beforeAll(() => {
    selfHostedEnv = process.env.SELF_HOSTED;
    process.env.SELF_HOSTED = 'false';
  });
  afterAll(() => {
    process.env.SELF_HOSTED = selfHostedEnv;
  });

  test('self-hosted installs are unlimited whatever the billing rows say', () => {
    expect(
      resolveChatTier(organization({ subscriptionStatus: null }), true)
    ).toBe('unlimited');
  });

  test('trials and blocked billing states', () => {
    expect(
      resolveChatTier(organization({ subscriptionStatus: 'trialing' }), false)
    ).toBe('trial');
    expect(
      resolveChatTier(
        organization({ subscriptionStatus: null, subscriptionEndsAt: PAST }),
        false
      )
    ).toBe('blocked');
    expect(
      resolveChatTier(organization({ subscriptionStatus: 'canceled' }), false)
    ).toBe('blocked');
    expect(
      resolveChatTier(organization({ subscriptionStatus: 'past_due' }), false)
    ).toBe('starter');
  });

  test('paid plans band by their event limit', () => {
    expect(resolveChatTier(organization(), false)).toBe('starter');
    expect(
      resolveChatTier(
        organization({ subscriptionPeriodEventsLimit: 100_000 }),
        false
      )
    ).toBe('starter');
    expect(
      resolveChatTier(
        organization({ subscriptionPeriodEventsLimit: 250_000 }),
        false
      )
    ).toBe('growth');
    expect(
      resolveChatTier(
        organization({ subscriptionPeriodEventsLimit: 5_000_000 }),
        false
      )
    ).toBe('scale');
  });
});

class MemoryStore implements ChatLimitStore {
  values = new Map<string, number>();
  expiries = new Map<string, number>();
  failing = false;

  get(key: string) {
    const value = this.values.get(key);
    return Promise.resolve(value === undefined ? null : String(value));
  }
  increment(key: string, windowMs: number) {
    if (this.failing) {
      return Promise.reject(new Error('store down'));
    }
    const next = (this.values.get(key) ?? 0) + 1;
    this.values.set(key, next);
    // Like the real stores: the window opens on the first hit.
    if (!this.expiries.has(key)) {
      this.expiries.set(key, windowMs);
    }
    return Promise.resolve({ count: next, ttlMs: this.expiries.get(key) ?? 0 });
  }
  set(key: string, value: string, ttlMs?: number) {
    this.values.set(key, Number(value));
    if (ttlMs !== undefined) {
      this.expiries.set(key, ttlMs);
    }
    return Promise.resolve();
  }
}

const silentLogger: Logger = {
  fatal: () => undefined,
  error: () => undefined,
  warn: () => undefined,
  info: () => undefined,
  debug: () => undefined,
  trace: () => undefined,
  child: () => silentLogger,
};

function deps(store: MemoryStore) {
  return { stores: { coordination: store }, logger: silentLogger };
}

describe('checkChatLimits', () => {
  test('a blocked workspace is refused without touching the store', async () => {
    const store = new MemoryStore();
    const refusal = await checkChatLimits(deps(store), {
      organizationId: 'org',
      userId: 'user',
      tier: 'blocked',
      now: NOW,
    });
    expect(refusal?.reason).toBe('blocked');
    expect(store.values.size).toBe(0);
  });

  test('the daily cap counts per workspace and resets at midnight UTC', async () => {
    const store = new MemoryStore();
    const cap = CHAT_MESSAGES_PER_DAY.trial ?? 0;
    for (let turn = 0; turn < cap; turn += 1) {
      const refusal = await checkChatLimits(deps(store), {
        organizationId: 'org',
        userId: `user-${turn}`,
        tier: 'trial',
        now: NOW,
      });
      expect(refusal).toBeNull();
    }
    const refusal = await checkChatLimits(deps(store), {
      organizationId: 'org',
      userId: 'late',
      tier: 'trial',
      now: NOW,
    });
    expect(refusal?.reason).toBe('daily');
    expect(refusal?.limit).toBe(cap);
    expect(refusal?.resetsAt).toBe('2026-10-21T00:00:00.000Z');
    expect(await readChatUsageToday(store, 'org', NOW)).toBe(cap + 1);
    // The day key expires at midnight, not a fixed 24h after the first hit.
    expect(store.expiries.get('chat:day:org:2026-10-20')).toBe(
      14 * 60 * 60 * 1000
    );
  });

  test('the burst window refuses before a daily slot is consumed', async () => {
    const store = new MemoryStore();
    for (let turn = 0; turn < CHAT_BURST_LIMIT.max; turn += 1) {
      await checkChatLimits(deps(store), {
        organizationId: 'org',
        userId: 'user',
        tier: 'scale',
        now: NOW,
      });
    }
    const refusal = await checkChatLimits(deps(store), {
      organizationId: 'org',
      userId: 'user',
      tier: 'scale',
      now: NOW,
    });
    expect(refusal?.reason).toBe('burst');
    expect(await readChatUsageToday(store, 'org', NOW)).toBe(
      CHAT_BURST_LIMIT.max
    );
  });

  test('unlimited tiers only pay the burst guard', async () => {
    const store = new MemoryStore();
    const refusal = await checkChatLimits(deps(store), {
      organizationId: 'org',
      userId: 'user',
      tier: 'unlimited',
      now: NOW,
    });
    expect(refusal).toBeNull();
    expect(await readChatUsageToday(store, 'org', NOW)).toBe(0);
  });

  test('a store outage lets the turn through', async () => {
    const store = new MemoryStore();
    store.failing = true;
    const refusal = await checkChatLimits(deps(store), {
      organizationId: 'org',
      userId: 'user',
      tier: 'starter',
      now: NOW,
    });
    expect(refusal).toBeNull();
  });
});

describe('monthly AI budget', () => {
  test('is a tenth of the plan price, at least $1; none when self-hosted', () => {
    expect(chatMonthlyBudgetMicros('trial', 1_000_000)).toBe(1_000_000);
    // 10K plan ($3): the $1 floor.
    expect(chatMonthlyBudgetMicros('starter', 10_000)).toBe(1_000_000);
    // 1M plan ($45): $4.50.
    expect(chatMonthlyBudgetMicros('growth', 1_000_000)).toBe(4_500_000);
    // 50M plan ($450): $45.
    expect(chatMonthlyBudgetMicros('scale', 50_000_000)).toBe(45_000_000);
    expect(chatMonthlyBudgetMicros('unlimited', 1_000_000)).toBeNull();
    expect(chatMonthlyBudgetMicros('blocked', 1_000_000)).toBeNull();
  });

  test('prices a turn from its tokens; unknown models as the dearest', () => {
    // 20K in, 1K out on GPT-6.1 Sol ($2 / $10 per 1M): $0.05.
    expect(chatCostMicros('gpt-6.1-sol', 20_000, 1000)).toBe(50_000);
    expect(chatCostMicros('some-new-model', 1_000_000, 0)).toBe(5_000_000);
    expect(chatCostMicros('gpt-6.1-sol', undefined, undefined)).toBe(0);
  });

  test('refuses once the month is spent, and starts over next month', async () => {
    const store = new MemoryStore();
    const now = new Date('2026-11-24T10:00:00Z');
    const input = {
      organizationId: 'org',
      userId: 'u1',
      tier: 'growth' as const,
      budgetMicros: 100_000,
      now,
    };
    expect(await checkChatLimits(deps(store), input)).toBeNull();
    // Two Sol turns of $0.05 use the $0.10 budget.
    for (let i = 0; i < 2; i++) {
      await recordChatSpend(deps(store), {
        organizationId: 'org',
        modelId: 'gpt-6.1-sol',
        inputTokens: 20_000,
        outputTokens: 1000,
        now,
      });
    }
    const refused = await checkChatLimits(deps(store), {
      ...input,
      userId: 'u2',
    });
    expect(refused).toMatchObject({
      reason: 'monthly',
      resetsAt: '2026-12-01T00:00:00.000Z',
    });
    expect(
      await checkChatLimits(deps(store), {
        ...input,
        userId: 'u3',
        now: new Date('2026-12-01T00:00:01Z'),
      })
    ).toBeNull();
  });
});
