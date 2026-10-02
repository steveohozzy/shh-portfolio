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

      // Old posts
      {
        source: '/posts',
        destination: '/',
        permanent: true,
      },
      {
        source: '/posts/',
        destination: '/',
        permanent: true,
      },
      {
        source: '/posts/:path+',
        destination: '/',
        permanent: true,
      },

      // Old blog
      {
        source: '/blog',
        destination: '/',
        permanent: true,
      },
      {
        source: '/blog/',
        destination: '/',
        permanent: true,
      },
      {
        source: '/blog/:path+',
        destination: '/',
        permanent: true,
      },

      // Old individual work/project pages
      {
        source: '/work/:path+',
        destination: '/work',
        permanent: true,
      },

      // Old Bloodborne URL
      {
        source: '/bloodborne',
        destination: '/bloodborne/index.html',
        permanent: true,
      },
      {
        source: '/bloodborne/',
        destination: '/bloodborne/index.html',
        permanent: true,
      },

      // Old author page
      {
        source: '/author/hoskinshozzy',
        destination: '/',
        permanent: true,
      },
      {
        source: '/author/hoskinshozzy/',
        destination: '/',
        permanent: true,
      },

      {
        source: '/responsive-presentation',
        destination: '/responsive-presentation/index.html',
        permanent: true,
      },
      {
        source: '/responsive-presentation/',
        destination: '/responsive-presentation/index.html',
        permanent: true,
      },

    ]
  },

}

export default nextConfig