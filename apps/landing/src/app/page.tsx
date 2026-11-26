import type { Metadata } from 'next';
import { DropIn } from '@/components/drop-in';
import { Faq } from '@/components/faq';
import { ClosingCta, Footer } from '@/components/footer';
import { Hero } from '@/components/hero';
import { HowItWorks } from '@/components/how-it-works';
import { LiveProof } from '@/components/live-proof';
import { Nav } from '@/components/nav';
import { ProductTour } from '@/components/product/product-tour';
import { RunOptions } from '@/components/run-options';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/blog/rss.xml' },
  },
};

// Who we are and what the product is, for search engines and AI answers.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      logo: `${site.url}/logo.png`,
      sameAs: [site.github, site.x],
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      name: site.name,
      url: site.url,
      publisher: { '@id': `${site.url}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      name: site.name,
      url: site.url,
      description: site.description,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Web analytics',
      operatingSystem: 'Web',
      license: 'https://www.gnu.org/licenses/agpl-3.0.html',
      publisher: { '@id': `${site.url}/#organization` },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <DropIn />
        <ProductTour />
        <LiveProof />
        <HowItWorks />
        <RunOptions />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        type="application/ld+json"
      />
    </>
  );
}
