const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

let lastOrderCount = 0
let monitoringActive = true

console.log('🔍 PayFast Webhook Monitor Started')
console.log('📡 Watching for new orders and payment status updates...')
console.log('🎯 Complete a test payment now!')
console.log('⏹️  Press Ctrl+C to stop monitoring\n')

async function checkOrders() {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, total_amount, payment_status, status, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('❌ Error fetching orders:', error.message)
      return
    }

    // Check for new orders
    if (orders.length > lastOrderCount) {
      const newOrder = orders[0]
      console.log(`🆕 NEW ORDER DETECTED!`)
      console.log(`   ID: ${newOrder.id}`)
      console.log(`   Amount: R${newOrder.total_amount}`)
      console.log(`   Payment Status: ${newOrder.payment_status}`)
      console.log(`   Order Status: ${newOrder.status}`)
      console.log(`   Time: ${new Date(newOrder.created_at).toLocaleTimeString()}`)
      console.log('')
      lastOrderCount = orders.length
    }

    // Check for status updates
    orders.forEach((order, index) => {
      const timeAgo = Math.round((Date.now() - new Date(order.created_at).getTime()) / 1000 / 60)
      if (timeAgo <= 5) { // Orders from last 5 minutes
        const statusColor = order.payment_status === 'paid' ? '✅' : 
                           order.payment_status === 'pending' ? '⏳' : '❌'
        console.log(`${statusColor} Order R${order.total_amount}: ${order.payment_status} (${timeAgo}m ago)`)
      }
    })

    // Success detection
    const recentPaidOrder = orders.find(order => {
      const timeAgo = (Date.now() - new Date(order.created_at).getTime()) / 1000 / 60
      return timeAgo <= 2 && order.payment_status === 'paid'
    })

    if (recentPaidOrder) {
      console.log('\n🎉 SUCCESS! PayFast webhook is working!')
      console.log('✅ Order status updated to "paid" automatically')
      console.log('🔔 Real-time integration is functioning correctly')
      console.log('\nMonitoring will continue for additional tests...\n')
    }

  } catch (error) {
    console.error('💥 Monitoring error:', error.message)
  }
}

// Get initial count
supabase
  .from('orders')
  .select('id', { count: 'exact', head: true })
  .then(({ count }) => {
    lastOrderCount = count || 0
    console.log(`📊 Current order count: ${lastOrderCount}`)
    console.log('🚀 Ready for test payment!\n')
  })

// Monitor every 3 seconds
const monitorInterval = setInterval(checkOrders, 3000)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping monitor...')
  clearInterval(monitorInterval)
  process.exit(0)
})
