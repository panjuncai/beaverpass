import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/beaverpassbucket/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
