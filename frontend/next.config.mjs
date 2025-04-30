/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'your-production-domain.com'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/resumes/:id/primary',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://your-backend-url.com/api/resumes/:id/primary'
          : 'http://localhost:5001/api/resumes/:id/primary',
      },
      {
        source: '/api/resumes/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://your-backend-url.com/api/resumes/:path*'
          : 'http://localhost:5001/api/resumes/:path*',
      },
      {
        source: '/api/jobs/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://your-backend-url.com/api/jobs/:path*'
          : 'http://localhost:5001/api/jobs/:path*',
      },
      {
        source: '/api/cover-letters/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://your-backend-url.com/api/cover-letters/:path*'
          : 'http://localhost:5001/api/cover-letters/:path*',
      }
    ];
  },
};

export default nextConfig; 