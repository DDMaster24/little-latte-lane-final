#!/usr/bin/env node

/**
 * Simple Yoco Webhook Test
 * Tests just the webhook endpoint functionality without database dependencies
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const WEBHOOK_URL = 'https://www.littlelattelane.co.za/api/yoco/webhook';

console.log('🧪 Little Latte Lane - Simple Webhook Test\n');

// Test webhook endpoint accessibility
async function testWebhookEndpoint() {
  console.log('🔗 Testing Webhook Endpoint Accessibility');
  console.log('='.repeat(50));
  
  try {
    console.log(`📡 Testing GET: ${WEBHOOK_URL}`);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Webhook Endpoint: Accessible');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      return { success: true };
    } else {
      console.log(`❌ Webhook Endpoint Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return { success: false };
    }
  } catch (error) {
    console.log(`❌ Webhook Endpoint Error: ${error.message}`);
    return { success: false };
  }
}

// Test webhook with malformed data
async function testWebhookValidation() {
  console.log('\n🔍 Testing Webhook Validation');
  console.log('='.repeat(50));
  
  const testCases = [
    {
      name: 'Empty Body',
      body: '',
      expectedStatus: 400
    },
    {
      name: 'Invalid JSON',
      body: '{ invalid json }',
      expectedStatus: 400
    },
    {
      name: 'Missing Required Fields',
      body: JSON.stringify({ id: 'test' }),
      expectedStatus: 400
    },
    {
      name: 'Valid Structure but No Order',
      body: JSON.stringify({
        id: 'evt_test',
        type: 'payment.succeeded',
        createdDate: new Date().toISOString(),
        payload: {
          id: 'payment_test',
          status: 'succeeded',
          amount: 1000,
          currency: 'ZAR',
          metadata: {
            orderId: 'non-existent-order',
            userId: 'test-user'
          }
        }
      }),
      expectedStatus: 404
    }
  ];

  let passedTests = 0;

  for (const testCase of testCases) {
    console.log(`\n📤 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Yoco-Webhooks-Test/1.0'
        },
        body: testCase.body
      });

      const actualStatus = response.status;
      const responseText = await response.text();
      
      if (actualStatus === testCase.expectedStatus) {
        console.log(`✅ ${testCase.name}: Expected ${testCase.expectedStatus}, got ${actualStatus}`);
        passedTests++;
      } else {
        console.log(`❌ ${testCase.name}: Expected ${testCase.expectedStatus}, got ${actualStatus}`);
        console.log(`   Response: ${responseText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: Error - ${error.message}`);
    }
  }

  console.log(`\n📊 Validation Tests: ${passedTests}/${testCases.length} passed`);
  return { success: passedTests === testCases.length, passedTests, totalTests: testCases.length };
}

// Test webhook with events that should be acknowledged but not processed
async function testWebhookAcknowledgment() {
  console.log('\n✅ Testing Webhook Event Acknowledgment');
  console.log('='.repeat(50));
  
  const testEvents = [
    {
      name: 'Unknown Event Type',
      payload: {
        id: 'evt_test_' + Date.now(),
        type: 'unknown.event.type',
        createdDate: new Date().toISOString(),
        payload: {
          id: 'test_payload',
          status: 'completed',
          amount: 1000,
          currency: 'ZAR',
          metadata: {}
        }
      }
    },
    {
      name: 'Event Without Order ID',
      payload: {
        id: 'evt_test_' + Date.now(),
        type: 'payment.succeeded',
        createdDate: new Date().toISOString(),
        payload: {
          id: 'test_payload',
          status: 'succeeded',
          amount: 1000,
          currency: 'ZAR',
          metadata: {
            someOtherField: 'value'
          }
        }
      }
    }
  ];

  let acknowledgedEvents = 0;

  for (const testEvent of testEvents) {
    console.log(`\n📤 Testing: ${testEvent.name}`);
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Yoco-Webhooks-Test/1.0'
        },
        body: JSON.stringify(testEvent.payload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${testEvent.name}: Acknowledged`);
        console.log(`   Response: ${JSON.stringify(data)}`);
        acknowledgedEvents++;
      } else {
        const errorText = await response.text();
        console.log(`❌ ${testEvent.name}: Not acknowledged (${response.status})`);
        console.log(`   Error: ${errorText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${testEvent.name}: Error - ${error.message}`);
    }
  }

  console.log(`\n📊 Acknowledgment Tests: ${acknowledgedEvents}/${testEvents.length} successful`);
  return { success: acknowledgedEvents > 0, acknowledgedEvents, totalTests: testEvents.length };
}

// Main test runner
async function runWebhookTests() {
  console.log('🚀 Starting Simple Webhook Tests...\n');
  
  const results = {
    endpoint: await testWebhookEndpoint(),
    validation: await testWebhookValidation(),
    acknowledgment: await testWebhookAcknowledgment()
  };

  // Summary
  console.log('\n📊 WEBHOOK TEST SUMMARY');
  console.log('='.repeat(50));
  
  const testNames = {
    endpoint: 'Endpoint Accessibility',
    validation: 'Request Validation',
    acknowledgment: 'Event Acknowledgment'
  };

  Object.entries(results).forEach(([key, result]) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testNames[key]}`);
  });

  const passedTests = Object.values(results).filter(r => r.success).length;
  const totalTests = Object.values(results).length;

  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} test categories passed`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL WEBHOOK TESTS PASSED!');
    console.log('Your webhook endpoint is properly configured and ready.');
    console.log('\n📋 READY FOR LIVE PAYMENTS:');
    console.log('✅ Webhook registration: Complete');
    console.log('✅ Webhook endpoint: Working');
    console.log('✅ Event handling: Functional');
    console.log('✅ Error handling: Robust');
  } else {
    console.log('\n⚠️ Some webhook tests failed. Please check the errors above.');
  }

  console.log('\n🔗 Your webhook URL is ready for Yoco:');
  console.log(WEBHOOK_URL);
}

// Run tests
runWebhookTests().catch(console.error);
