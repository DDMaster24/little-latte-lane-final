const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Environment Configuration Check\n')

console.log('=== PayFast Configuration ===')
console.log('PAYFAST_MERCHANT_ID:', process.env.PAYFAST_MERCHANT_ID ? '[SET]' : '[NOT SET]')
console.log('PAYFAST_MERCHANT_KEY:', process.env.PAYFAST_MERCHANT_KEY ? '[SET]' : '[NOT SET]')
console.log('PAYFAST_PASSPHRASE:', process.env.PAYFAST_PASSPHRASE ? '[SET]' : '[NOT SET]')
console.log('NEXT_PUBLIC_PAYFAST_SANDBOX:', process.env.NEXT_PUBLIC_PAYFAST_SANDBOX)
console.log('')

console.log('=== Webhook Configuration ===')
console.log('BASE_URL:', process.env.BASE_URL || '[NOT SET]')
console.log('VERCEL_URL:', process.env.VERCEL_URL || '[NOT SET]')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('')

console.log('=== Expected Webhook URLs ===')
const baseUrl = process.env.BASE_URL || `https://${process.env.VERCEL_URL}` || 'http://localhost:3000'
console.log('Base URL:', baseUrl)
console.log('Notify URL:', `${baseUrl}/api/payfast/notify`)
console.log('Return URL:', `${baseUrl}/api/payfast/return`)
console.log('Cancel URL:', `${baseUrl}/api/payfast/cancel`)
console.log('')

// Test if URLs are accessible
const isLiveMode = process.env.NEXT_PUBLIC_PAYFAST_SANDBOX !== 'true'
console.log('=== Mode Analysis ===')
console.log('Is Live Mode:', isLiveMode)
console.log('Webhook URL Protocol:', baseUrl.startsWith('https://') ? 'HTTPS ✅' : 'HTTP ❌')
console.log('PayFast Requirements:', isLiveMode ? 'REQUIRES HTTPS' : 'HTTP OK for sandbox')

if (isLiveMode && !baseUrl.startsWith('https://')) {
  console.log('')
  console.log('🚨 CRITICAL ISSUE: Live mode requires HTTPS webhook URLs!')
  console.log('   PayFast will reject HTTP URLs in live mode')
}

if (baseUrl.includes('localhost')) {
  console.log('')
  console.log('🚨 CRITICAL ISSUE: Localhost URLs detected!')
  console.log('   PayFast cannot reach localhost for webhooks')
  console.log('   You need your production domain URL')
}
