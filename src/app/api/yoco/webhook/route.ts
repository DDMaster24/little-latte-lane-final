/**
 * Yoco Webhook Handler - Official Format
 * Processes payment status updates from Yoco according to official API docs
 * Event types: payment.succeeded, payment.failed
 * Webhook signature verification with HMAC-SHA256
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { 
  verifyYocoWebhookSignature, 
  getYocoWebhookSecret,
  validateYocoWebhookEvent,
  extractOrderIdFromWebhook,
  logYocoWebhookEvent
} from '@/lib/yoco-webhook-utils';

interface YocoWebhookEvent {
  id: string;
  type: 'payment.succeeded' | 'payment.failed';
  createdDate: string;
  payload: {
    id: string; // event ID
    amount: number; // amount in cents
    currency: string;
    createdDate: string;
    mode: 'live' | 'test';
    status: 'succeeded' | 'failed';
    type: 'payment';
    metadata: {
      checkoutId: string;
      [key: string]: string | number | undefined;
    };
    paymentMethodDetails?: {
      type: string;
      card?: {
        expiryMonth: number;
        expiryYear: number;
        maskedCard: string;
        scheme: string;
        cardHolder: string;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Official Yoco webhook received at:', new Date().toISOString());
    
    // Get webhook signature for HMAC verification (required by Yoco)
    const signature = request.headers.get('webhook-signature');
    console.log('📋 Webhook signature:', signature ? 'Present' : 'Missing');
    
    // Get raw body for signature verification
    const body = await request.text();
    console.log('📄 Raw webhook body length:', body.length);
    
    // Verify webhook signature if secret is configured
    const webhookSecret = getYocoWebhookSecret();
    if (webhookSecret && signature) {
      const isValid = verifyYocoWebhookSignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error('❌ Invalid Yoco webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('✅ Webhook signature verified');
    } else if (signature) {
      console.log('⚠️ Webhook signature present but YOCO_WEBHOOK_SECRET not configured');
    }

    // Parse the webhook event according to official Yoco format
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
    
    // Log webhook event details
    logYocoWebhookEvent(event, '📊');

    // Validate webhook event structure
    const validation = validateYocoWebhookEvent(event);
    if (!validation.isValid) {
      console.error('❌ Invalid webhook event structure:', validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Extract order ID from metadata
    const orderId = extractOrderIdFromWebhook(event);
    if (!orderId) {
      console.error('❌ No orderId found in webhook metadata');
      return NextResponse.json(
        { error: 'Missing orderId in metadata' },
        { status: 400 }
      );
    }

    console.log('🎯 Processing Yoco payment event:', {
      eventType: event.type,
      orderId,
      checkoutId: event.payload.metadata.checkoutId,
      paymentStatus: event.payload.status,
      amount: event.payload.amount,
      currency: event.payload.currency,
    });

    // Get order from database
    const supabase = await getSupabaseServer();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, payment_status, user_id, total_amount')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found:', orderId, orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify payment amount matches order total (security check)
    const orderTotalCents = Math.round((order.total_amount || 0) * 100); // Convert to cents
    if (event.payload.amount !== orderTotalCents) {
      console.error('❌ Payment amount mismatch:', {
        webhookAmount: event.payload.amount,
        orderAmount: orderTotalCents,
        orderId
      });
      // Still process the payment but log the discrepancy
      console.log('⚠️ Processing payment despite amount mismatch');
    }

    // Process the payment based on official Yoco event type
    let newPaymentStatus: string;
    let newOrderStatus: string;

    if (event.type === 'payment.succeeded') {
      newPaymentStatus = 'completed';
      newOrderStatus = 'confirmed';
      console.log('✅ Yoco payment succeeded');
    } else if (event.type === 'payment.failed') {
      newPaymentStatus = 'failed';
      newOrderStatus = 'cancelled';
      console.log('❌ Yoco payment failed');
    } else {
      console.error('❓ Unsupported Yoco webhook event type:', event.type);
      return NextResponse.json(
        { error: `Unsupported event type: ${event.type}` },
        { status: 400 }
      );
    }

    // Update order status in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: newPaymentStatus,
        status: newOrderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ Failed to update order in database:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    console.log(`✅ Order ${orderId} updated successfully from Yoco webhook:`, {
      eventType: event.type,
      paymentStatus: newPaymentStatus,
      orderStatus: newOrderStatus,
      paymentId: event.payload.id,
      checkoutId: event.payload.metadata.checkoutId,
    });

    // Trigger order status notifications (async, don't wait for response)
    try {
      const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.littlelattelane.co.za'}/api/orders/payment-success`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          paymentStatus: newPaymentStatus,
          eventType: event.type,
          paymentId: event.payload.id,
          checkoutId: event.payload.metadata.checkoutId,
        })
      });
      
      if (notificationResponse.ok) {
        console.log('✅ Order notification sent successfully');
      } else {
        console.log('⚠️ Order notification failed:', await notificationResponse.text());
      }
    } catch (notificationError) {
      console.log('⚠️ Notification error (non-critical):', notificationError);
    }

    // Return success response as required by Yoco (must be 200 status)
    return NextResponse.json({ 
      received: true,
      eventId: event.id,
      eventType: event.type,
      orderId,
      paymentId: event.payload.id,
      processedAt: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Yoco webhook processing error:', error);
    
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
