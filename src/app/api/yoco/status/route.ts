/**
 * Yoco Payment Status API Route
 * Checks the status of a Yoco payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { yocoClient } from '@/lib/yoco';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutId = searchParams.get('checkoutId');
    const orderId = searchParams.get('orderId');

    if (!checkoutId && !orderId) {
      return NextResponse.json(
        { error: 'Either checkoutId or orderId is required' },
        { status: 400 }
      );
    }

    const finalCheckoutId = checkoutId;

    // If we only have orderId, look up the checkout ID from the database
    if (!checkoutId && orderId) {
      const supabase = await getSupabaseServer();
      const { data: order, error } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // For now, we'll need to store the checkout ID when we implement the schema
      return NextResponse.json(
        { error: 'Checkout ID lookup not yet implemented' },
        { status: 501 }
      );
    }

    if (!finalCheckoutId) {
      return NextResponse.json(
        { error: 'Checkout ID not found' },
        { status: 400 }
      );
    }

    // Get payment status from Yoco
    const checkout = await yocoClient.getCheckout(finalCheckoutId);

    return NextResponse.json({
      success: true,
      checkoutId: checkout.id,
      status: checkout.status,
      amount: checkout.amount,
      currency: checkout.currency,
      metadata: checkout.metadata,
    });

  } catch (error) {
    console.error('Payment status check failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check payment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
