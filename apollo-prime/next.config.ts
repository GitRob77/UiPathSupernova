import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@uipath/apollo-wind"],
  devIndicators: {
    position: "bottom-left",
  },
};

export default nextConfig;
