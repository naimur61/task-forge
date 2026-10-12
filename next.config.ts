import type { NextConfig } from 'next';

// Real backend. The browser only talks to this app's own /api/v1, so there is no CORS
// and the refresh cookie stays first-party.
const BACKEND_URL = (process.env.BACKEND_URL ?? 'https://task-forge-server-theta.vercel.app').replace(/\/+$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/api/v1/:path*', destination: `${BACKEND_URL}/api/v1/:path*` }];
  },
};

export default nextConfig;
