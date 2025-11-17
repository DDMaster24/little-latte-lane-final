/**
 * Next.js Proxy (Next.js 16+)
 * Runs on Edge runtime for fast authentication and route protection
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { validateEnvironment } from '@/lib/env';

// Validate environment on proxy initialization (production only)
if (process.env.NODE_ENV === 'production') {
  try {
    validateEnvironment();
    console.log('✅ Environment validation passed');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    // In production, this will prevent the app from starting
  }
}

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = [
  '/account',
  '/admin',
  '/staff',
  '/cart/checkout',
];

/**
 * Routes that require admin access
 */
const ADMIN_ROUTES = [
  '/admin',
];

/**
 * Routes that require staff or admin access
 */
const STAFF_ROUTES = [
  '/staff',
];

/**
 * Check if a path matches any of the protected route patterns
 */
function isProtectedRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => pathname.startsWith(route));
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client for Edge runtime
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Get user session (this will auto-refresh if needed)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if route requires authentication
  if (isProtectedRoute(pathname, PROTECTED_ROUTES)) {
    if (!user) {
      // Redirect to home page (where users can log in)
      const redirectUrl = new URL('/', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check admin access
    if (isProtectedRoute(pathname, ADMIN_ROUTES)) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        // Redirect to home with error
        const redirectUrl = new URL('/', request.url);
        redirectUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Check staff access
    if (isProtectedRoute(pathname, STAFF_ROUTES)) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, is_staff')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin && !profile?.is_staff) {
        // Redirect to home with error
        const redirectUrl = new URL('/', request.url);
        redirectUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return response;
}

/**
 * Proxy configuration
 * Specify which routes should run through proxy
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    '/((?!api).*)', // Exclude API routes - they have their own auth
  ],
};
