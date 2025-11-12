import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname

  // Create Supabase client for session management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          // Set cookie with secure options for production
          response.cookies.set({
            name,
            value,
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: false, // Allow client-side access for auth
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
          })
        },
        remove(name: string, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
          })
        },
      },
    }
  )

  // Refresh session if needed
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      // Session exists, refresh it to extend expiry
      await supabase.auth.refreshSession()
    }
  } catch (error) {
    // Ignore session refresh errors to avoid blocking requests
    console.warn('Session refresh error in middleware:', error)
  }

  // Cart middleware logic - preserve original functionality
  if (pathname.includes('/cart')) {
    // Set secure cookie settings for payment compatibility
    response.headers.set(
      'Set-Cookie',
      ['SameSite=Lax; Secure=' + (process.env.NODE_ENV === 'production'), 'Path=/'].join('; ')
    )

    // Basic CORS headers for payment processing
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // Add general security headers for better session management
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  // Apply to all routes for session management
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}