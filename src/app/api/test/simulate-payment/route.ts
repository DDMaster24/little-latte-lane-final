import { NextRequest, NextResponse } from 'next/server';

/**
 * Simulate Payment Success
 * Manually trigger payment success for testing webhook functionality
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    console.log('🧪 Simulating payment success for order:', orderId);

    // Create a mock webhook payload
    const mockWebhookPayload = {
      type: 'checkout.succeeded',
      payload: {
        id: 'test_checkout_' + Date.now(),
        status: 'succeeded',
        amount: 100, // cents
        currency: 'ZAR',
        metadata: {
          orderId: orderId
        }
      }
    };

    // Call our own webhook endpoint
    const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.littlelattelane.co.za'}/api/yoco/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-yoco-signature': 'test-signature', // Mock signature
      },
      body: JSON.stringify(mockWebhookPayload)
    });

    const webhookResult = await webhookResponse.json();

    if (webhookResponse.ok) {
      return NextResponse.json({
        success: true,
        message: 'Payment success simulated successfully',
        orderId,
        webhookResult
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Webhook simulation failed',
        orderId,
        webhookResult
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Simulate payment error:', error);
    return NextResponse.json(
      { error: 'Simulation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Payment simulation endpoint is active',
    usage: 'POST with { "orderId": "your-order-id" } to simulate payment success',
    timestamp: new Date().toISOString()
  });
}
