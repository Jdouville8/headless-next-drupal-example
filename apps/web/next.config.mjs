import os from "node:os";
import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false,
  },
  images: {
    // Allow next/image to optimize images served from the local Drupal/DDEV
    // host and any standard hosted Drupal domain. Configure additional hosts
    // here when promoting to a real environment.
    remotePatterns: [
      { protocol: "https", hostname: "meridian.ddev.site" },
      { protocol: "http", hostname: "meridian.ddev.site" },
      { protocol: "https", hostname: "*.ddev.site" },
    ],
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
