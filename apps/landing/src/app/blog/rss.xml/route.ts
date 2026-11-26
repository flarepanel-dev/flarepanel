import { POSTS } from '@/lib/blog';
import { site } from '@/lib/site';

export const dynamic = 'force-static';

function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function GET() {
  const items = POSTS.map(({ meta }) => {
    const url = `${site.url}/blog/${meta.slug}`;
    return `    <item>
      <title>${escape(meta.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${escape(meta.description)}</description>
      <pubDate>${new Date(`${meta.date}T12:00:00Z`).toUTCString()}</pubDate>
    </item>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>FlarePanel blog</title>
    <link>${site.url}/blog</link>
    <description>Product news, engineering notes and guides from FlarePanel.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
}
