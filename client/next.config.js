/** @type {import('next').NextConfig} */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["placeholder.svg"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  // This helps with dynamic server components
  output: 'standalone',
  experimental: {
    // This allows dynamic usage in routes that would typically
    // need to be statically generated at build time
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  // Mark API routes as dynamic to prevent static generation errors
  env: {
    BUILD_MODE: process.env.NEXT_PHASE === 'build' ? 'static' : 'dynamic',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000/api',
    NEXT_PUBLIC_COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME || process.env.COMPANY_NAME || 'Ranketha',
  },
}

module.exports = nextConfig
