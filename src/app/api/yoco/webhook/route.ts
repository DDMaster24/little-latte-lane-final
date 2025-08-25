/**
 * Yoco Webhook Handler
 * Processes payment status updates from Yoco
 */

import { NextRequest, NextResponse } from 'next/server';
import { yocoClient } from '@/lib/yoco';
import { getSupabaseServer } from '@/lib/supabase-server';

interface YocoWebhookEvent {
  id: string;
  type: 'checkout.succeeded' | 'checkout.failed' | 'checkout.cancelled';
  createdDate: string;
  payload: {
    id: string; // checkout ID
    status: 'succeeded' | 'failed' | 'cancelled';
    amount: number; // amount in cents
    currency: string;
    metadata?: {
      orderId?: string;
      userId?: string;
      [key: string]: string | number | undefined;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature for verification (if Yoco provides one)
    const signature = request.headers.get('x-yoco-signature') || '';
    
    // Get raw body for signature verification
    const body = await request.text();
    
    // Verify webhook signature (placeholder for now)
    if (!yocoClient.verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the webhook event
    const event: YocoWebhookEvent = JSON.parse(body);
    
    console.log('Received Yoco webhook:', {
      type: event.type,
      checkoutId: event.payload.id,
      status: event.payload.status,
    });

    // Extract order ID from metadata
    const orderId = event.payload.metadata?.orderId;
    if (!orderId || typeof orderId !== 'string') {
      console.error('No orderId in webhook metadata');
      return NextResponse.json(
        { error: 'Missing orderId in metadata' },
        { status: 400 }
      );
    }

    // Get order from database
    const supabase = await getSupabaseServer();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, payment_status, user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // TODO: Verify the checkout ID matches when payment_provider_id column is added
    // For now, we'll skip this validation as the webhook URL should be secret
    // if (order.payment_provider_id !== event.payload.id) {
    //   console.error('Checkout ID mismatch:', {
    //     orderCheckoutId: order.payment_provider_id,
    //     webhookCheckoutId: event.payload.id,
    //   });
    //   return NextResponse.json(
    //     { error: 'Checkout ID mismatch' },
    //     { status: 400 }
    //   );
    // }

    // Process the payment based on event type
    let newPaymentStatus: string;
    let newOrderStatus: string;

    switch (event.type) {
      case 'checkout.succeeded':
        newPaymentStatus = 'completed';
        newOrderStatus = 'confirmed';
        break;
      
      case 'checkout.failed':
        newPaymentStatus = 'failed';
        newOrderStatus = 'cancelled';
        break;
      
      case 'checkout.cancelled':
        newPaymentStatus = 'cancelled';
        newOrderStatus = 'cancelled';
        break;
      
      default:
        console.error('Unknown webhook event type:', event.type);
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        );
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: newPaymentStatus,
        status: newOrderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    console.log(`Order ${orderId} updated:`, {
      paymentStatus: newPaymentStatus,
      orderStatus: newOrderStatus,
    });

    // TODO: Send notification emails/SMS based on order status
    // This would integrate with your existing notification system

    return NextResponse.json({ 
      success: true,
      orderId,
      status: newOrderStatus,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
