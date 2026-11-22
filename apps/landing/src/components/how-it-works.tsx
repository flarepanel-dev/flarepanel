import { Container } from './ui';

const STOPS = [
  {
    name: 'Your site or app',
    service: 'SDK · op1.js',
    body: 'The SDK batches the event and sends it to the closest Cloudflare location.',
  },
  {
    name: 'Nearest edge',
    service: 'Workers',
    body: 'A Worker checks the client, adds country and device, and answers straight away.',
  },
  {
    name: 'Your project',
    service: 'Durable Objects',
    body: 'One object per project stores recent events and keeps daily rollups ready for charts.',
  },
  {
    name: 'Archive',
    service: 'R2',
    body: 'Raw events are compressed by the hour and kept for as long as you choose.',
  },
] as const;

const COMPARE = [
  ['Servers or VMs to patch', 'Several', 'None'],
  [
    'Analytics database to size and back up',
    'ClickHouse cluster',
    'Durable Objects + R2',
  ],
  ['Cache and job queue', 'Redis + workers', 'Queues'],
  ['Cost when nobody visits', 'Always on', 'Only the Workers plan'],
  ['Traffic spike', 'You scale it', 'Cloudflare scales it'],
] as const;

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-title"
      className="border-rule border-t py-24 sm:py-32"
      id="how-it-works"
    >
      <Container>
        <div className="max-w-[720px]">
          <h2
            className="display text-[36px] sm:text-[48px] lg:text-[56px]"
            id="how-title"
          >
            Four stops, all on Cloudflare.
          </h2>
          <p className="mt-5 max-w-[60ch] text-[16px] text-muted leading-[1.6]">
            Every event takes the same short route. Accounts and settings live
            in D1, background work runs on Queues, and nothing waits on a server
            you have to keep alive.
          </p>
        </div>

        <div className="relative mt-16">
          {/* the route: horizontal on desktop, a vertical rail on phones */}
          <div
            aria-hidden
            className="absolute top-[6px] bottom-[6px] left-[5px] w-px overflow-hidden bg-rule-strong md:top-[5px] md:right-[12.5%] md:bottom-auto md:left-[12.5%] md:h-px md:w-auto"
          >
            <span className="route-pulse-y absolute inset-0 md:hidden">
              <span className="absolute top-0 left-0 h-16 w-px -translate-y-full bg-gradient-to-b from-transparent to-coral" />
            </span>
            <span className="route-pulse-x absolute inset-0 hidden md:block">
              <span className="absolute top-0 left-0 h-px w-24 -translate-x-full bg-gradient-to-r from-transparent to-coral" />
            </span>
          </div>
          <ol className="grid gap-10 md:grid-cols-4 md:gap-0">
            {STOPS.map((stop) => (
              <li
                className="relative grid grid-cols-[11px_minmax(0,1fr)] gap-x-5 md:block md:px-4 md:text-center"
                key={stop.name}
              >
                <span
                  aria-hidden
                  className="relative mt-[1px] block size-[11px] rounded-full border border-faint bg-ink md:mx-auto md:mt-0"
                />
                <div className="md:mt-8">
                  <h3 className="font-semibold text-[20px] tracking-[-0.015em]">
                    {stop.name}
                  </h3>
                  <p className="mt-1 text-[14px] text-soft">{stop.service}</p>
                  <p className="mt-3 max-w-[34ch] text-[15px] text-muted leading-[1.6] md:mx-auto">
                    {stop.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-24 grid gap-10 border-rule border-t pt-16 sm:mt-28 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-14">
          <div>
            <h3 className="display max-w-[16ch] text-[28px] sm:text-[34px]">
              What you no longer run.
            </h3>
            <p className="mt-4 max-w-[44ch] text-[15.5px] text-muted leading-[1.6]">
              A typical self-hosted analytics stack is a set of servers that
              stay on all month. FlarePanel is a set of Cloudflare services you
              pay for as they are used, on a Workers Paid plan.
            </p>
          </div>
          <div>
            <table className="w-full border-collapse text-left text-[14px] sm:text-[15px]">
              <caption className="sr-only">
                A typical self-hosted analytics stack compared with FlarePanel
              </caption>
              <thead>
                <tr className="border-rule border-b font-mono text-[11.5px] text-faint uppercase tracking-[0.08em]">
                  <th className="py-3 pr-4 font-normal" scope="col">
                    <span className="sr-only">Concern</span>
                  </th>
                  <th className="py-3 pr-4 font-normal" scope="col">
                    Typical self-hosted
                  </th>
                  <th className="py-3 font-normal text-paper" scope="col">
                    FlarePanel
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([concern, typical, flare]) => (
                  <tr className="border-rule border-b" key={concern}>
                    <th
                      className="w-[42%] py-4 pr-4 font-normal text-soft"
                      scope="row"
                    >
                      {concern}
                    </th>
                    <td className="py-4 pr-4 text-faint">{typical}</td>
                    <td className="py-4 font-medium text-paper">{flare}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  );
}
