import { describe, expect, it } from 'bun:test';
import { createTrialCapCounter } from './trial-cap';

describe('trial cap counter', () => {
  it('admits exactly up to the limit and not one event more', async () => {
    const counter = createTrialCapCounter(async () => 97);
    const cap = { limit: 100, others: 0 };
    let stored = 0;
    let reachedOn = 0;
    for (let i = 1; i <= 10; i += 1) {
      if (await counter.admit(cap)) {
        stored += 1;
        if (counter.settle(cap, true)) {
          reachedOn = i;
        }
      }
    }
    expect(stored).toBe(3);
    expect(reachedOn).toBe(3);
  });

  it('holds the limit when events arrive together, before any is stored', async () => {
    const counter = createTrialCapCounter(async () => 95);
    const cap = { limit: 100, others: 0 };
    const admitted = await Promise.all(
      Array.from({ length: 50 }, () => counter.admit(cap))
    );
    expect(admitted.filter(Boolean)).toHaveLength(5);
  });

  it('gives the slot back for an event that was not stored', async () => {
    const counter = createTrialCapCounter(async () => 99);
    const cap = { limit: 100, others: 0 };
    expect(await counter.admit(cap)).toBe(true);
    expect(counter.settle(cap, false)).toBe(false);
    expect(await counter.admit(cap)).toBe(true);
    expect(counter.settle(cap, true)).toBe(true);
    expect(await counter.admit(cap)).toBe(false);
  });

  it('counts the other projects of the workspace against the same limit', async () => {
    const counter = createTrialCapCounter(async () => 10);
    const cap = { limit: 100, others: 89 };
    expect(await counter.admit(cap)).toBe(true);
    expect(counter.settle(cap, true)).toBe(true);
    expect(await counter.admit(cap)).toBe(false);
  });

  it('admits nothing for a workspace without a trial', async () => {
    const counter = createTrialCapCounter(async () => 0);
    expect(await counter.admit({ limit: 0, others: 0 })).toBe(false);
  });

  it('recounts after a reset', async () => {
    let inStore = 100;
    const counter = createTrialCapCounter(async () => inStore);
    expect(await counter.admit({ limit: 100, others: 0 })).toBe(false);
    inStore = 40;
    counter.reset();
    expect(await counter.admit({ limit: 100, others: 0 })).toBe(true);
  });
});
