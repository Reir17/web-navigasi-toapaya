import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-expect-error - abaikan pemeriksaan tipe untuk properti eslint
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;