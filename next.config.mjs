/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

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
      // Collapse sub-work paths safely
      {
        source: '/work/:path+',
        destination: '/work',
        permanent: true,
      },
      // Mini-games and presentations (handles /bloodborne AND /bloodborne/ cleanly)
      {
        source: '/bloodborne/:path*',
        destination: '/bloodborne/index.html',
        permanent: true,
      },
      {
        source: '/rock-paper-scissors/:path*',
        destination: '/rock-paper-scissors/index.html',
        permanent: true,
      },
      {
        source: '/responsive-presentation/:path*',
        destination: '/responsive-presentation/index.html',
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

export default nextConfig