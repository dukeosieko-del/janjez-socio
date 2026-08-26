import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/order", destination: "/services", permanent: true },
      { source: "/order/:path*", destination: "/services/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
