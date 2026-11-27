// The exact stop for a free trial, kept inside the project's event store.
// A slot is reserved before an event is stored and given back if it was not
// stored after all, so events that arrive together while a write is in flight
// cannot pass the allowance between them.
import type { ProjectEventsCap } from './project-events';

export interface TrialCapCounter {
  /** Reserves a slot. False when the allowance is used up: do not store the event. */
  admit(cap: ProjectEventsCap): Promise<boolean>;
  /**
   * Call once after every admitted event: `stored` false gives the slot back
   * (a duplicate or a filtered event). True when this event used the last slot.
   */
  settle(cap: ProjectEventsCap, stored: boolean): boolean;
  /** Forget the count (events were stored uncounted, or the store was reset). */
  reset(): void;
}

/** `countStored` is read once, then the count is kept exact in memory. */
export function createTrialCapCounter(
  countStored: () => Promise<number>
): TrialCapCounter {
  let count: number | null = null;
  let loading: Promise<number> | null = null;
  return {
    async admit(cap) {
      if (count === null) {
        loading ??= countStored();
        const loaded = await loading;
        // Only the first waiter sets it; later ones must keep its reservations.
        count ??= loaded;
        loading = null;
      }
      if (count + cap.others >= cap.limit) {
        return false;
      }
      count += 1;
      return true;
    },
    settle(cap, stored) {
      if (count === null) {
        return false;
      }
      if (!stored) {
        count -= 1;
        return false;
      }
      return count + cap.others >= cap.limit;
    },
    reset() {
      count = null;
      loading = null;
    },
  };
}
