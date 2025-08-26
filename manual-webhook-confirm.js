// Manual webhook test to confirm draft order
const https = require('https');

function testWebhookConfirmation() {
  console.log('🧪 Testing webhook confirmation for draft order LL1032...');
  
  // Simulate a payment success webhook for order LL1032
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
        orderId: '5f7bd755-f04b-44c9-94e4-9bad7055b964', // Actual draft order ID
        userId: '107ca881-0d6b-2109-107c-a881e29b41d4',
        customerEmail: 'test@example.com'
      }
    }
  };

  const postData = JSON.stringify(testWebhookData);

  const options = {
    hostname: 'little-latte-lane-final.vercel.app',
    port: 443,
    path: '/api/yoco/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'webhook-id': 'wh_test_manual_confirmation',
      'webhook-timestamp': Math.floor(Date.now() / 1000).toString()
    }
  };

  const req = https.request(options, (res) => {
    console.log(`📋 Response Status: ${res.statusCode}`);
    console.log(`📋 Response Headers:`, res.headers);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      console.log('📋 Response Body:', body);
      
      if (res.statusCode === 200) {
        console.log('✅ Webhook processed successfully!');
        console.log('🎉 Order LL1032 should now be confirmed - check your admin panel!');
      } else {
        console.log('❌ Webhook processing failed');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error making webhook request:', error.message);
  });

  req.write(postData);
  req.end();
}

testWebhookConfirmation();
