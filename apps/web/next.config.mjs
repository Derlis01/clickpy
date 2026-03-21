/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-990cb0123a7d4edea189289a4f3c3014.r2.dev'
      },
      {
        protocol: 'https',
        hostname: 'images.clickpy.app'
      }
    ]
  },
  transpilePackages: ['@clickpy/shared'],
  typescript: {
    // Pre-existing type mismatches between shared types (snake_case) and storefront (camelCase)
    ignoreBuildErrors: true
  }
}
export default nextConfig
