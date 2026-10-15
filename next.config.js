/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Hilangkan header X-Powered-By: Next.js (Anti-Fingerprinting)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload', // Enforce HTTPS (HSTS)
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Proteksi Anti-Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Mencegah MIME-sniffing exploit
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Nonaktifkan hardware sensor yang tidak perlu
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com; connect-src 'self' http://localhost:8000 https://api.haisenofficial.com https://app.sandbox.midtrans.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src https://app.sandbox.midtrans.com https://app.midtrans.com; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
