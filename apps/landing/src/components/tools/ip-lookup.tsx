'use client';

import { type FormEvent, useState } from 'react';
import { TOOLS_API } from './tool-page';

interface Lookup {
  ip: string;
  location?: {
    country?: string | null;
    region?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  isLocalhost?: boolean;
  isPrivate?: boolean;
  attribution?: string;
}

const COUNTRY_NAMES =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

function countryName(code?: string | null) {
  if (!code) {
    return null;
  }
  try {
    return COUNTRY_NAMES?.of(code) ?? code;
  } catch {
    return code;
  }
}

export function IpLookup() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState<Lookup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const query = ip.trim() ? `?ip=${encodeURIComponent(ip.trim())}` : '';
      const response = await fetch(`${TOOLS_API}/tools/ip-lookup${query}`);
      const body = (await response.json()) as Lookup & { error?: string };
      if (!response.ok) {
        setResult(null);
        setError(
          response.status === 429
            ? 'Too many lookups. Try again in a minute.'
            : (body.error ?? 'That did not work. Check the address.')
        );
        return;
      }
      setResult(body);
    } catch {
      setError('Could not reach the lookup service. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const rows: [string, string | null][] = result
    ? [
        ['IP address', result.ip],
        ['Country', countryName(result.location?.country)],
        ['Region', result.location?.region ?? null],
        ['City', result.location?.city ?? null],
        [
          'Coordinates',
          result.location?.latitude != null &&
          result.location?.longitude != null
            ? `${result.location.latitude.toFixed(4)}, ${result.location.longitude.toFixed(4)}`
            : null,
        ],
      ]
    : [];

  return (
    <div className="max-w-[720px]">
      <form className="flex flex-wrap gap-2" onSubmit={lookup}>
        <label className="sr-only" htmlFor="ip">
          IP address
        </label>
        <input
          autoComplete="off"
          className="h-12 min-w-[240px] flex-1 rounded-[10px] border border-rule-strong bg-panel px-4 font-mono text-[15px] text-paper placeholder:text-faint focus-visible:outline-2 focus-visible:outline-coral"
          id="ip"
          inputMode="text"
          onChange={(e) => setIp(e.target.value)}
          placeholder="Leave empty for your own IP"
          spellCheck={false}
          value={ip}
        />
        <button
          className="h-12 rounded-[10px] bg-paper px-5 font-medium text-[15px] text-ink transition-colors hover:bg-paper-hover disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Looking up…' : 'Look up'}
        </button>
      </form>

      <div aria-live="polite" className="mt-6">
        {error ? (
          <p className="rounded-xl border border-crimson/40 bg-crimson/10 px-4 py-3 text-[15px] text-soft">
            {error}
          </p>
        ) : null}
        {result ? (
          <div className="overflow-hidden rounded-2xl border border-rule bg-panel">
            {result.isPrivate || result.isLocalhost ? (
              <p className="border-rule border-b px-5 py-3 text-[14px] text-muted">
                This is a private or local address, so it has no public
                location.
              </p>
            ) : null}
            <dl>
              {rows.map(([label, value]) => (
                <div
                  className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 border-rule border-t px-5 py-3.5 first:border-t-0"
                  key={label}
                >
                  <dt className="text-[14px] text-faint">{label}</dt>
                  <dd className="truncate font-mono text-[14.5px] text-paper">
                    {value ?? '—'}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="border-rule border-t px-5 py-3 text-[12.5px] text-faint">
              <a
                className="underline decoration-rule-strong underline-offset-2 hover:text-muted"
                href="https://db-ip.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                IP geolocation by DB-IP
              </a>
              . Locations are approximate, usually the network's city.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
