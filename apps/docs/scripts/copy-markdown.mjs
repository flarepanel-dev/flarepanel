// Vocs writes each page's Markdown to dist/public/assets/md/<path>.md and
// links it as <path>.md (the "alternate" link and the page menu). Its own
// server rewrites those URLs; this site is plain static files, so copy them
// to where the links point.
import { cp, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../dist/public');
const source = path.join(root, 'assets/md');

let copied = 0;
for (const entry of await readdir(source, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
  const from = path.join(entry.parentPath, entry.name);
  await cp(from, path.join(root, path.relative(source, from)));
  copied++;
}
if (copied === 0) throw new Error(`No Markdown pages found in ${source}`);
console.log(`Copied ${copied} Markdown pages next to their HTML.`);
