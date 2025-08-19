const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function analyzeKitchenData() {
  console.log('🔍 Kitchen Data Analysis - Finding Display Issues\n')

  try {
    // Check recent paid orders
    console.log('📋 Checking recent paid orders:')
    const { data: paidOrders, error: paidError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        payment_status,
        total_amount,
        created_at,
        order_items (
          id,
          quantity,
          price,
          menu_item_id,
          menu_items (
            id,
            name
          )
        )
      `)
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .limit(3)

    if (paidError) {
      console.error('❌ Error fetching paid orders:', paidError)
      return
    }

    if (!paidOrders || paidOrders.length === 0) {
      console.log('❌ No paid orders found!')
      return
    }

    console.log(`✅ Found ${paidOrders.length} paid orders\n`)

    paidOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.id}`)
      console.log(`   Status: ${order.status}`)
      console.log(`   Payment Status: ${order.payment_status}`)
      console.log(`   Total: R${order.total_amount}`)
      console.log(`   Created: ${new Date(order.created_at).toLocaleString()}`)
      
      if (order.order_items && order.order_items.length > 0) {
        console.log(`   Items:`)
        order.order_items.forEach(item => {
          const menuItem = item.menu_items
          console.log(`     - ${menuItem?.name || 'Unknown'} x${item.quantity} @ R${item.price}`)
        })
      } else {
        console.log(`   ❌ NO ORDER ITEMS FOUND!`)
      }
      console.log('')
    })

    // Check what kitchen panel query would return
    console.log('🍳 Kitchen Panel Query Analysis:')
    console.log('Kitchen panel filters for: status IN (pending, preparing)')
    
    const { data: kitchenOrders, error: kitchenError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .in('status', ['pending', 'preparing'])
      .order('created_at', { ascending: true })

    if (kitchenError) {
      console.error('❌ Kitchen query error:', kitchenError)
      return
    }

    console.log(`Kitchen panel would show: ${kitchenOrders?.length || 0} orders`)
    
    if (kitchenOrders && kitchenOrders.length > 0) {
      kitchenOrders.forEach((order, index) => {
        console.log(`${index + 1}. Kitchen Order: ${order.id} - Status: ${order.status}`)
      })
    } else {
      console.log('❌ Kitchen panel shows no orders!')
      console.log('')
      console.log('🔧 Issues Found:')
      console.log('1. Paid orders have different status than "pending" or "preparing"')
      console.log('2. Kitchen panel only shows pending/preparing orders')
      console.log('3. Newly paid orders might have status "confirmed" instead')
    }

    // Check order statuses distribution
    console.log('\n📊 Order Status Distribution:')
    const { data: statusData } = await supabase
      .from('orders')
      .select('status, payment_status')
      .not('status', 'is', null)

    if (statusData) {
      const statusCounts = {}
      statusData.forEach(order => {
        const key = `${order.status} (payment: ${order.payment_status})`
        statusCounts[key] = (statusCounts[key] || 0) + 1
      })
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} orders`)
      })
    }

  } catch (error) {
    console.error('💥 Analysis error:', error)
  }
}

analyzeKitchenData()
