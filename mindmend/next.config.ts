import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  typescript: {
    // During build, we'll want to ignore TypeScript errors
    ignoreBuildErrors: false,
  },
  eslint: {
    // During build, we'll want to ignore ESLint errors
    ignoreDuringBuilds: false,
  },
  // Handle potential permission issues
  distDir: '.next',
  // Add webpack configuration for better error handling
  webpack: (config, { isServer }) => {
    // Handle potential module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
