/**
 * Check Current Orders for Webhook Testing
 */

const { getSupabaseAdmin } = require('./src/lib/supabase-server');

async function checkOrders() {
  try {
    console.log('📋 Checking recent orders...');
    
    const supabase = getSupabaseAdmin();
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, status, payment_status, total_amount, user_id')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }
    
    console.log('📊 Recent orders:');
    orders.forEach(order => {
      console.log(`- ${order.id}: ${order.status}/${order.payment_status} (R${order.total_amount}) - User: ${order.user_id}`);
    });
    
    // Find an order that's currently awaiting payment for testing
    const awaitingOrders = orders.filter(o => o.payment_status === 'awaiting_payment');
    if (awaitingOrders.length > 0) {
      console.log('\n🎯 Orders available for webhook testing:');
      awaitingOrders.forEach(order => {
        console.log(`- ${order.id}: R${order.total_amount}`);
      });
      
      return awaitingOrders[0]; // Return first awaiting order for testing
    } else {
      console.log('\n⚠️ No orders currently awaiting payment');
      return orders[0]; // Return most recent order anyway
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

checkOrders().then(order => {
  if (order) {
    console.log(`\n🧪 Use this order for testing: ${order.id}`);
    console.log(`💰 Amount: R${order.total_amount} (${Math.round(order.total_amount * 100)} cents)`);
  }
});
