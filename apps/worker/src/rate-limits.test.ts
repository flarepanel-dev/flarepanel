import { describe, expect, it } from 'bun:test';
import { checkEdgeRateLimit, type EdgeLimiter } from './rate-limits';

/** Allows `allowed` calls per key, then refuses; records the keys it saw. */
function limiter(allowed: number) {
  const seen: string[] = [];
  const counts = new Map<string, number>();
  const binding: EdgeLimiter = {
    limit: ({ key }) => {
      seen.push(key);
      const count = (counts.get(key) ?? 0) + 1;
      counts.set(key, count);
      return Promise.resolve({ success: count <= allowed });
    },
  };
  return { binding, seen };
}

function post(path: string, ip = '203.0.113.7') {
  return new Request(`https://api.example.com${path}`, {
    method: 'POST',
    headers: { 'cf-connecting-ip': ip },
  });
}

describe('checkEdgeRateLimit', () => {
  it('caps /mcp per IP and answers 429 as JSON with retry-after', async () => {
    const mcp = limiter(2);
    const env = { MCP_LIMITER: mcp.binding };

    expect(await checkEdgeRateLimit(post('/mcp'), '/mcp', env)).toBeNull();
    expect(await checkEdgeRateLimit(post('/mcp'), '/mcp', env)).toBeNull();
    const refused = await checkEdgeRateLimit(post('/mcp'), '/mcp', env);

    expect(refused?.status).toBe(429);
    expect(refused?.headers.get('retry-after')).toBe('60');
    expect(await refused?.json()).toEqual({
      error: 'Too many requests. Try again in a minute.',
    });
    expect(mcp.seen).toEqual(['203.0.113.7', '203.0.113.7', '203.0.113.7']);
  });

  it('counts each IP separately', async () => {
    const mcp = limiter(1);
    const env = { MCP_LIMITER: mcp.binding };

    expect(await checkEdgeRateLimit(post('/mcp', 'a'), '/mcp', env)).toBeNull();
    expect(await checkEdgeRateLimit(post('/mcp', 'b'), '/mcp', env)).toBeNull();
  });

  it('keeps /track and /mcp on their own limiters', async () => {
    const track = limiter(0);
    const mcp = limiter(5);
    const env = { TRACK_LIMITER: track.binding, MCP_LIMITER: mcp.binding };

    expect(
      (await checkEdgeRateLimit(post('/track'), '/track', env))?.status
    ).toBe(429);
    expect(await checkEdgeRateLimit(post('/mcp'), '/mcp', env)).toBeNull();
    expect(track.seen).toHaveLength(1);
    expect(mcp.seen).toHaveLength(1);
  });

  it('leaves /track/crawl off the per-IP ingest cap', async () => {
    const track = limiter(0);
    const env = { TRACK_LIMITER: track.binding };

    expect(
      await checkEdgeRateLimit(post('/track/crawl'), '/track/crawl', env)
    ).toBeNull();
    expect(track.seen).toHaveLength(0);
  });

  it('lets through other paths, other methods and a missing binding', async () => {
    const mcp = limiter(0);
    const env = { MCP_LIMITER: mcp.binding };

    expect(
      await checkEdgeRateLimit(post('/trpc/x'), '/trpc/x', env)
    ).toBeNull();
    expect(
      await checkEdgeRateLimit(
        new Request('https://api.example.com/mcp'),
        '/mcp',
        env
      )
    ).toBeNull();
    expect(await checkEdgeRateLimit(post('/mcp'), '/mcp', {})).toBeNull();
    expect(mcp.seen).toHaveLength(0);
  });
});
