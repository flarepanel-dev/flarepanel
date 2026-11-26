import { Nav } from '@/components/nav';
import { Container, GitHubButton } from '@/components/ui';

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main">
        <Container className="py-32 sm:py-40">
          <p className="tabular font-mono text-[13px] text-ember">404</p>
          <h1 className="display mt-4 max-w-[16ch] text-[44px] sm:text-[64px]">
            This page is not here.
          </h1>
          <p className="mt-5 max-w-[50ch] text-[16px] text-muted leading-[1.6]">
            The link may be old, or the page may have moved.{' '}
            <a
              className="text-ember underline decoration-ember/40 underline-offset-[0.22em] hover:decoration-ember"
              href="/"
            >
              Go to the home page
            </a>
            .
          </p>
          <div className="mt-8">
            <GitHubButton label="Browse the source" />
          </div>
        </Container>
      </main>
    </>
  );
}
