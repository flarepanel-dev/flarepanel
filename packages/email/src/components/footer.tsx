import { Hr, Link, Row, Section, Text } from '@react-email/components';

const GITHUB_URL = 'https://github.com/flarepanel-dev/flarepanel';
const SITE_URL = 'https://flarepanel.dev';
const CONTACT = 'hello@flarepanel.dev';

export function Footer({ unsubscribeUrl }: { unsubscribeUrl?: string }) {
  return (
    <>
      <Hr />
      <Section className="w-full p-6">
        <Text className="font-regular text-[16px]" style={{ margin: 0 }}>
          FlarePanel: open-source web and product analytics on Cloudflare.
        </Text>

        <Row className="mt-4">
          <Text className="text-[#707070] text-[14px]" style={{ margin: 0 }}>
            <Link className="text-[#707070]" href={SITE_URL}>
              flarepanel.dev
            </Link>
            {' · '}
            <Link className="text-[#707070]" href={GITHUB_URL}>
              GitHub
            </Link>
            {' · '}
            <Link className="text-[#707070]" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </Link>
          </Text>
        </Row>

        {unsubscribeUrl && (
          <Row className="mt-4">
            <Link
              className="text-[#707070] text-[14px]"
              href={unsubscribeUrl}
              title="Unsubscribe"
            >
              Notification preferences
            </Link>
          </Row>
        )}
      </Section>
    </>
  );
}
