/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['antd'],

  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '183housingsolutions.com' },
      { protocol: 'https', hostname: 'api.183housingsolutions.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    unoptimized: true,
  },

  // ✅ CACHE HEADERS
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // {
      //   source: '/:path*',
      //   headers: [
      //     {
      //       key: 'Cache-Control',
      //       value: 'public, s-maxage=5, stale-while-revalidate=10',
      //     },
      //   ],
      // },
    ]
  },

  // ✅ REDIRECTS: Old property-showcase → new /listing format
  async redirects() {
    return [
      // /property-showcase/LSE-0047/my-slug → /listing/my-slug-LSE-0047
      {
        source: '/property-showcase/:id/:slug',
        destination: '/listing/:slug-:id',
        permanent: true,
      },
      // /property-showcase/LSE-0047 (no slug) → /listing/LSE-0047
      {
        source: '/property-showcase/:id',
        destination: '/listing/:id',
        permanent: true,
      },
    ]
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    staleTimes: {
      dynamic: 0,
    },
    optimizeCss: true,
  },
}

export default nextConfig