import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostMetaLine } from '@/components/blog/post-meta';
import { Footer } from '@/components/footer';
import { Nav } from '@/components/nav';
import { Container, EarlyAccessButton } from '@/components/ui';
import { getPost, POSTS } from '@/lib/blog';
import { site } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map(({ meta }) => ({ slug: meta.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return {};
  }
  const { meta } = post;
  return {
    title: `${meta.title}: FlarePanel blog`,
    description: meta.description,
    alternates: { canonical: `/blog/${meta.slug}` },
    openGraph: {
      type: 'article',
      url: `${site.url}/blog/${meta.slug}`,
      title: meta.title,
      description: meta.description,
      publishedTime: meta.date,
      authors: [meta.author],
      images: [{ url: '/og.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['/og.png'],
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    notFound();
  }
  const { meta, Body } = post;
  const others = POSTS.filter((p) => p.meta.slug !== slug).slice(0, 2);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    author: { '@type': 'Organization', name: meta.author },
    publisher: { '@type': 'Organization', name: 'FlarePanel', url: site.url },
    mainEntityOfPage: `${site.url}/blog/${meta.slug}`,
  };

  return (
    <div>
      <Nav />
      <main className="border-rule border-t" id="main">
        <Container className="py-14 sm:py-20">
          <article className="mx-auto max-w-[72ch]">
            <Link
              className="text-[14px] text-muted transition-colors hover:text-paper"
              href="/blog"
            >
              ← All posts
            </Link>
            <div className="mt-8">
              <PostMetaLine date={meta.date} tags={meta.tags} />
            </div>
            <h1 className="display mt-4 text-[36px] sm:text-[48px] lg:text-[54px]">
              {meta.title}
            </h1>
            <p className="mt-5 text-[18px] text-soft leading-[1.6]">
              {meta.description}
            </p>
            <p className="mt-6 border-rule border-b pb-8 text-[14px] text-faint">
              By {meta.author}
            </p>
            <div className="legal-body blog-body mt-10">
              <Body />
            </div>
          </article>

          <aside className="mx-auto mt-20 max-w-[72ch] rounded-[18px] border border-rule bg-panel p-6 sm:p-8">
            <h2 className="font-semibold text-[20px] text-paper tracking-[-0.02em]">
              Try FlarePanel
            </h2>
            <p className="mt-2 text-[15px] text-muted leading-[1.6]">
              Open-source analytics on Cloudflare. Free for 30 days, no card
              needed.
            </p>
            <div className="mt-5">
              <EarlyAccessButton />
            </div>
          </aside>

          {others.length ? (
            <nav aria-label="More posts" className="mx-auto mt-14 max-w-[72ch]">
              <h2 className="font-mono text-[12px] text-faint uppercase tracking-[0.08em]">
                Read next
              </h2>
              <ul className="mt-4 grid gap-3">
                {others.map(({ meta: other }) => (
                  <li key={other.slug}>
                    <Link
                      className="group flex items-baseline justify-between gap-6 border-rule border-b py-4"
                      href={`/blog/${other.slug}`}
                    >
                      <span className="font-medium text-[17px] text-paper group-hover:text-ember">
                        {other.title}
                      </span>
                      <span className="shrink-0 text-ember">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </Container>
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
      </main>
      <Footer />
    </div>
  );
}
