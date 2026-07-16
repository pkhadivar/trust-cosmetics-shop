/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'trust-shop-storage.storage.c2.liara.site',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
};

export default nextConfig;