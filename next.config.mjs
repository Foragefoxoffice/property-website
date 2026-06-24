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
      { protocol: 'https', hostname: 'dev.placetest.in' },
      { protocol: 'https', hostname: 'dev.183housingsolutions.com' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
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
      // SEO Slugs
      { source: '/en/about', destination: '/en/about-us', permanent: false },
      { source: '/vi/about', destination: '/vi/ve-chung-toi', permanent: false },
      { source: '/vi/contact', destination: '/vi/lien-he', permanent: false },
      { source: '/en/terms-conditions', destination: '/en/terms-and-conditions', permanent: false },
      { source: '/vi/terms-conditions', destination: '/vi/dieu-khoan-dieu-kien', permanent: false },
      { source: '/vi/privacy-policy', destination: '/vi/chinh-sach-bao-mat', permanent: false },
      { source: '/en/blogs', destination: '/en/blog', permanent: false },
      { source: '/vi/blogs', destination: '/vi/tin-tuc', permanent: false },
    ]
  },

  // ✅ REWRITES: Translated slugs to internal routes
  async rewrites() {
    return [
      { source: '/en/about-us', destination: '/en/about' },
      { source: '/vi/ve-chung-toi', destination: '/vi/about' },
      { source: '/vi/lien-he', destination: '/vi/contact' },
      { source: '/en/terms-and-conditions', destination: '/en/terms-conditions' },
      { source: '/vi/dieu-khoan-dieu-kien', destination: '/vi/terms-conditions' },
      { source: '/vi/chinh-sach-bao-mat', destination: '/vi/privacy-policy' },
      { source: '/en/blog', destination: '/en/blogs' },
      { source: '/vi/tin-tuc', destination: '/vi/blogs' },
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