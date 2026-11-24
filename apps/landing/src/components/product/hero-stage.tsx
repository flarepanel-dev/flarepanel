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
