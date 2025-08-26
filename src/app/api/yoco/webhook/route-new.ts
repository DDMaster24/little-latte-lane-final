/**
 * Yoco Checkout Webhook Handler - CORRECTED IMPLEMENTATION
 * Processes checkout completion events from Yoco according to official API docs
 * Based on: https://developer.yoco.com/checkout-api-reference/webhooks/register-webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { 
  verifyYocoWebhookSignature, 
  getYocoWebhookSecret,
} from '@/lib/yoco-webhook-utils';

// Yoco Checkout Webhook Event Format (based on official docs)
interface YocoWebhookEvent {
  id: string;
  type: 'checkout.payment_received' | 'checkout.cancelled' | 'checkout.expired';
  createdDate: string;
  payload: {
    id: string; // checkout ID
    status: 'completed' | 'cancelled' | 'expired';
    amount: number; // amount in cents
    currency: string;
    paymentId?: string; // present for successful payments
    successUrl?: string;
    cancelUrl?: string;
    failureUrl?: string;
    metadata?: {
      orderId?: string;
      userId?: string;
      [key: string]: string | number | undefined;
    };
    merchantId: string;
    processingMode: 'live' | 'test';
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Yoco checkout webhook received at:', new Date().toISOString());
    
    // Get webhook signature for HMAC verification
    const signature = request.headers.get('webhook-signature') || request.headers.get('x-webhook-signature');
    console.log('📋 Webhook signature:', signature ? 'Present' : 'Missing');
    
    // Get raw body for signature verification
    const body = await request.text();
    console.log('📄 Raw webhook body length:', body.length);
    console.log('📄 Raw webhook body preview:', body.substring(0, 200) + '...');
    
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
    } else {
      console.log('⚠️ No webhook signature found - proceeding without verification');
    }

    // Parse the webhook event
    let event: YocoWebhookEvent;
    try {
      event = JSON.parse(body);
      console.log('📊 Parsed webhook event:', {
        id: event.id,
        type: event.type,
        checkoutId: event.payload?.id,
        status: event.payload?.status,
        amount: event.payload?.amount,
        currency: event.payload?.currency,
        paymentId: event.payload?.paymentId,
        metadata: event.payload?.metadata,
      });
    } catch (parseError) {
      console.error('❌ Failed to parse webhook JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!event.id || !event.type || !event.payload) {
      console.error('❌ Invalid webhook event structure - missing required fields');
      return NextResponse.json(
        { error: 'Invalid webhook event structure' },
        { status: 400 }
      );
    }

    // Extract order ID from metadata
    const orderId = event.payload.metadata?.orderId;
    if (!orderId) {
      console.error('❌ No orderId found in webhook metadata');
      console.log('Available metadata:', event.payload.metadata);
      return NextResponse.json(
        { error: 'Missing orderId in metadata' },
        { status: 400 }
      );
    }

    console.log('🎯 Processing Yoco checkout event:', {
      eventType: event.type,
      orderId,
      checkoutId: event.payload.id,
      checkoutStatus: event.payload.status,
      amount: event.payload.amount,
      currency: event.payload.currency,
      paymentId: event.payload.paymentId,
    });

    // Get order from database
    const supabase = await getSupabaseServer();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, payment_status, user_id, total_amount')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found:', { orderId, orderError });
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('📋 Found order:', {
      id: order.id,
      currentStatus: order.status,
      currentPaymentStatus: order.payment_status,
      totalAmount: order.total_amount,
    });

    // Determine order status based on checkout event
    let newOrderStatus: string;
    let newPaymentStatus: string;
    let shouldSendEmail = false;

    if (event.type === 'checkout.payment_received' && event.payload.status === 'completed') {
      // Payment successful
      newOrderStatus = 'confirmed';
      newPaymentStatus = 'paid';
      shouldSendEmail = true;
      console.log('✅ Payment successful - updating order to confirmed');
    } else if (event.type === 'checkout.cancelled' || event.payload.status === 'cancelled') {
      // Payment cancelled
      newOrderStatus = 'cancelled';
      newPaymentStatus = 'cancelled';
      console.log('❌ Payment cancelled');
    } else if (event.type === 'checkout.expired' || event.payload.status === 'expired') {
      // Payment expired
      newOrderStatus = 'cancelled';
      newPaymentStatus = 'expired';
      console.log('⏰ Payment expired');
    } else {
      console.log('ℹ️ Unhandled event type or status:', event.type, event.payload.status);
      return NextResponse.json({ received: true, message: 'Event acknowledged but not processed' });
    }

    // Update order in database
    const updateData: any = {
      status: newOrderStatus,
      payment_status: newPaymentStatus,
      updated_at: new Date().toISOString(),
    };

    // Add payment details for successful payments
    if (event.payload.paymentId) {
      updateData.payment_id = event.payload.paymentId;
      updateData.payment_method = 'yoco';
      updateData.paid_at = new Date().toISOString();
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    console.log('✅ Order updated successfully:', {
      orderId,
      newStatus: newOrderStatus,
      newPaymentStatus: newPaymentStatus,
    });

    // Send confirmation email for successful payments
    if (shouldSendEmail) {
      try {
        // Import the email sending function
        const { sendOrderConfirmationEmail } = await import('@/lib/email');
        
        // Get user email
        const { data: user } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', order.user_id)
          .single();

        if (user?.email) {
          await sendOrderConfirmationEmail(updatedOrder, user);
          console.log('📧 Confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError);
        // Don't fail the webhook for email errors
      }
    }

    // Log successful webhook processing
    console.log('🎉 Webhook processed successfully:', {
      eventId: event.id,
      eventType: event.type,
      orderId,
      newStatus: newOrderStatus,
      emailSent: shouldSendEmail,
    });

    return NextResponse.json({
      received: true,
      processed: true,
      orderId,
      status: newOrderStatus,
      paymentStatus: newPaymentStatus,
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
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
  return NextResponse.json({
    message: 'Yoco checkout webhook endpoint is active',
    timestamp: new Date().toISOString(),
    webhookSecret: getYocoWebhookSecret() ? 'Configured' : 'Not configured',
  });
}
