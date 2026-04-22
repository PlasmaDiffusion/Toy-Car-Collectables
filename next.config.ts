import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow external placeholder domains if needed in the future
    remotePatterns: [],
  },
};

export default nextConfig;
