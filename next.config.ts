import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google profile avatars
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // Facebook profile avatars
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        // Facebook CDN (used by some accounts)
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
    ],
  },
};

export default nextConfig;
