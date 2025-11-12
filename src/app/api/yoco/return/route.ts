/**
 * Yoco Return Handler
 * Handles user return from Yoco payment gateway
 * CRITICAL: Preserves user session by using proper redirect with cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status') || 'unknown';

    if (!orderId) {
      // Redirect to cart with error message
      const response = NextResponse.redirect(
        new URL('/cart?error=missing_order_id', request.url)
      );
      // Preserve cookies
      await preserveAuthCookies(request, response);
      return response;
    }

    // Check order status in database
    const supabase = await getSupabaseServer();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, payment_status')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      const response = NextResponse.redirect(
        new URL('/cart?error=order_not_found', request.url)
      );
      await preserveAuthCookies(request, response);
      return response;
    }

    // Determine redirect URL based on payment status
    let redirectUrl: string;
    
    if (order.payment_status === 'completed' && order.status === 'confirmed') {
      // Success - redirect to success page
      redirectUrl = `/cart/payment/success?orderId=${orderId}`;
    } else if (order.payment_status === 'failed' || order.status === 'cancelled') {
      // Failed - redirect to failure page
      redirectUrl = `/cart/payment/failed?orderId=${orderId}`;
    } else if (status === 'cancelled') {
      // Cancelled by user
      redirectUrl = `/cart/payment/cancelled?orderId=${orderId}`;
    } else {
      // Payment pending or unknown status
      redirectUrl = `/cart/payment/pending?orderId=${orderId}`;
    }

    // Create response with preserved auth cookies
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));
    await preserveAuthCookies(request, response);
    return response;

  } catch (error) {
    console.error('Payment return handling failed:', error);
    
    // Redirect to cart with generic error
    const response = NextResponse.redirect(
      new URL('/cart?error=payment_error', request.url)
    );
    await preserveAuthCookies(request, response);
    return response;
  }
}

/**
 * Preserve authentication cookies during redirect
 * This ensures the user stays logged in after returning from Yoco
 */
async function preserveAuthCookies(request: NextRequest, response: NextResponse) {
  try {
    // Get all cookies from the request
    const cookieStore = await cookies();
    
    // Copy Supabase auth cookies to response
    const authCookies = [
      'sb-access-token',
      'sb-refresh-token', 
      'sb-auth-token',
      'supabase-auth-token'
    ];
    
    authCookies.forEach((cookieName) => {
      const cookie = cookieStore.get(cookieName);
      if (cookie) {
        response.cookies.set(cookieName, cookie.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }
    });
  } catch (error) {
    console.error('Failed to preserve auth cookies:', error);
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
