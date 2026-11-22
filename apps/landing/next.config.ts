import type { NextConfig } from 'next';

// Fully static site: `next build` writes plain files to `out/`, which the
// Worker in wrangler.jsonc serves as static assets (no server code runs).
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
