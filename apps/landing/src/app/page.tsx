import { Capabilities } from '@/components/capabilities';
import { DropIn } from '@/components/drop-in';
import { Faq } from '@/components/faq';
import { ClosingCta, Footer } from '@/components/footer';
import { Hero } from '@/components/hero';
import { HowItWorks } from '@/components/how-it-works';
import { Nav } from '@/components/nav';
import { RunOptions } from '@/components/run-options';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <DropIn />
        <Capabilities />
        <HowItWorks />
        <RunOptions />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
