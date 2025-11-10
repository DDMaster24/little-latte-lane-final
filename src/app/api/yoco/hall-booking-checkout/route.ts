/**
 * Yoco Checkout API Route for Roberts Hall Bookings
 * Creates a new payment session with Yoco for hall bookings
 */

import { NextRequest, NextResponse } from 'next/server';
import { yocoClient, randssToCents, generateCallbackUrls } from '@/lib/yoco';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { checkRateLimit, getClientIdentifier, RateLimitPresets, getRateLimitHeaders } from '@/lib/rate-limit';

interface HallBookingCheckoutRequest {
  bookingId: string;
  userId: string;
  amount: number; // Temporarily set to 20 for testing (normally 2500: R1,500 rental + R1,000 deposit)
  userDetails: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export async function POST(request: NextRequest) {
  console.log('Hall booking checkout POST request received');

  try {
    const body: HallBookingCheckoutRequest = await request.json();

    const { bookingId, userId, amount, userDetails } = body;

    // Apply rate limiting for payment operations
    const identifier = getClientIdentifier(request, userId);
    const rateLimitResult = checkRateLimit(identifier, {
      id: 'hall-booking-checkout',
      ...RateLimitPresets.PAYMENT,
    });

    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.resetAt).toISOString();
      return NextResponse.json(
        {
          error: 'Too many checkout requests. Please try again later.',
          resetAt: resetTime,
        },
        {
          status: 429,
          headers: getRateLimitHeaders({
            ...rateLimitResult,
            limit: RateLimitPresets.PAYMENT.limit,
          }),
        }
      );
    }

    // Validate required fields
    console.log('Validating fields:', { bookingId, userId, amount });
    if (!bookingId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId or userId' },
        { status: 400 }
      );
    }

    // SECURITY: Validate payment amount (TEMPORARILY SET TO R20 FOR TESTING - normally R2,500)
    const HALL_BOOKING_AMOUNT = 20; // TODO: Change back to 2500 for production

    if (typeof amount !== 'number' || isNaN(amount)) {
      return NextResponse.json(
        { error: 'Invalid amount - must be a valid number' },
        { status: 400 }
      );
    }

    if (amount !== HALL_BOOKING_AMOUNT) {
      return NextResponse.json(
        {
          error: `Invalid amount - Roberts Hall booking fee must be exactly R${HALL_BOOKING_AMOUNT}`,
          expected: HALL_BOOKING_AMOUNT,
          received: amount,
        },
        { status: 400 }
      );
    }

    // Verify the booking exists in our database using admin client
    const supabase = getSupabaseAdmin();
    console.log('🔍 Looking for hall booking:', { bookingId, userId });

    const { data: booking, error: bookingError } = await supabase
      .from('hall_bookings')
      .select('id, event_date, status, user_id, applicant_email')
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();

    console.log('📊 Booking query result:', { booking, bookingError });

    if (bookingError || !booking) {
      console.log('❌ Booking lookup failed:', { bookingError, booking });
      return NextResponse.json(
        { error: 'Booking not found or unauthorized' },
        { status: 404 }
      );
    }

    // Allow payment only for pending_payment status
    if (booking.status !== 'pending_payment') {
      return NextResponse.json(
        {
          error: `Booking status is ${booking.status}, cannot process payment`,
          details: 'Only bookings with pending_payment status can be paid'
        },
        { status: 400 }
      );
    }

    // Generate callback URLs using booking ID
    const callbacks = generateCallbackUrls(bookingId, request, 'hall-booking');

    // Convert amount to cents for Yoco
    const amountInCents = randssToCents(amount);

    console.log('💳 Creating Yoco checkout for hall booking:', {
      amount: amountInCents,
      currency: 'ZAR',
      callbacks,
      metadata: {
        bookingId,
        userId: userId,
        eventDate: booking.event_date,
        customerEmail: userDetails.email,
      }
    });

    // Create Yoco checkout session
    const checkout = await yocoClient.createCheckout({
      amount: amountInCents,
      currency: 'ZAR',
      successUrl: callbacks.successUrl,
      cancelUrl: callbacks.cancelUrl,
      failureUrl: callbacks.failureUrl,
      webhookUrl: callbacks.webhookUrl,
      metadata: {
        orderId: bookingId, // Using bookingId as orderId for compatibility
        userId,
        bookingId,
        bookingType: 'hall_booking',
        eventDate: booking.event_date,
        customerEmail: userDetails.email,
        customerName: `${userDetails.firstName} ${userDetails.lastName}`,
        customerPhone: userDetails.phone,
      },
    });

    console.log('✅ Yoco checkout created successfully for hall booking:', {
      id: checkout.id,
      redirectUrl: checkout.redirectUrl
    });

    // Update booking status to payment_processing
    const { error: updateError } = await supabase
      .from('hall_bookings')
      .update({
        status: 'payment_processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('⚠️ Failed to update booking status to payment_processing:', updateError);
      // Don't fail the request - payment can still proceed
    }

    return NextResponse.json({
      success: true,
      checkoutId: checkout.id,
      redirectUrl: checkout.redirectUrl,
      amount: amountInCents,
      currency: 'ZAR',
    });

  } catch (error) {
    console.error('❌ Hall booking checkout creation failed:', error);

    return NextResponse.json(
      {
        error: 'Failed to create payment session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log('🚀 Hall booking checkout GET request received');
  return NextResponse.json(
    {
      message: 'Roberts Hall booking checkout endpoint is working',
      timestamp: new Date().toISOString(),
      methods: ['POST']
    },
    { status: 200 }
  );
}
