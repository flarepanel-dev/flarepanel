import type { PlatformStores } from './ports';

/**
 * Process-wide stores for code that is not handed a `deps` scope (module-level
 * helpers such as `cacheable`). The app shell configures them once at boot; a
 * runtime registers a default (Redis on Bun) so older call sites keep working.
 */
let configured: PlatformStores | null = null;
let fallback: (() => PlatformStores) | null = null;

export function configurePlatformStores(stores: PlatformStores) {
  configured = stores;
}

export function registerDefaultPlatformStores(factory: () => PlatformStores) {
  fallback = factory;
}

export function getPlatformStores(): PlatformStores {
  if (!configured) {
    if (!fallback) {
      throw new Error(
        'Platform stores are not configured: call configurePlatformStores() at boot.'
      );
    }
    configured = fallback();
  }
  return configured;
}

/** Tests only: forget the configured stores. */
export function resetPlatformStores() {
  configured = null;
}
