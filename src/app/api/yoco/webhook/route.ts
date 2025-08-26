import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { 
  verifyYocoWebhookSignature, 
  getYocoWebhookSecret,
  validateWebhookTimestamp,
  logWebhookEvent
} from '@/lib/yoco-webhook-utils';

// Generic webhook event interface - handles any Yoco event
interface YocoWebhookEvent {
  id: string;
  type: string; // Accept any event type for now
  createdDate: string;
  payload: {
    id: string;
    status?: string;
    amount?: number;
    currency?: string;
    paymentId?: string;
    metadata?: {
      orderId?: string;
      userId?: string;
      checkoutId?: string;
      [key: string]: string | number | undefined;
    };
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Yoco webhook received at:', new Date().toISOString());
    
    // Get webhook headers
    const webhookSignature = request.headers.get('webhook-signature');
    const webhookId = request.headers.get('webhook-id');
    const webhookTimestamp = request.headers.get('webhook-timestamp');
    
    console.log('📋 Webhook headers:', {
      signature: webhookSignature ? 'Present' : 'Missing',
      id: webhookId || 'Missing',
      timestamp: webhookTimestamp || 'Missing',
    });
    
    // Get raw body for signature verification
    const body = await request.text();
    console.log('📄 Raw webhook body length:', body.length);
    console.log('📄 Raw webhook body preview:', body.substring(0, 300) + '...');
    
    // Verify webhook signature if all required components are present
    const webhookSecret = getYocoWebhookSecret();
    if (webhookSecret && webhookSignature && webhookId && webhookTimestamp) {
      // Validate timestamp first (prevent replay attacks)
      if (!validateWebhookTimestamp(webhookTimestamp)) {
        console.error('❌ Webhook timestamp is too old or invalid');
        return NextResponse.json({ error: 'Invalid timestamp' }, { status: 401 });
      }
      
      const isValid = verifyYocoWebhookSignature(
        body, 
        webhookSignature, 
        webhookId, 
        webhookTimestamp, 
        webhookSecret
      );
      
      if (!isValid) {
        console.error('❌ Invalid Yoco webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('✅ Webhook signature verified');
    } else {
      console.log('⚠️ Webhook verification skipped - missing signature components or secret');
    }

    // Parse the webhook event
    let event: YocoWebhookEvent;
    try {
      event = JSON.parse(body);
      logWebhookEvent(event as unknown as Record<string, unknown>, '📊');
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
      
      // For now, just acknowledge the webhook even if we can't process it
      return NextResponse.json({ 
        received: true, 
        processed: false, 
        reason: 'No orderId in metadata - webhook acknowledged but not processed' 
      });
    }

    console.log('🎯 Processing Yoco event:', {
      eventType: event.type,
      orderId,
      payloadId: event.payload.id,
      status: event.payload.status,
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

    // Determine order status based on event type and payload
    let newOrderStatus: string;
    let newPaymentStatus: string;
    let shouldSendEmail = false;

    // Handle different event types and statuses
    if (
      (event.type.includes('payment') && event.payload.status === 'succeeded') ||
      (event.type.includes('checkout') && event.payload.status === 'completed') ||
      event.type.includes('succeeded') ||
      event.type.includes('completed')
    ) {
      // Payment successful
      newOrderStatus = 'confirmed';
      newPaymentStatus = 'paid';
      shouldSendEmail = true;
      console.log('✅ Payment successful - updating order to confirmed');
    } else if (
      event.type.includes('cancelled') ||
      event.type.includes('failed') ||
      event.payload.status === 'cancelled' ||
      event.payload.status === 'failed'
    ) {
      // Payment failed or cancelled
      newOrderStatus = 'cancelled';
      newPaymentStatus = event.type.includes('failed') ? 'failed' : 'cancelled';
      console.log('❌ Payment failed/cancelled');
    } else if (
      event.type.includes('expired') ||
      event.payload.status === 'expired'
    ) {
      // Payment expired
      newOrderStatus = 'cancelled';
      newPaymentStatus = 'expired';
      console.log('⏰ Payment expired');
    } else {
      console.log('ℹ️ Unhandled event type or status:', event.type, event.payload.status);
      // Still acknowledge the webhook
      return NextResponse.json({ 
        received: true, 
        processed: false, 
        message: 'Event acknowledged but not processed - unknown event type' 
      });
    }

    // Update order in database
    const updateData: {
      status: string;
      payment_status: string;
      updated_at: string;
      payment_id?: string;
      payment_method?: string;
      paid_at?: string;
    } = {
      status: newOrderStatus,
      payment_status: newPaymentStatus,
      updated_at: new Date().toISOString(),
    };

    // Add payment details for successful payments
    if (event.payload.paymentId || (shouldSendEmail && event.payload.id)) {
      updateData.payment_id = event.payload.paymentId || event.payload.id;
      updateData.payment_method = 'yoco';
      updateData.paid_at = new Date().toISOString();
    }

    const { data: _updatedOrder, error: updateError } = await supabase
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
        // For now, just log that we would send an email
        console.log('📧 Would send confirmation email to user:', order.user_id);
        
        /*
        // TODO: Implement email sending when email service is ready
        const { sendOrderConfirmationEmail } = await import('@/lib/email');
        
        if (order.user_id) {
          const { data: user } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', order.user_id)
            .single();

          if (user?.email) {
            await sendOrderConfirmationEmail(updatedOrder, user);
            console.log('📧 Confirmation email sent successfully');
          }
        }
        */
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
    supportedMethods: ['POST'],
    status: 'ready'
  });
}
