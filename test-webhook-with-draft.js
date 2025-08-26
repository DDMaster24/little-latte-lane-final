// Test webhook processing with one of the draft orders
const fetch = require('node-fetch');

async function testWebhookWithDraftOrder() {
  console.log('🧪 Testing webhook with draft order LL1032...');
  
  // Simulate a payment success webhook for order LL1032 (R6)
  const testWebhookData = {
    id: 'test-webhook-' + Date.now(),
    type: 'checkout.payment_received',
    createdDate: new Date().toISOString(),
    payload: {
      id: 'ch_test_payment_' + Date.now(),
      status: 'completed',
      amount: 600, // R6 in cents
      currency: 'ZAR',
      metadata: {
        orderId: '7c8b9e6f-4a3b-4c5d-9e8f-1a2b3c4d5e6f', // Need to get actual order ID
        userId: '107ca881-0d6b-2109-107c-a881e29b41d4',
        customerEmail: 'test@example.com'
      }
    }
  };

  try {
    const response = await fetch('http://localhost:3000/api/yoco/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'webhook-id': 'wh_test_id',
        'webhook-timestamp': Math.floor(Date.now() / 1000).toString(),
        'webhook-signature': 'v1,test_signature'
      },
      body: JSON.stringify(testWebhookData)
    });

    const result = await response.text();
    console.log('📋 Response Status:', response.status);
    console.log('📋 Response Body:', result);

  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
  }
}

testWebhookWithDraftOrder();
