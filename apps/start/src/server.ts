// Dashboard server entry: TanStack Start's default handler, plus an HTTPS
// redirect and security headers on every rendered page (see
// https-redirect.ts and security-headers.ts).
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server';
import { httpsRedirect } from './https-redirect';
import { withSecurityHeaders } from './security-headers';

const startFetch = createStartHandler(defaultStreamHandler);

export default {
  async fetch(...args: Parameters<typeof startFetch>) {
    const [request] = args;
    const insecure = httpsRedirect(request);
    if (insecure) {
      return insecure;
    }
    const response = await startFetch(...args);
    return withSecurityHeaders(request, response);
  },
};
