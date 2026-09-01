import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["192.168.1.35", "192.168.1.19", "192.168.1.7", "192.168.1.30", "192.168.1.52"],
};

export default nextConfig;
