import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook Test Endpoint
 * Debug endpoint to test Yoco webhook functionality
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Test webhook called!');
    
    // Log request headers
    console.log('📋 Headers:');
    for (const [key, value] of request.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Log request body
    const body = await request.text();
    console.log('📄 Body:', body);
    
    // Try to parse as JSON
    try {
      const jsonBody = JSON.parse(body);
      console.log('📊 Parsed JSON:', JSON.stringify(jsonBody, null, 2));
    } catch (parseError) {
      console.log('⚠️ Body is not valid JSON');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test webhook received successfully',
      timestamp: new Date().toISOString(),
      receivedBody: body,
    });
    
  } catch (error) {
    console.error('❌ Test webhook error:', error);
    return NextResponse.json(
      { error: 'Test webhook failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Test webhook endpoint is active',
    timestamp: new Date().toISOString(),
    info: 'This endpoint logs all POST requests for debugging',
    webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/test/webhook`,
  });
}
