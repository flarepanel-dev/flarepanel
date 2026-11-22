import { ArrowRight, Github } from 'lucide-react';
import type { ReactNode } from 'react';
import { site } from '@/lib/site';

export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-14 ${className}`}
    >
      {children}
    </div>
  );
}

const base =
  'inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[9px] px-[18px] font-medium text-[15px] transition-[background-color,border-color,color,transform] duration-200 ease-out-expo active:translate-y-px';

export function GitHubButton({ label = 'Star on GitHub' }: { label?: string }) {
  return (
    <a
      className={`${base} bg-paper text-ink hover:bg-paper-hover`}
      href={site.github}
      rel="noopener"
    >
      <Github aria-hidden className="size-[17px]" strokeWidth={2} />
      {label}
    </a>
  );
}

export function EarlyAccessButton({
  label = 'Get early access',
}: {
  label?: string;
}) {
  return (
    <a
      className={`${base} group border border-rule-strong text-paper hover:border-faint hover:bg-raised`}
      href={site.signUp}
    >
      {label}
      <ArrowRight
        aria-hidden
        className="size-4 transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5"
        strokeWidth={2}
      />
    </a>
  );
}

export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const external = href.startsWith('http');
  return (
    <a
      className="text-coral underline decoration-coral/40 underline-offset-[0.22em] transition-colors hover:decoration-coral"
      href={href}
      rel={external ? 'noopener' : undefined}
    >
      {children}
    </a>
  );
}

export function SectionHeading({
  id,
  title,
  children,
}: {
  id?: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:gap-14">
      <h2
        className="display max-w-[16ch] text-[36px] sm:text-[48px] lg:text-[56px]"
        id={id}
      >
        {title}
      </h2>
      {children ? (
        <div className="max-w-[60ch] text-[16px] text-muted leading-[1.6] lg:pb-1.5">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg aria-hidden className="size-7 shrink-0" viewBox="0 0 48 48">
        <rect fill="#FFFFFF" height="48" rx="12" width="48" />
        <rect fill="#0D0D10" height="26" rx="3" width="6" x="12" y="11" />
        <rect fill="#0D0D10" height="6" rx="3" width="16" x="20.5" y="11" />
        <rect fill="#0D0D10" height="6" rx="3" width="10.5" x="20.5" y="21" />
        <circle cx="23.5" cy="34" fill="#FF496B" r="3" />
      </svg>
      <span className="font-semibold text-[19px] tracking-[-0.02em]">
        FlarePanel
      </span>
    </span>
  );
}
