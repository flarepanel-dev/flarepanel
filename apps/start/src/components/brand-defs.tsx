// Shared SVG paint for the Photon look, defined once per document so any
// chart can reference it with `fill="url(#fp-data-bar)"`.
//
// The data bar runs from Flare at its base to a warm Ember at its top: the
// same light as the logo's lit panel. Each bar gets the whole ramp
// (objectBoundingBox), so short and tall bars read the same.

export const DATA_BAR_FILL = 'url(#fp-data-bar)';
/** Solid stand-in for tooltips and legends where a gradient cannot go. */
export const DATA_BAR_COLOR = 'var(--chart-0)';

export function BrandDefs() {
  return (
    <svg
      aria-hidden
      focusable="false"
      height="0"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      width="0"
    >
      <defs>
        <linearGradient id="fp-data-bar" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0" stopColor="#ff4f62" />
          <stop offset="0.6" stopColor="#ff6a4d" />
          <stop offset="1" stopColor="#ff8a4a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
