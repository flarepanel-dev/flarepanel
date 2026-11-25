// Dashboard server entry: TanStack Start's default handler, plus security
// headers on every rendered page (see security-headers.ts).
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server';
import { withSecurityHeaders } from './security-headers';

const startFetch = createStartHandler(defaultStreamHandler);

export default {
  async fetch(...args: Parameters<typeof startFetch>) {
    const [request] = args;
    const response = await startFetch(...args);
    return withSecurityHeaders(request, response);
  },
};
