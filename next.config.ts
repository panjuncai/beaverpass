import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'beaverpassbucket.s3.us-east-2.amazonaws.com',
        port: '',
        pathname: '/**',
        search: '',
      },
    ],
  },
  transpilePackages: ["antd-mobile"]
};

export default nextConfig;
