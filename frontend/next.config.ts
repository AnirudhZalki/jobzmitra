import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: BACKEND_URL.startsWith("https") ? "https" : "http",
        hostname: BACKEND_URL.replace(/^https?:\/\//, '').split(':')[0],
        port: BACKEND_URL.split(':')[2] || "",
      },
    ],
  },
};

export default nextConfig;
