/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.trustbeautystore.ir',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;