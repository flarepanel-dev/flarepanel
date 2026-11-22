# FlarePanel brand

Brand kit v1: **Bar F** mark, **Obsidian + Hot coral** colors, **Geist**
wordmark. Machine-readable values are in `tokens.json`.

## Files

| File | Use |
|---|---|
| `logo-mark.svg` | App icon on light surfaces (Obsidian tile). Source of the favicon and app icons |
| `logo-mark-inverted.svg` | App icon on dark surfaces (white tile) |
| `logo-glyph.svg` / `logo-glyph-white.svg` | The F without a tile, for stamps and watermarks |
| `wordmark-light.svg` | Icon + name on light backgrounds |
| `wordmark-dark.svg` | Icon + name on dark backgrounds |
| `logo-mark-512.png` | Raster icon where SVG is not accepted |
| `tokens.json` | Full color scales, semantic colors, chart palette, contrast results |

The wordmark text is outlined (converted to shapes) from Geist SemiBold
(weight 640, tracking −3.5%), so it renders the same everywhere without the
font installed. Geist is licensed under the SIL Open Font License.

## The mark

An **F built from chart bars**: a stem, two bars of falling length, and a
coral dot where the third bar would be. It reads as the letter F and as a
small bar chart, with the dot as the "flare". Built on a 48-unit grid with
6-unit bars, 3-unit radii and a 12-unit tile radius.

- Keep clear space of at least 25% of the icon width on every side.
- Minimum size: 16 px for the icon, 80 px wide for the wordmark.
- Do not recolor the bars, move the dot, stretch the tile or add effects.

## Colors

| Role | Value | Use |
|---|---|---|
| Hot coral (brand) | `#FF496B` | Logo dot, chart highlight, links on dark, focus rings |
| Coral link | `#E12251` | Links on white (4.6:1) |
| Obsidian 950 (ink) | `#0D0D10` | Text, primary buttons, icon tile |
| Obsidian 50 | `#F9FAFE` | Text and buttons on dark |
| Success | `#0A7E3A` | Up / positive numbers |
| Danger | `#B71A18` | Errors and down / negative numbers |
| Warning | `#A96000` | Warnings |
| Info | `#006BBB` | Neutral notices |

Full 50–950 scales for Coral and Obsidian are in `tokens.json`.

Chart series order: coral `#FF496B`, indigo `#6B79EA`, teal `#08B6AF`,
amber `#E9AB2B`, violet `#A064DB`, sky `#4CB0E5`, lime `#83C758`,
slate `#A1A1A5`. These are mirrored in `apps/start/src/styles.css`
(`--chart-0..7`) and `packages/core/src/modules/report/report.constants.ts`.

### Rules

1. **Coral is a spark, not a fill.** Use it for accents. Buttons and surfaces
   stay Obsidian or white.
2. **Down is crimson, never coral.** Negative numbers use Danger and always
   carry ▲ / ▼ arrows, so coral is never read as "bad".
3. **On dark, use the inverted icon.** The Obsidian tile disappears on dark
   backgrounds.
4. **Not Cloudflare.** FlarePanel runs on Cloudflare but is not a Cloudflare
   product, so the brand avoids Cloudflare's orange and blue.

## Name

Write it **FlarePanel**: one word, capital F and P. The domain is
`flarepanel.dev`.

## Generated files

Dashboard icons in `apps/start/public` come from `logo-mark.svg`:
`logo.svg`, `logo-inverted.svg`, `favicon.ico` (16/32/48/64),
`logo192.png`, `logo512.png`, and `apple-touch-icon.png` (180 px, square and
opaque because iOS rounds the corners itself).
