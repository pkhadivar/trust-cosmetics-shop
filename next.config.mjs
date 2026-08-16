import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

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
        protocol: "https",
        hostname: "media.trustbeautystore.ir",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // 🌟 این خط ارور تداخل Turbopack با افزونه PWA را برطرف می‌کند
  turbopack: {},
  output: "standalone",
};

export default withPWA(nextConfig);
