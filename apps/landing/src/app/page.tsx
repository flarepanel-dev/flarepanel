import { DropIn } from '@/components/drop-in';
import { Faq } from '@/components/faq';
import { ClosingCta, Footer } from '@/components/footer';
import { Hero } from '@/components/hero';
import { HowItWorks } from '@/components/how-it-works';
import { LiveProof } from '@/components/live-proof';
import { Nav } from '@/components/nav';
import { ProductTour } from '@/components/product/product-tour';
import { RunOptions } from '@/components/run-options';

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
    </>
  );
}
