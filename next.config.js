/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  serverExternalPackages: ['pdf-parse'],
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Temporarily disable strict CSP for development
          // {
          //   key: 'Content-Security-Policy',
          //   value: [
          //     "default-src 'self'",
          //     "script-src 'self' 'unsafe-eval'",
          //     "style-src 'self' 'unsafe-inline'",
          //     "img-src 'self' data: https:",
          //     "font-src 'self'",
          //     "connect-src 'self' https://*.supabase.co https://api.groq.com https://api.xroute.ai",
          //     "frame-ancestors 'none'",
          //     "base-uri 'self'",
          //     "form-action 'self'"
          //   ].join('; '),
          // },
        ],
      },
    ]
  },
}

module.exports = nextConfig
