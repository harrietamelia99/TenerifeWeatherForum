/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Disable incremental compilation cache to ensure clean builds on Vercel
  experimental: {
    turbotrace: undefined,
  },
};

export default nextConfig;
