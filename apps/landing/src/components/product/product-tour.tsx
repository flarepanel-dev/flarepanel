'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type KeyboardEvent, useRef, useState } from 'react';
import { Container, SectionHeading } from '../ui';
import { AppFrame, type ViewId } from './app-frame';
import { AppView } from './views';

const TABS: { id: ViewId; label: string; caption: string }[] = [
  {
    id: 'realtime',
    label: 'Realtime',
    caption:
      'Who is on your site right now, where they are, and what they just did, on a live map.',
  },
  {
    id: 'sessions',
    label: 'Sessions & replay',
    caption:
      'Every visit with its pages, source, place and device. Open a recorded session to watch where people clicked.',
  },
  {
    id: 'funnel',
    label: 'Funnels',
    caption:
      'Pick the steps that matter and see where people drop off, and how long the journey takes.',
  },
  {
    id: 'retention',
    label: 'Retention',
    caption:
      'Weekly cohorts show who comes back after signing up, and for how long.',
  },
  {
    id: 'profiles',
    label: 'Profiles',
    caption:
      'Identify signed-in users and follow one person from their first visit to checkout.',
  },
  {
    id: 'chat',
    label: 'AI chat',
    caption:
      'Ask in plain words. The assistant runs the queries and answers from your own events, on your own OpenAI or Anthropic key.',
  },
];

export function ProductTour() {
  const [view, setView] = useState<ViewId>('realtime');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduce = useReducedMotion();

  const index = TABS.findIndex((t) => t.id === view);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') {
      return;
    }
    e.preventDefault();
    const from = index < 0 ? 0 : index;
    const next =
      (from + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    setView(TABS[next].id);
    tabRefs.current[next]?.focus();
  };
  const caption =
    TABS[index]?.caption ??
    'Traffic, sources, pages and live visitors on one page.';

  return (
    <section
      aria-labelledby="product-title"
      className="border-rule border-t py-24 sm:py-32"
      id="product"
    >
      <Container>
        <SectionHeading
          id="product-title"
          title="Every screen, the real dashboard."
        >
          <p>
            The full OpenPanel feature set, rebuilt on Cloudflare’s own building
            blocks. What you see below is FlarePanel’s own interface, filled
            with sample data. Click around.
          </p>
        </SectionHeading>

        <div className="mt-14 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div
            aria-label="Dashboard screens"
            className="-mx-5 flex gap-1 overflow-x-auto px-5 [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:mx-0 sm:px-0 sm:[mask-image:none]"
            onKeyDown={onKey}
            role="tablist"
          >
            {TABS.map((tab, i) => (
              <button
                aria-controls="tour-panel"
                aria-selected={tab.id === view}
                className={`h-9 shrink-0 rounded-lg px-3.5 font-medium text-[14px] transition-colors duration-200 ${
                  tab.id === view
                    ? 'bg-raised text-paper'
                    : 'text-muted hover:text-paper'
                }`}
                id={`tour-tab-${tab.id}`}
                key={tab.id}
                onClick={() => setView(tab.id)}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                tabIndex={tab.id === view || (index < 0 && i === 0) ? 0 : -1}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p
            aria-live="polite"
            className="max-w-[56ch] text-[15px] text-muted leading-[1.55] lg:min-h-[3.1em] lg:pb-1 lg:text-right"
          >
            {caption}
          </p>
        </div>

        <div
          aria-labelledby={index >= 0 ? `tour-tab-${view}` : undefined}
          className="mt-6"
          id="tour-panel"
          role="tabpanel"
        >
          <AppFrame
            height="h-[560px] sm:h-[640px] lg:h-[680px]"
            onSelect={setView}
            view={view}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="h-full"
                exit={{ opacity: 0 }}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                key={view}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <AppView id={view} />
              </motion.div>
            </AnimatePresence>
          </AppFrame>
        </div>
      </Container>
    </section>
  );
}
