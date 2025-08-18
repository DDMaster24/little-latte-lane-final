import { NextRequest, NextResponse } from 'next/server';
import { payfast } from '@/lib/payfast';

const isDevelopment = process.env.NODE_ENV === 'development';
const isLiveMode = process.env.NEXT_PUBLIC_PAYFAST_SANDBOX !== 'true';

export async function POST(request: NextRequest) {
  try {
    if (isDevelopment) {
      console.log('🎯 PayFast Create Payment API Called');
    }

    const body = await request.json();
    const { orderId, userId, amount, itemName, itemDescription, userDetails } = body;

    // Validate required fields
    if (!orderId || !userId || !amount || !itemName) {
      if (isDevelopment) {
        console.log('❌ Missing required fields:', { orderId, userId, amount, itemName });
      }
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate and parse amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount', details: `Amount ${amount} is not a valid positive number` },
        { status: 400 }
      );
    }

    // Live mode amount validation
    if (isLiveMode && (parsedAmount < 0.01 || parsedAmount > 999999.99)) {
      return NextResponse.json(
        { error: 'Amount out of range', details: 'Live mode requires amount between R0.01 and R999,999.99' },
        { status: 400 }
      );
    }

    // Resolve base URL for PayFast callbacks
    const baseUrl = process.env.BASE_URL?.replace(/\/$/, '') || new URL(request.url).origin;
    
    if (isDevelopment) {
      console.log('� Payment Details:', { orderId, amount: parsedAmount, isLiveMode });
    }

    // Create payment data
    const paymentData = payfast.createPaymentData({
      orderId,
      userId,
      amount: parsedAmount,
      itemName,
      itemDescription,
      userEmail: userDetails?.email,
      userFirstName: userDetails?.firstName,
      userLastName: userDetails?.lastName,
      userPhone: userDetails?.phone,
      deliveryType: userDetails?.deliveryType,
      deliveryAddress: userDetails?.deliveryAddress,
      returnUrl: `${baseUrl}/api/payfast/return`,
      cancelUrl: `${baseUrl}/api/payfast/cancel`,
      notifyUrl: `${baseUrl}/api/payfast/notify`,
    });

    const paymentUrl = payfast.getPaymentUrl();

    if (isDevelopment) {
      console.log('✅ Payment created:', { paymentUrl, hasSignature: !!paymentData.signature });
    }

    return NextResponse.json({
      paymentUrl,
      paymentData,
      debug: isDevelopment ? {
        environment: isLiveMode ? 'live' : 'sandbox',
        merchantId: paymentData.merchant_id,
        hasSignature: !!paymentData.signature,
        timestamp: new Date().toISOString(),
        amount: paymentData.amount,
      } : undefined,
    });
  } catch (error) {
    if (isDevelopment) {
      console.error('❌ PayFast payment creation error:', error);
    }
    
    return NextResponse.json(
      {
        error: 'Failed to create payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
