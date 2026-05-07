import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
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
