import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
}

// Dark tile on light surfaces, white (inverted) tile on dark ones: the
// Obsidian tile would disappear on the dark theme. See brand/README.md.
export function LogoSquare({ className }: LogoProps) {
  return (
    <>
      <img
        alt="FlarePanel logo"
        className={cn('rounded-md dark:hidden', className)}
        src="/logo.svg"
      />
      <img
        alt="FlarePanel logo"
        className={cn('hidden rounded-md dark:block', className)}
        src="/logo-inverted.svg"
      />
    </>
  );
}

export function Logo({ className }: LogoProps) {
  return (
    <div
      className={cn('flex items-center gap-2 font-medium text-xl', className)}
    >
      <LogoSquare className="max-h-8" />
      <span>FlarePanel</span>
    </div>
  );
}
