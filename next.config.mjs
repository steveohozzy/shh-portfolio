/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin'],

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  // Enforce consistent clean URLs globally to stop Google trailing-slash redirect errors
  trailingSlash: false,

  async redirects() {
    return [
      // Clean catch-alls for old WordPress paths
      {
        source: '/posts/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/blog/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/author/hoskinshozzy/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/the-use-of-basic-shapes-and-colour-in-design-the-influence-of-the-bauhaus/:path*',
        destination: '/',
        permanent: true,
      },
      // Dead pages found in your Search Console list
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
      {
        source: '/about/',
        destination: '/',
        permanent: true,
      },
      // Explicit catches for your minigame/folder roots to handle trailing slashes cleanly
      {
        source: '/online-squishy-dumpling',
        destination: '/online-squishy-dumpling/',
        permanent: true,
      },
      {
        source: '/work',
        destination: '/work/',
        permanent: true,
      },
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
    ]
  },
}

export default nextConfig;