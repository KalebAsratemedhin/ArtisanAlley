import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 15 * 60 * 1000, // 15 minutes
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 4,
  },
  /* config options here */
  images: {
    domains: ['source.unsplash.com','i.pravatar.cc','xheymqzejyolgxnolege.supabase.co', 'lh3.googleusercontent.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
      // Faster source maps in development (but less accurate)
      config.devtool = 'eval-cheap-module-source-map';
      
      // Cache builds for faster HMR
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    return config;
  }
};

export default nextConfig;
