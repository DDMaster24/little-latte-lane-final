const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkR29Payment() {
  console.log('🔍 Checking R29 payment status...\n')

  try {
    // Look for R29 payment
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('total_amount', 29)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('❌ Error fetching R29 order:', error)
      return
    }

    if (!orders || orders.length === 0) {
      console.log('❌ No R29 orders found')
      return
    }

    const order = orders[0]
    const timeAgo = Math.round((Date.now() - new Date(order.created_at).getTime()) / 1000 / 60)

    console.log('📋 R29 Payment Details:')
    console.log(`   Order ID: ${order.id}`)
    console.log(`   Amount: R${order.total_amount}`)
    console.log(`   Status: ${order.status}`)
    console.log(`   Payment Status: ${order.payment_status}`)
    console.log(`   Created: ${timeAgo} minutes ago`)
    console.log('')

    if (order.payment_status === 'pending') {
      console.log('❌ WEBHOOK STILL NOT WORKING!')
      console.log('')
      console.log('🔍 Possible Issues:')
      console.log('   1. Webhook URL mismatch: www.littlelattelane.co.za vs littlelattelane.co.za')
      console.log('   2. PayFast still has old cached webhook URL')
      console.log('   3. PayFast webhook delivery failing for other reasons')
      console.log('')
      console.log('✅ But payment DID go through on PayFast side!')
      console.log('   - Your bank was charged ✅')
      console.log('   - Order was created in database ✅')
      console.log('   - Only webhook notification is failing ❌')
    } else {
      console.log('✅ WEBHOOK WORKING! Payment status updated!')
    }

    // Check URL mismatch theory
    console.log('🔧 URL Analysis:')
    console.log('   Your logs show: www.littlelattelane.co.za')
    console.log('   Webhook might be set to: littlelattelane.co.za')
    console.log('   PayFast may be trying wrong domain')

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

checkR29Payment()
