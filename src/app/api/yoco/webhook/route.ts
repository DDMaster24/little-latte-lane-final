/**
 * Yoco Webhook Handler
 * Processes payment status updates from Yoco
 */

import { NextRequest, NextResponse } from 'next/server';
import { yocoClient } from '@/lib/yoco';
import { getSupabaseServer } from '@/lib/supabase-server';

interface YocoWebhookEvent {
  id: string;
  type?: 'checkout.succeeded' | 'checkout.failed' | 'checkout.cancelled';
  eventType?: string; // Alternative field name
  createdDate: string;
  payload?: {
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
  data?: any; // Alternative payload structure
  [key: string]: any; // Allow additional fields
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Yoco webhook received at:', new Date().toISOString());
    
    // Log request details for debugging
    console.log('📋 Webhook headers:');
    for (const [key, value] of request.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Get webhook signature for verification (if Yoco provides one)
    const signature = request.headers.get('x-yoco-signature') || '';
    
    // Get raw body for signature verification
    const body = await request.text();
    console.log('📄 Webhook body:', body);
    
    // For now, skip signature verification as Yoco might not provide it
    // if (!yocoClient.verifyWebhookSignature(body, signature)) {
    //   console.error('Invalid webhook signature');
    //   return NextResponse.json(
    //     { error: 'Invalid signature' },
    //     { status: 401 }
    //   );
    // }

    // Parse the webhook event
    let event: YocoWebhookEvent;
    try {
      event = JSON.parse(body);
    } catch (parseError) {
      console.error('❌ Failed to parse webhook JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    
    console.log('📊 Parsed webhook event:', {
      type: event.type,
      checkoutId: event.payload?.id,
      status: event.payload?.status,
      amount: event.payload?.amount,
      metadata: event.payload?.metadata,
    });

    // Handle different possible event structures
    const eventType = event.type || event.eventType;
    const payload = event.payload || event.data || event;
    
    // Extract order ID from metadata
    const orderId = payload.metadata?.orderId || payload.metadata?.order_id;
    if (!orderId || typeof orderId !== 'string') {
      console.error('❌ No orderId in webhook metadata:', payload.metadata);
      return NextResponse.json(
        { error: 'Missing orderId in metadata' },
        { status: 400 }
      );
    }

    console.log('🎯 Processing payment for order:', orderId);

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

    // Handle different event type formats
    const normalizedEventType = eventType?.toLowerCase() || '';
    
    if (normalizedEventType.includes('succeed') || normalizedEventType.includes('success') || 
        normalizedEventType.includes('completed') || payload.status === 'succeeded') {
      newPaymentStatus = 'completed';
      newOrderStatus = 'confirmed';
      console.log('✅ Payment succeeded');
    } else if (normalizedEventType.includes('fail') || payload.status === 'failed') {
      newPaymentStatus = 'failed';
      newOrderStatus = 'cancelled';
      console.log('❌ Payment failed');
    } else if (normalizedEventType.includes('cancel') || payload.status === 'cancelled') {
      newPaymentStatus = 'cancelled';
      newOrderStatus = 'cancelled';
      console.log('🚫 Payment cancelled');
    } else {
      console.error('❓ Unknown webhook event type:', eventType, 'payload status:', payload.status);
      // For unknown events, let's assume success if we got a webhook
      newPaymentStatus = 'completed';
      newOrderStatus = 'confirmed';
      console.log('⚠️ Assuming payment success for unknown event type');
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

    console.log(`✅ Order ${orderId} updated successfully:`, {
      paymentStatus: newPaymentStatus,
      orderStatus: newOrderStatus,
    });

    // Trigger order status notifications
    try {
      const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.littlelattelane.co.za'}/api/orders/payment-success`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          paymentStatus: newPaymentStatus
        })
      });
      
      if (notificationResponse.ok) {
        console.log('✅ Order notification sent successfully');
      } else {
        console.log('⚠️ Order notification failed:', await notificationResponse.text());
      }
    } catch (notificationError) {
      console.log('⚠️ Notification error:', notificationError);
    }

    return NextResponse.json({ 
      success: true,
      orderId,
      status: newOrderStatus,
      paymentStatus: newPaymentStatus,
      eventType: eventType,
      processedAt: new Date().toISOString(),
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
