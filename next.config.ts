import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.0.101",
    "192.168.0.103",
    "192.168.0.106",
    "localhost:3000",
    "127.0.0.1:3000",
    "192.168.0.101:3000",
    "192.168.0.103:3000",
    "192.168.0.106:3000",
    "localhost:5173",
    "127.0.0.1:5173",
    "192.168.0.101:5173",
    "192.168.0.103:5173",
    "192.168.0.106:5173",
    "localhost:5174",
    "127.0.0.1:5174",
    "192.168.0.101:5174",
    "192.168.0.103:5174",
    "192.168.0.106:5174",
    "localhost:4000",
    "127.0.0.1:4000",
    "192.168.0.106:4000",
  ],
  async rewrites() {
    return [
      // Proxy API requests to backend
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
      // Proxy dashboard app requests
      {
        source: "/dashboard/:path*",
        destination: "http://localhost:5174/dashboard/:path*",
      },
      // Proxy landing app requests
      {
        source: "/landing/:path*",
        destination: "http://localhost:5173/landing/:path*",
      },
      // Root path to landing
      {
        source: "/",
        destination: "/landing",
      },
    ];
  },
};

export default nextConfig;
