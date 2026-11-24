'use client';

import { useInView, useReducedMotion } from 'motion/react';
import { type RefObject, useEffect, useState } from 'react';

/**
 * A tick that advances every `ms` while the preview is on screen and active.
 * Stops entirely under prefers-reduced-motion, so previews rest on their
 * first frame.
 */
export function useLiveTick(
  ref: RefObject<Element | null>,
  ms: number,
  active = true
) {
  const inView = useInView(ref, { amount: 0.25 });
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  const running = inView && active && !reduce;
  useEffect(() => {
    if (!running) {
      return;
    }
    const id = window.setInterval(() => setTick((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [running, ms]);
  return { tick, running, reduce: Boolean(reduce) };
}
