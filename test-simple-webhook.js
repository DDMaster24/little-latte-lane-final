#!/usr/bin/env node

/**
 * Simple webhook POST test
 */

console.log('Testing webhook POST...');

const testPayload = {
  id: 'evt_test_' + Date.now(),
  type: 'payment.succeeded',
  createdDate: new Date().toISOString(),
  payload: {
    id: 'payment_test_' + Date.now(),
    status: 'succeeded',
    amount: 1000,
    currency: 'ZAR',
    metadata: {
      orderId: 'test-order-123',
      userId: 'test-user-123'
    }
  }
};

fetch('https://www.littlelattelane.co.za/api/yoco/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
})
.then(response => {
  console.log('Status:', response.status);
  return response.text();
})
.then(text => {
  console.log('Response:', text);
})
.catch(error => {
  console.error('Error:', error.message);
});
