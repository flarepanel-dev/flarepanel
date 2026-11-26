---
name: FlarePanel
description: Open-source web and product analytics that runs entirely on Cloudflare.
colors:
  flare: "#ff3d6e"
  flare-soft: "#ff7393"
  ember: "#ff6a4d"
  spark: "#ffb547"
  data-base: "#ff4f62"
  data-top: "#ff8a4a"
  crimson: "#ef5a5f"
  up: "#3ccb7f"
  ink: "#0d0d10"
  panel: "#111115"
  raised: "#18181d"
  hover: "#1d1d23"
  rule: "#24242b"
  rule-strong: "#3b3b44"
  faint: "#7d7d86"
  muted: "#a3a3ab"
  soft: "#d6d6dc"
  paper: "#f9fafe"
  paper-hover: "#e6e6eb"
  app-bg: "#16161b"
  app-card: "#121216"
  app-line: "#24242b"
  app-field: "#1c1c22"
  app-hover: "#1c1c22"
  app-muted: "#a0a0aa"
  app-nav: "#d6d6dc"
  app-text: "#f9fafe"
typography:
  display-sm:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "60px"
    fontWeight: 700
    lineHeight: 0.97
    letterSpacing: "-0.045em"
  lede:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "74px"
    fontWeight: 700
    lineHeight: 0.97
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "56px"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  headline-sm:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  title-lg:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "\"ss01\", \"cv11\""
  body-sm:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
  data:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "26px"
    fontWeight: 600
    fontFeature: "\"tnum\""
  data-label:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "10.5px"
    fontWeight: 400
    letterSpacing: "0.08em"
  app-count:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 600
    letterSpacing: "-0.03em"
  app-value:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "19px"
    fontWeight: 600
    letterSpacing: "-0.5px"
    fontFeature: "\"tnum\""
  app-title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  app-value-sm:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "18px"
    fontWeight: 600
  app-ui:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  app-nav:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
  app-row:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
  app-meta:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 400
  replay-page:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "9px"
    fontWeight: 400
  replay-page-sm:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "8.5px"
    fontWeight: 400
  replay-page-xs:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "8px"
    fontWeight: 400
  code:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.9
rounded:
  bar: "4px"
  chip: "7px"
  control-sm: "8px"
  control: "9px"
  panel: "12px"
  card: "16px"
  frame: "18px"
  full: "999px"
spacing:
  gutter-mobile: "20px"
  gutter-tablet: "32px"
  gutter-desktop: "56px"
  container-max: "1440px"
  card-pad: "36px"
  panel-pad: "16px"
  head-to-content: "56px"
  section-mobile: "96px"
  section: "128px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.paper-hover}"
  button-outline:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.raised}"
  button-nav:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control-sm}"
    padding: "0 14px"
    height: "36px"
  tab:
    textColor: "{colors.muted}"
    rounded: "{rounded.control-sm}"
    padding: "0 14px"
    height: "36px"
  tab-active:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.paper}"
  text-link:
    textColor: "{colors.flare}"
  status-pill:
    textColor: "{colors.soft}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  card-option:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  dashboard-frame:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.frame}"
  dashboard-panel:
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-pad}"
---

# Design System: FlarePanel

## Overview

**Creative North Star: "The Live Instrument", in Photon light**

FlarePanel's marketing surface is a dark instrument panel, the same world as the dashboard it sells. The ground is near-black ink, structure is drawn with hairline rules instead of fills or shadows, and almost everything sits in a quiet cool-graphite ramp taken from the logo's panel. Against that, three warm lights each do one job, as in the Photon mark (brand/README.md): Ember is data (bars lit from the base, the current-period line), Spark is live (the online-now dot, the live card, the newest event), and Flare is interaction (links, focus, selection). Because the rest of the panel stays dark, a warm pixel always means something.

Type does two clearly separate jobs. Geist at 700 with very tight tracking makes compact, heavy claims; Geist Mono carries every number, code line, path and measurement, the way it would in a terminal or a chart axis. Density is generous at page level (tall sections, wide gutters) and tight inside the instrument (dashboard chips, KPI strips, code rows), so the product reads as dense working UI on a calm stage.

The page is dark because its readers work next to a dark IDE and the dark FlarePanel dashboard; the marketing world is the dashboard's world, not a separate brand expression. Motion is rare and authored: each moment gets at most one, and every one of them stops under reduced motion.

**Key Characteristics:**
- Ink ground with tonal panels and 1px rules. The only gradients are the logo's light: data bars lit Flare-to-Ember from the base, and one warm stage light behind the hero product frame.
- One job per warm colour: Ember data, Spark live, Flare interaction. None of them fills a button or a background.
- Geist 700 at -0.045em for headings; Geist Mono only for data, code and measurements. The dashboard uses the same Geist families.
- Up is green, down is crimson (its own cooler red), never a data colour.
- One authored motion per moment, all paused under reduced motion.

## Colors

A cool, near-monochrome ink ramp with three warm Photon lights, each with one job, and two delta hues.

### Primary
- **Ember** (ember): data. The lead chart series in the dashboard (`--chart-0`, first of `chartColors`) and in every preview: KPI bars (painted with the `bg-data` / `fp-data-bar` ramp from Flare at the base to a warm orange at the top), the current-period line and its area, funnel bars, retention, map dots, replay progress, the pricing slider.
- **Spark** (spark): live. The online-now dot and its ping, the live count, the live card's bars, the newest row in the realtime feed and its city ping, the current step of a progress stepper.
- **Flare** (flare): interaction and brand. Text links and their underline, the global focus ring, text selection, the event-route pulse. **Flare Soft** (flare-soft) is link hover on dark.

### Secondary
- **Delta Crimson** (crimson): negative deltas and the removed line of a diff (marker, strike-through decoration and a faint wash). Cooler and redder than Ember so a falling number never reads as data.
- **Delta Green** (up): positive deltas, the added line of a diff, success checks and the copied-confirmation check.

### Neutral
- **Obsidian** (ink): page ground, theme color, browser chrome, and the fill behind route nodes so the line appears to pass through them.
- **Panel Black** (panel): the dashboard frame, the code card, the highlighted run option.
- **Raised Graphite** (raised): active tab, copy button, sample-data tag, top-pages bar fills, outline-button hover, mobile menu hover.
- **Hover Graphite** (hover): the selected item in the dashboard sidebar.
- **Hairline** (rule): every section divider, card and panel border, table row line.
- **Strong Hairline** (rule-strong): outline-button border, the highlighted card's border, the event-route line, rest-state bullets, link underlines that are not yet Flare, the scrollbar thumb, code line numbers.
- **Faint Gray** (faint): metadata, axis labels, footnotes, dim code, footer legal line.
- **Muted Gray** (muted): body copy and ledes, nav links at rest.
- **Soft Gray** (soft): secondary emphasis: list points, row headers, inline code, service names.
- **Paper** (paper): headings, primary text, primary button fill.
- **Paper Pressed** (paper-hover): hover fill of paper buttons only.

### Named Rules
**The Data Palette Rule.** Categories take the Photon chart palette in this order: ember #ff6a4d, sky #4cb0e5, spark #ffb547, teal #08b6af, violet #a064db, lime #83c758, then slate, flare, blue, orchid, sea, green, blush. One colour always means one thing: screen_view is sky, sign_up ember, checkout_started spark, project_created teal. Fills sit at low opacity (about 16%) behind text and at full strength only for the mark itself (dot, line, bar). Chart colours never appear outside data: not on buttons, headings, borders or page backgrounds.

**The One Job Rule.** Ember is data, Spark is live, Flare is interaction. If it is not data, not happening now and you cannot click it, it is none of the three.

**The Lit Bar Rule.** Single-series bars are lit like the logo's panel: Flare at the base to a warm orange at the top (`bg-data` on the website, `url(#fp-data-bar)` from `components/brand-defs.tsx` in the dashboard). Lines and areas stay solid Ember.

**The Crimson Down Rule.** A negative or removed value is crimson, never a data colour, and always carries an arrow.

**The Paper Button Rule.** The primary action is a paper-white button with ink text, never a warm fill.

## Typography

**Display Font:** Geist (with ui-sans-serif, system-ui)
**Body Font:** Geist, with stylistic sets `ss01` and `cv11` on the body
**Label/Mono Font:** Geist Mono (with ui-monospace, SFMono-Regular)

**Character:** A single family pair from the same foundry: heavy, tightly packed sans claims beside an engineer's mono that only ever speaks in values.

### Hierarchy
- **Display** (700, 44px mobile, 60px sm, 74px lg; line-height 0.97): the hero claim only.
- **Headline** (700, 36px mobile, 48px sm, 56px lg; line-height 0.98; up to 68px for the closing call): section headings, capped near 14 to 18ch.
- **Headline Small** (700, 28px to 34px): a sub-heading inside a section, such as the comparison block.
- **Title Large** (600, 26px, -0.02em): card titles in the run options.
- **Title** (600, 20px, -0.015em): list and step titles (capabilities, route stops). FAQ questions use 500 at 18px, -0.01em.
- **Body** (400, 16px, line-height 1.6; lede 17px from sm): ledes and section intros, 46 to 60ch.
- **Body Small** (400, 15 to 15.5px, line-height 1.6 to 1.65): row and card copy, FAQ answers, up to 64ch. Footnotes and footer copy drop to 13 to 14px in faint gray.
- **Label** (500, 14 to 15px): buttons, nav, tabs.
- **Data** (Geist Mono 600, 22px mobile, 26px sm, tabular figures): KPI values and the live count.
- **Data Label** (Geist Mono 400, 10.5 to 11.5px, uppercase, 0.08em): KPI labels, table column heads, the SAMPLE DATA tag. Lowercase mono at 10 to 12.5px handles axis dates, paths, event names and meta.
- **Code** (Geist Mono 400, 11.5px mobile, 14px sm, 15px xl; line-height 1.9): code blocks and diffs.

### Named Rules
**The Tight Display Rule.** Every display and headline heading is Geist 700 at -0.045em with line-height near 0.98 and balanced wrapping. Lighter weights or looser tracking belong to titles and below.

**The Mono Means Measurement Rule.** Geist Mono is only for code, data and measurements (values, paths, event names, dates, file names, tabular headers). It never sets prose, headings, buttons or navigation.

## Layout

A single centered container (max 1440px) with gutters of 20px on phones, 32px from sm, 56px from lg. Sections are separated by a full-width 1px hairline and padded 96px vertically (128px from sm). The recurring desktop grammar is an asymmetric two-column split: a fixed column of 380 to 440px holding a heading and lede beside a fluid content column, at gaps of 48 to 80px. In capabilities the heading column is sticky (top 112px). Section headings sit 56 to 64px above their content.

Lists are ruled rather than boxed: capabilities, FAQ and the comparison table are stacks of rows bordered top and bottom, with a 220px name column inside each capability row from sm. The event route is four equal columns joined by one horizontal line on desktop and becomes a vertical rail with left-aligned stops on phones.

Breakpoints are Tailwind's defaults (640, 768, 1024, 1280). Collapsing is by column, never by shrinking: the hero splits into heading above lede, the dashboard drops its sidebar below md and hides lower feed rows, tabs scroll horizontally with a fading mask on phones. Anchor scrolling clears the sticky 68px header with an 88px scroll padding.

## Elevation & Depth

The system is flat and tonal. Depth comes from stepping the neutral ramp (ink, then panel, then raised, then hover) and from 1px rules; no card, button or menu casts a shadow. The sticky header goes translucent (ink at 90% with a medium backdrop blur) and gains its bottom rule only once the page has scrolled.

### Shadow Vocabulary
- **Stage drop** (`box-shadow: 0 40px 120px -40px rgba(0,0,0,0.9)`): only under the hero dashboard frame, lifting the product off the page.

### Named Rules
**The One Lift Rule.** The product frame is the only thing that casts a shadow. Everything else separates by tone and hairline.

## Shapes

Soft, small, consistent corners that grow with the size of the container: 4px on chart bars, 5 to 7px on chips and list highlights, 8 to 9px on controls, 12px on dashboard panels, 16px on cards and the code block, 18px on the dashboard frame. Status pills, dots and the scrollbar are fully round. Borders are always 1px. Markers are geometric and small: 6px dots, 11px hollow route nodes, 12px dash bullets. Focus rings follow a 6px corner.

## Components

### Buttons
Quiet, compact and solid, with a pressed nudge rather than a glow.
- **Shape:** gently rounded (9px), 44px tall, 18px side padding, 15px Geist 500, optional 16 to 17px icon at an 8px gap.
- **Primary:** paper fill with ink text. Hover steps to the paper-pressed gray.
- **Outline:** transparent with a strong-hairline border and paper text; hover lifts to the raised fill and a faint border, and a trailing arrow nudges 2px right.
- **Hover / Focus:** 200ms transitions on the expo-out curve; active presses down 1px; focus is the global 2px Flare outline at 3px offset.
- **Compact (nav):** the same paper button at 36px tall, 8px radius, 14px text.
- **Utility (copy):** 32px tall, 6px radius, raised fill with a hairline border and muted text that turns paper on hover.

### Chips
- **Style:** data chips in the dashboard are 7px-radius hairline outlines with mono 11.5px muted text; the SAMPLE DATA tag is a raised fill with faint uppercase mono.
- **Status pill:** fully round, hairline border, 13px text with a 6px dot. A ready state is a filled soft-gray dot on a strong border; a coming-soon state is a hollow dot on a plain rule. Status is neutral, not a brand colour.

### Cards / Containers
- **Corner Style:** 16px for content cards, 12px for panels inside the dashboard.
- **Background:** the highlighted card uses panel black with a strong hairline; the secondary card is transparent with a plain hairline.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1px rule or strong rule.
- **Internal Padding:** 28px, 36px from sm; dashboard panels 16px.

### Tabs
- **Style:** 36px tall, 8px radius, 14px Geist. Inactive tabs are muted text with no fill; the active tab gets the raised fill and paper text. Arrow keys move between tabs.

### Navigation
- **Style:** sticky 68px bar, logo left, 14px muted links that turn paper on hover, Sign in as a plain link and GitHub as the compact paper button at right.
- **Scroll state:** transparent rule at the top; after 8px of scroll, ink at 90% with backdrop blur and a hairline.
- **Mobile:** a 40px menu toggle opens a full-width panel of 17px soft-gray links with raised hover rows; Escape closes it.

### Links
- **Inline:** Flare text with a Flare underline at 40% opacity (1px, 0.22em offset) that goes to full Flare on hover.
- **Card call to action:** paper 15px text with a strong-hairline underline that turns Flare on hover, plus an arrow that nudges right.

### Product previews: the app world (signature)
Product imagery is the dashboard itself, rebuilt as components, never a drawn mockup. Inside a preview the page switches to the dashboard's own world (the `app-*` colours: #151515 ground, #1a1a1a sidebar and cards, #272727 lines, #a6a6a6 muted text) and its type ramp (10px uppercase labels at 0.5px tracking, 12 to 13px rows and controls, 19px mono values, 44px realtime count), set in Geist and Geist Mono. 6px corners inside, the 18px frame and the stage drop outside. Every preview carries the SAMPLE DATA tag (in the sidebar from md, top-right below md). Previews are decorative (`aria-hidden`); the tour's tabs are the keyboard path.

- **App frame** (`components/product/app-frame.tsx`): the project sidebar of apps/start with its exact order and lucide icons; clicking an entry switches the view (in the hero it opens the tour at that view).
- **Hero: Overview** (`overview-view.tsx`): toolbar (range, arrows, interval, filters, AI filter field, live count, Public), the eight KPI cards with 30 lit Ember mini bars (the selected card keeps a 2px Ember inset edge), the unique-visitors chart with the previous period in gray, the incomplete day dashed and the spike's referrer pinned on the peak, hover readout, then the referrer and pages tables with source icons, revenue rings and share fills. Every 2.4s while in view the live count moves and today's numbers tick up. Below sm only four KPI cards show so the chart stays visible.
- **Tour** (`product-tour.tsx`): tabs Realtime, Sessions & replay, Funnels, Retention, Profiles, AI chat, with a two-line caption slot so the frame never shifts. One crossfade (0.35s, expo-out) between views.
- **Realtime**: the Natural Earth 110m map in the dashboard's Mercator band (static `public/realtime-map.svg` from `scripts/build-map.ts`), cover-fitted with the city dots in the same box; a new event every 1.8s pings its city and enters the feed.
- **Sessions & replay**: the sessions table and the replay sheet playing a recorded visit to a sample pricing page (cursor path, click ripple, timeline with event markers); below lg the sheet covers the table.
- **Funnels / Retention**: the report builder (steps on the left), data in Ember; drop-off in crimson with an arrow.
- **Profiles**: metrics strip, properties, most viewed pages and the activity timeline in event colours.
- **AI chat**: tool calls, a result chart in the event palette, the answer streaming once, and the model picker with "Your OpenAI key" (bring your own key).

All motion stops under reduced motion: ticks halt, pings hide, the chat answer shows in full.

### Code Diff (signature)
A 16px panel-black card with a tab bar and copy button above a mono code body at line-height 1.9 with gutter line numbers in strong hairline. Added lines get an 8% green wash, paper text and a green `+`; removed lines get a 7% crimson wash, muted struck-through text and a crimson minus; context lines are soft or faint.

### Event Route (signature)
Four stops joined by a 1px strong-hairline line through 11px hollow nodes. One Flare-tipped gradient pulse travels the line every 4.8s (`cubic-bezier(0.45, 0, 0.2, 1)`), horizontally on desktop and down the rail on phones, and is removed under reduced motion.

## Do's and Don'ts

### Do:
- **Do** keep each warm colour to its job: Ember for data, Spark for live (live count, newest feed row, online dot), Flare for links, focus and selection.
- **Do** set every display and headline heading in Geist 700 at -0.045em, line-height about 0.98.
- **Do** put every value, path, event name, date and code line in Geist Mono, with tabular figures for numbers that change.
- **Do** show positive deltas in green and negative deltas in crimson, each with an arrow, so color is never the only cue.
- **Do** separate surfaces with 1px hairlines and tonal steps (ink, panel, raised).
- **Do** give each moment at most one authored motion, and stop it under `prefers-reduced-motion` (interval halted, ping removed, pulse hidden, smooth scroll off).
- **Do** label any product imagery built from invented numbers as SAMPLE DATA.

### Don't:
- **Don't** fill buttons, cards or backgrounds with a warm colour; the primary button is paper on ink.
- **Don't** use a data colour for negative, error or removed states; that is crimson.
- **Don't** set prose, headings, buttons or navigation in Geist Mono.
- **Don't** add shadows beyond the single stage drop under the product frame.
- **Don't** put uppercase mono labels above section headings; tracked uppercase mono belongs to data labels inside the product and tables.
- **Don't** run a second ambient animation alongside a moment's authored motion.
