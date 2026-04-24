import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@uipath/apollo-wind"],
  devIndicators: {
    position: "bottom-left",
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "http://localhost:8080/api/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
