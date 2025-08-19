const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

async function manuallyCompleteOrder() {
  console.log('🔧 Manual Order Completion Tool\n')
  
  // Get the latest pending order
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error || !orders || orders.length === 0) {
    console.log('❌ No pending orders found')
    return
  }

  const order = orders[0]
  console.log(`📋 Latest pending order: ${order.id}`)
  console.log(`   Amount: R${order.total_amount}`)
  console.log(`   Created: ${new Date(order.created_at).toLocaleString()}`)
  console.log('')
  
  console.log('⚠️  This tool will manually mark the order as paid.')
  console.log('❓ Only use this if you CONFIRMED the payment was completed on PayFast!')
  console.log('')
  console.log('🚫 Stopping here - run this manually only if payment is confirmed.')
  
  // Uncomment below ONLY if payment is confirmed on PayFast side:
  /*
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  if (updateError) {
    console.error('❌ Error updating order:', updateError)
  } else {
    console.log('✅ Order manually marked as paid!')
  }
  */
}

manuallyCompleteOrder()
