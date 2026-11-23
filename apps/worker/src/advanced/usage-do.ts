/**
 * The install's Basin SQL usage for the month, in one Durable Object, so
 * every Worker isolate sees the same budget. Billed bytes are counted the way
 * Cloudflare bills them (at least 10 MB per query). Each threshold alerts
 * once a month: 80% (warning) and 100% (queries stop).
 */
import { DurableObject } from 'cloudflare:workers';
import type { AdvancedAnalyticsUsage } from '@flarepanel/core/ingest/cloudflare';
import type { Env } from '../index';

const WARNING_SHARE = 0.8;

export type BudgetAlert = 'warning' | 'reached' | null;

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export class BasinUsageDurableObject extends DurableObject<Env> {
  async usage(budgetBytes: number): Promise<AdvancedAnalyticsUsage> {
    const month = currentMonth();
    const usedBytes =
      (await this.ctx.storage.get<number>(`used:${month}`)) ?? 0;
    return { month, usedBytes, budgetBytes };
  }

  async record(
    bytes: number,
    budgetBytes: number
  ): Promise<{ usage: AdvancedAnalyticsUsage; alert: BudgetAlert }> {
    const month = currentMonth();
    const storage = this.ctx.storage;
    const usedBytes =
      ((await storage.get<number>(`used:${month}`)) ?? 0) + Math.max(0, bytes);
    await storage.put(`used:${month}`, usedBytes);

    let alert: BudgetAlert = null;
    if (
      usedBytes >= budgetBytes &&
      !(await storage.get(`alert:${month}:reached`))
    ) {
      alert = 'reached';
      await storage.put({
        [`alert:${month}:reached`]: true,
        [`alert:${month}:warning`]: true,
      });
    } else if (
      usedBytes >= budgetBytes * WARNING_SHARE &&
      !(await storage.get(`alert:${month}:warning`))
    ) {
      alert = 'warning';
      await storage.put(`alert:${month}:warning`, true);
    }
    return { usage: { month, usedBytes, budgetBytes }, alert };
  }
}
