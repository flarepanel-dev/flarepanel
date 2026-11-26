import { Button, Link, Text } from '@react-email/components';
import { z } from 'zod';
import { Layout } from '../components/layout';

export const zEmailVerify = z.object({
  url: z.string(),
});

export type Props = z.infer<typeof zEmailVerify>;
export default EmailVerify;
export function EmailVerify({
  url = 'https://flarepanel.dev',
  unsubscribeUrl,
}: Props & { unsubscribeUrl?: string }) {
  return (
    <Layout unsubscribeUrl={unsubscribeUrl}>
      <Text>
        Confirm your email address to finish creating your FlarePanel account.
        Follow the link below and you will be signed in:
      </Text>
      <Button
        href={url}
        style={{
          backgroundColor: '#000',
          borderRadius: '6px',
          color: '#fff',
          padding: '12px 20px',
          textDecoration: 'none',
        }}
      >
        Verify email
      </Button>
      <Text>
        Verification link: <Link href={url}>{url}</Link>
      </Text>
      <Text style={{ color: '#666' }}>
        The link works for 24 hours. Did not sign up for FlarePanel? Ignore this
        email: the account stays inactive unless the link is opened.
      </Text>
    </Layout>
  );
}
