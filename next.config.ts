import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Izinkan domain Supabase Storage untuk next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/guru',
        destination: '/login',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
