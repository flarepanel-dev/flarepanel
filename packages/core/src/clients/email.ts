// Loaded lazily: @flarepanel/email depends on @flarepanel/db, which depends on
// @flarepanel/core, so a static import would make core's barrel load
// @flarepanel/db mid-evaluation and resolve core's own exports as undefined.
//
// No `ProviderError`: `@flarepanel/email` swallows every Resend and SMTP failure
// and returns `null`, so nothing reaches this wrapper to classify.

import type { EmailData, EmailTemplate } from '@flarepanel/email';

export type { EmailData, EmailTemplate } from '@flarepanel/email';

export async function sendEmail<T extends EmailTemplate>(
  templateKey: T,
  options: {
    to: string;
    data: EmailData<T>;
    replyTo?: string;
  }
) {
  const { sendEmail: send } = await import('@flarepanel/email');
  return send(templateKey, options);
}
