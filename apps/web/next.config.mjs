/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-990cb0123a7d4edea189289a4f3c3014.r2.dev'
      }
    ]
  },
  transpilePackages: ['@clickpy/shared']
}
export default nextConfig
