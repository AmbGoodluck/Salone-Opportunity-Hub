import type { NextConfig } from "next"

const nextConfig: NextConfig = {
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
  // output: 'export', // Uncomment for static export to Cloudflare Pages
}

export default nextConfig
