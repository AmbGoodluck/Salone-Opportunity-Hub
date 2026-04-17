import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/webp'],
  },
  // Required for @react-pdf/renderer (server component external packages)
  serverExternalPackages: ['@react-pdf/renderer'],
  // Cloudflare Pages compatibility
  output: 'export', // Static export for Cloudflare Pages
}

export default nextConfig
