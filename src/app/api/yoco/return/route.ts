/**
 * Yoco Return Handler
 * Handles user return from Yoco payment gateway
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status') || 'unknown';

    if (!orderId) {
      // Redirect to cart with error message
      return NextResponse.redirect(
        new URL('/cart?error=missing_order_id', request.url)
      );
    }

    // Check order status in database
    const supabase = await getSupabaseServer();
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, payment_status')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.redirect(
        new URL('/cart?error=order_not_found', request.url)
      );
    }

    // Redirect based on payment status
    if (order.payment_status === 'completed' && order.status === 'confirmed') {
      // Success - redirect to success page
      return NextResponse.redirect(
        new URL(`/cart/payment/success?orderId=${orderId}`, request.url)
      );
    } else if (order.payment_status === 'failed' || order.status === 'cancelled') {
      // Failed - redirect to failure page
      return NextResponse.redirect(
        new URL(`/cart/payment/failed?orderId=${orderId}`, request.url)
      );
    } else if (status === 'cancelled') {
      // Cancelled by user
      return NextResponse.redirect(
        new URL(`/cart/payment/cancelled?orderId=${orderId}`, request.url)
      );
    } else {
      // Payment pending or unknown status
      return NextResponse.redirect(
        new URL(`/cart/payment/pending?orderId=${orderId}`, request.url)
      );
    }

  } catch (error) {
    console.error('Payment return handling failed:', error);
    
    // Redirect to cart with generic error
    return NextResponse.redirect(
      new URL('/cart?error=payment_error', request.url)
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
