import { ArrowUpRight } from 'lucide-react';
import { Container, TextLink } from './ui';
import { site } from '@/lib/site';

// The real widgets of this site's own FlarePanel project, embedded the same
// way a customer would embed them: one iframe each, no script.

function WidgetFrame({
  src,
  title,
  height,
  label,
}: {
  src: string;
  title: string;
  height: number;
  label: string;
}) {
  return (
    <figure className="min-w-0 overflow-hidden rounded-2xl border border-rule bg-panel">
      <figcaption className="flex items-center justify-between border-rule border-b px-5 py-3">
        <span className="font-mono text-[11px] text-faint uppercase tracking-[0.08em]">
          {label}
        </span>
        <code className="hidden font-mono text-[11.5px] text-faint sm:block">
          &lt;iframe src=&quot;…/widget/{title.toLowerCase()}&quot;&gt;
        </code>
      </figcaption>
      <iframe
        className="block w-full border-0"
        height={height}
        loading="lazy"
        src={src}
        title={`${title} widget for flarepanel.dev`}
      />
    </figure>
  );
}

export function LiveProof() {
  return (
    <section
      aria-labelledby="live-title"
      className="border-rule border-t py-24 sm:py-32"
      id="live"
    >
      <Container>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:gap-14">
          <div>
            <p className="mb-4 flex items-center gap-2.5 font-mono text-[12px] text-soft uppercase tracking-[0.08em]">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ffb547] opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-[#ffb547]" />
              </span>
              Live from this site
            </p>
            <h2
              className="display max-w-[17ch] text-[36px] sm:text-[48px] lg:text-[56px]"
              id="live-title"
            >
              Our own numbers, right now.
            </h2>
          </div>
          <div className="lg:pb-1.5">
            <p className="max-w-[60ch] text-[16px] text-muted leading-[1.6]">
              flarepanel.dev is tracked with FlarePanel. These are the public
              widgets of our own project, and your visit is already in them. Put
              the same widgets on your site with one iframe.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <iframe
                className="border-0"
                height={32}
                loading="lazy"
                src={site.widgets.counter}
                title="Visitors on flarepanel.dev right now"
                width={220}
              />
              <TextLink href={`${site.docs}/features/widgets`}>
                Widgets in the docs
                <ArrowUpRight className="ml-0.5 inline size-3.5" />
              </TextLink>
            </div>
          </div>
        </div>
        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          <WidgetFrame
            height={420}
            label="Realtime · last 30 minutes"
            src={site.widgets.realtime}
            title="Realtime"
          />
          <WidgetFrame
            height={440}
            label="Traffic · visitors and top pages"
            src={site.widgets.traffic}
            title="Traffic"
          />
        </div>
      </Container>
    </section>
  );
}
