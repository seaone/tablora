import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tablora/shared"],
  // Produces a self-contained server bundle in .next/standalone, which keeps the
  // production Docker image small (see frontend/Dockerfile).
  output: "standalone",
};

export default nextConfig;
