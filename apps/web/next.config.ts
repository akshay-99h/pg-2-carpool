import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const monorepoRoot = fileURLToPath(new URL('../../', import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: monorepoRoot,
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
