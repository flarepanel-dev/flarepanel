// MCP's stateless POST transport, mounted at `/mcp`.
//
// Rate limits: every wrong secret costs one password-hash verify (`src/auth.ts`
// caches only a *correct* secret, for 5 minutes). `http/rate-limit.ts` limits
// /mcp per token client id (60/min) and per IP (3000/min) on every build. On
// Workers an edge cap (`MCP_LIMITER`, apps/worker/src/rate-limits.ts) also
// refuses floods per IP before the app boots.
//
// The JSON-RPC body comes off the CONTEXT, not from `request.json`: Elysia has
// already consumed the stream by the time the handler runs, and reading it
// twice throws "Body already used" (caught by the auth contracts).

import { defineRoutes } from '../../http/define';

const METHOD_NOT_ALLOWED = 405;
const JSONRPC_METHOD_NOT_FOUND = -32_601;

/**
 * A stateless MCP server speaks POST only. Without these the other methods
 * fell through to the framework's 404, which tells a client the endpoint does
 * not exist rather than that it used the wrong method. The MCP spec asks for
 * 405 with an `Allow` header.
 */
const methodNotAllowedBody = {
  jsonrpc: '2.0',
  error: { code: JSONRPC_METHOD_NOT_FOUND, message: 'Method Not Allowed' },
  id: null,
};

export const mcpRoutes = defineRoutes((app) =>
  app
    .get('/mcp', ({ set }) => {
      set.status = METHOD_NOT_ALLOWED;
      set.headers.allow = 'POST';
      return methodNotAllowedBody;
    })
    .delete('/mcp', ({ set }) => {
      set.status = METHOD_NOT_ALLOWED;
      set.headers.allow = 'POST';
      return methodNotAllowedBody;
    })
    .post('/mcp', async ({ body, ctx, query, request, set }) => {
      const token = ctx.services.mcp.extractToken(
        query as Record<string, string>,
        request.headers.get('authorization') ?? undefined
      );

      const { status, body: responseBody } =
        await ctx.services.mcp.handleStatelessMcpRequest(token, body);
      set.status = status;
      return responseBody;
    })
);
