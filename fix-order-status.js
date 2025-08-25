/**
 * Simple Order Status Update Tool
 * Manually update orders from awaiting_payment to completed
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateOrderStatus() {
  try {
    console.log('🔍 Finding orders with awaiting_payment status...');
    
    // Get orders that are awaiting payment
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'awaiting_payment')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log('✅ No orders with awaiting_payment status found');
      return;
    }

    console.log(`📋 Found ${orders.length} orders with awaiting_payment status:`);
    orders.forEach(order => {
      console.log(`  - Order ${order.order_number || order.id.slice(-8)}: R${order.total_amount}`);
    });

    // Update all awaiting payment orders to completed
    console.log('\n🔄 Updating orders to confirmed status...');
    
    const { data: updatedOrders, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('payment_status', 'awaiting_payment')
      .select();

    if (updateError) {
      console.error('❌ Error updating orders:', updateError);
      return;
    }

    console.log('✅ Successfully updated orders:');
    updatedOrders?.forEach(order => {
      console.log(`  ✅ Order ${order.order_number || order.id.slice(-8)}: ${order.status} / ${order.payment_status}`);
    });

    console.log(`\n🎉 Updated ${updatedOrders?.length || 0} orders to confirmed status!`);
    console.log('💡 Customers should now see these orders as confirmed in their account page.');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the update
updateOrderStatus();
