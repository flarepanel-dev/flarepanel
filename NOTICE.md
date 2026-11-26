# Notice

FlarePanel is a modified version of OpenPanel
(https://github.com/Openpanel-dev/openpanel), copyright OpenPanel and its
contributors, licensed under the GNU Affero General Public License v3.0.

- Forked: 2026-11-22, from OpenPanel's `main` branch.
- Modified since then by the FlarePanel contributors: the backend was rebuilt
  on Cloudflare (Workers, D1, Durable Objects, R2, Queues), the dashboard,
  website and docs were rebranded and extended, and new features were added.
  The git history of this repository records every change.

FlarePanel is not affiliated with, sponsored or endorsed by OpenPanel. The
name "OpenPanel" is used only to describe where this software comes from and
what it is compatible with, as OpenPanel's trademark guidelines allow
(https://github.com/Openpanel-dev/openpanel/blob/main/TRADEMARK.md). No
OpenPanel logos are used.

## Licenses

- Platform (everything except `packages/sdks`): AGPL-3.0, see `LICENSE.md`.
  If you run a modified version for others over a network, AGPL section 13
  requires you to offer them its source code; the hosted dashboard links to
  this repository for that reason.
- Client SDKs (`packages/sdks/*`): MIT, keeping OpenPanel's copyright notice
  next to FlarePanel's.

## Third-party data and assets

- IP geolocation for server-side events: DB-IP City Lite
  (https://db-ip.com), licensed under CC BY 4.0. "IP Geolocation by DB-IP."
- World map: Natural Earth (public domain).
- Fonts: Geist and Geist Mono by Vercel, SIL Open Font License 1.1.
- Country flags: flag-icons (MIT).
- Cloudflare product names and icons are trademarks of Cloudflare, Inc.;
  FlarePanel is not affiliated with or endorsed by Cloudflare.
