import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Abaikan error TypeScript saat build di Vercel (opsional)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;