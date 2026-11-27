
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin'],

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  // Enforce consistent clean URLs globally
  trailingSlash: false,

  async rewrites() {
    return [
      {
        source: '/squishy-dumpling-board-game',
        destination: '/squishy-dumpling-board-game/index.html',
      },
    ];
  },

  async redirects() {
    return [
      // Old files/pages
      {
        source: '/wp-content/uploads/2016/07/May-the-film-be-with-you.pdf',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
