import {
  Column,
  Hr,
  Img,
  Link,
  Row,
  Section,
  Text,
} from '@react-email/components';

const baseUrl = 'https://flarepanel.dev';

export function Footer({ unsubscribeUrl }: { unsubscribeUrl?: string }) {
  return (
    <>
      <Hr />
      <Section className="w-full p-6">
        <Text className="font-regular text-[21px]" style={{ margin: 0 }}>
          An open-source alternative to Mixpanel
        </Text>

        <br />

        <Row className="mt-4">
          <Column className="w-8">
            <Link href="https://git.new/openpanel">
              <Img
                alt="FlarePanel on Github"
                height="22"
                src={`${baseUrl}/icons/github.png`}
                width="22"
              />
            </Link>
          </Column>
          <Column className="w-8">
            <Link href="https://x.com/openpaneldev">
              <Img
                alt="FlarePanel on X"
                height="22"
                src={`${baseUrl}/icons/x.png`}
                width="22"
              />
            </Link>
          </Column>
          <Column className="w-8">
            <Link href="https://go.flarepanel.dev/discord">
              <Img
                alt="FlarePanel on Discord"
                height="22"
                src={`${baseUrl}/icons/discord.png`}
                width="22"
              />
            </Link>
          </Column>
          <Column className="w-auto">
            <Link href="mailto:hello@flarepanel.dev">
              <Img
                alt="Contact FlarePanel with email"
                height="22"
                src={`${baseUrl}/icons/email.png`}
                width="22"
              />
            </Link>
          </Column>
        </Row>

        <Row>
          <Text className="text-[#B8B8B8] text-xs">
            FlarePanel AB - Sankt Eriksgatan 100, 113 31, Stockholm, Sweden.
          </Text>
        </Row>

        {unsubscribeUrl && (
          <Row>
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
