'use client';

import {
  ArrowUp,
  Check,
  ChevronDown,
  KeyRound,
  Plus,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { SourceIcon } from './glyphs';
import type { Source } from './sample-data';

const QUESTION = 'Which sources brought the most sign-ups this week?';
const ANSWER =
  'Google led with 142 sign-ups, then Hacker News with 96, most of them on Thursday when your post was on the front page. Direct traffic converts best: 6.1% of its visitors signed up, against 3.4% from Google.';

const RESULT: { name: string; icon: Source; value: number }[] = [
  { name: 'Google', icon: 'google', value: 142 },
  { name: 'Hacker News', icon: 'hackernews', value: 96 },
  { name: 'Direct', icon: 'direct', value: 81 },
  { name: 'newsletter', icon: 'newsletter', value: 37 },
  { name: 'github.com', icon: 'github', value: 22 },
];

const CONVERSATIONS = [
  'Sign-ups by source this week',
  'Why did bounce rate drop?',
  'Checkout funnel on mobile',
  'Top pages from Hacker News',
];

/**
 * The Chat page answering a real question with the data tools it ran. The
 * answer streams in once when the view comes on screen; it runs on the
 * workspace's own AI key.
 */
export function ChatView({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: true });
  const reduce = useReducedMotion();
  const [chars, setChars] = useState(reduce ? ANSWER.length : 0);
  const done = chars >= ANSWER.length;

  useEffect(() => {
    if (!(active && inView) || reduce || done) {
      if (reduce) {
        setChars(ANSWER.length);
      }
      return;
    }
    const id = window.setInterval(
      () => setChars((c) => Math.min(ANSWER.length, c + 3)),
      24
    );
    return () => window.clearInterval(id);
  }, [active, inView, reduce, done]);

  const max = RESULT[0].value;
  return (
    <div className="flex h-full" ref={ref}>
      <div className="hidden w-[210px] shrink-0 flex-col gap-1 border-app-line border-r p-3 xl:flex">
        <div className="mb-2 flex h-8 items-center gap-1.5 rounded-md border border-app-line bg-app-card px-2.5 text-[12.5px]">
          <Plus className="size-3.5" />
          New chat
        </div>
        {CONVERSATIONS.map((c, i) => (
          <div
            className={`truncate rounded-md px-2.5 py-1.5 text-[12px] ${i === 0 ? 'bg-app-field text-app-text' : 'text-app-muted'}`}
            key={c}
          >
            {c}
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden px-5 pt-5 sm:px-8">
          <div className="mx-auto flex max-w-[640px] flex-col gap-4">
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-app-field px-3.5 py-2.5 text-[13px]">
              {QUESTION}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'get_events: sign_up by referrer',
                'get_conversion: visitors to sign_up',
              ].map((tool) => (
                <span
                  className="flex items-center gap-1.5 rounded-md border border-app-line bg-app-card px-2 py-1 font-mono text-[10.5px] text-app-muted"
                  key={tool}
                >
                  <Wrench className="size-3" strokeWidth={1.75} />
                  {tool}
                  <Check className="size-3 text-up" strokeWidth={2.25} />
                </span>
              ))}
            </div>
            <div className="rounded-md border border-app-line bg-app-card p-3.5">
              <div className="mb-2.5 flex items-center justify-between font-medium text-[10px] text-app-muted uppercase tracking-[0.5px]">
                sign_up by referrer · last 7 days
                <span className="font-mono normal-case tracking-normal">
                  378 total
                </span>
              </div>
              {RESULT.map((r) => (
                <div
                  className="flex h-7 items-center gap-2.5 text-[12px]"
                  key={r.name}
                >
                  <span className="flex w-[110px] shrink-0 items-center gap-2">
                    <SourceIcon source={r.icon} />
                    <span className="truncate">{r.name}</span>
                  </span>
                  <span className="relative h-[14px] flex-1 overflow-hidden rounded-[3px] bg-app-field">
                    <span
                      className="absolute inset-y-0 left-0 rounded-[3px] bg-[#6b79ea] transition-[width] duration-700 ease-out-expo"
                      style={{
                        width: `${done || reduce ? (r.value / max) * 100 : Math.min(1, chars / 80) * (r.value / max) * 100}%`,
                      }}
                    />
                  </span>
                  <span className="tabular w-8 text-right font-mono font-semibold text-[11.5px]">
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-app-nav leading-[1.6]">
              {ANSWER.slice(0, chars)}
              {done ? null : (
                <span className="ml-0.5 inline-block h-[13px] w-[6px] translate-y-[2px] animate-pulse bg-app-text motion-reduce:hidden" />
              )}
            </p>
            <div
              className={`flex flex-wrap gap-1.5 transition-opacity duration-500 ${done ? 'opacity-100' : 'opacity-0'}`}
            >
              {[
                'Show the trend by day',
                'Break down by country',
                'Save as report',
              ].map((s) => (
                <span
                  className="rounded-full border border-app-line px-2.5 py-1 text-[11.5px] text-app-muted"
                  key={s}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 pt-2 pb-4 sm:px-8">
          <div className="mx-auto max-w-[640px] rounded-xl border border-app-line bg-app-card p-2.5">
            <div className="px-1.5 py-1 text-[13px] text-app-muted">
              Ask about your data…
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex h-7 items-center gap-1.5 rounded-md border border-app-line px-2 text-[11.5px]">
                <Sparkles className="size-3.5" strokeWidth={1.75} />
                GPT-6.1 Sol
                <ChevronDown className="size-3 text-app-muted" />
              </span>
              <span className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] text-app-muted max-sm:hidden">
                <KeyRound className="size-3.5" strokeWidth={1.75} />
                Your OpenAI key ····9f2c
              </span>
              <span className="ml-auto flex size-7 items-center justify-center rounded-md bg-paper text-ink">
                <ArrowUp className="size-4" strokeWidth={2.25} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
