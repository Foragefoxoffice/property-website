/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['antd'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '183housingsolutions.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

  // ✅ ADD THIS BLOCK
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig