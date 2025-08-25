/**
 * Order Status Debug Tool - Updated for Payment Issue
 * Manually check and update order payment status
 */
const { getSupabaseAdmin } = require('./src/lib/supabase-server.js');

async function debugOrderStatus() {
  try {
    console.log('🔍 Checking orders with awaiting_payment status...');
    
    const supabase = getSupabaseAdmin();
    
    // Get orders that are awaiting payment
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'awaiting_payment')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log('✅ No orders with awaiting_payment status found');
      return;
    }

    console.log(`📋 Found ${orders.length} orders awaiting payment:`);
    orders.forEach(order => {
      console.log(`\n🔖 Order ${order.order_number || order.id.slice(-8)}:`);
      console.log(`  ID: ${order.id}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Payment Status: ${order.payment_status}`);
      console.log(`  Total: R${order.total_amount}`);
      console.log(`  Created: ${order.created_at}`);
      console.log(`  User ID: ${order.user_id}`);
    });

    console.log('\n💡 To manually mark these orders as paid, run:');
    console.log('node debug-order.js update');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

async function updateOrderStatus() {
  try {
    console.log('🔄 Manually updating awaiting_payment orders to confirmed...');
    
    const supabase = getSupabaseAdmin();
    
    // First, get the orders to update
    const { data: ordersToUpdate, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, user_id')
      .eq('payment_status', 'awaiting_payment')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching orders:', fetchError);
      return;
    }

    if (!ordersToUpdate || ordersToUpdate.length === 0) {
      console.log('✅ No orders to update');
      return;
    }

    console.log(`� Updating ${ordersToUpdate.length} orders...`);

    // Update the orders to confirmed status
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('payment_status', 'awaiting_payment')
      .select();

    if (error) {
      console.error('❌ Error updating orders:', error);
      return;
    }

    console.log('✅ Orders updated successfully:');
    data?.forEach(order => {
      console.log(`📦 Order ${order.order_number || order.id.slice(-8)}: ${order.status} / ${order.payment_status}`);
    });

    // Trigger order notifications for each updated order
    console.log('\n� Triggering order confirmation notifications...');
    
    for (const order of data || []) {
      try {
        // Use the order status notification system
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.littlelattelane.co.za'}/api/orders/payment-success`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            paymentStatus: 'completed'
          })
        });
        
        if (response.ok) {
          console.log(`✅ Notification sent for order ${order.order_number || order.id.slice(-8)}`);
        } else {
          const errorText = await response.text();
          console.log(`⚠️ Notification failed for order ${order.order_number || order.id.slice(-8)}: ${errorText}`);
        }
      } catch (notificationError) {
        console.log(`⚠️ Notification error for order ${order.order_number || order.id.slice(-8)}:`, notificationError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Update error:', error);
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'update') {
  updateOrderStatus();
} else {
  debugOrderStatus();
}
