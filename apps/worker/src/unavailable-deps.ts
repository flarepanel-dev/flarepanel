/** A dependency that exists on Bun but not yet on Workers: any use throws. */
export function unavailableOnWorkers<T>(name: string): T {
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (property === 'then') {
          return undefined;
        }
        throw new Error(
          `${name} is not available on Cloudflare Workers yet (accessed .${String(property)}); it moves with the event pipeline in Phase 3`
        );
      },
    }
  ) as T;
}
