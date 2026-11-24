'use client';

import { AppFrame, type ViewId } from './app-frame';
import { OverviewView } from './overview-view';

/** Ask the product tour below to show a view, then scroll to it. */
export function openTour(view: ViewId) {
  window.dispatchEvent(new CustomEvent<ViewId>('fp:tour', { detail: view }));
  document.getElementById('product')?.scrollIntoView({ block: 'start' });
}

export function HeroStage() {
  return (
    <div className="relative">
      <AppFrame
        className="[mask-image:linear-gradient(to_bottom,black_78%,transparent)]"
        height="h-[640px] sm:h-[780px] lg:h-[860px]"
        onSelect={(view) => view !== 'overview' && openTour(view)}
        view="overview"
      >
        <OverviewView />
      </AppFrame>
    </div>
  );
}
