import { describe, expect, test } from 'bun:test';
import {
  type DeliveryDeps,
  deliverFeedback,
  describeUserAgent,
  feedbackEnabled,
  issueBody,
  issueTitle,
} from './feedback.service';

const CHROME_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

function deps(
  over: Partial<DeliveryDeps> & {
    config?: Partial<DeliveryDeps['config']>;
  } = {}
) {
  const calls: { fetch: [string, RequestInit][]; email: unknown[] } = {
    fetch: [],
    email: [],
  };
  const { config: configOver, ...rest } = over;
  const d: DeliveryDeps = {
    config: {
      email: 'team@example.com',
      githubToken: 'gh-token',
      githubRepo: 'acme/app',
      ...configOver,
    },
    fetch: (async (url: string, init: RequestInit) => {
      calls.fetch.push([url, init]);
      return new Response(
        JSON.stringify({
          number: 42,
          html_url: 'https://github.com/acme/app/issues/42',
        }),
        { status: 201 }
      );
    }) as unknown as DeliveryDeps['fetch'],
    sendEmail: async (o) => {
      calls.email.push(o);
      return { id: 'm1' };
    },
    logger: { warn: () => undefined } as unknown as DeliveryDeps['logger'],
    ...rest,
  };
  return { d, calls };
}

describe('feedback', () => {
  test('is enabled by an email address or a GitHub token', () => {
    expect(
      feedbackEnabled({
        email: undefined,
        githubToken: undefined,
        githubRepo: 'a/b',
      })
    ).toBe(false);
    expect(
      feedbackEnabled({
        email: 'x@y.z',
        githubToken: undefined,
        githubRepo: 'a/b',
      })
    ).toBe(true);
    expect(
      feedbackEnabled({ email: undefined, githubToken: 't', githubRepo: 'a/b' })
    ).toBe(true);
  });

  test('titles are one short line with the type', () => {
    expect(issueTitle({ type: 'bug', message: 'Chart\n is   empty' })).toBe(
      '[Bug] Chart is empty'
    );
    const long = issueTitle({ type: 'idea', message: 'x'.repeat(200) });
    expect(long.length).toBeLessThanOrEqual(80);
    expect(long.endsWith('…')).toBe(true);
  });

  test('the body quotes the message, defuses mentions and hides the sender unless shared', () => {
    const body = issueBody({
      type: 'idea',
      message: 'ping @octocat\nsecond line',
      page: '/a/b',
    });
    expect(body).toContain('> ping @​octocat');
    expect(body).toContain('> second line');
    expect(body).toContain('| From | _not shared_ |');
    expect(body).toContain('| Page | `/a/b` |');
  });

  test('describes the browser briefly', () => {
    expect(describeUserAgent(CHROME_MAC)).toBe('Chrome 141 on macOS');
    expect(describeUserAgent(undefined)).toBeUndefined();
  });

  test('creates the issue, then emails the team with its link and reply-to', async () => {
    const { d, calls } = deps();
    const r = await deliverFeedback(d, {
      type: 'bug',
      message: 'The funnel is empty',
      replyTo: 'alex@example.com',
      userAgent: CHROME_MAC,
    });
    expect(r).toEqual({ delivered: true, issueNumber: 42, emailed: true });
    expect(calls.fetch[0]?.[0]).toBe(
      'https://api.github.com/repos/acme/app/issues'
    );
    const sent = JSON.parse(String(calls.fetch[0]?.[1].body));
    expect(sent.labels).toEqual(['feedback', 'bug']);
    expect(calls.email[0]).toMatchObject({
      to: 'team@example.com',
      replyTo: 'alex@example.com',
      data: {
        issueUrl: 'https://github.com/acme/app/issues/42',
        userAgent: 'Chrome 141 on macOS',
      },
    });
  });

  test('a GitHub failure still counts as delivered when the email goes out', async () => {
    const { d } = deps({
      fetch: (async () =>
        new Response('nope', {
          status: 403,
        })) as unknown as DeliveryDeps['fetch'],
    });
    const r = await deliverFeedback(d, {
      type: 'idea',
      message: 'More colours',
    });
    expect(r).toEqual({ delivered: true, issueNumber: null, emailed: true });
  });

  test('nothing delivered when both channels fail', async () => {
    const { d } = deps({
      fetch: (async () => {
        throw new Error('offline');
      }) as unknown as DeliveryDeps['fetch'],
      sendEmail: async () => null,
    });
    const r = await deliverFeedback(d, { type: 'other', message: 'Hello' });
    expect(r.delivered).toBe(false);
  });

  test('email only, when no token is configured', async () => {
    const { d, calls } = deps({ config: { githubToken: undefined } });
    const r = await deliverFeedback(d, {
      type: 'question',
      message: 'How do I export?',
    });
    expect(calls.fetch.length).toBe(0);
    expect(r).toEqual({ delivered: true, issueNumber: null, emailed: true });
  });
});
