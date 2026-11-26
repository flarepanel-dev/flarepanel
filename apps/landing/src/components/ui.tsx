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
      className="text-flare underline decoration-flare/40 underline-offset-[0.22em] transition-colors hover:decoration-flare"
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
      {/* The Photon mark, built by brand/scripts/build.ts. */}
      <img
        alt=""
        aria-hidden
        className="size-[30px] shrink-0"
        height={30}
        src="/mark.svg"
        width={30}
      />
      <span className="font-semibold text-[19px] tracking-[-0.035em]">
        FlarePanel
      </span>
    </span>
  );
}
