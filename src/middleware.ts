import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Handle cart-related requests for secure payments
  if (request.nextUrl.pathname.includes('/cart')) {
    // Set secure cookie settings for payment compatibility
    response.headers.set(
      'Set-Cookie',
      ['SameSite=None; Secure', 'Path=/'].join('; ')
    );

    // Basic CORS headers for payment processing
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: ['/cart/:path*'],
};
