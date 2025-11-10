import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { createYocoCheckout } from '@/lib/yoco';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, amount, customerEmail, customerName } = await request.json();

    // Validation
    if (!bookingId || !amount || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const supabase = await getSupabaseServer();
    const { data: booking, error: bookingError } = await supabase
      .from('hall_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Create Yoco checkout
    const amountInCents = Math.round(amount * 100);

    const checkoutData = {
      amount: amountInCents,
      currency: 'ZAR',
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/hall-booking/success?bookingId=${bookingId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/hall-booking?step=8`,
      failureUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/hall-booking?step=8&error=payment_failed`,
      metadata: {
        bookingId,
        bookingReference: booking.booking_reference,
        type: 'hall_booking',
        userId: booking.user_id,
        eventDate: booking.event_date,
      },
      lineItems: [
        {
          displayName: 'Roberts Hall Rental Fee',
          quantity: 1,
          pricingDetails: {
            price: Math.round(booking.rental_fee * 100),
          },
        },
        {
          displayName: 'Security Deposit (Refundable)',
          quantity: 1,
          pricingDetails: {
            price: Math.round(booking.deposit_amount * 100),
          },
        },
      ],
    };

    const yocoCheckout = await createYocoCheckout(checkoutData);

    if (!yocoCheckout) {
      throw new Error('Failed to create Yoco checkout session');
    }

    return NextResponse.json({
      checkoutId: yocoCheckout.id,
      redirectUrl: yocoCheckout.redirectUrl,
    });

  } catch (error: any) {
    console.error('Yoco checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
