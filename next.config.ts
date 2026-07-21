import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Vercel deployment settings
  // output: "standalone", // Uncomment if you want standalone output for Docker/self-hosting
};

export default nextConfig;
