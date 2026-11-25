import type { Metadata } from 'next';
import { ToolPage } from '@/components/tools/tool-page';
import { UrlChecker } from '@/components/tools/url-checker';

export const metadata: Metadata = {
  title: 'URL checker: status, speed, SEO and security headers · FlarePanel',
  description:
    'Free URL checker: test any public page for status code, redirects, response time, title and meta tags, social previews and security headers.',
  alternates: { canonical: '/tools/url-checker' },
};

export default function UrlCheckerPage() {
  return (
    <ToolPage
      lede="Check any public page: does it answer, how fast, where does it redirect, what do search engines and social networks see, and which security headers are set."
      path="/tools/url-checker"
      title="URL checker"
    >
      <UrlChecker />
    </ToolPage>
  );
}
