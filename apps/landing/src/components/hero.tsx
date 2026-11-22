import { DashboardStage } from './dashboard-stage';
import { Container, EarlyAccessButton, GitHubButton } from './ui';

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative">
      <Container className="pt-10 sm:pt-12 lg:pt-11">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end lg:gap-12 xl:grid-cols-[minmax(0,1fr)_400px]">
          <h1
            className="display max-w-[15ch] text-[44px] sm:text-[60px] lg:text-[74px] lg:leading-[0.97] xl:max-w-none"
            id="hero-title"
          >
            Your users, your traffic, <br className="hidden xl:block" />
            your&nbsp;Cloudflare.
          </h1>
          <div className="lg:pb-2">
            <p className="max-w-[52ch] text-[16px] text-muted leading-[1.6] sm:text-[17px]">
              Open-source web and product analytics that runs entirely on
              Cloudflare. No servers, no ClickHouse, and the OpenPanel SDKs you
              already ship keep working.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <GitHubButton />
              <EarlyAccessButton />
            </div>
          </div>
        </div>
      </Container>
      <Container className="relative mt-10 sm:mt-14 lg:mt-[60px]">
        <DashboardStage />
      </Container>
    </section>
  );
}
