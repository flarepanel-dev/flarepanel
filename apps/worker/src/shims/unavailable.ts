/**
 * Stand-ins for Node-only dependencies that the Worker bundle aliases away
 * (see wrangler.jsonc `alias`). They load fine and fail loudly only if code
 * that needs them actually runs on Workers. Everything they back belongs to the
 * event pipeline or to integrations that move in later phases.
 */
export function unavailable(name: string): never {
  throw new Error(
    `${name} is not available on Cloudflare Workers (FlarePanel runs it on Bun until a later phase)`
  );
}

export class UnavailableClass {
  constructor(..._args: unknown[]) {
    unavailable(new.target.name || 'This dependency');
  }
}
