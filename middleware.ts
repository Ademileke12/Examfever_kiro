import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient, isProtectedRoute, isAuthRoute, getRedirectUrl } from '@/lib/supabase/middleware'
import { SecurityError } from '@/lib/security/config'
import { getRateLimitConfig } from '@/lib/security/rate-limit'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response, user } = await createMiddlewareSupabaseClient(request)
    const pathname = request.nextUrl.pathname
    let isUnauthorizedApi = false

    // Handle protected routes
    if (isProtectedRoute(pathname)) {
      if (!user) {
        if (pathname.startsWith('/api')) {
          isUnauthorizedApi = true
        } else {
          const redirectUrl = getRedirectUrl(request, '/login')
          return NextResponse.redirect(redirectUrl)
        }
      }
    }

    // Apply Rate Limiting to /api routes
    if (pathname.startsWith('/api')) {
      const { limiter, limit, windowMs } = getRateLimitConfig(pathname)
      const xForwardedFor = request.headers.get('x-forwarded-for')
      const ip = xForwardedFor?.split(',')[0] || request.headers.get('x-real-ip') || 'anonymous'
      const identifier = user?.id || ip

      const result = await limiter.check(identifier, limit, windowMs)

      if (!result.success) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Too Many Requests',
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.reset.toString()
            }
          }
        )
      }
    }

    // If we reached here, rate limit is OK. Now check if we were marked as unauthorized.
    if (isUnauthorizedApi) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Handle auth routes (redirect authenticated users away from login/register)
    if (isAuthRoute(pathname)) {
      if (user) {
        const redirectUrl = getRedirectUrl(request, '/dashboard')
        return NextResponse.redirect(redirectUrl)
      }
    }

    // --- SECURITY HEADERS ---
    const headers = response.headers

    // 1. Content Security Policy (Strict but functional for Next.js)
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.paystack.co;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https://*.supabase.co;
      font-src 'self' https://fonts.gstatic.com;
      frame-src 'self' https://js.paystack.co;
      connect-src 'self' https://*.supabase.co https://api.paystack.co https://api.groq.com;
    `.replace(/\s{2,}/g, ' ').trim()

    headers.set('Content-Security-Policy', cspHeader)
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    return response
  } catch (error) {
    console.error('Middleware error:', error)

    // For API routes, return JSON error instead of redirection loop
    if (request.nextUrl.pathname.startsWith('/api')) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
