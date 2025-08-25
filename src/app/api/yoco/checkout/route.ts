/**
 * Yoco Checkout API Route
 * Creates a new payment session with Yoco
 */

import { NextRequest, NextResponse } from 'next/server';
import { yocoClient, randssToCents, generateCallbackUrls } from '@/lib/yoco';
import { getSupabaseAdmin } from '@/lib/supabase-server';

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
  console.log('🚀 Yoco checkout POST request received');
  
  try {
    const body: CheckoutRequestBody = await request.json();
    console.log('📝 Request body:', body);
    
    const { orderId, userId, amount, itemName, itemDescription, userDetails } = body;

    // Validate required fields
    console.log('🔍 Validating fields:', { orderId, userId, amount });
    if (!orderId || !userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, userId, or invalid amount' },
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

    // Verify the amount matches
    const orderAmount = order.total_amount || 0;
    if (Math.abs(orderAmount - amount) > 0.01) {
      return NextResponse.json(
        { error: 'Amount mismatch between request and order' },
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
