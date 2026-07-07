import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/default',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: isProd ? '/robots.prod.txt' : '/robots.disallow.txt',
      },
    ];
  },
};

export default nextConfig;
