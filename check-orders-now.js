const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://awytuszmunxvthuizyur.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.log('❌ No Supabase key found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
  console.log('🔍 Checking current orders in database...');
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_status, total_amount, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching orders:', error);
    return;
  }

  console.log('📊 Recent orders:', orders?.length || 0);
  
  if (orders && orders.length > 0) {
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.order_number || order.id.slice(-8)}:`);
      console.log(`   Status: ${order.status} | Payment: ${order.payment_status}`);
      console.log(`   Amount: R${order.total_amount} | Created: ${new Date(order.created_at).toLocaleString()}`);
      console.log(`   User: ${order.user_id.slice(-8)}`);
      console.log('');
    });
  } else {
    console.log('📭 No orders found');
  }
  
  // Check for draft orders specifically
  const { data: draftOrders, error: draftError } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_status, total_amount, created_at')
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  if (draftError) {
    console.error('❌ Error fetching draft orders:', draftError);
    return;
  }

  console.log(`📝 Draft orders (awaiting payment): ${draftOrders?.length || 0}`);
  if (draftOrders && draftOrders.length > 0) {
    draftOrders.forEach((order, index) => {
      console.log(`${index + 1}. Draft Order ${order.order_number || order.id.slice(-8)}:`);
      console.log(`   Amount: R${order.total_amount} | Created: ${new Date(order.created_at).toLocaleString()}`);
      console.log(`   Full Order ID: ${order.id}`);
    });
  }

  // Also check order items for these draft orders
  if (draftOrders && draftOrders.length > 0) {
    console.log('\n🛒 Checking order items for draft orders...');
    for (const order of draftOrders) {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('quantity, price, menu_item_id, special_instructions')
        .eq('order_id', order.id);

      if (itemsError) {
        console.error(`❌ Error fetching items for order ${order.id}:`, itemsError);
        continue;
      }

      console.log(`\nItems for Order ${order.order_number || order.id.slice(-8)}:`);
      if (items && items.length > 0) {
        items.forEach((item, idx) => {
          console.log(`  ${idx + 1}. Qty: ${item.quantity}, Price: R${item.price}`);
          console.log(`     Menu Item ID: ${item.menu_item_id || 'null (customized)'}`);
          if (item.special_instructions) {
            console.log(`     Instructions: ${item.special_instructions}`);
          }
        });
      } else {
        console.log('  No items found for this order');
      }
    }
  }
}

checkOrders().catch(console.error);
