const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkLatestOrder() {
  console.log('🔍 Checking latest order status post-payment attempt...\n')

  try {
    // Get the most recent order
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('❌ Error fetching latest order:', error)
      return
    }

    if (!orders || orders.length === 0) {
      console.log('❌ No orders found')
      return
    }

    const latestOrder = orders[0]
    const timeAgo = Math.round((Date.now() - new Date(latestOrder.created_at).getTime()) / 1000 / 60)

    console.log('📋 Latest Order Details:')
    console.log(`   Order ID: ${latestOrder.id}`)
    console.log(`   Amount: R${latestOrder.total_amount}`)
    console.log(`   Status: ${latestOrder.status}`)
    console.log(`   Payment Status: ${latestOrder.payment_status}`)
    console.log(`   Created: ${timeAgo} minutes ago`)
    console.log(`   User ID: ${latestOrder.user_id}`)
    console.log('')

    // Analyze the situation
    if (latestOrder.payment_status === 'pending') {
      console.log('⚠️  Payment Status Analysis:')
      console.log('   - Order created but payment_status still "pending"')
      console.log('   - This confirms PayFast webhook is NOT reaching our server')
      console.log('   - User may have completed payment on PayFast side')
      console.log('   - But webhook notification failed to update our database')
      console.log('')
      
      console.log('🔧 Possible Solutions:')
      console.log('   1. PayFast is caching old webhook URL - wait for cache refresh')
      console.log('   2. Check PayFast merchant dashboard for webhook delivery status')
      console.log('   3. Manually test webhook with PayFast webhook tester')
      console.log('   4. Contact PayFast support about webhook delivery issues')
      
    } else {
      console.log('✅ Payment status updated - webhook is working!')
    }

    // Check if there are multiple recent pending orders
    const { data: pendingOrders } = await supabase
      .from('orders')
      .select('id, total_amount, created_at')
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    if (pendingOrders && pendingOrders.length > 0) {
      console.log('')
      console.log(`📊 Found ${pendingOrders.length} pending orders:`)
      pendingOrders.forEach((order, index) => {
        const mins = Math.round((Date.now() - new Date(order.created_at).getTime()) / 1000 / 60)
        console.log(`   ${index + 1}. R${order.total_amount} (${mins} mins ago)`)
      })
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

checkLatestOrder()
