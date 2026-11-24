// Small drawn stand-ins for what the dashboard shows as favicons, flags and
// generated avatars. Simplified on purpose: they sit at 14 to 16px.
import { Github, Mail, Scan } from 'lucide-react';
import type { Flag, Source } from './sample-data';

export function SourceIcon({ source }: { source: Source }) {
  const box = 'size-[15px] shrink-0';
  switch (source) {
    case 'google':
      return (
        <svg aria-hidden className={box} viewBox="0 0 16 16">
          <circle cx="8" cy="8" fill="#fff" r="8" />
          <path
            d="M12.4 8.1c0-.3 0-.6-.1-.9H8v1.7h2.5a2.2 2.2 0 0 1-.9 1.4v1.2h1.5c.9-.8 1.4-2 1.4-3.4Z"
            fill="#4285F4"
          />
          <path
            d="M8 12.6c1.2 0 2.3-.4 3-1.1l-1.4-1.1c-.4.3-1 .5-1.6.5a2.8 2.8 0 0 1-2.6-1.9H3.9v1.2A4.6 4.6 0 0 0 8 12.6Z"
            fill="#34A853"
          />
          <path
            d="M5.4 9a2.8 2.8 0 0 1 0-1.9V5.9H3.9a4.6 4.6 0 0 0 0 4.2L5.4 9Z"
            fill="#FBBC05"
          />
          <path
            d="M8 5.2c.7 0 1.3.2 1.8.7l1.3-1.3A4.6 4.6 0 0 0 3.9 5.9l1.5 1.2C5.7 6 6.8 5.2 8 5.2Z"
            fill="#EA4335"
          />
        </svg>
      );
    case 'hackernews':
      return (
        <svg aria-hidden className={box} viewBox="0 0 16 16">
          <rect fill="#FF6600" height="16" rx="2.5" width="16" />
          <path
            d="m5 4 3 4.6V12m3-8L8 8.6"
            fill="none"
            stroke="#fff"
            strokeLinecap="round"
            strokeWidth="1.6"
          />
        </svg>
      );
    case 'reddit':
      return (
        <svg aria-hidden className={box} viewBox="0 0 16 16">
          <circle cx="8" cy="8" fill="#FF4500" r="8" />
          <ellipse cx="8" cy="9.4" fill="#fff" rx="4.2" ry="2.8" />
          <circle cx="6.4" cy="9.2" fill="#FF4500" r=".75" />
          <circle cx="9.6" cy="9.2" fill="#FF4500" r=".75" />
          <circle cx="10.6" cy="4.4" fill="#fff" r="1" />
        </svg>
      );
    case 'x':
      return (
        <svg aria-hidden className={box} viewBox="0 0 16 16">
          <rect fill="#000" height="16" rx="3" stroke="#3a3a3a" width="16" />
          <path
            d="m4.4 4 7.2 8m-7.2 0 7.2-8"
            stroke="#fff"
            strokeLinecap="round"
            strokeWidth="1.4"
          />
        </svg>
      );
    case 'duckduckgo':
      return (
        <svg aria-hidden className={box} viewBox="0 0 16 16">
          <circle cx="8" cy="8" fill="#DE5833" r="8" />
          <circle cx="8" cy="8" fill="#fff" r="4.6" />
          <circle cx="9.2" cy="7" fill="#2d2d2d" r="1" />
        </svg>
      );
    case 'github':
      return <Github aria-hidden className={`${box} text-app-text`} />;
    case 'newsletter':
      return <Mail aria-hidden className={`${box} text-app-muted`} />;
    default:
      return <Scan aria-hidden className={`${box} text-app-muted`} />;
  }
}

const FLAGS: Record<Flag, (id: string) => React.ReactNode> = {
  de: () => (
    <>
      <rect fill="#000" height="4" width="18" />
      <rect fill="#DD0000" height="4" width="18" y="4" />
      <rect fill="#FFCE00" height="4" width="18" y="8" />
    </>
  ),
  us: () => (
    <>
      <rect fill="#fff" height="12" width="18" />
      {[0, 2, 4, 6, 8, 10].map((y) => (
        <rect fill="#B22234" height="1" key={y} width="18" y={y} />
      ))}
      <rect fill="#3C3B6E" height="6" width="8" />
    </>
  ),
  gb: () => (
    <>
      <rect fill="#012169" height="12" width="18" />
      <path d="M0 0 18 12M18 0 0 12" stroke="#fff" strokeWidth="2.4" />
      <path d="M0 0 18 12M18 0 0 12" stroke="#C8102E" strokeWidth="1" />
      <path d="M9 0v12M0 6h18" stroke="#fff" strokeWidth="3.6" />
      <path d="M9 0v12M0 6h18" stroke="#C8102E" strokeWidth="2" />
    </>
  ),
  se: () => (
    <>
      <rect fill="#006AA7" height="12" width="18" />
      <path d="M6.5 0v12M0 6h18" stroke="#FECC00" strokeWidth="2.2" />
    </>
  ),
  br: () => (
    <>
      <rect fill="#009C3B" height="12" width="18" />
      <path d="m9 1.5 7 4.5-7 4.5L2 6Z" fill="#FFDF00" />
      <circle cx="9" cy="6" fill="#002776" r="2.6" />
    </>
  ),
  jp: () => (
    <>
      <rect fill="#fff" height="12" width="18" />
      <circle cx="9" cy="6" fill="#BC002D" r="3.4" />
    </>
  ),
  in: () => (
    <>
      <rect fill="#FF9933" height="4" width="18" />
      <rect fill="#fff" height="4" width="18" y="4" />
      <rect fill="#138808" height="4" width="18" y="8" />
      <circle
        cx="9"
        cy="6"
        fill="none"
        r="1.4"
        stroke="#000080"
        strokeWidth=".5"
      />
    </>
  ),
  tr: () => (
    <>
      <rect fill="#E30A17" height="12" width="18" />
      <circle cx="7" cy="6" fill="#fff" r="3" />
      <circle cx="7.8" cy="6" fill="#E30A17" r="2.4" />
      <circle cx="10.6" cy="6" fill="#fff" r=".9" />
    </>
  ),
  pt: () => (
    <>
      <rect fill="#FF0000" height="12" width="18" />
      <rect fill="#006600" height="12" width="7" />
      <circle cx="7" cy="6" fill="#FFCC00" r="2" />
    </>
  ),
  sg: () => (
    <>
      <rect fill="#EF3340" height="6" width="18" />
      <rect fill="#fff" height="6" width="18" y="6" />
      <circle cx="4" cy="3" fill="#fff" r="1.8" />
      <circle cx="4.7" cy="3" fill="#EF3340" r="1.6" />
    </>
  ),
  au: () => (
    <>
      <rect fill="#00008B" height="12" width="18" />
      <path d="M0 0h9v6H0z" fill="#012169" />
      <path d="M4.5 0v6M0 3h9" stroke="#fff" strokeWidth="1.4" />
      <path d="M4.5 0v6M0 3h9" stroke="#C8102E" strokeWidth=".7" />
      <circle cx="13.5" cy="8" fill="#fff" r=".9" />
      <circle cx="4.5" cy="9" fill="#fff" r="1.1" />
    </>
  ),
  ca: () => (
    <>
      <rect fill="#fff" height="12" width="18" />
      <rect fill="#D80621" height="12" width="4.5" />
      <rect fill="#D80621" height="12" width="4.5" x="13.5" />
      <path
        d="m9 3 1 2 1.4-.4-.6 2.2L9 8.4 7.2 6.8l-.6-2.2L8 5Z"
        fill="#D80621"
      />
    </>
  ),
  ng: () => (
    <>
      <rect fill="#008751" height="12" width="18" />
      <rect fill="#fff" height="12" width="6" x="6" />
    </>
  ),
};

export function FlagIcon({ flag }: { flag: Flag }) {
  return (
    <svg
      aria-hidden
      className="h-[11px] w-[16px] shrink-0 overflow-hidden rounded-[2px]"
      preserveAspectRatio="none"
      viewBox="0 0 18 12"
    >
      {FLAGS[flag](flag)}
    </svg>
  );
}

const AVATAR_COLORS = [
  '#e8833a',
  '#5b6cf0',
  '#e2455c',
  '#3aa58f',
  '#8e5be8',
  '#d9a23a',
];

/** The dashboard's generated anonymous avatar: a tinted tile with a small face. */
export function Avatar({ seed, size = 18 }: { seed: number; size?: number }) {
  const color = AVATAR_COLORS[seed % AVATAR_COLORS.length];
  const mouth = seed % 3;
  return (
    <svg
      aria-hidden
      className="shrink-0 rounded-[4px]"
      height={size}
      viewBox="0 0 18 18"
      width={size}
    >
      <rect fill={color} height="18" width="18" />
      <rect fill="#fff" fillOpacity=".18" height="9" width="18" y="9" />
      <circle cx="6" cy="7.4" fill="#fff" r="1.2" />
      <circle cx="12" cy="7.4" fill="#fff" r="1.2" />
      {mouth === 0 ? (
        <path
          d="M6.5 11.6h5"
          stroke="#fff"
          strokeLinecap="round"
          strokeWidth="1.2"
        />
      ) : mouth === 1 ? (
        <path
          d="M6.4 11a2.8 2.8 0 0 0 5.2 0"
          fill="none"
          stroke="#fff"
          strokeLinecap="round"
          strokeWidth="1.2"
        />
      ) : (
        <circle cx="9" cy="11.6" fill="#fff" r="1.1" />
      )}
    </svg>
  );
}

/** Small brand-neutral OS marks for the sessions table. */
export function OsIcon({
  os,
}: {
  os: 'macos' | 'windows' | 'ios' | 'android';
}) {
  if (os === 'windows') {
    return (
      <svg aria-hidden className="size-[13px] shrink-0" viewBox="0 0 16 16">
        <path
          d="M1 2.5 7 1.7v5.8H1Zm7-.9L15 .6v6.9H8ZM1 8.5h6v5.8l-6-.8Zm7 0h7v6.9l-7-1Z"
          fill="#4cb0e5"
        />
      </svg>
    );
  }
  if (os === 'android') {
    return (
      <svg aria-hidden className="size-[13px] shrink-0" viewBox="0 0 16 16">
        <path d="M3 7a5 5 0 0 1 10 0v.5H3Z" fill="#83c758" />
        <rect fill="#83c758" height="5.5" rx="1" width="10" x="3" y="8.5" />
      </svg>
    );
  }
  return (
    <svg aria-hidden className="size-[13px] shrink-0" viewBox="0 0 16 16">
      <path
        d="M11.2 8.5c0-1.6 1.3-2.3 1.3-2.4-.7-1-1.8-1.2-2.2-1.2-.9-.1-1.8.6-2.3.6s-1.2-.5-2-.5A3 3 0 0 0 3.5 6.6c-1.1 1.9-.3 4.7.8 6.2.5.8 1.1 1.6 1.9 1.5.8 0 1-.5 2-.5s1.2.5 2 .5c.8 0 1.3-.8 1.8-1.5.6-.8.8-1.6.8-1.7 0 0-1.6-.6-1.6-2.6ZM9.7 3.8c.4-.5.7-1.2.6-1.8-.6 0-1.3.4-1.7.9-.4.4-.7 1.1-.6 1.7.6.1 1.3-.3 1.7-.8Z"
        fill="#e4e4e4"
      />
    </svg>
  );
}
