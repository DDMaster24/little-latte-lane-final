/**
 * Yoco Checkout API Route
 * Creates a new payment session with Yoco
 */

import { NextRequest, NextResponse } from 'next/server';
import { yocoClient, randssToCents, generateCallbackUrls } from '@/lib/yoco';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { checkRateLimit, getClientIdentifier, RateLimitPresets, getRateLimitHeaders } from '@/lib/rate-limit';

interface CheckoutRequestBody {
  orderId: string;
  userId: string;
  amount: number; // Amount in rands
  itemName: string;
  itemDescription: string;
  userDetails: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export async function POST(request: NextRequest) {
  console.log('Yoco checkout POST request received');

  try {
    const body: CheckoutRequestBody = await request.json();

    const { orderId, userId, amount, itemName, itemDescription, userDetails } = body;

    // Apply rate limiting for payment operations
    const identifier = getClientIdentifier(request, userId);
    const rateLimitResult = checkRateLimit(identifier, {
      id: 'yoco-checkout',
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
    console.log('Validating fields:', { orderId, userId, amount });
    if (!orderId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId or userId' },
        { status: 400 }
      );
    }

    // SECURITY: Validate payment amount with min/max limits
    const MIN_AMOUNT = 5; // R5 minimum (to cover payment gateway fees)
    const MAX_AMOUNT = 10000; // R10,000 maximum (reasonable limit for restaurant orders)

    if (typeof amount !== 'number' || isNaN(amount)) {
      return NextResponse.json(
        { error: 'Invalid amount - must be a valid number' },
        { status: 400 }
      );
    }

    if (amount < MIN_AMOUNT) {
      return NextResponse.json(
        { error: `Amount too low - minimum order amount is R${MIN_AMOUNT}` },
        { status: 400 }
      );
    }

    if (amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `Amount too high - maximum order amount is R${MAX_AMOUNT}` },
        { status: 400 }
      );
    }

    // Validate decimal precision (max 2 decimal places for currency)
    if (!Number.isFinite(amount) || Math.round(amount * 100) / 100 !== amount) {
      return NextResponse.json(
        { error: 'Invalid amount - must have at most 2 decimal places' },
        { status: 400 }
      );
    }

    // Verify the order exists in our database using admin client for elevated access
    const supabase = getSupabaseAdmin();
    console.log('🔍 Looking for order:', { orderId, userId });
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, total_amount, status, user_id')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    console.log('📊 Order query result:', { order, orderError });

    if (orderError || !order) {
      console.log('❌ Order lookup failed:', { orderError, order });
      return NextResponse.json(
        { error: 'Order not found or unauthorized' },
        { status: 404 }
      );
    }

    // SECURITY: Verify the amount matches using integer comparison (cents) to avoid floating point issues
    const orderAmount = order.total_amount || 0;
    const amountCents = Math.round(amount * 100);
    const orderAmountCents = Math.round(orderAmount * 100);

    if (amountCents !== orderAmountCents) {
      console.error('Amount mismatch:', {
        requestAmount: amount,
        requestAmountCents: amountCents,
        orderAmount: orderAmount,
        orderAmountCents: orderAmountCents,
      });
      return NextResponse.json(
        {
          error: 'Amount mismatch - the payment amount must match the order total',
          expected: orderAmount,
          received: amount,
        },
        { status: 400 }
      );
    }

    // Allow payment for both draft and pending orders
    if (!order.status || !['draft', 'pending'].includes(order.status)) {
      return NextResponse.json(
        { error: `Order status is ${order.status || 'unknown'}, cannot process payment` },
        { status: 400 }
      );
    }
    
    // Generate callback URLs using current request context
    const callbacks = generateCallbackUrls(orderId, request);

    // Convert amount to cents for Yoco
    const amountInCents = randssToCents(amount);

    console.log('💳 Creating Yoco checkout:', {
      amount: amountInCents,
      currency: 'ZAR',
      callbacks,
      metadata: {
        orderId,
        userId: userId,
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
        orderId,
        userId,
        itemName,
        itemDescription,
        customerEmail: userDetails.email,
        customerName: `${userDetails.firstName} ${userDetails.lastName}`,
        customerPhone: userDetails.phone,
      },
    });

    console.log('✅ Yoco checkout created successfully:', {
      id: checkout.id,
      redirectUrl: checkout.redirectUrl
    });

    return NextResponse.json({
      success: true,
      checkoutId: checkout.id,
      redirectUrl: checkout.redirectUrl,
      amount: amountInCents,
      currency: 'ZAR',
    });

  } catch (error) {
    console.error('❌ Yoco checkout creation failed:', error);
    
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
  console.log('🚀 Yoco checkout GET request received');
  return NextResponse.json(
    { 
      message: 'Yoco checkout endpoint is working',
      timestamp: new Date().toISOString(),
      methods: ['POST']
    },
    { status: 200 }
  );
}
