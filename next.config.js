/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify 需要这个配置来支持 API Routes
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
