// In-app feedback: one message becomes a GitHub issue (when a token is
// configured) and an email to the team inbox (when an address is). Either one
// succeeding counts as delivered; the dashboard only falls back to a GitHub
// link when neither is configured.

import type { FeedbackConfig } from '../../config';
import type { Logger } from '../../logger';

export const FEEDBACK_TYPES = ['idea', 'bug', 'question', 'other'] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_LABEL: Record<FeedbackType, string> = {
  idea: 'Idea',
  bug: 'Bug',
  question: 'Question',
  other: 'Feedback',
};

export interface FeedbackInput {
  type: FeedbackType;
  message: string;
  page?: string;
  organizationId?: string;
  projectId?: string;
  /** Only set when the sender allowed a reply. */
  replyTo?: string;
  userAgent?: string;
  /** Public URLs of attached screenshots. */
  screenshots?: string[];
}

export const MAX_SCREENSHOTS = 3;
/** Per image, after the dashboard resized it (it aims for well under this). */
export const MAX_SCREENSHOT_BYTES = 1_500_000;
export const SCREENSHOT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;
export type ScreenshotType = (typeof SCREENSHOT_TYPES)[number];

/** True when the bytes really are the image type they claim to be. */
export function isImage(bytes: Uint8Array, type: ScreenshotType): boolean {
  const at = (i: number, ...v: number[]) =>
    v.every((b, k) => bytes[i + k] === b);
  if (type === 'image/png') {
    return at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  }
  if (type === 'image/jpeg') {
    return at(0, 0xff, 0xd8, 0xff);
  }
  return at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50);
}

export function feedbackEnabled(config: FeedbackConfig): boolean {
  return Boolean(config.email || config.githubToken);
}

/** A short, readable browser and OS, e.g. "Chrome 141 on macOS". */
export function describeUserAgent(ua: string | undefined): string | undefined {
  if (!ua) {
    return;
  }
  const browser =
    /Edg\/(\d+)/.exec(ua)?.[1] !== undefined
      ? `Edge ${/Edg\/(\d+)/.exec(ua)?.[1]}`
      : /Firefox\/(\d+)/.exec(ua)
        ? `Firefox ${/Firefox\/(\d+)/.exec(ua)?.[1]}`
        : /Chrome\/(\d+)/.exec(ua)
          ? `Chrome ${/Chrome\/(\d+)/.exec(ua)?.[1]}`
          : /Version\/(\d+).*Safari/.exec(ua)
            ? `Safari ${/Version\/(\d+)/.exec(ua)?.[1]}`
            : undefined;
  const os = /iPhone|iPad/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
      ? 'Android'
      : /Mac OS X/.test(ua)
        ? 'macOS'
        : /Windows/.test(ua)
          ? 'Windows'
          : /Linux/.test(ua)
            ? 'Linux'
            : undefined;
  if (browser && os) {
    return `${browser} on ${os}`;
  }
  return browser ?? os ?? ua.slice(0, 120);
}

/** One line, at most 80 characters, from the start of the message. */
export function issueTitle(input: Pick<FeedbackInput, 'type' | 'message'>) {
  const flat = input.message.replace(/\s+/g, ' ').trim();
  const short = flat.length > 72 ? `${flat.slice(0, 71).trimEnd()}…` : flat;
  return `[${FEEDBACK_LABEL[input.type]}] ${short}`;
}

/** Markdown body. The message is quoted so it cannot render as mentions or tasks. */
export function issueBody(input: FeedbackInput): string {
  const quoted = input.message
    .replace(/@/g, '@​')
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
  const rows: [string, string][] = [
    ['From', input.replyTo ?? '_not shared_'],
    ['Page', input.page ? `\`${input.page}\`` : '–'],
  ];
  if (input.organizationId) {
    rows.push([
      'Workspace',
      `\`${input.organizationId}\`${input.projectId ? ` / \`${input.projectId}\`` : ''}`,
    ]);
  }
  const browser = describeUserAgent(input.userAgent);
  if (browser) {
    rows.push(['Browser', browser]);
  }
  const shots = (input.screenshots ?? []).map(
    (url, i) => `![Screenshot ${i + 1}](${url})`
  );
  return [
    `**${FEEDBACK_LABEL[input.type]}** sent from the dashboard.`,
    '',
    quoted,
    '',
    ...(shots.length ? [...shots, ''] : []),
    '| | |',
    '|---|---|',
    ...rows.map(([k, v]) => `| ${k} | ${v.replace(/\|/g, '\\|')} |`),
  ].join('\n');
}

export interface DeliveryDeps {
  config: FeedbackConfig;
  fetch: (url: string, init: RequestInit) => Promise<Response>;
  sendEmail: (options: {
    to: string;
    data: {
      type: FeedbackType;
      message: string;
      page?: string;
      from?: string;
      organization?: string;
      project?: string;
      userAgent?: string;
      issueUrl?: string;
      screenshots?: string[];
    };
    replyTo?: string;
  }) => Promise<unknown>;
  logger: Pick<Logger, 'warn'>;
}

export interface DeliveryResult {
  delivered: boolean;
  issueNumber: number | null;
  emailed: boolean;
}

export async function deliverFeedback(
  deps: DeliveryDeps,
  input: FeedbackInput
): Promise<DeliveryResult> {
  const { config } = deps;
  let issueNumber: number | null = null;
  let issueUrl: string | undefined;

  if (config.githubToken) {
    try {
      const res = await deps.fetch(
        `https://api.github.com/repos/${config.githubRepo}/issues`,
        {
          method: 'POST',
          headers: {
            accept: 'application/vnd.github+json',
            authorization: `Bearer ${config.githubToken}`,
            'content-type': 'application/json',
            'user-agent': 'flarepanel-feedback',
            'x-github-api-version': '2022-11-28',
          },
          body: JSON.stringify({
            title: issueTitle(input),
            body: issueBody(input),
            labels: ['feedback', input.type],
          }),
        }
      );
      if (res.ok) {
        const json = (await res.json()) as {
          number?: number;
          html_url?: string;
        };
        issueNumber = json.number ?? null;
        issueUrl = json.html_url;
      } else {
        deps.logger.warn(
          { status: res.status },
          'feedback: GitHub issue was not created'
        );
      }
    } catch (error) {
      deps.logger.warn(
        { error: (error as Error).message },
        'feedback: GitHub request failed'
      );
    }
  }

  let emailed = false;
  if (config.email) {
    const sent = await deps
      .sendEmail({
        to: config.email,
        replyTo: input.replyTo,
        data: {
          type: input.type,
          message: input.message,
          page: input.page,
          from: input.replyTo,
          organization: input.organizationId,
          project: input.projectId,
          userAgent: describeUserAgent(input.userAgent),
          issueUrl,
          screenshots: input.screenshots,
        },
      })
      .catch(() => null);
    emailed = sent !== null && sent !== undefined;
    if (!emailed) {
      deps.logger.warn({}, 'feedback: email was not sent');
    }
  }

  return { delivered: issueNumber !== null || emailed, issueNumber, emailed };
}
