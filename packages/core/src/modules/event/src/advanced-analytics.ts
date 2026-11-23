// Advanced analytics (opt-in): Basin SQL over the project's Iceberg table,
// for history older than the Durable Object keeps and for projects too large
// to scan there. Off unless the install turns it on; every query is checked
// against a monthly scan budget, so nobody is billed by surprise.

export class AdvancedAnalyticsBudgetError extends Error {
  constructor(
    readonly usedBytes: number,
    readonly budgetBytes: number
  ) {
    super('The monthly advanced analytics budget is used up');
  }
}

export interface AdvancedAnalyticsUsage {
  /** `YYYY-MM`, UTC. */
  month: string;
  usedBytes: number;
  budgetBytes: number;
}

export interface AdvancedAnalytics {
  /** `namespace.table` of the events table. */
  table: string;
  /** Epoch ms: events before this are no longer in the Durable Objects. */
  hotFrom(): number;
  /** One read-only query, counted against the monthly budget. */
  query<T extends Record<string, unknown>>(sql: string): Promise<T[]>;
  usage(): Promise<AdvancedAnalyticsUsage>;
}
