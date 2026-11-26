import type { Metadata } from 'next';
import { IpLookup } from '@/components/tools/ip-lookup';
import { ToolPage } from '@/components/tools/tool-page';

export const metadata: Metadata = {
  title: 'IP address lookup: find the location of an IP · FlarePanel',
  description:
    'Free IP lookup: see the country, region and city of any IPv4 or IPv6 address, or of your own connection. No sign-up.',
  alternates: { canonical: '/tools/ip-lookup' },
};

export default function IpLookupPage() {
  return (
    <ToolPage
      lede="See roughly where an IP address is: country, region and city. Leave the field empty to look up your own connection. We don't keep what you look up."
      path="/tools/ip-lookup"
      title="IP address lookup"
    >
      <IpLookup />
    </ToolPage>
  );
}
