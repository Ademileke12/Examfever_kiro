import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function createMiddlewareSupabaseClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Use anon key for middleware - this is correct for auth operations
  // Service role key should only be used for admin operations in API routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    // Refresh session if expired - required for Server Components
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error && !error.message.includes('Auth session missing')) {
      console.error('Auth session error:', error)
      // Don't throw here, let the route handle auth failures
    }

    return { supabase, response, user }
  } catch (error) {
    console.error('Supabase client error:', error)
    return { supabase, response, user: null }
  }
}

export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/exam',
    '/upload',
    '/analytics',
    '/settings',
    '/questions',
    '/create-exam',
    '/api'
  ]

  // Exclude public API routes
  const publicApiRoutes = [
    '/api/auth',
  ]

  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return false
  }

  return protectedRoutes.some(route => pathname.startsWith(route))
}

export function isAuthRoute(pathname: string): boolean {
  const authRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ]

  return authRoutes.some(route => pathname.startsWith(route))
}

export function getRedirectUrl(request: NextRequest, redirectTo: string): URL {
  const url = new URL(redirectTo, request.url)

  // Preserve the original URL as a redirect parameter
  if (redirectTo === '/login') {
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
  }

  return url
}
