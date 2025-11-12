import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import {
  verifyYocoWebhookSignature,
  getYocoWebhookSecret,
  validateWebhookTimestamp,
  logWebhookEvent
} from '@/lib/yoco-webhook-utils';
import { checkRateLimit, getClientIdentifier, RateLimitPresets, getRateLimitHeaders } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

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
    logger.info('Yoco webhook received');

    // Apply rate limiting to prevent webhook flooding
    const identifier = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, {
      id: 'yoco-webhook',
      ...RateLimitPresets.WEBHOOK,
    });

    if (!rateLimitResult.success) {
      logger.warn('Webhook rate limit exceeded');
      return NextResponse.json(
        { error: 'Too many webhook requests' },
        {
          status: 429,
          headers: getRateLimitHeaders({
            ...rateLimitResult,
            limit: RateLimitPresets.WEBHOOK.limit,
          }),
        }
      );
    }

    // Get webhook headers
    const webhookSignature = request.headers.get('webhook-signature');
    const webhookId = request.headers.get('webhook-id');
    const webhookTimestamp = request.headers.get('webhook-timestamp');

    logger.debug('Webhook headers received', {
      hasSignature: !!webhookSignature,
      webhookId: webhookId || 'Missing',
      hasTimestamp: !!webhookTimestamp,
    });

    // Get raw body for signature verification
    const body = await request.text();
    logger.debug('Webhook body received', { bodyLength: body.length });
    
    // SECURITY: Mandatory webhook signature verification
    const webhookSecret = getYocoWebhookSecret();

    // Fail if webhook secret is not configured
    if (!webhookSecret) {
      logger.error('Yoco webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook authentication not configured' },
        { status: 500 }
      );
    }

    // Fail if any signature component is missing
    if (!webhookSignature || !webhookId || !webhookTimestamp) {
      logger.error('Missing required webhook signature components', {
        hasSignature: !!webhookSignature,
        hasId: !!webhookId,
        hasTimestamp: !!webhookTimestamp,
      });
      return NextResponse.json(
        { error: 'Missing webhook signature components' },
        { status: 401 }
      );
    }

    // Validate timestamp first (prevent replay attacks)
    if (!validateWebhookTimestamp(webhookTimestamp)) {
      logger.error('Webhook timestamp too old or invalid');
      return NextResponse.json({ error: 'Invalid timestamp' }, { status: 401 });
    }

    // Verify the signature
    const isValid = verifyYocoWebhookSignature(
      body,
      webhookSignature,
      webhookId,
      webhookTimestamp,
      webhookSecret
    );

    if (!isValid) {
      logger.error('Invalid Yoco webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    logger.info('Webhook signature verified successfully');

    // Parse the webhook event
    let event: YocoWebhookEvent;
    try {
      event = JSON.parse(body);

      // Log webhook structure for debugging
      logger.debug('Webhook event structure', {
        eventId: event.id,
        eventType: event.type,
        createdDate: event.createdDate,
        payloadKeys: Object.keys(event.payload || {}),
      });

      // Check all possible metadata locations with proper typing
      const eventAny = event as unknown as Record<string, unknown>;
      const payloadAny = event.payload as unknown as Record<string, unknown>;

      logger.debug('Metadata search locations', {
        hasPayloadMetadata: !!event.payload.metadata,
        hasEventMetadata: !!eventAny.metadata,
        hasPayloadData: !!payloadAny.data,
        hasPayloadObject: !!payloadAny.object,
      });

      logWebhookEvent(event as unknown as Record<string, unknown>, '📊');
    } catch (parseError) {
      logger.error('Failed to parse webhook JSON', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!event.id || !event.type || !event.payload) {
      logger.error('Invalid webhook event structure - missing required fields');
      return NextResponse.json(
        { error: 'Invalid webhook event structure' },
        { status: 400 }
      );
    }

    // Extract order ID or booking ID from metadata - CHECK MULTIPLE LOCATIONS
    let orderId: string | undefined;
    let bookingId: string | undefined;
    let bookingType: string | undefined;

    // Try multiple possible metadata locations
    const eventAny = event as unknown as Record<string, unknown>;
    const payloadAny = event.payload as unknown as Record<string, unknown>;

    // 1. Standard location: event.payload.metadata
    orderId = event.payload.metadata?.orderId as string | undefined;
    bookingId = event.payload.metadata?.bookingId as string | undefined;
    const rawBookingType = event.payload.metadata?.bookingType;
    bookingType = typeof rawBookingType === 'string' ? rawBookingType : undefined;

    // 2. Alternative: event.metadata
    if (!orderId && !bookingId && eventAny.metadata && typeof eventAny.metadata === 'object') {
      const metadata = eventAny.metadata as Record<string, unknown>;
      orderId = metadata.orderId as string;
      bookingId = metadata.bookingId as string;
      bookingType = metadata.bookingType as string | undefined;
    }

    // 3. Alternative: event.payload.data.metadata
    if (!orderId && !bookingId && payloadAny.data && typeof payloadAny.data === 'object') {
      const data = payloadAny.data as Record<string, unknown>;
      if (data.metadata && typeof data.metadata === 'object') {
        const metadata = data.metadata as Record<string, unknown>;
        orderId = metadata.orderId as string;
        bookingId = metadata.bookingId as string;
        bookingType = metadata.bookingType as string | undefined;
      }
    }

    // 4. Alternative: event.payload.object.metadata (for checkout objects)
    if (!orderId && !bookingId && payloadAny.object && typeof payloadAny.object === 'object') {
      const object = payloadAny.object as Record<string, unknown>;
      if (object.metadata && typeof object.metadata === 'object') {
        const metadata = object.metadata as Record<string, unknown>;
        orderId = metadata.orderId as string;
        bookingId = metadata.bookingId as string;
        bookingType = metadata.bookingType as string | undefined;
      }
    }

    logger.debug('ID extraction result', {
      foundOrderId: orderId || 'NOT FOUND',
      foundBookingId: bookingId || 'NOT FOUND',
      bookingType: bookingType || 'NOT FOUND',
      searchLocations: [
        'event.payload.metadata',
        'event.metadata',
        'event.payload.data.metadata',
        'event.payload.object.metadata'
      ]
    });

    // Check if this is a hall booking payment
    const isHallBooking = bookingType === 'hall_booking' && bookingId;

    if (!orderId && !isHallBooking) {
      logger.warn('No orderId or bookingId found in webhook metadata', {
        availableMetadata: event.payload.metadata,
      });

      // For now, just acknowledge the webhook even if we can't process it
      return NextResponse.json({
        received: true,
        processed: false,
        reason: 'No orderId or bookingId in metadata - webhook acknowledged but not processed'
      });
    }

    logger.info('Processing Yoco event', {
      eventType: event.type,
      orderId,
      bookingId,
      isHallBooking,
      payloadId: event.payload.id,
      status: event.payload.status,
      amount: event.payload.amount,
      currency: event.payload.currency,
    });

    const supabase = getSupabaseAdmin();

    // Handle hall booking payments
    if (isHallBooking && bookingId) {
      logger.info('Processing hall booking payment', { bookingId });

      const { data: booking, error: bookingError } = await supabase
        .from('hall_bookings')
        .select('id, status, user_id, event_date, applicant_email')
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        logger.error('Hall booking not found', { bookingId, error: bookingError });
        return NextResponse.json(
          { error: 'Hall booking not found' },
          { status: 404 }
        );
      }

      logger.debug('Found hall booking', {
        id: booking.id,
        currentStatus: booking.status,
        eventDate: booking.event_date,
      });

      // Determine booking status based on event type
      let newBookingStatus: string;

      if (
        (event.type.includes('payment') && event.payload.status === 'succeeded') ||
        (event.type.includes('checkout') && event.payload.status === 'completed') ||
        event.type.includes('succeeded') ||
        event.type.includes('completed')
      ) {
        // Payment successful - set to pending_approval (admin must approve)
        newBookingStatus = 'pending_approval';
        logger.info('Hall booking payment successful - awaiting admin approval', { bookingId });
      } else if (
        event.type.includes('cancelled') ||
        event.type.includes('failed') ||
        event.payload.status === 'cancelled' ||
        event.payload.status === 'failed'
      ) {
        // Payment failed or cancelled
        newBookingStatus = 'cancelled';
        logger.info('Hall booking payment failed/cancelled', { bookingId });
      } else {
        logger.warn('Unhandled event type for hall booking', {
          eventType: event.type,
          status: event.payload.status,
        });
        return NextResponse.json({
          received: true,
          processed: false,
          message: 'Event acknowledged but not processed - unknown event type'
        });
      }

      // Update booking in database
      const { error: updateError } = await supabase
        .from('hall_bookings')
        .update({
          status: newBookingStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (updateError) {
        logger.error('Failed to update hall booking', updateError);
        return NextResponse.json(
          { error: 'Failed to update hall booking' },
          { status: 500 }
        );
      }

      logger.info('Hall booking updated successfully', {
        bookingId,
        newStatus: newBookingStatus,
      });

      // TODO: Send confirmation email for hall booking
      // This can be implemented later with booking details

      return NextResponse.json({
        received: true,
        processed: true,
        bookingId,
        newStatus: newBookingStatus,
      });
    }

    // Handle regular order payments (existing logic)
    if (!orderId) {
      logger.error('No orderId found for regular order payment');
      return NextResponse.json(
        { error: 'No orderId found' },
        { status: 400 }
      );
    }

    // Get order from database using admin client (bypasses RLS for webhooks)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, payment_status, user_id, total_amount')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      logger.error('Order not found', { orderId, error: orderError });
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    logger.debug('Found order', {
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
      logger.info('Payment successful - updating order to confirmed', { orderId });
    } else if (
      event.type.includes('cancelled') ||
      event.type.includes('failed') ||
      event.payload.status === 'cancelled' ||
      event.payload.status === 'failed'
    ) {
      // Payment failed or cancelled
      newOrderStatus = 'cancelled';
      newPaymentStatus = event.type.includes('failed') ? 'failed' : 'cancelled';
      logger.info('Payment failed/cancelled', { orderId, eventType: event.type });
    } else if (
      event.type.includes('expired') ||
      event.payload.status === 'expired'
    ) {
      // Payment expired
      newOrderStatus = 'cancelled';
      newPaymentStatus = 'expired';
      logger.info('Payment expired', { orderId });
    } else {
      logger.warn('Unhandled event type or status', {
        eventType: event.type,
        status: event.payload.status,
      });
      // Still acknowledge the webhook
      return NextResponse.json({
        received: true,
        processed: false,
        message: 'Event acknowledged but not processed - unknown event type'
      });
    }

    // Update order in database (only use columns that exist in the schema)
    const updateData: {
      status: string;
      payment_status: string;
    } = {
      status: newOrderStatus,
      payment_status: newPaymentStatus,
    };

    // Note: Removed payment_id, payment_method, paid_at, updated_at as they don't exist in orders table
    // The orders table schema only has: id, user_id, order_number, status, total_amount, payment_status, special_instructions

    const { data: _updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to update order', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    logger.info('Order updated successfully', {
      orderId,
      newStatus: newOrderStatus,
      newPaymentStatus: newPaymentStatus,
    });

    // Send confirmation email for successful payments
    if (shouldSendEmail) {
      try {
        logger.info('Sending order confirmation email', { userId: order.user_id });

        if (order.user_id) {
          const { data: user } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', order.user_id)
            .single();

          if (user?.email) {
            const { sendOrderConfirmationEmail } = await import('@/lib/notifications');

            // Fetch order items for the email
            const { data: orderItems } = await supabase
              .from('order_items')
              .select(`
                quantity,
                price,
                menu_items!inner (name)
              `)
              .eq('order_id', orderId);

            const items = (orderItems || []).map((item: {
              quantity: number;
              price: number;
              menu_items: { name: string };
            }) => ({
              name: item.menu_items.name,
              quantity: item.quantity,
              price: item.price,
            }));

            const emailSent = await sendOrderConfirmationEmail({
              orderId: orderId,
              total: order.total_amount || 0,
              userEmail: user.email,
              userName: user.full_name || 'Valued Customer',
              items,
              deliveryType: 'delivery',
              estimatedReadyTime: undefined,
            });

            if (emailSent) {
              logger.info('Order confirmation email sent successfully', { email: user.email });
            } else {
              logger.warn('Order confirmation email failed to send', { email: user.email });
            }
          }
        }
      } catch (emailError) {
        logger.error('Failed to send confirmation email', emailError);
        // Don't fail the webhook for email errors
      }
    }

    // Log successful webhook processing
    logger.info('Webhook processed successfully', {
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
    logger.error('Webhook processing error', error);

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
