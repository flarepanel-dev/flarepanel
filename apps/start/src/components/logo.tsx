import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
}

// The Photon mark is its own panel, so it needs no tile. Its unlit panel is
// graphite on dark surfaces and pale grey on light ones. See brand/README.md.
export function LogoSquare({ className }: LogoProps) {
  return (
    <>
      <img
        alt="FlarePanel logo"
        className={cn('dark:hidden', className)}
        src="/logo.svg"
      />
      <img
        alt="FlarePanel logo"
        className={cn('hidden dark:block', className)}
        src="/logo-inverted.svg"
      />
    </>
  );
}

export function Logo({ className }: LogoProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 font-semibold text-xl tracking-[-0.03em]',
        className
      )}
    >
      <LogoSquare className="max-h-8" />
      <span>FlarePanel</span>
    </div>
  );
}
