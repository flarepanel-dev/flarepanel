'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { AppFrame, type ViewId } from './app-frame';
import { AppView } from './views';

/**
 * The hero is the whole dashboard: every sidebar entry opens its page in
 * place, filled with sample data, so visitors can click through the product.
 */
export function HeroStage() {
  const [view, setView] = useState<ViewId>('overview');
  const reduce = useReducedMotion();
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[min(1100px,100%)] -translate-x-1/2 bg-[radial-gradient(50%_60%_at_50%_45%,rgba(255,106,77,0.16),rgba(255,154,74,0.06)_45%,transparent_75%)] blur-2xl"
      />
      <AppFrame
        className="[mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
        height="h-[640px] sm:h-[780px] lg:h-[860px]"
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
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <AppView id={view} />
          </motion.div>
        </AnimatePresence>
      </AppFrame>
      <p className="mt-5 hidden text-center text-[14px] text-muted md:block">
        Click any page in the sidebar: it is the real interface, with sample
        data.
      </p>
    </div>
  );
}
