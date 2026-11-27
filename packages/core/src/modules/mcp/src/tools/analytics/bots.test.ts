import { expect, mock, test } from 'bun:test';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { capturingLogger } from '../../../../../../test/rpc-fixtures';
import type { ServiceDeps } from '../../../../../services';
import { emptyBotStats } from '../../../../ingest/cloudflare/bot-store';
import type { McpToolDeps } from '../shared';
import { registerBotTools } from './bots';

const STATS = {
  ...emptyBotStats({ month: '2026-11', hits: 12, cap: 100_000, capped: false }),
  totals: {
    total: 12,
    ai: 10,
    answers: 4,
    indexing: 2,
    training: 4,
    search: 2,
    other: 0,
  },
  series: [
    {
      date: '2026-11-27',
      total: 12,
      ai: 10,
      answers: 4,
      indexing: 2,
      training: 4,
      search: 2,
      other: 0,
    },
  ],
  topBots: [
    {
      name: 'ChatGPT-User',
      category: 'AI Assistant',
      group: 'answers' as const,
      hits: 4,
      verifiedHits: 4,
      lastSeen: Date.parse('2026-11-27T08:00:00Z'),
    },
    {
      name: 'GPTBot',
      category: 'AI Data Scraper',
      group: 'training' as const,
      hits: 4,
      verifiedHits: 0,
      lastSeen: Date.parse('2026-11-27T07:00:00Z'),
    },
  ],
  topPaths: [
    {
      path: '/llms.txt',
      hits: 6,
      lastSeen: Date.parse('2026-11-27T08:00:00Z'),
      status: { '2xx': 3, '3xx': 0, '4xx': 2, '5xx': 1 },
      bots: [
        {
          name: 'GPTBot',
          category: 'AI Data Scraper',
          group: 'training' as const,
          hits: 4,
        },
      ],
    },
  ],
};

function setup() {
  const botStats = mock(async (_projectId: string, _query: unknown) => STATS);
  const deps = {
    logger: capturingLogger(),
    config: { selfHosted: false },
    db: {
      project: {
        findUniqueOrThrow: async () => ({
          organization: { id: 'org', timezone: 'Europe/Berlin' },
        }),
      },
    },
    eventStore: { botStats },
  } as unknown as ServiceDeps;
  const tools = new Map<
    string,
    (input: unknown) => Promise<{ content: { text: string }[] }>
  >();
  const server = {
    tool(
      name: string,
      _description: string,
      _schema: unknown,
      handler: (input: unknown) => Promise<{ content: { text: string }[] }>
    ) {
      tools.set(name, handler);
    },
  };
  registerBotTools(
    server as unknown as McpServer,
    {
      context: {
        projectId: 'project',
        organizationId: 'org',
        clientType: 'read',
      },
      deps,
    } as McpToolDeps
  );
  const invoke = async (input: unknown) => {
    const handler = tools.get('get_bot_traffic');
    if (!handler) {
      throw new Error('get_bot_traffic is not registered');
    }
    const result = await handler(input);
    return JSON.parse(result.content[0]?.text ?? '{}');
  };
  return { botStats, invoke };
}

test('get_bot_traffic reads the project-time-zone window with its filters', async () => {
  const { botStats, invoke } = setup();
  const result = await invoke({
    startDate: '2026-11-01',
    endDate: '2026-11-27',
    group: 'answers',
    verified: true,
    limit: 1,
  });

  expect(botStats).toHaveBeenCalledTimes(1);
  const [projectId, query] = botStats.mock.calls[0] as [
    string,
    Record<string, unknown>,
  ];
  expect(projectId).toBe('project');
  expect(query).toMatchObject({
    fromMs: Date.parse('2026-10-31T23:00:00Z'),
    toMs: Date.parse('2026-11-27T22:59:59Z'),
    timezone: 'Europe/Berlin',
    group: 'answers',
    verified: 'verified',
    monthlyCap: 100_000,
  });

  expect(result.totals.answers).toBe(4);
  expect(result.usage).toEqual({
    month: '2026-11',
    hits: 12,
    cap: 100_000,
    capped: false,
  });
  expect(result.daily.rows).toEqual([['2026-11-27', 12, 4, 2, 4, 2, 0]]);
  expect(result.top_bots.columns).toEqual([
    'name',
    'group',
    'category',
    'hits',
    'verified_hits',
    'last_seen',
  ]);
  // One row kept, the other rolled up so the totals still add up.
  expect(result.top_bots.rows).toHaveLength(2);
  expect(result.top_bots.rows[0].slice(0, 5)).toEqual([
    'ChatGPT-User',
    'answers',
    'AI Assistant',
    4,
    4,
  ]);
  expect(result.top_pages.rows[0].slice(0, 5)).toEqual([
    '/llms.txt',
    6,
    2,
    1,
    'GPTBot',
  ]);
});

test('get_bot_traffic counts every hit unless asked for verified ones', async () => {
  const { botStats, invoke } = setup();
  await invoke({ range: '7d' });
  const [, query] = botStats.mock.calls[0] as [string, Record<string, unknown>];
  expect(query.verified).toBe('all');
  expect(query.group).toBeUndefined();
});
