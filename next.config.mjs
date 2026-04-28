/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['antd'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '183housingsolutions.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
}

export default nextConfig
