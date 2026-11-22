'use client';

import { Github, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Container, Logo } from './ui';
import { nav, site } from '@/lib/site';

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300 ${
        scrolled || open
          ? 'border-rule bg-ink/90 backdrop-blur-md'
          : 'border-transparent bg-ink'
      }`}
    >
      <Container className="flex h-[68px] items-center gap-9">
        <a aria-label="FlarePanel home" className="rounded-md" href="/">
          <Logo />
        </a>
        <nav aria-label="Main" className="ml-6 hidden md:block">
          <ul className="flex gap-7 text-[14px] text-muted">
            {nav.map((item) => (
              <li key={item.label}>
                <a
                  className="transition-colors duration-200 hover:text-paper"
                  href={item.href}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto hidden items-center gap-5 md:flex">
          <a
            className="text-[14px] text-muted transition-colors hover:text-paper"
            href={site.signIn}
          >
            Sign in
          </a>
          <a
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-paper px-3.5 font-medium text-[14px] text-ink transition-colors hover:bg-paper-hover"
            href={site.github}
            rel="noopener"
          >
            <Github aria-hidden className="size-4" />
            GitHub
          </a>
        </div>
        <button
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="-mr-2 ml-auto grid size-10 place-items-center rounded-lg text-soft hover:bg-raised md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </Container>
      {open ? (
        <div className="border-rule border-t md:hidden" id="mobile-menu">
          <Container className="grid gap-1 py-4">
            {nav.map((item) => (
              <a
                className="rounded-lg px-2 py-3 text-[17px] text-soft hover:bg-raised"
                href={item.href}
                key={item.label}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              className="rounded-lg px-2 py-3 text-[17px] text-soft hover:bg-raised"
              href={site.signIn}
            >
              Sign in
            </a>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
