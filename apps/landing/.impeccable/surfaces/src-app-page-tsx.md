---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

## Scope

flarepanel.dev marketing landing page (`apps/landing`). Mode: Persuade. Audience: developers and startup teams choosing web + product analytics. Primary action: star / read on GitHub; secondary: get early access (dashboard sign-up). Proof: the product itself, labelled sample data, open-source code; no customers, testimonials, numbers or pricing.

Scene: an engineer evaluating tools at their desk late in the day, next to a dark IDE and the dark FlarePanel dashboard; the page is dark for that reason.

## Direction contract

THESIS: The product is the proof. The page opens on the FlarePanel dashboard itself, running, under a short ownership claim; it refuses the centered-slogan-over-feature-cards opener and the abstract "global network" globe.

OWN-WORLD: Obsidian #0D0D10 ground with #111114/#18181B raised panels and 1px #27272A rules; Hot coral #FF496B used only for the live signal (current bar, live count, links, focus); white #F9FAFE primary buttons; Geist display at -0.045em, Geist Mono only for data, code and measurements; crimson for negative deltas, never coral; inverted Bar F tile logo.

STORY: Visitor sees real analytics UI, learns it runs entirely on Cloudflare with no servers, sees their OpenPanel SDK works by changing one URL, understands how events flow (edge Worker → per-project Durable Object → R2), sees two ways to run it honestly labelled, then stars the repo or joins early access.

FIRST VIEWPORT: Nav (logo, Product / How it works / Docs / FAQ, Sign in, GitHub). Left: two-line headline "Your users, your traffic, your Cloudflare." at ~74px. Right column: one-paragraph lede, white "Star on GitHub" and outlined "Get early access". From y≈330 the dashboard frame (sidebar + KPI strip + bar chart) bleeds off the fold, tagged SAMPLE DATA. Signature interaction: the dashboard is alive — the current bar is the only coral bar (sequencer step), the live count ticks and a small event feed streams, paused under reduced motion.

FORM: "The product on stage", position 3 of the re-roll hand (dealt, option index 2). seed:de387b0c82ba2328

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Docs (Fumadocs) later; /docs links to the GitHub docs folder for now.
- Pricing section waits until pricing is decided.
