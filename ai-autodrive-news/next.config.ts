import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 确保这些服务端依赖在构建时被正确外部化，避免 module-not-found
  serverExternalPackages: [
    '@google/generative-ai',
    'rss-parser',
    'nodemailer',
    '@vercel/postgres',
  ],
};

export default nextConfig;
