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
      bookingId?: string;
      type?: string; // 'order' or 'hall_booking'
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

    // Extract metadata from multiple possible locations
    let orderId: string | undefined;
    let bookingId: string | undefined;
    let paymentType: string | undefined;

    // Try multiple possible metadata locations
    const eventAny = event as unknown as Record<string, unknown>;
    const payloadAny = event.payload as unknown as Record<string, unknown>;

    // Helper function to extract metadata from any location
    const extractMetadata = (obj: Record<string, unknown>): Record<string, unknown> | null => {
      if (obj.metadata && typeof obj.metadata === 'object') {
        return obj.metadata as Record<string, unknown>;
      }
      return null;
    };

    // 1. Standard location: event.payload.metadata
    let metadata = extractMetadata(event.payload as unknown as Record<string, unknown>);

    // 2. Alternative: event.metadata
    if (!metadata && eventAny.metadata) {
      metadata = extractMetadata(eventAny);
    }

    // 3. Alternative: event.payload.data.metadata
    if (!metadata && payloadAny.data && typeof payloadAny.data === 'object') {
      metadata = extractMetadata(payloadAny.data as Record<string, unknown>);
    }

    // 4. Alternative: event.payload.object.metadata (for checkout objects)
    if (!metadata && payloadAny.object && typeof payloadAny.object === 'object') {
      metadata = extractMetadata(payloadAny.object as Record<string, unknown>);
    }

    // Extract IDs from metadata
    if (metadata) {
      orderId = metadata.orderId as string;
      bookingId = metadata.bookingId as string;
      paymentType = metadata.type as string;
    }

    logger.debug('Metadata extraction result', {
      foundOrderId: orderId || 'NOT FOUND',
      foundBookingId: bookingId || 'NOT FOUND',
      paymentType: paymentType || 'NOT SPECIFIED',
      searchLocations: [
        'event.payload.metadata',
        'event.metadata',
        'event.payload.data.metadata',
        'event.payload.object.metadata'
      ]
    });

    // Must have either orderId or bookingId
    if (!orderId && !bookingId) {
      logger.warn('No orderId or bookingId found in webhook metadata', {
        availableMetadata: event.payload.metadata,
      });

      // Acknowledge the webhook but don't process it
      return NextResponse.json({
        received: true,
        processed: false,
        reason: 'No orderId or bookingId in metadata - webhook acknowledged but not processed'
      });
    }

    logger.info('Processing Yoco event', {
      eventType: event.type,
      paymentType,
      orderId,
      bookingId,
      payloadId: event.payload.id,
      status: event.payload.status,
      amount: event.payload.amount,
      currency: event.payload.currency,
    });

    // Get Supabase admin client (bypasses RLS for webhooks)
    const supabase = getSupabaseAdmin();

    // Determine if this is a hall booking or regular order
    const isHallBooking = paymentType === 'hall_booking' || bookingId;
    const recordId = isHallBooking ? bookingId : orderId;
    const tableName = isHallBooking ? 'hall_bookings' : 'orders';

    if (!recordId) {
      logger.error('No record ID found for payment type', { paymentType, isHallBooking });
      return NextResponse.json(
        { error: 'Invalid payment record ID' },
        { status: 400 }
      );
    }

    // Fetch the record from the appropriate table
    const { data: record, error: fetchError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', recordId)
      .single();

    if (fetchError || !record) {
      logger.error(`${tableName} record not found`, { recordId, error: fetchError });
      return NextResponse.json(
        { error: `${tableName} record not found` },
        { status: 404 }
      );
    }

    logger.debug(`Found ${tableName} record`, {
      id: record.id,
      currentStatus: record.status,
      currentPaymentStatus: record.payment_status,
      totalAmount: record.total_amount,
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

    // Prepare update data
    const updateData: Record<string, unknown> = {
      status: newOrderStatus,
      payment_status: newPaymentStatus,
    };

    // For hall bookings, also update payment date and confirmation timestamp
    if (isHallBooking && shouldSendEmail) {
      updateData.payment_date = new Date().toISOString();
      updateData.payment_reference = event.payload.id;
      updateData.confirmed_at = new Date().toISOString();
    }

    // Update record in database
    const { data: _updatedRecord, error: updateError } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', recordId)
      .select()
      .single();

    if (updateError) {
      logger.error(`Failed to update ${tableName} record`, updateError);
      return NextResponse.json(
        { error: `Failed to update ${tableName} record` },
        { status: 500 }
      );
    }

    logger.info(`${tableName} record updated successfully`, {
      recordId,
      newStatus: newOrderStatus,
      newPaymentStatus: newPaymentStatus,
    });

    // Send confirmation email for successful payments
    if (shouldSendEmail) {
      try {
        if (isHallBooking) {
          // Hall booking confirmation email
          logger.info('Sending hall booking confirmation email', { bookingId: recordId });

          try {
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/hall-booking/confirmation`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId: recordId,
                bookingReference: record.booking_reference,
              }),
            });

            logger.info('Hall booking confirmation email sent successfully', { bookingReference: record.booking_reference });
          } catch (emailError) {
            logger.error('Failed to send hall booking confirmation email', emailError);
          }
        } else {
          // Regular order confirmation email
          logger.info('Sending order confirmation email', { userId: record.user_id });

          if (record.user_id) {
            const { data: user } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', record.user_id)
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
                .eq('order_id', recordId);

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
                orderId: recordId!,
                total: record.total_amount || 0,
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
      paymentType: isHallBooking ? 'hall_booking' : 'order',
      recordId,
      orderId,
      bookingId,
      newStatus: newOrderStatus,
      emailSent: shouldSendEmail,
    });

    return NextResponse.json({
      received: true,
      processed: true,
      type: isHallBooking ? 'hall_booking' : 'order',
      recordId,
      orderId,
      bookingId,
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
