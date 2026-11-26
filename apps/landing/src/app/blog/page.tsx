import type { Metadata } from 'next';
import Link from 'next/link';
import { PostMetaLine } from '@/components/blog/post-meta';
import { Footer } from '@/components/footer';
import { Nav } from '@/components/nav';
import { Container } from '@/components/ui';
import { POSTS } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog: FlarePanel',
  description:
    'Product news, engineering notes and guides from the team building FlarePanel, open-source analytics on Cloudflare.',
  alternates: {
    canonical: '/blog',
    types: { 'application/rss+xml': '/blog/rss.xml' },
  },
};

export default function BlogIndex() {
  const [latest, ...rest] = POSTS;
  return (
    <>
      <Nav />
      <main className="border-rule border-t" id="main">
        <Container className="py-16 sm:py-24">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:gap-14">
            <h1 className="display text-[44px] sm:text-[60px] lg:text-[72px]">
              Blog
            </h1>
            <p className="max-w-[52ch] text-[16px] text-muted leading-[1.6] lg:pb-2">
              What we ship, how it works under the hood, and how to get the most
              out of FlarePanel.{' '}
              <a
                className="text-ember underline decoration-ember/40 underline-offset-[0.22em] hover:decoration-ember"
                href="/blog/rss.xml"
              >
                RSS
              </a>
            </p>
          </div>

          {latest ? (
            <Link
              className="group mt-14 grid gap-6 rounded-[18px] border border-rule bg-panel p-6 transition-colors hover:border-rule-strong sm:p-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14"
              href={`/blog/${latest.meta.slug}`}
            >
              <div>
                <PostMetaLine date={latest.meta.date} tags={latest.meta.tags} />
                <h2 className="display mt-4 max-w-[22ch] text-[30px] sm:text-[40px]">
                  {latest.meta.title}
                </h2>
              </div>
              <div className="flex flex-col justify-end gap-5">
                <p className="text-[16px] text-muted leading-[1.6]">
                  {latest.meta.description}
                </p>
                <span className="text-[15px] text-ember">
                  Read the post{' '}
                  <span className="inline-block transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </div>
            </Link>
          ) : null}

          <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rest.map(({ meta }) => (
              <li key={meta.slug}>
                <Link
                  className="group flex h-full flex-col rounded-[18px] border border-rule p-6 transition-colors hover:border-rule-strong hover:bg-panel sm:p-8"
                  href={`/blog/${meta.slug}`}
                >
                  <PostMetaLine date={meta.date} tags={meta.tags} />
                  <h2 className="mt-4 font-semibold text-[22px] text-paper leading-[1.25] tracking-[-0.02em]">
                    {meta.title}
                  </h2>
                  <p className="mt-3 text-[15px] text-muted leading-[1.6]">
                    {meta.description}
                  </p>
                  <span className="mt-auto pt-6 text-[14px] text-ember">
                    Read{' '}
                    <span className="inline-block transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </main>
      <Footer />
    </>
  );
}
