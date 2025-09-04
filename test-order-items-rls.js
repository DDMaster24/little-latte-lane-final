/**
 * Test Order Items RLS Policies
 * This script tests if order items can be inserted properly
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://awytuszmunxvthuizyur.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testOrderItemsInsertion() {
  console.log('🧪 Testing Order Items Insertion...\n');
  
  try {
    // Get an existing order to test with
    console.log('📋 Step 1: Getting an existing order...');
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, user_id')
      .eq('status', 'draft')
      .limit(1);
    
    if (ordersError) throw ordersError;
    if (!orders || orders.length === 0) {
      throw new Error('No draft orders found to test with');
    }
    
    const testOrder = orders[0];
    console.log('✅ Found test order:', testOrder.order_number);
    
    // Get a menu item
    console.log('\n📋 Step 2: Getting a menu item...');
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select('id, name, price')
      .eq('is_available', true)
      .limit(1);
    
    if (menuError) throw menuError;
    if (!menuItems || menuItems.length === 0) {
      throw new Error('No menu items found');
    }
    
    const testMenuItem = menuItems[0];
    console.log('✅ Found menu item:', testMenuItem.name);
    
    // Try to insert an order item with admin role (should work)
    console.log('\n📋 Step 3: Inserting order item with admin role...');
    const testOrderItem = {
      order_id: testOrder.id,
      menu_item_id: testMenuItem.id,
      quantity: 1,
      price: parseFloat(testMenuItem.price.toString()),
    };
    
    console.log('📝 Order item data:', testOrderItem);
    
    const { data: insertResult, error: insertError } = await supabaseAdmin
      .from('order_items')
      .insert(testOrderItem)
      .select();
    
    if (insertError) {
      console.log('❌ Admin insertion failed!');
      console.log('Error details:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      });
      throw insertError;
    }
    
    console.log('✅ Admin insertion successful:', insertResult);
    
    // Now try with anon role (simulate normal user)
    console.log('\n📋 Step 4: Testing with anon role (simulating normal user)...');
    const supabaseAnon = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTA0MzAsImV4cCI6MjA3MDgyNjQzMH0.UaljSLQF38JBcZ05JbuMGfzvDlSOFr_frBdSb8ATWlY');
    
    const testOrderItem2 = {
      order_id: testOrder.id,
      menu_item_id: testMenuItem.id,
      quantity: 2,
      price: parseFloat(testMenuItem.price.toString()),
    };
    
    const { data: anonResult, error: anonError } = await supabaseAnon
      .from('order_items')
      .insert(testOrderItem2)
      .select();
    
    if (anonError) {
      console.log('❌ Anon insertion failed (likely RLS blocking):');
      console.log('Error details:', {
        message: anonError.message,
        code: anonError.code,
        details: anonError.details,
        hint: anonError.hint,
      });
    } else {
      console.log('✅ Anon insertion successful (unexpected):', anonResult);
    }
    
    // Check the current state
    console.log('\n📋 Step 5: Checking current order items...');
    const { data: currentItems, error: checkError } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', testOrder.id);
    
    if (checkError) throw checkError;
    
    console.log(`✅ Found ${currentItems.length} order items for this order:`);
    currentItems.forEach((item, index) => {
      console.log(`   Item ${index + 1}: ${item.quantity}x menu_item_id=${item.menu_item_id} (R${item.price})`);
    });
    
    // Cleanup test items
    console.log('\n📋 Step 6: Cleaning up test items...');
    await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('order_id', testOrder.id);
    
    console.log('✅ Cleanup complete');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
  }
}

testOrderItemsInsertion();
