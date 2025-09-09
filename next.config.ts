import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'alphaakki.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'v.ftcdn.net',
      },
    ],
  },
};

export default nextConfig;
