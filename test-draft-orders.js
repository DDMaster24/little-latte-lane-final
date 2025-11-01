const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually for this test
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing draft order query...');
console.log('URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDraftOrders() {
  try {
    console.log('\n=== Testing Draft Orders Query ===');
    
    // First, let's see what orders exist
    const { data: allOrders, error: allError } = await supabase
      .from('orders')
      .select('id, user_id, status, order_number, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (allError) {
      console.error('❌ Error fetching all orders:', allError);
      return;
    }
    
    console.log('\n📋 Recent orders:');
    allOrders.forEach(order => {
      console.log(`  ${order.id} | ${order.status} | ${order.order_number || 'No #'} | User: ${order.user_id?.slice(-8)}`);
    });
    
    // Find draft/pending orders
    const draftOrders = allOrders.filter(order => ['draft', 'pending'].includes(order.status));
    console.log('\n🔄 Draft/Pending orders:', draftOrders.length);
    
    if (draftOrders.length === 0) {
      console.log('\n🧪 Creating a test draft order...');
      
      // Get a valid user ID from profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (profileError || !profiles || profiles.length === 0) {
        console.error('❌ Error fetching profiles:', profileError);
        return;
      }
      
      const userId = profiles[0].id;
      console.log('Using user ID:', userId.slice(-8));
      
      // Get first menu item
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('id, name, price')
        .limit(1);
        
      if (menuError || !menuItems || menuItems.length === 0) {
        console.error('❌ Error fetching menu items:', menuError);
        return;
      }
      
      const menuItem = menuItems[0];
      console.log('Using menu item:', menuItem.name);
      
      // Create a test draft order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'draft',
          order_number: 'DRAFT_TEST_' + Date.now(),
          total_amount: menuItem.price,
          delivery_method: 'pickup'
        })
        .select()
        .single();
        
      if (orderError) {
        console.error('❌ Error creating test order:', orderError);
        return;
      }
      
      console.log('✅ Created test order:', newOrder.id);
      
      // Add order item
      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: newOrder.id,
          menu_item_id: menuItem.id,
          quantity: 1,
          price: menuItem.price
        })
        .select();
        
      if (itemError) {
        console.error('❌ Error creating order item:', itemError);
        return;
      }
      
      console.log('✅ Created order item for:', menuItem.name);
      
      // Now test the retry API query
      console.log('\n🧪 Testing retry query for new draft order:', newOrder.id);
      
      const { data: retryOrder, error: retryError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          user_id,
          status,
          order_items (
            menu_item_id,
            quantity,
            price,
            menu_items (
              id,
              name,
              description,
              price
            )
          )
        `)
        .eq('id', newOrder.id)
        .eq('user_id', newOrder.user_id)
        .in('status', ['draft', 'pending'])
        .single();
        
      if (retryError) {
        console.error('❌ Retry query error:', retryError);
      } else {
        console.log('✅ Retry query successful:');
        console.log('  Order ID:', retryOrder.id);
        console.log('  Status:', retryOrder.status);
        console.log('  Items:', retryOrder.order_items?.length || 0);
        
        if (retryOrder.order_items && retryOrder.order_items.length > 0) {
          console.log('  Sample item:', {
            menu_item_id: retryOrder.order_items[0].menu_item_id,
            quantity: retryOrder.order_items[0].quantity,
            price: retryOrder.order_items[0].price,
            menu_item_name: retryOrder.order_items[0].menu_items?.name
          });
        }
      }
      
      // Clean up test order
      console.log('\n🧹 Cleaning up test order...');
      await supabase.from('order_items').delete().eq('order_id', newOrder.id);
      await supabase.from('orders').delete().eq('id', newOrder.id);
      console.log('✅ Test order cleaned up');
      
    } else {
      // Test with existing draft order
      const testOrder = draftOrders[0];
      console.log('\n🧪 Testing retry query for order:', testOrder.id);
      
      const { data: retryOrder, error: retryError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          user_id,
          status,
          order_items (
            menu_item_id,
            quantity,
            price,
            menu_items (
              id,
              name,
              description,
              price
            )
          )
        `)
        .eq('id', testOrder.id)
        .eq('user_id', testOrder.user_id)
        .in('status', ['draft', 'pending'])
        .single();
        
      if (retryError) {
        console.error('❌ Retry query error:', retryError);
      } else {
        console.log('✅ Retry query successful:');
        console.log('  Order ID:', retryOrder.id);
        console.log('  Status:', retryOrder.status);
        console.log('  Items:', retryOrder.order_items?.length || 0);
        
        if (retryOrder.order_items && retryOrder.order_items.length > 0) {
          console.log('  Sample item:', {
            menu_item_id: retryOrder.order_items[0].menu_item_id,
            quantity: retryOrder.order_items[0].quantity,
            price: retryOrder.order_items[0].price,
            menu_item_name: retryOrder.order_items[0].menu_items?.name
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testDraftOrders();