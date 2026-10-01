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
      // Exact matches for parent routes
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
      // Wildcard matches for sub-routes
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
    ]
  },
}

export default nextConfig