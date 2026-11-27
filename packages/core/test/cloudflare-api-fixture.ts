// A stand-in for api.cloudflare.com in tests: records every request and
// answers from a handler, so no test touches the network.

export interface RecordedRequest {
  url: string;
  method: string;
  authorization: string | null;
  /** The GraphQL query text, for POST /graphql. */
  query: string | null;
  variables: Record<string, unknown> | null;
}

export type FakeHandler = (
  request: RecordedRequest,
  index: number
) => Response | Promise<Response>;

export function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

export function fakeCloudflare(handler: FakeHandler) {
  const requests: RecordedRequest[] = [];
  const fetcher = async (input: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    let query: string | null = null;
    let variables: Record<string, unknown> | null = null;
    if (typeof init.body === 'string') {
      const body = JSON.parse(init.body) as {
        query?: string;
        variables?: Record<string, unknown>;
      };
      query = body.query ?? null;
      variables = body.variables ?? null;
    }
    const request: RecordedRequest = {
      url: input,
      method: init.method ?? 'GET',
      authorization: headers.get('authorization'),
      query,
      variables,
    };
    requests.push(request);
    return await handler(request, requests.length - 1);
  };
  const sleeps: number[] = [];
  const sleep = async (ms: number) => {
    sleeps.push(ms);
    await Promise.resolve();
  };
  return { fetcher, requests, sleep, sleeps };
}

/** A GraphQL answer with groups for `httpRequestsAdaptiveGroups`. */
export function groupsResponse(
  groups: {
    count: number;
    dimensions: Record<string, string | number>;
  }[]
): Response {
  return jsonResponse({
    data: { viewer: { zones: [{ httpRequestsAdaptiveGroups: groups }] } },
    errors: null,
  });
}

/** The answer to the zone check (`settings` node). */
export function settingsResponse(
  limits: {
    maxDuration?: number;
    notOlderThan?: number;
    maxPageSize?: number;
  } = {}
): Response {
  return jsonResponse({
    data: {
      viewer: {
        zones: [
          {
            settings: {
              httpRequestsAdaptiveGroups: {
                enabled: true,
                maxDuration: limits.maxDuration ?? 2_678_400,
                notOlderThan: limits.notOlderThan ?? 2_678_400,
                maxPageSize: limits.maxPageSize ?? 10_000,
              },
            },
          },
        ],
      },
    },
    errors: null,
  });
}

export const isSettingsQuery = (request: RecordedRequest) =>
  request.query?.includes('settings') ?? false;
