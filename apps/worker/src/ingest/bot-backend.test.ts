// The Workers ingest backend hands bot hits to the project's Durable Object
// with the plan's monthly allowance, and reports when it turned one away.

import { describe, expect, it, mock } from 'bun:test';
import { BOT_HITS_PER_MONTH } from '@flarepanel/core/modules/event/event.constants';
import { MemoryCacheStore } from '@flarepanel/platform';
import {
  createCloudflareIngestBackend,
  createWorkerEventStore,
} from './backend';

function backendFor(selfHosted: boolean, capped = false) {
  const addBotEvent = mock(async (_row: unknown, _options: unknown) => ({
    listed: !capped,
    capped,
  }));
  const env = {
    PROJECT_EVENTS: {
      idFromName: (name: string) => name,
      get: () => ({ addBotEvent }),
    },
  };
  const backend = createCloudflareIngestBackend({
    env: env as never,
    cache: new MemoryCacheStore(),
    deps: () => ({ config: { selfHosted } }) as never,
  });
  return { backend, addBotEvent };
}

const HIT = {
  name: 'GPTBot',
  type: 'AI Data Scraper',
  projectId: 'project-1',
  path: 'https://example.com/gone',
  createdAt: new Date('2026-11-27T09:00:00Z'),
  status: 404,
  verified: true,
  verifiedCategory: 'AI Crawler',
};

describe('recordBot', () => {
  it('stores the hit with its status and verification under the hosted allowance', async () => {
    const { backend, addBotEvent } = backendFor(false);
    expect(await backend.recordBot(HIT)).toEqual({ capped: false });
    expect(addBotEvent).toHaveBeenCalledTimes(1);
    expect(addBotEvent.mock.calls[0]?.[0]).toMatchObject({
      name: 'GPTBot',
      type: 'AI Data Scraper',
      project_id: 'project-1',
      path: 'https://example.com/gone',
      created_at: '2026-11-27 09:00:00.000',
      status: 404,
      verified: true,
      verified_category: 'AI Crawler',
    });
    expect(addBotEvent.mock.calls[0]?.[1]).toEqual({
      monthlyCap: BOT_HITS_PER_MONTH,
    });
  });

  it('caps nothing when self-hosted, and passes a turned-away hit on', async () => {
    const selfHosted = backendFor(true);
    await selfHosted.backend.recordBot(HIT);
    expect(selfHosted.addBotEvent.mock.calls[0]?.[1]).toEqual({
      monthlyCap: null,
    });

    const full = backendFor(false, true);
    expect(await full.backend.recordBot(HIT)).toEqual({ capped: true });
    // The colo remembers: the next hit that month skips the Durable Object.
    expect(await full.backend.recordBot(HIT)).toEqual({ capped: true });
    expect(full.addBotEvent).toHaveBeenCalledTimes(1);
  });
});

describe('botImport', () => {
  it('sends one import batch to the project’s Durable Object', async () => {
    const importBotHours = mock(async (_batch: unknown) => ({
      hours: 1,
      rows: 1,
      hits: 12,
      skippedHours: 0,
      cappedHours: 0,
    }));
    const names: string[] = [];
    const env = {
      PROJECT_EVENTS: {
        idFromName: (name: string) => {
          names.push(name);
          return name;
        },
        get: () => ({ importBotHours }),
      },
    };
    const store = createWorkerEventStore(env as never);
    const batch = {
      source: 'cloudflare' as const,
      fromHour: 10,
      toHour: 11,
      rows: [
        {
          hour: 10,
          name: 'GPTBot',
          type: 'AI Data Scraper',
          path: '/',
          hits: 12,
        },
      ],
    };
    expect(await store.botImport?.('project-1', batch)).toMatchObject({
      hits: 12,
    });
    expect(names).toEqual(['project-1']);
    expect(importBotHours.mock.calls[0]?.[0]).toEqual(batch);
  });
});
