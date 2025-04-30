/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'your-production-domain.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/resumes/:id/primary',
        destination: 'http://localhost:5001/api/resumes/:id/primary',
      },
      {
        source: '/api/resumes/:path*',
        destination: 'http://localhost:5001/api/resumes/:path*',
      },
      {
        source: '/api/jobs/:path*',
        destination: 'http://localhost:5001/api/jobs/:path*',
      },
      {
        source: '/api/cover-letters/:path*',
        destination: 'http://localhost:5001/api/cover-letters/:path*',
      }
    ];
  },
};

export default nextConfig; 