'use client';

import { Check, CircleAlert, X } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { TOOLS_API } from './tool-page';

interface SiteCheck {
  url: string;
  finalUrl: string;
  seo: {
    title: { value: string; length: number };
    description: { value: string; length: number };
    canonical: string | null;
    h1: string[];
    robotsMeta: string | null;
    robotsTxtStatus: string | null;
    hasSitemap: boolean;
  };
  social: {
    og: Record<string, string | null>;
    twitter: Record<string, string | null>;
  };
  technical: {
    statusCode: number;
    redirectChain: { url: string; status: number; responseTime: number }[];
    responseTime: { ttfb: number; total: number };
    contentType: string | null;
    pageSize: number;
    server: string | null;
  };
  hosting: {
    ip: string | null;
    location: { country?: string | null; city?: string | null } | null;
    cdn: string | null;
  };
  security: {
    csp: string | null;
    xFrameOptions: string | null;
    xContentTypeOptions: string | null;
    hsts: string | null;
    score: number;
  };
}

type Verdict = 'good' | 'warn' | 'bad';

const ICON: Record<Verdict, ReactNode> = {
  good: <Check aria-hidden className="size-4 text-up" strokeWidth={2.5} />,
  warn: (
    <CircleAlert
      aria-hidden
      className="size-4 text-chart-spark"
      strokeWidth={2.25}
    />
  ),
  bad: <X aria-hidden className="size-4 text-crimson" strokeWidth={2.5} />,
};
const VERDICT_TEXT: Record<Verdict, string> = {
  good: 'Good',
  warn: 'Could be better',
  bad: 'Missing or wrong',
};

function lengthVerdict(length: number, min: number, max: number): Verdict {
  if (length === 0) {
    return 'bad';
  }
  return length >= min && length <= max ? 'good' : 'warn';
}

function Row({
  label,
  verdict,
  children,
}: {
  label: string;
  verdict?: Verdict;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-4 border-rule border-t px-5 py-3.5 first:border-t-0 sm:grid-cols-[190px_minmax(0,1fr)]">
      <dt className="flex items-start gap-2 text-[14px] text-faint">
        {verdict ? (
          <span className="mt-0.5" title={VERDICT_TEXT[verdict]}>
            {ICON[verdict]}
            <span className="sr-only">{VERDICT_TEXT[verdict]}: </span>
          </span>
        ) : null}
        {label}
      </dt>
      <dd className="min-w-0 break-words text-[14.5px] text-paper">
        {children}
      </dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-rule bg-panel">
      <h2 className="border-rule border-b px-5 py-3 font-semibold text-[15px] text-paper">
        {title}
      </h2>
      <dl>{children}</dl>
    </section>
  );
}

const muted = (text: string) => <span className="text-faint">{text}</span>;

function kb(bytes: number) {
  return `${(bytes / 1024).toFixed(bytes > 100 * 1024 ? 0 : 1)} KB`;
}

export function UrlChecker() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<SiteCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function check(event: FormEvent) {
    event.preventDefault();
    const target = url.trim();
    if (!target) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const withScheme = /^https?:\/\//i.test(target)
        ? target
        : `https://${target}`;
      const response = await fetch(
        `${TOOLS_API}/tools/site-checker?url=${encodeURIComponent(withScheme)}`
      );
      const body = (await response.json()) as SiteCheck & { error?: string };
      if (!response.ok) {
        setResult(null);
        setError(
          response.status === 429
            ? 'Too many checks. Try again in a minute.'
            : body.error === 'Invalid URL'
              ? 'Enter a public web address, like example.com.'
              : (body.error ?? 'Could not check that page.')
        );
        return;
      }
      setResult(body);
    } catch {
      setError('Could not reach the checker. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const r = result;
  return (
    <div className="max-w-[860px]">
      <form className="flex flex-wrap gap-2" onSubmit={check}>
        <label className="sr-only" htmlFor="url">
          Page address
        </label>
        <input
          autoComplete="url"
          className="h-12 min-w-[260px] flex-1 rounded-[10px] border border-rule-strong bg-panel px-4 text-[15px] text-paper placeholder:text-faint focus-visible:outline-2 focus-visible:outline-flare"
          id="url"
          inputMode="url"
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
          required
          spellCheck={false}
          value={url}
        />
        <button
          className="h-12 rounded-[10px] bg-paper px-5 font-medium text-[15px] text-ink transition-colors hover:bg-paper-hover disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </form>

      <div aria-live="polite" className="mt-6 grid gap-4">
        {error ? (
          <p className="rounded-xl border border-crimson/40 bg-crimson/10 px-4 py-3 text-[15px] text-soft">
            {error}
          </p>
        ) : null}
        {r ? (
          <>
            <Section title="Overview">
              <Row
                label="Status"
                verdict={
                  r.technical.statusCode < 300
                    ? 'good'
                    : r.technical.statusCode < 400
                      ? 'warn'
                      : 'bad'
                }
              >
                {r.technical.statusCode}
              </Row>
              <Row label="Final address">{r.finalUrl}</Row>
              <Row
                label="Response time"
                verdict={
                  r.technical.responseTime.total < 800
                    ? 'good'
                    : r.technical.responseTime.total < 2000
                      ? 'warn'
                      : 'bad'
                }
              >
                {r.technical.responseTime.total} ms{' '}
                {muted(`(first byte ${r.technical.responseTime.ttfb} ms)`)}
              </Row>
              <Row label="Page size">{kb(r.technical.pageSize)}</Row>
              <Row label="Served by">
                {[r.hosting.cdn, r.technical.server]
                  .filter(
                    (name, i, all): name is string =>
                      Boolean(name) &&
                      all.findIndex(
                        (other) => other?.toLowerCase() === name?.toLowerCase()
                      ) === i
                  )
                  .join(' · ') || muted('Unknown')}
                {r.hosting.location?.country
                  ? muted(
                      ` · ${[r.hosting.location.city, r.hosting.location.country].filter(Boolean).join(', ')}`
                    )
                  : null}
              </Row>
              {r.technical.redirectChain.length > 1 ? (
                <Row label="Redirects" verdict="warn">
                  <ol className="grid gap-1">
                    {r.technical.redirectChain.map((hop) => (
                      <li className="font-mono text-[13px]" key={hop.url}>
                        {hop.status} {hop.url}
                      </li>
                    ))}
                  </ol>
                </Row>
              ) : null}
            </Section>

            <Section title="Search engines">
              <Row
                label={`Title (${r.seo.title.length})`}
                verdict={lengthVerdict(r.seo.title.length, 30, 60)}
              >
                {r.seo.title.value || muted('No title')}
              </Row>
              <Row
                label={`Description (${r.seo.description.length})`}
                verdict={lengthVerdict(r.seo.description.length, 70, 160)}
              >
                {r.seo.description.value || muted('No meta description')}
              </Row>
              <Row
                label="Main heading (H1)"
                verdict={
                  r.seo.h1.length === 1
                    ? 'good'
                    : r.seo.h1.length
                      ? 'warn'
                      : 'bad'
                }
              >
                {r.seo.h1.length
                  ? r.seo.h1.join(' / ')
                  : muted('No H1 on the page')}
                {r.seo.h1.length > 1
                  ? muted(` (${r.seo.h1.length} found; one is best)`)
                  : null}
              </Row>
              <Row
                label="Canonical"
                verdict={r.seo.canonical ? 'good' : 'warn'}
              >
                {r.seo.canonical ?? muted('Not set')}
              </Row>
              <Row
                label="Indexing"
                verdict={
                  r.seo.robotsMeta?.includes('noindex') ||
                  r.seo.robotsTxtStatus === 'blocked'
                    ? 'bad'
                    : 'good'
                }
              >
                {r.seo.robotsMeta ? `robots: ${r.seo.robotsMeta}` : 'Allowed'}
                {muted(
                  ` · robots.txt ${r.seo.robotsTxtStatus ?? 'not found'} · sitemap ${r.seo.hasSitemap ? 'found' : 'not found'}`
                )}
              </Row>
            </Section>

            <Section title="Social previews">
              <Row
                label="Open Graph"
                verdict={
                  r.social.og.title && r.social.og.image ? 'good' : 'warn'
                }
              >
                {r.social.og.title ?? muted('No og:title')}
                {r.social.og.image ? null : muted(' · no og:image')}
              </Row>
              <Row
                label="X / Twitter card"
                verdict={r.social.twitter.card ? 'good' : 'warn'}
              >
                {r.social.twitter.card ?? muted('No twitter:card')}
              </Row>
            </Section>

            <Section title={`Security headers · ${r.security.score}/100`}>
              <Row
                label="HTTPS only (HSTS)"
                verdict={r.security.hsts ? 'good' : 'bad'}
              >
                {r.security.hsts ?? muted('Missing')}
              </Row>
              <Row
                label="Content-Security-Policy"
                verdict={r.security.csp ? 'good' : 'warn'}
              >
                {r.security.csp ? (
                  <span className="font-mono text-[13px]">
                    {r.security.csp}
                  </span>
                ) : (
                  muted('Missing')
                )}
              </Row>
              <Row
                label="Clickjacking (X-Frame-Options)"
                verdict={r.security.xFrameOptions ? 'good' : 'warn'}
              >
                {r.security.xFrameOptions ?? muted('Missing')}
              </Row>
              <Row
                label="X-Content-Type-Options"
                verdict={r.security.xContentTypeOptions ? 'good' : 'warn'}
              >
                {r.security.xContentTypeOptions ?? muted('Missing')}
              </Row>
            </Section>
          </>
        ) : null}
      </div>
    </div>
  );
}
