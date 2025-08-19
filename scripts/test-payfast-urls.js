// Test what URL PayFast is receiving
console.log('🔍 Testing current PayFast payment data generation...\n')

// Simulate the current environment
process.env.BASE_URL = 'https://littlelattelane.co.za'
process.env.NODE_ENV = 'production'

const { payfast } = require('../src/lib/payfast.ts')

// Test payment data creation
const testPaymentData = payfast.createPaymentData({
  orderId: 'test-order-123',
  userId: 'test-user-456',
  amount: 20.00,
  itemName: 'Test Payment',
  itemDescription: 'Testing webhook URL',
  returnUrl: 'https://littlelattelane.co.za/api/payfast/return',
  cancelUrl: 'https://littlelattelane.co.za/api/payfast/cancel',
  notifyUrl: 'https://littlelattelane.co.za/api/payfast/notify',
})

console.log('🎯 Generated PayFast Data:')
console.log('Notify URL:', testPaymentData.notify_url || 'NOT SET')
console.log('Return URL:', testPaymentData.return_url || 'NOT SET')
console.log('Cancel URL:', testPaymentData.cancel_url || 'NOT SET')
console.log('Merchant ID:', testPaymentData.merchant_id)
console.log('Has Signature:', !!testPaymentData.signature)

if (testPaymentData.notify_url === 'https://littlelattelane.co.za/api/payfast/notify') {
  console.log('\n✅ PayFast should now receive correct webhook URL!')
  console.log('📋 This means the issue is likely PayFast cache/delay')
} else {
  console.log('\n❌ PayFast is still receiving wrong webhook URL!')
  console.log('📋 BASE_URL environment variable may not be active yet')
}
