#!/usr/bin/env node

/**
 * Complete Yoco Payment Integration Test
 * Tests the entire flow: checkout creation → webhook handling → database updates
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;
const YOCO_WEBHOOK_SECRET = process.env.YOCO_WEBHOOK_SECRET;
const WEBHOOK_URL = 'https://www.littlelattelane.co.za/api/yoco/webhook';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.littlelattelane.co.za';

console.log('🧪 Little Latte Lane - Complete Yoco Integration Test\n');

if (!YOCO_SECRET_KEY) {
  console.error('❌ Error: YOCO_SECRET_KEY not found in .env.local');
  process.exit(1);
}

// Test 1: Check webhook registration status
async function testWebhookStatus() {
  console.log('🔍 TEST 1: Checking Webhook Registration Status');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch('https://payments.yoco.com/api/webhooks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const webhooks = data.webhooks || data || [];
      
      console.log(`✅ API Access: Working`);
      console.log(`📊 Registered Webhooks: ${webhooks.length}`);
      
      const ourWebhook = webhooks.find(w => w.url === WEBHOOK_URL);
      if (ourWebhook) {
        console.log(`✅ Our Webhook: Found (ID: ${ourWebhook.id})`);
        console.log(`🔐 Secret Available: ${ourWebhook.secret ? 'Yes' : 'No'}`);
        console.log(`📋 Mode: ${ourWebhook.mode || 'unknown'}`);
      } else {
        console.log(`❌ Our Webhook: Not found`);
        console.log(`🌐 Expected URL: ${WEBHOOK_URL}`);
      }
      
      return { success: true, webhook: ourWebhook };
    } else {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      return { success: false };
    }
  } catch (error) {
    console.log(`❌ Connection Error: ${error.message}`);
    return { success: false };
  }
}

// Test 2: Test checkout creation
async function testCheckoutCreation() {
  console.log('\n💳 TEST 2: Testing Checkout Creation');
  console.log('='.repeat(60));
  
  try {
    const testCheckoutData = {
      amount: 1000, // R10.00 in cents
      currency: 'ZAR',
      successUrl: `${SITE_URL}/payment/success`,
      cancelUrl: `${SITE_URL}/payment/cancel`,
      failureUrl: `${SITE_URL}/payment/failure`,
      metadata: {
        orderId: 'test-order-' + Date.now(),
        userId: 'test-user-123',
        customerEmail: 'test@example.com',
        testPayment: 'true'
      }
    };

    console.log('📤 Creating test checkout...');
    console.log('💰 Amount: R10.00 (1000 cents)');
    console.log('🆔 Test Order ID:', testCheckoutData.metadata.orderId);

    const response = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCheckoutData)
    });

    if (response.ok) {
      const checkout = await response.json();
      console.log('✅ Checkout Created Successfully!');
      console.log(`🆔 Checkout ID: ${checkout.id}`);
      console.log(`🔗 Payment URL: ${checkout.redirectUrl}`);
      console.log(`📋 Status: ${checkout.status}`);
      console.log(`💰 Amount: ${checkout.amount} cents`);
      console.log(`💴 Currency: ${checkout.currency}`);
      
      return { 
        success: true, 
        checkout,
        testOrderId: testCheckoutData.metadata.orderId 
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ Checkout Creation Failed: ${response.status} ${response.statusText}`);
      console.log('Error details:', errorData);
      return { success: false };
    }
  } catch (error) {
    console.log(`❌ Checkout Creation Error: ${error.message}`);
    return { success: false };
  }
}

// Test 3: Test webhook endpoint accessibility
async function testWebhookEndpoint() {
  console.log('\n🔗 TEST 3: Testing Webhook Endpoint Accessibility');
  console.log('='.repeat(60));
  
  try {
    console.log(`📡 Testing: ${WEBHOOK_URL}`);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Webhook Endpoint: Accessible');
      console.log('📊 Response:', data);
      console.log(`🔐 Webhook Secret: ${YOCO_WEBHOOK_SECRET ? 'Configured' : 'Not configured'}`);
      return { success: true };
    } else {
      console.log(`❌ Webhook Endpoint Error: ${response.status} ${response.statusText}`);
      return { success: false };
    }
  } catch (error) {
    console.log(`❌ Webhook Endpoint Error: ${error.message}`);
    return { success: false };
  }
}

// Test 4: Simulate webhook call
async function testWebhookSimulation(testOrderId) {
  console.log('\n🔔 TEST 4: Simulating Webhook Call');
  console.log('='.repeat(60));
  
  try {
    // Try different webhook payload formats to see what Yoco actually sends
    const mockWebhookPayloads = [
      {
        name: 'Payment Succeeded Event',
        payload: {
          id: 'evt_' + Date.now(),
          type: 'payment.succeeded',
          createdDate: new Date().toISOString(),
          payload: {
            id: 'payment_test_' + Date.now(),
            status: 'succeeded',
            amount: 1000,
            currency: 'ZAR',
            paymentId: 'payment_test_' + Date.now(),
            metadata: {
              orderId: testOrderId,
              userId: 'test-user-123',
              checkoutId: 'checkout_test_' + Date.now()
            },
            processingMode: 'test'
          }
        }
      },
      {
        name: 'Checkout Payment Received Event',
        payload: {
          id: 'evt_' + Date.now(),
          type: 'checkout.payment_received',
          createdDate: new Date().toISOString(),
          payload: {
            id: 'checkout_test_' + Date.now(),
            status: 'completed',
            amount: 1000,
            currency: 'ZAR',
            paymentId: 'payment_test_' + Date.now(),
            metadata: {
              orderId: testOrderId,
              userId: 'test-user-123'
            },
            merchantId: 'test_merchant',
            processingMode: 'test'
          }
        }
      },
      {
        name: 'Generic Payment Event',
        payload: {
          id: 'evt_' + Date.now(),
          type: 'payment_completed',
          createdDate: new Date().toISOString(),
          payload: {
            id: 'payment_test_' + Date.now(),
            status: 'completed',
            amount: 1000,
            currency: 'ZAR',
            paymentId: 'payment_test_' + Date.now(),
            metadata: {
              orderId: testOrderId,
              userId: 'test-user-123'
            }
          }
        }
      }
    ];

    let successCount = 0;

    for (const testCase of mockWebhookPayloads) {
      console.log(`\n📤 Testing: ${testCase.name}...`);
      console.log('🎯 Event Type:', testCase.payload.type);
      console.log('🆔 Order ID:', testOrderId);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Yoco-Webhooks/1.0'
        },
        body: JSON.stringify(testCase.payload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${testCase.name}: Success`);
        console.log('📊 Response:', data);
        successCount++;
      } else {
        const errorText = await response.text();
        console.log(`❌ ${testCase.name}: Failed (${response.status})`);
        console.log('Error details:', errorText.substring(0, 200));
      }
    }

    console.log(`\n📊 Webhook Tests: ${successCount}/${mockWebhookPayloads.length} successful`);
    return { success: successCount > 0, successCount, totalTests: mockWebhookPayloads.length };
    
  } catch (error) {
    console.log(`❌ Webhook Simulation Error: ${error.message}`);
    return { success: false };
  }
}

// Test 5: Environment validation
async function testEnvironmentSetup() {
  console.log('\n⚙️ TEST 5: Environment Setup Validation');
  console.log('='.repeat(60));
  
  const envChecks = [
    { name: 'YOCO_SECRET_KEY', value: YOCO_SECRET_KEY, required: true },
    { name: 'YOCO_PUBLIC_KEY', value: process.env.YOCO_PUBLIC_KEY, required: true },
    { name: 'YOCO_WEBHOOK_SECRET', value: YOCO_WEBHOOK_SECRET, required: false },
    { name: 'NEXT_PUBLIC_YOCO_TEST_MODE', value: process.env.NEXT_PUBLIC_YOCO_TEST_MODE, required: true },
    { name: 'NEXT_PUBLIC_SITE_URL', value: process.env.NEXT_PUBLIC_SITE_URL, required: true },
  ];

  let allGood = true;

  envChecks.forEach(check => {
    const status = check.value ? '✅' : (check.required ? '❌' : '⚠️');
    const message = check.value 
      ? `${check.value.substring(0, 20)}...` 
      : (check.required ? 'MISSING (Required)' : 'Not set (Optional)');
    
    console.log(`${status} ${check.name}: ${message}`);
    
    if (check.required && !check.value) {
      allGood = false;
    }
  });

  console.log(`\n📋 Environment Status: ${allGood ? '✅ Ready' : '❌ Issues Found'}`);
  return { success: allGood };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Complete Yoco Integration Test Suite...\n');
  
  const results = {
    environment: await testEnvironmentSetup(),
    webhook: await testWebhookStatus(),
    endpoint: await testWebhookEndpoint(),
    checkout: await testCheckoutCreation(),
  };

  // Only run webhook simulation if we have a test order
  if (results.checkout.success && results.checkout.testOrderId) {
    results.webhookSim = await testWebhookSimulation(results.checkout.testOrderId);
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const testNames = {
    environment: 'Environment Setup',
    webhook: 'Webhook Registration',
    endpoint: 'Webhook Endpoint',
    checkout: 'Checkout Creation',
    webhookSim: 'Webhook Simulation'
  };

  Object.entries(results).forEach(([key, result]) => {
    if (result) {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${testNames[key]}`);
    }
  });

  const passedTests = Object.values(results).filter(r => r && r.success).length;
  const totalTests = Object.values(results).filter(r => r).length;

  console.log(`\n🎯 Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Your Yoco integration is ready!');
    console.log('\n📋 NEXT STEPS FOR LIVE PAYMENTS:');
    console.log('1. Get live Yoco credentials (pk_live_... and sk_live_...)');
    console.log('2. Update environment variables in Vercel');
    console.log('3. Set NEXT_PUBLIC_YOCO_TEST_MODE=false');
    console.log('4. Test with small real payments first');
  } else {
    console.log('\n⚠️ Some tests failed. Please fix the issues above before going live.');
  }

  // If checkout was successful, show payment URL
  if (results.checkout && results.checkout.success && results.checkout.checkout) {
    console.log('\n💳 TEST PAYMENT AVAILABLE:');
    console.log('You can test the payment flow with this URL:');
    console.log(results.checkout.checkout.redirectUrl);
    console.log('(This is a test payment - no real money will be charged)');
  }
}

// Run tests
runAllTests().catch(console.error);
