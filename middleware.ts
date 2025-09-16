import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Cart middleware logic - preserve original functionality
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

  return NextResponse.next()
}

export const config = {
  // Only apply to cart routes
  matcher: [
    '/cart/:path*'
  ],
}