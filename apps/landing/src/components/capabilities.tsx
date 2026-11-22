import type { ReactNode } from 'react';
import {
  AskAiVisual,
  EventsVisual,
  FunnelVisual,
  ProfileVisual,
  ReportsVisual,
  RetentionVisual,
  TrafficVisual,
} from './capability-visuals';
import { Container, SectionHeading } from './ui';

type Tile = {
  name: string;
  body: string;
  span: string;
  visual: ReactNode;
};

// 6-column grid: rows of 4+2, 2+2+2 and 2+4 so the wide tiles zigzag.
const TILES: Tile[] = [
  {
    name: 'Web analytics',
    body: 'Visitors, sessions, bounce rate, referrers, UTM campaigns, countries and devices, updating in real time from the edge.',
    span: 'lg:col-span-4',
    visual: <TrafficVisual />,
  },
  {
    name: 'Product events',
    body: 'Track any action with properties, then filter and break it down.',
    span: 'lg:col-span-2',
    visual: <EventsVisual />,
  },
  {
    name: 'Profiles',
    body: 'Identify signed-in users and follow one person’s journey in order.',
    span: 'lg:col-span-2',
    visual: <ProfileVisual />,
  },
  {
    name: 'Funnels',
    body: 'See exactly which step of a flow loses people.',
    span: 'lg:col-span-2',
    visual: <FunnelVisual />,
  },
  {
    name: 'Retention',
    body: 'Weekly cohorts show who comes back, and for how long.',
    span: 'lg:col-span-2',
    visual: <RetentionVisual />,
  },
  {
    name: 'Reports and dashboards',
    body: 'Save charts and share the numbers your team checks every morning.',
    span: 'lg:col-span-2',
    visual: <ReportsVisual />,
  },
  {
    name: 'Ask AI',
    body: 'Ask a question in plain words and get an answer built from your own events.',
    span: 'lg:col-span-4',
    visual: <AskAiVisual />,
  },
];

export function Capabilities() {
  return (
    <section
      aria-labelledby="product-title"
      className="border-rule border-t py-24 sm:py-32"
      id="product"
    >
      <Container>
        <SectionHeading
          id="product-title"
          title="The analytics you need, nothing to host."
        >
          <p>
            The full OpenPanel feature set, rebuilt on Cloudflare’s own building
            blocks. One dashboard for marketing traffic and product usage.
          </p>
          <p className="mt-3 text-[13px] text-faint">
            Previews below use sample data.
          </p>
        </SectionHeading>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {TILES.map((tile) => (
            <li
              className={`group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-rule bg-panel transition-colors duration-300 hover:border-rule-strong ${tile.span} ${
                tile.span === 'lg:col-span-4' ? 'sm:col-span-2' : ''
              }`}
              key={tile.name}
            >
              <div className="p-6 pb-0 sm:p-7 sm:pb-0">
                <h3 className="font-semibold text-[19px] tracking-[-0.015em]">
                  {tile.name}
                </h3>
                <p className="mt-1.5 max-w-[52ch] text-[14.5px] text-muted leading-[1.55]">
                  {tile.body}
                </p>
              </div>
              <div
                aria-hidden
                className="relative mt-6 flex-1 px-6 pb-6 sm:px-7 sm:pb-7"
              >
                {tile.visual}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
