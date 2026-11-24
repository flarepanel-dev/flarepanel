import { PRICING } from '@flarepanel/payments/prices';
import {
  getSubscriptionState,
  type SubscriptionStateInput,
  subscriptionBlocksDashboard,
} from '@flarepanel/payments/subscription-state';
import type { CoordinationStore } from '@flarepanel/platform';
import type { Logger } from '../../../logger';
import {
  CHAT_BURST_LIMIT,
  CHAT_MESSAGES_PER_DAY,
  CHAT_MODEL_PRICES,
  CHAT_MONTHLY_BUDGET_MIN_USD,
  CHAT_MONTHLY_BUDGET_SHARE,
  CHAT_TIER_EVENT_BANDS,
  type ChatLimitError,
  type ChatTier,
} from '../assistant.constants';

const SECOND = 1000;
const DAY_MS = 24 * 60 * 60 * SECOND;
const DATE_LENGTH = 'YYYY-MM-DD'.length;

const TIER_LABELS: Record<ChatTier, string> = {
  trial: 'free trial',
  starter: 'Starter',
  growth: 'Growth',
  scale: 'Scale',
  unlimited: 'self-hosted',
  blocked: 'inactive',
};

export type ChatTierInput = SubscriptionStateInput & {
  subscriptionPeriodEventsLimit: number;
};

export function resolveChatTier(
  organization: ChatTierInput,
  selfHosted: boolean
): ChatTier {
  if (selfHosted) {
    return 'unlimited';
  }
  const state = getSubscriptionState(organization);
  if (state === 'self_hosted') {
    return 'unlimited';
  }
  if (state === 'trialing') {
    return 'trial';
  }
  if (subscriptionBlocksDashboard(state)) {
    return 'blocked';
  }
  const events = organization.subscriptionPeriodEventsLimit;
  if (events <= CHAT_TIER_EVENT_BANDS.starter) {
    return 'starter';
  }
  if (events <= CHAT_TIER_EVENT_BANDS.growth) {
    return 'growth';
  }
  return 'scale';
}

/** The subset of the coordination store the counters need; narrow so tests can stub it. */
export type ChatLimitStore = Pick<
  CoordinationStore,
  'get' | 'increment' | 'set'
>;

export interface ChatLimitDeps {
  stores: { coordination: ChatLimitStore };
  logger: Logger;
}

export interface ChatLimitInput {
  organizationId: string;
  userId: string;
  tier: ChatTier;
  /** The month's AI budget in micro-dollars; null or absent is none. */
  budgetMicros?: number | null;
  now?: Date;
}

const MICROS_PER_USD = 1_000_000;
const MONTH_TTL_MS = 32 * DAY_MS;
const MOST_EXPENSIVE = Object.values(CHAT_MODEL_PRICES).reduce((max, price) =>
  price.output > max.output ? price : max
);

const spendKey = (organizationId: string, now: Date) =>
  `chat:spend:${organizationId}:${now.toISOString().slice(0, 7)}`;

/**
 * The month's AI budget for a workspace, in micro-dollars: a share of its
 * plan's price, at least the minimum. Null when there is no budget
 * (self-hosted) or no AI at all (blocked).
 */
export function chatMonthlyBudgetMicros(
  tier: ChatTier,
  eventsLimit: number
): number | null {
  if (tier === 'unlimited' || tier === 'blocked') {
    return null;
  }
  const plan =
    tier === 'trial'
      ? undefined
      : (PRICING.find((price) => price.events >= eventsLimit) ??
        PRICING.at(-1));
  const usd = Math.max(
    CHAT_MONTHLY_BUDGET_MIN_USD,
    (plan?.price ?? 0) * CHAT_MONTHLY_BUDGET_SHARE
  );
  return Math.round(usd * MICROS_PER_USD);
}

/** What a model call cost, in micro-dollars, from its token counts. */
export function chatCostMicros(
  modelId: string,
  inputTokens: number | undefined,
  outputTokens: number | undefined
): number {
  const price = CHAT_MODEL_PRICES[modelId] ?? MOST_EXPENSIVE;
  // USD per 1M tokens is micro-dollars per token.
  return Math.ceil(
    (inputTokens ?? 0) * price.input + (outputTokens ?? 0) * price.output
  );
}

/** Adds a finished turn's cost to the workspace's month. */
export async function recordChatSpend(
  deps: ChatLimitDeps,
  input: {
    organizationId: string;
    modelId: string;
    inputTokens: number | undefined;
    outputTokens: number | undefined;
    now?: Date;
  }
): Promise<void> {
  const now = input.now ?? new Date();
  const cost = chatCostMicros(
    input.modelId,
    input.inputTokens,
    input.outputTokens
  );
  if (cost <= 0) {
    return;
  }
  const key = spendKey(input.organizationId, now);
  const spent = Number((await deps.stores.coordination.get(key)) ?? 0) || 0;
  await deps.stores.coordination.set(key, String(spent + cost), MONTH_TTL_MS);
}

/** The month's AI spend so far, in micro-dollars. */
export async function chatSpentMicros(
  deps: ChatLimitDeps,
  organizationId: string,
  now = new Date()
): Promise<number> {
  return (
    Number(
      (await deps.stores.coordination.get(spendKey(organizationId, now))) ?? 0
    ) || 0
  );
}

function nextMonthStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

function monthlyError(tier: ChatTier, now: Date): ChatLimitError {
  return {
    code: 'chat_limit',
    reason: 'monthly',
    tier,
    limit: 0,
    resetsAt: nextMonthStart(now).toISOString(),
    message: `This month's AI assistant allowance on the ${TIER_LABELS[tier]} plan is used up. It renews on the 1st (UTC); a larger plan includes more.`,
  };
}

const dayKey = (organizationId: string, now: Date) =>
  `chat:day:${organizationId}:${now.toISOString().slice(0, DATE_LENGTH)}`;
const burstKey = (userId: string) => `chat:burst:${userId}`;

function nextUtcMidnight(now: Date): Date {
  return new Date(Math.floor(now.getTime() / DAY_MS) * DAY_MS + DAY_MS);
}

/** Fixed window: the first hit opens it; the store re-arms a counter that lost its expiry, so it cannot lock a caller out for good. */
async function countHit(
  store: ChatLimitStore,
  key: string,
  windowMs: number
): Promise<{ hits: number; ttlMs: number }> {
  const { count, ttlMs } = await store.increment(key, windowMs);
  return { hits: count, ttlMs };
}

function blockedError(tier: ChatTier, resetsAt: Date): ChatLimitError {
  return {
    code: 'chat_limit',
    reason: 'blocked',
    tier,
    limit: 0,
    resetsAt: resetsAt.toISOString(),
    message:
      'The AI assistant is paused until the workspace has an active plan.',
  };
}

function burstError(tier: ChatTier, ttlMs: number, now: Date): ChatLimitError {
  const seconds = Math.max(1, Math.ceil(ttlMs / SECOND));
  return {
    code: 'chat_limit',
    reason: 'burst',
    tier,
    limit: CHAT_BURST_LIMIT.max,
    resetsAt: new Date(now.getTime() + ttlMs).toISOString(),
    message: `That is a lot of messages at once. You can send the next one in ${seconds} seconds.`,
  };
}

function dailyError(tier: ChatTier, limit: number, now: Date): ChatLimitError {
  return {
    code: 'chat_limit',
    reason: 'daily',
    tier,
    limit,
    resetsAt: nextUtcMidnight(now).toISOString(),
    message: `Today's ${limit} AI messages on the ${TIER_LABELS[tier]} plan are used up. The limit resets at midnight UTC.`,
  };
}

/**
 * Counts one user turn and answers with the refusal to send, or `null` when
 * the turn may run. The burst window is checked first so a refused burst does
 * not consume a daily slot. A store failure lets the turn through: this guards
 * spend, not access.
 */
export async function checkChatLimits(
  deps: ChatLimitDeps,
  input: ChatLimitInput
): Promise<ChatLimitError | null> {
  const now = input.now ?? new Date();
  const { tier } = input;
  if (tier === 'blocked') {
    return blockedError(tier, now);
  }
  try {
    const burst = await countHit(
      deps.stores.coordination,
      burstKey(input.userId),
      CHAT_BURST_LIMIT.windowMs
    );
    if (burst.hits > CHAT_BURST_LIMIT.max) {
      return burstError(tier, burst.ttlMs, now);
    }
    if (input.budgetMicros !== null && input.budgetMicros !== undefined) {
      const spent = await chatSpentMicros(deps, input.organizationId, now);
      if (spent >= input.budgetMicros) {
        return monthlyError(tier, now);
      }
    }
    const cap = CHAT_MESSAGES_PER_DAY[tier];
    if (cap === null) {
      return null;
    }
    const day = await countHit(
      deps.stores.coordination,
      dayKey(input.organizationId, now),
      nextUtcMidnight(now).getTime() - now.getTime()
    );
    if (day.hits > cap) {
      deps.logger.warn(
        { organizationId: input.organizationId, tier, cap, hits: day.hits },
        'chat daily limit reached'
      );
      return dailyError(tier, cap, now);
    }
    return null;
  } catch (error) {
    deps.logger.error({ err: error }, 'chat limit store unavailable');
    return null;
  }
}

/** Messages the workspace has sent today, for the billing tool. */
export async function readChatUsageToday(
  store: ChatLimitStore,
  organizationId: string,
  now = new Date()
): Promise<number> {
  const value = await store.get(dayKey(organizationId, now));
  return Number(value) || 0;
}
