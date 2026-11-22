import { OpenPanel } from '@flarepanel/web';

export const op = new OpenPanel({
  clientId: import.meta.env.VITE_OPENPANEL_CLIENT_ID ?? 'testbed-client',
  apiUrl: import.meta.env.VITE_OPENPANEL_API_URL ?? 'http://localhost:3333',
  trackScreenViews: true,
  trackOutgoingLinks: true,
  trackAttributes: true,
  disabled: true,
});
