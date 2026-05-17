import os from "node:os";
import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false,
  },
  webpack: (config) => {
    // OrbStack mounts ~/OrbStack as a FUSE-style virtual filesystem; webpack's
    // initial scan can stall there with ETIMEDOUT. Exclude it from the watcher.
    const orbstack = path.join(os.homedir(), "OrbStack");
    const ignored = [
      "**/node_modules/**",
      "**/.next/**",
      "**/.git/**",
      orbstack,
      `${orbstack}/**`,
    ];
    config.watchOptions = { ...config.watchOptions, ignored };
    return config;
  },
};

export default nextConfig;
