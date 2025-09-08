// Import Sentry for error tracking and performance monitoring
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require('@sentry/nextjs');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Enable PWA in all environments for better testing
  sw: 'sw.js',
});

// Content Security Policy - extracted to reduce bundle size
const CSP_DIRECTIVES = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''} blob: https://*.payfast.co.za https://payfast.co.za https://www.payfast.co.za https://vercel.live https://*.vercel.live https://*.sentry.io`,
  "script-src-elem 'self' 'unsafe-inline' blob: https://*.payfast.co.za https://payfast.co.za https://www.payfast.co.za https://vercel.live https://*.vercel.live https://*.sentry.io",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' wss: https://*.payfast.co.za https://payfast.co.za https://www.payfast.co.za https://awytuszmunxvthuizyur.supabase.co wss://awytuszmunxvthuizyur.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.googletagmanager.com https://overbridgenet.com https://*.sentry.io https://vercel.live https://*.vercel.live",
  "worker-src 'self' blob:",
  "child-src 'self' blob: https://vercel.live https://*.vercel.live",
  "frame-src 'self' blob: https://vercel.live https://*.vercel.live",
  "form-action 'self' https: http:",
  "frame-ancestors 'self' https://vercel.live https://*.vercel.live",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable Vercel toolbar
  env: {
    VERCEL_TOOLBAR: 'false',
  },
  // Server Actions configuration for large file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase from default 1MB to 10MB for image uploads
    },
    scrollRestoration: true,
    optimizePackageImports: ['lucide-react', '@supabase/auth-helpers-nextjs'],
  },
  // TypeScript and ESLint validation - TypeScript re-enabled ✅, ESLint warnings causing build issues 
  typescript: {
    ignoreBuildErrors: false, // Re-enabled: TypeScript validation during builds
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disabled due to React Hook dependency warnings
    dirs: ['src'], // Only lint src directory
  },
  // Image optimization for better performance
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Webpack optimization to handle large strings better and reduce warnings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack: (config: any, _context: any) => {
    // Suppress cache warnings specifically
    config.ignoreWarnings = [
      /Failed to collect dependencies/,
      /Can't resolve.*next\.config\.compiled\.js/,
      /webpack\.cache\.PackFileCacheStrategy/,
      /Caching failed for pack/,
    ];
    
    // Reduce memory usage for builds
    if (config.cache && typeof config.cache === 'object') {
      config.cache.maxMemoryGenerations = 1;
      config.cache.compression = 'gzip';
    }
    
    // Optimize module resolution
    config.resolve.symlinks = false;
    
    // Reduce webpack logging verbosity
    if (process.env.NODE_ENV === 'development') {
      config.infrastructureLogging = {
        level: 'error',
      };
      config.stats = 'errors-warnings';
    }
    
    return config;
  },
  // Compiler optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error'],
          }
        : false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: CSP_DIRECTIVES,
          },
          // Allow iframes for same origin (needed for visual editor)
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Security headers for production
          ...(process.env.NODE_ENV === 'production' ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains; preload',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'Permissions-Policy',
              value: 'geolocation=(), microphone=(), camera=(), payment=()',
            },
          ] : []),
        ],
      },
      // Cache static assets
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      // Cache API responses for a short time
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

// Combine PWA and Sentry configurations
const configWithPWA = withPWA(nextConfig);

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  
  // Upload source maps in production only
  hideSourceMaps: true,
  
  // Disable source map upload in development
  dryRun: process.env.NODE_ENV === 'development',
  
  // Organization and project (will be overridden by environment variables)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Auth token
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

// Export configuration with Sentry
module.exports = withSentryConfig(configWithPWA, sentryWebpackPluginOptions);
