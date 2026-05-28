/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['antd'],

  compress: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '183housingsolutions.com' },
      { protocol: 'https', hostname: 'api.183housingsolutions.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
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

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
}

export default nextConfig