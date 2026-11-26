import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { site } from '@/lib/site';
import './globals.css';

const title = 'FlarePanel: open-source analytics that runs on Cloudflare';

const ANALYTICS_SNIPPET = `window.op=window.op||function(){var n=[];return new Proxy(function(){arguments.length&&n.push([].slice.call(arguments))},{get:function(t,r){return"q"===r?n:"call"===r||"apply"===r||"bind"===r?t[r]:function(){n.push([r].concat([].slice.call(arguments)))}},has:function(t,r){return"q"===r}})}();
window.op('init',{clientId:'${site.analyticsClientId}',trackScreenViews:true,trackOutgoingLinks:true,trackAttributes:true});`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description: site.description,
  applicationName: site.name,
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: site.name,
    title,
    description: site.description,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: site.description,
    images: ['/og.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0D0D10',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`} lang="en">
      <head>
        {/* We track this site with FlarePanel itself: no cookies, and the
            same script tag the docs tell customers to use. */}
        <script
          dangerouslySetInnerHTML={{ __html: ANALYTICS_SNIPPET }}
        />
        <script async defer src="/op1.js" />
      </head>
      <body className="min-h-dvh bg-ink text-paper">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-paper focus:px-4 focus:py-2 focus:font-medium focus:text-ink"
          href="#main"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
