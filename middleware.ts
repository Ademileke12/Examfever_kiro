import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient, isProtectedRoute, isAuthRoute, getRedirectUrl } from '@/lib/supabase/middleware'
import { validateEnvironment, SecurityError } from '@/lib/security/config'

export async function middleware(request: NextRequest) {
  try {
    // Temporarily disable strict environment validation for development
    // TODO: Re-enable for production deployment
    // const { isValid, missing } = validateEnvironment()
    // if (!isValid) {
    //   throw new SecurityError(
    //     `Missing required environment variables: ${missing.join(', ')}`,
    //     'ENV_VALIDATION_FAILED'
    //   )
    // }
    
    const { supabase, response, session } = await createMiddlewareSupabaseClient(request)
    
    const pathname = request.nextUrl.pathname

    // Handle protected routes
    if (isProtectedRoute(pathname)) {
      if (!session) {
        const redirectUrl = getRedirectUrl(request, '/login')
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Handle auth routes (redirect authenticated users away from login/register)
    if (isAuthRoute(pathname)) {
      if (session) {
        const redirectUrl = getRedirectUrl(request, '/dashboard')
        return NextResponse.redirect(redirectUrl)
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Handle security errors specifically
    if (error instanceof SecurityError) {
      if (error.code === 'ENV_VALIDATION_FAILED') {
        return new NextResponse('Server configuration error', { status: 500 })
      }
    }
    
    // For auth errors, redirect to login
    if (error instanceof Error && error.message.toLowerCase().includes('auth')) {
      const redirectUrl = getRedirectUrl(request, '/login')
      return NextResponse.redirect(redirectUrl)
    }
    
    // Fallback: allow request to continue but log the error
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
