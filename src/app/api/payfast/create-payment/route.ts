import { NextRequest, NextResponse } from 'next/server';
import { payfast } from '@/lib/payfast';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 === PAYFAST CREATE PAYMENT API CALLED ===');
    console.log('🔴 LIVE MODE ACTIVE - REAL PAYMENTS!');

    const body = await request.json();
    console.log('📥 Request body:', JSON.stringify(body, null, 2));

    const { orderId, userId, amount, itemName, itemDescription, userDetails } =
      body;

    if (!orderId || !userId || !amount || !itemName) {
      console.log('❌ Missing required fields:', {
        orderId,
        userId,
        amount,
        itemName,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount with enhanced error handling for live mode
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.log('❌ Invalid amount:', amount, 'parsed to:', parsedAmount);
      return NextResponse.json(
        {
          error: 'Invalid amount',
          details: `Amount ${amount} is not a valid positive number`,
        },
        { status: 400 }
      );
    }

    // Additional validation for live mode
    if (process.env.NEXT_PUBLIC_PAYFAST_SANDBOX !== 'true') {
      if (parsedAmount < 0.01 || parsedAmount > 999999.99) {
        console.log('❌ Amount out of live mode range:', parsedAmount);
        return NextResponse.json(
          {
            error: 'Amount out of range',
            details: 'Live mode requires amount between R0.01 and R999,999.99',
          },
          { status: 400 }
        );
      }
    }

    // Resolve base URL (allows overriding with BASE_URL for tunnels like ngrok)
    const baseUrl =
      process.env.BASE_URL?.replace(/\/$/, '') || new URL(request.url).origin;
    if (process.env.BASE_URL) {
      console.log('🌐 Using BASE_URL override for PayFast URLs:', baseUrl);
    } else {
      console.log('🌐 Using request origin for PayFast URLs:', baseUrl);
    }

    console.log('📊 Payment details:');
    console.log('  - Order ID:', orderId);
    console.log('  - User ID:', userId);
    console.log('  - Amount:', parsedAmount);
    console.log('  - Item:', itemName);
    console.log('  - Base URL:', baseUrl);
    console.log('  - User Details:', JSON.stringify(userDetails, null, 2));

    console.log('🔧 Environment variables:');
    console.log('  - PAYFAST_MERCHANT_ID:', process.env.PAYFAST_MERCHANT_ID);
    console.log('  - PAYFAST_MERCHANT_KEY:', process.env.PAYFAST_MERCHANT_KEY);
    console.log(
      '  - PAYFAST_MERCHANT_SALT:',
      process.env.PAYFAST_MERCHANT_SALT ? '[SET]' : '[NOT SET]'
    );
    console.log(
      '  - NEXT_PUBLIC_PAYFAST_SANDBOX:',
      process.env.NEXT_PUBLIC_PAYFAST_SANDBOX
    );
    console.log('  - BASE_URL:', process.env.BASE_URL);

    // Create payment data with enhanced debugging
    console.log('🔧 Creating PayFast payment data...');
    console.log('🔍 Environment check before payment creation:');
    console.log('  - PAYFAST_MERCHANT_ID:', process.env.PAYFAST_MERCHANT_ID);
    console.log('  - PAYFAST_MERCHANT_KEY:', process.env.PAYFAST_MERCHANT_KEY);
    console.log(
      '  - PAYFAST_PASSPHRASE:',
      process.env.PAYFAST_PASSPHRASE ? '[SET]' : '[NOT SET]'
    );
    console.log(
      '  - PAYFAST_MERCHANT_SALT:',
      process.env.PAYFAST_MERCHANT_SALT ? '[SET]' : '[NOT SET]'
    );
    console.log(
      '  - Passphrase used:',
      process.env.PAYFAST_PASSPHRASE || process.env.PAYFAST_MERCHANT_SALT
    );

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

    console.log('📦 === FINAL PAYMENT DATA BEING SENT TO PAYFAST ===');
    console.log('Complete payment data object:');
    Object.entries(paymentData).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log('================================================');

    const paymentUrl = payfast.getPaymentUrl();

    console.log('✅ Payment creation successful!');
    console.log('🔗 Payment URL:', paymentUrl);
    console.log(
      '📝 Payment Data Fields Count:',
      Object.keys(paymentData).length
    );
    console.log('🔐 Generated Signature:', paymentData.signature);
    console.log('💰 Final Amount:', paymentData.amount);
    console.log('🆔 Payment ID:', paymentData.m_payment_id);

    // Additional validation for live mode
    if (process.env.NEXT_PUBLIC_PAYFAST_SANDBOX !== 'true') {
      console.log('🔴 LIVE MODE VALIDATION:');
      console.log('  - Merchant ID length:', paymentData.merchant_id.length);
      console.log('  - Merchant Key length:', paymentData.merchant_key.length);
      console.log('  - Signature length:', paymentData.signature.length);
      console.log(
        '  - Return URL valid:',
        paymentData.return_url?.startsWith('https://')
      );
      console.log(
        '  - Cancel URL valid:',
        paymentData.cancel_url?.startsWith('https://')
      );
      console.log(
        '  - Notify URL valid:',
        paymentData.notify_url?.startsWith('https://')
      );
    }

    console.log('🎯 === PAYFAST CREATE PAYMENT API COMPLETE ===\n');

    return NextResponse.json({
      paymentUrl,
      paymentData,
      debug: {
        environment:
          process.env.NEXT_PUBLIC_PAYFAST_SANDBOX === 'true'
            ? 'sandbox'
            : 'live',
        merchantId: paymentData.merchant_id,
        hasSignature: !!paymentData.signature,
        signatureLength: paymentData.signature?.length || 0,
        timestamp: new Date().toISOString(),
        fieldsCount: Object.keys(paymentData).length,
        amount: paymentData.amount,
        isLiveMode: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX !== 'true',
      },
    });
  } catch (error) {
    console.error('❌ PayFast payment creation error:', error);
    console.error(
      '❌ Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        error: 'Failed to create payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
