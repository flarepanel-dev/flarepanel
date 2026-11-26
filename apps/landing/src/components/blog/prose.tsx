// The building blocks a blog post body may use besides plain HTML elements.
// Styling lives in globals.css under `.blog-body`.

import Link from 'next/link';
import type { ReactNode } from 'react';

export function Code({ children }: { children: ReactNode }) {
  return <code className="blog-code">{children}</code>;
}

export function Pre({ children, lang }: { children: string; lang?: string }) {
  return (
    <figure className="blog-pre">
      {lang ? <figcaption>{lang}</figcaption> : null}
      <pre>
        <code>{children.replace(/^\n/, '').replace(/\n\s*$/, '')}</code>
      </pre>
    </figure>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <aside className="blog-callout" role="note">
      {children}
    </aside>
  );
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith('/')) {
    return <Link href={href}>{children}</Link>;
  }
  return (
    <a href={href} rel="noopener">
      {children}
    </a>
  );
}
