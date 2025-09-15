import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { i18n } from './i18n-config'

import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // @ts-expect-error locales are readonly
  const locales: string[] = i18n.locales

  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales
  )

  const locale = matchLocale(languages, locales, i18n.defaultLocale)

  return locale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Existing cart middleware logic - preserve original functionality
  if (pathname.includes('/cart')) {
    const response = NextResponse.next()
    
    // Set secure cookie settings for payment compatibility
    response.headers.set(
      'Set-Cookie',
      ['SameSite=None; Secure', 'Path=/'].join('; ')
    )

    // Basic CORS headers for payment processing
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    
    return response
  }

  // React Bricks i18n middleware - only for React Bricks content routes
  // Skip for existing app routes, API routes, static files, and admin routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/account/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/bookings/') ||
    pathname.startsWith('/menu/') ||
    pathname.startsWith('/staff/') ||
    pathname.startsWith('/cart/') ||
    pathname.startsWith('/install/') ||
    pathname.startsWith('/privacy-policy/') ||
    pathname.startsWith('/terms/') ||
    [
      '/manifest.json',
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml',
    ].includes(pathname) ||
    pathname.startsWith('/images/')
  ) {
    return NextResponse.next()
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Only redirect for React Bricks content (homepage for now)
  if (pathnameIsMissingLocale && pathname === '/') {
    const locale = getLocale(request)

    // Redirect homepage to locale-prefixed version for React Bricks
    return NextResponse.redirect(
      new URL(`/${locale}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  // Include both cart and React Bricks routes
  matcher: [
    '/cart/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|admin|account|auth|bookings|menu|staff|install|privacy-policy|terms|images).*)'
  ],
}