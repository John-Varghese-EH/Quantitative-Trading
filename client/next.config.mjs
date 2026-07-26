/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*' // Proxy to Backend
      }
    ];
  }
};

export default nextConfig;
