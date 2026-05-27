import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        // Dashboard-uploaded product images live in Supabase Storage and are
        // surfaced as public object URLs. next/image (CatalogImage — catalog
        // banner + product detail hero) rejects un-allowlisted hosts with a
        // 400, so the Supabase project host must be permitted here.
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // Dashboard product image uploads accept up to 5MB; default is 1MB.
    serverActions: { bodySizeLimit: "6mb" },
  },
  async redirects() {
    return [
      {
        source: "/catalog",
        destination: "/build",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
