/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin'],

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  // Enforce consistent clean URLs globally (strips trailing slashes automatically)
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