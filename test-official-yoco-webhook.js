/**
 * Test Official Yoco Webhook Format
 * Simulates the exact webhook payload format from Yoco documentation
 */

const testOfficialYocoWebhook = async () => {
  console.log('🧪 Testing Official Yoco Webhook Format...');
  
  // Official Yoco webhook payload format
  const webhookPayload = {
    id: 'evt_test_' + Date.now(),
    type: 'payment.succeeded',
    createdDate: new Date().toISOString(),
    payload: {
      id: 'pay_test_' + Date.now(),
      amount: 15000, // R150.00 in cents
      currency: 'ZAR',
      createdDate: new Date().toISOString(),
      mode: 'test',
      status: 'succeeded',
      type: 'payment',
      metadata: {
        checkoutId: 'checkout_test_' + Date.now(),
        orderId: 'LL1031', // Using a test order that we know exists
        userId: 'test-user-id',
        customerEmail: 'test@example.com'
      },
      paymentMethodDetails: {
        type: 'card',
        card: {
          expiryMonth: 12,
          expiryYear: 2025,
          maskedCard: '****1234',
          scheme: 'visa',
          cardHolder: 'Test Customer'
        }
      }
    }
  };

  try {
    console.log('📤 Sending webhook payload:', JSON.stringify(webhookPayload, null, 2));

    const response = await fetch('https://www.littlelattelane.co.za/api/yoco/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'webhook-signature': 'test_signature_not_verified_yet',
        'User-Agent': 'Yoco-Webhook/1.0'
      },
      body: JSON.stringify(webhookPayload)
    });

    const responseData = await response.text();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('📥 Response body:', responseData);

    if (response.ok) {
      console.log('✅ Webhook test successful!');
      return { success: true, data: responseData };
    } else {
      console.log('❌ Webhook test failed:', response.status, responseData);
      return { success: false, error: responseData };
    }

  } catch (error) {
    console.error('❌ Webhook test error:', error);
    return { success: false, error: error.message };
  }
};

// Test payment.failed event as well
const testFailedPaymentWebhook = async () => {
  console.log('🧪 Testing Failed Payment Webhook...');
  
  const webhookPayload = {
    id: 'evt_fail_' + Date.now(),
    type: 'payment.failed',
    createdDate: new Date().toISOString(),
    payload: {
      id: 'pay_fail_' + Date.now(),
      amount: 12500, // R125.00 in cents
      currency: 'ZAR',
      createdDate: new Date().toISOString(),
      mode: 'test',
      status: 'failed',
      type: 'payment',
      metadata: {
        checkoutId: 'checkout_fail_' + Date.now(),
        orderId: 'LL1032', // Different test order
        userId: 'test-user-id-2',
        customerEmail: 'test2@example.com'
      }
    }
  };

  try {
    const response = await fetch('https://www.littlelattelane.co.za/api/yoco/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'webhook-signature': 'test_signature_for_failed_payment',
        'User-Agent': 'Yoco-Webhook/1.0'
      },
      body: JSON.stringify(webhookPayload)
    });

    const responseData = await response.text();
    
    console.log('📥 Failed payment response:', response.status, responseData);
    return { success: response.ok, data: responseData };

  } catch (error) {
    console.error('❌ Failed payment webhook error:', error);
    return { success: false, error: error.message };
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting Official Yoco Webhook Tests...\n');
  
  // Test successful payment
  const successTest = await testOfficialYocoWebhook();
  console.log('✅ Success test result:', successTest);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test failed payment
  const failTest = await testFailedPaymentWebhook();
  console.log('❌ Fail test result:', failTest);
  
  console.log('\n🏁 Webhook tests completed!');
};

// Export for module usage or run directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testOfficialYocoWebhook, testFailedPaymentWebhook, runTests };
} else {
  runTests();
}
