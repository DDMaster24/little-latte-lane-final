import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Handle PayFast-related requests
  if (
    request.nextUrl.pathname.includes('/api/payfast') ||
    request.nextUrl.pathname.includes('/cart')
  ) {
    // Set secure cookie settings for PayFast compatibility
    response.headers.set(
      'Set-Cookie',
      ['SameSite=None; Secure', 'Path=/'].join('; ')
    );

    // Allow PayFast domains (both sandbox and live)
    const payFastOrigin = env.NEXT_PUBLIC_PAYFAST_SANDBOX
      ? 'https://sandbox.payfast.co.za'
      : 'https://www.payfast.co.za';
    response.headers.set('Access-Control-Allow-Origin', payFastOrigin);
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
  matcher: ['/api/payfast/:path*', '/cart/:path*'],
};
