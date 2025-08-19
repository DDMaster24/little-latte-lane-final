const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Post-Fix Webhook Diagnosis\n')

// Test the webhook URL that should now be working
const baseUrl = 'https://littlelattelane.co.za'
console.log('=== Expected Webhook Configuration ===')
console.log('Base URL:', baseUrl)
console.log('Notify URL:', `${baseUrl}/api/payfast/notify`)
console.log('Return URL:', `${baseUrl}/api/payfast/return`)
console.log('Cancel URL:', `${baseUrl}/api/payfast/cancel`)
console.log('')

// Test if the webhook endpoint is accessible
console.log('=== Webhook Endpoint Test ===')
console.log('Testing if webhook endpoint is reachable...')

async function testWebhookEndpoint() {
  try {
    const response = await fetch(`${baseUrl}/api/payfast/notify`, {
      method: 'GET'
    })
    
    console.log('Webhook endpoint status:', response.status)
    console.log('Webhook endpoint accessible:', response.status !== 404)
    
    if (response.status === 405) {
      console.log('✅ Endpoint exists (405 = Method Not Allowed for GET, expects POST)')
    } else if (response.status === 404) {
      console.log('❌ Endpoint not found - deployment issue')
    }
    
  } catch (error) {
    console.log('❌ Webhook endpoint test failed:', error.message)
  }
}

// Check recent orders
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (supabaseUrl && supabaseServiceKey) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  async function checkRecentOrders() {
    console.log('\n=== Recent Orders Check ===')
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, total_amount, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (error) {
      console.log('❌ Error fetching orders:', error.message)
      return
    }
    
    console.log('Recent orders:')
    orders.forEach((order, index) => {
      const timeAgo = Math.round((Date.now() - new Date(order.created_at).getTime()) / 1000 / 60)
      console.log(`${index + 1}. R${order.total_amount} - ${order.payment_status} (${timeAgo} mins ago)`)
    })
    
    const mostRecent = orders[0]
    if (mostRecent) {
      console.log(`\n🎯 Most recent order: ${mostRecent.id}`)
      console.log(`   Amount: R${mostRecent.total_amount}`)
      console.log(`   Status: ${mostRecent.payment_status}`)
      
      if (mostRecent.payment_status === 'pending') {
        console.log('\n⚠️  Still pending - possible causes:')
        console.log('   1. Vercel environment variable not updated yet')
        console.log('   2. Application not redeployed after env var change')
        console.log('   3. PayFast webhook delivery delay')
        console.log('   4. Payment not actually completed on PayFast side')
      }
    }
  }
  
  testWebhookEndpoint().then(() => {
    return checkRecentOrders()
  }).catch(console.error)
  
} else {
  console.log('❌ Missing Supabase credentials for order check')
  testWebhookEndpoint().catch(console.error)
}
