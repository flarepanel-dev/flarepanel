/**
 * The Cloudflare CoordinationStore: a SQLite-backed Durable Object. A Durable
 * Object runs one request at a time, so every method here is atomic without
 * locks. Keys are spread over a fixed number of objects (see `stores.ts`).
 *
 * Expired rows are ignored on read and swept by an alarm, so storage stays
 * bounded without a cron.
 */

import { DurableObject } from 'cloudflare:workers';
import type { WindowCount } from '../ports';

const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

interface Row extends Record<string, SqlStorageValue> {
  value: string;
  expires_at: number | null;
}

export class CoordinatorDurableObject extends DurableObject {
  private readonly sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS kv (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expires_at INTEGER
      )`
    );
  }

  private read(key: string, now = Date.now()): Row | null {
    const row = this.sql
      .exec<Row>('SELECT value, expires_at FROM kv WHERE key = ?', key)
      .toArray()[0];
    if (!row) {
      return null;
    }
    if (row.expires_at !== null && row.expires_at <= now) {
      this.sql.exec('DELETE FROM kv WHERE key = ?', key);
      return null;
    }
    return row;
  }

  private async write(key: string, value: string, expiresAt: number | null) {
    this.sql.exec(
      `INSERT INTO kv (key, value, expires_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at`,
      key,
      value,
      expiresAt
    );
    if (expiresAt !== null && (await this.ctx.storage.getAlarm()) === null) {
      await this.ctx.storage.setAlarm(Date.now() + SWEEP_INTERVAL_MS);
    }
  }

  async alarm() {
    this.sql.exec(
      'DELETE FROM kv WHERE expires_at IS NOT NULL AND expires_at <= ?',
      Date.now()
    );
    const remaining = this.sql
      .exec<{ n: number }>(
        'SELECT count(*) AS n FROM kv WHERE expires_at IS NOT NULL'
      )
      .one().n;
    if (remaining > 0) {
      await this.ctx.storage.setAlarm(Date.now() + SWEEP_INTERVAL_MS);
    }
  }

  get(key: string): string | null {
    return this.read(key)?.value ?? null;
  }

  async set(key: string, value: string, ttlMs?: number): Promise<void> {
    await this.write(
      key,
      value,
      ttlMs === undefined ? null : Date.now() + ttlMs
    );
  }

  async setIfAbsent(
    key: string,
    value: string,
    ttlMs: number
  ): Promise<boolean> {
    if (this.read(key)) {
      return false;
    }
    await this.write(key, value, Date.now() + ttlMs);
    return true;
  }

  delete(key: string): void {
    this.sql.exec('DELETE FROM kv WHERE key = ?', key);
  }

  deleteIfEquals(key: string, value: string): boolean {
    if (this.read(key)?.value !== value) {
      return false;
    }
    this.sql.exec('DELETE FROM kv WHERE key = ?', key);
    return true;
  }

  async extendIfEquals(
    key: string,
    value: string,
    ttlMs: number
  ): Promise<boolean> {
    if (this.read(key)?.value !== value) {
      return false;
    }
    await this.write(key, value, Date.now() + ttlMs);
    return true;
  }

  async increment(key: string, windowMs: number): Promise<WindowCount> {
    const now = Date.now();
    const row = this.read(key, now);
    const count = (row ? Number(row.value) || 0 : 0) + 1;
    const expiresAt = row?.expires_at ?? now + windowMs;
    await this.write(key, String(count), expiresAt);
    return { count, ttlMs: expiresAt - now };
  }

  ttl(key: string): number | null {
    const row = this.read(key);
    return row?.expires_at == null ? null : row.expires_at - Date.now();
  }

  ping(): boolean {
    return true;
  }
}
