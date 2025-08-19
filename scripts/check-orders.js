const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRecentOrders() {
  console.log('🔍 Checking recent orders and payment status...\n')

  try {
    // Get recent orders with pending payment status
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        created_at,
        user_id,
        order_items (
          id,
          quantity,
          price,
          menu_item_id,
          menu_items (
            name,
            price
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Error fetching orders:', error)
      return
    }

    console.log(`📋 Found ${orders.length} recent orders:\n`)

    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.id}`)
      console.log(`   Order Number: ${order.order_number || 'N/A'}`)
      console.log(`   Status: ${order.status || 'N/A'}`)
      console.log(`   Payment Status: ${order.payment_status || 'N/A'}`)
      console.log(`   Total Amount: R${order.total_amount || 0}`)
      console.log(`   Created: ${new Date(order.created_at).toLocaleString()}`)
      console.log(`   User ID: ${order.user_id || 'N/A'}`)
      
      if (order.order_items && order.order_items.length > 0) {
        console.log(`   Items:`)
        order.order_items.forEach(item => {
          const menuItem = item.menu_items
          console.log(`     - ${menuItem?.name || 'Unknown Item'} x${item.quantity} @ R${item.price}`)
        })
      }
      console.log('')
    })

    // Check for any orders with pending payment that might need attention
    const pendingOrders = orders.filter(order => order.payment_status === 'pending')
    if (pendingOrders.length > 0) {
      console.log(`⚠️  Found ${pendingOrders.length} orders with pending payment status`)
      console.log('🔔 These orders may not have received PayFast webhook notifications')
    }

    // Show the most recent order details for debugging
    if (orders.length > 0) {
      const mostRecent = orders[0]
      console.log('\n🎯 Most Recent Order Details:')
      console.log(`   UUID: ${mostRecent.id}`)
      console.log(`   Should be passed to PayFast as custom_str1`)
      console.log(`   Current payment_status: ${mostRecent.payment_status}`)
      console.log(`   If payment was completed, webhook should update this to 'paid'`)
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

checkRecentOrders()
