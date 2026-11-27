/**
 * The monthly usage cycle of a yearly plan. Limits are per month, so a yearly
 * plan that started on the 28th counts from the 28th of one month to the 27th
 * of the next. The cycle is the one containing `now`: before the start day it
 * is last month's, never a cycle that starts in the future (which would count
 * nothing and leave the limit unenforced for most of the month).
 */
export function yearlyPlanCycle(
  startsAt: Date,
  now: Date = new Date()
): { start: Date; end: Date } {
  const day = startsAt.getUTCDate();
  const at = (year: number, month: number) =>
    // Clamped to the month's last day: a plan started on the 31st has a
    // 30-day April cycle that starts on April 30, not May 1.
    new Date(
      Date.UTC(
        year,
        month,
        Math.min(day, new Date(Date.UTC(year, month + 1, 0)).getUTCDate())
      )
    );
  let start = at(now.getUTCFullYear(), now.getUTCMonth());
  if (start > now) {
    start = at(now.getUTCFullYear(), now.getUTCMonth() - 1);
  }
  const next = at(start.getUTCFullYear(), start.getUTCMonth() + 1);
  return { start, end: new Date(next.getTime() - 1) };
}
