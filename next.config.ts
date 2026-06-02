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
      {
        // UploadThing CDN
        protocol: "https",
        hostname: "*.ufs.sh",
      },
      {
        // UploadThing legacy CDN
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

export default nextConfig;
