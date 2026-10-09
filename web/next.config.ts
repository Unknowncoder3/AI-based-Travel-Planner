import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this frontend package instead of scanning parent folders.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
