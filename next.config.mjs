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
      {
        source: '/work/:path+',
        destination: '/work',
        permanent: true,
      },
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

      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },

      {
        source: '/rock-paper-scissors',
        destination: '/rock-paper-scissors/index.html',
        permanent: true,
      },

      {
        source: '/rock-paper-scissors/',
        destination: '/rock-paper-scissors/index.html',
        permanent: true,
      },

      {
        source: '/the-use-of-basic-shapes-and-colour-in-design-the-influence-of-the-bauhaus',
        destination: '/',
        permanent: true,
      },

      {
        source: '/the-use-of-basic-shapes-and-colour-in-design-the-influence-of-the-bauhaus/',
        destination: '/',
        permanent: true,
      },

    ]
  },

}

export default nextConfig