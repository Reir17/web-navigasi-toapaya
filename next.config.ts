import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Mengabaikan error TypeScript saat build di Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Mengabaikan warning ESLint saat build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;