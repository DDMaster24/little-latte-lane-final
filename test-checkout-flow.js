/**
 * Test Complete Checkout Flow
 * This simulates the exact same steps as the real app checkout process
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://awytuszmunxvthuizyur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTA0MzAsImV4cCI6MjA3MDgyNjQzMH0.UaljSLQF38JBcZ05JbuMGfzvDlSOFr_frBdSb8ATWlY';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Simulate the exact performCheckout function logic
async function simulateCheckout(userId, items, total) {
  console.log('🔄 Starting checkout simulation for user:', userId);
  
  // Step 1: Create client (same as real app)
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Step 2: Since we can't authenticate a real user in this script,
  // let's use admin client but follow the same flow as the real app
  
  // Create order as DRAFT status (exact same as real app)
  console.log('📝 Creating draft order...');
  const { data: orderRecord, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: userId,
      total_amount: total,
      status: 'draft',
      payment_status: 'awaiting_payment',
      delivery_method: 'pickup',
      special_instructions: 'Checkout simulation test',
      created_at: new Date().toISOString(),
    })
    .select('id, order_number')
    .single();

  if (orderError) throw orderError;
  console.log('✅ Order created:', orderRecord.order_number);

  const orderId = orderRecord.id;

  // Step 3: Process items (exact same logic as real app)
  console.log('📝 Processing order items...');
  const orderItems = [];

  for (const item of items) {
    // Fetch the menu item to get the price (exact same as real app)
    const { data: menuItem, error: priceError } = await supabaseAdmin
      .from('menu_items')
      .select('price, name')
      .eq('id', item.id)
      .single();

    if (priceError || !menuItem) {
      throw new Error(`Menu item with ID ${item.id} not found when fetching price`);
    }

    const unitPrice = parseFloat(menuItem.price.toString());

    orderItems.push({
      order_id: orderId,
      menu_item_id: item.id,
      quantity: item.quantity,
      price: unitPrice,
    });
  }

  console.log(`📝 Prepared ${orderItems.length} order items`);

  // Step 4: Insert order items (this is where the real app fails)
  console.log('📝 Inserting order items...');
  
  // Try with admin first (should work)
  console.log('   🔧 Trying with admin client...');
  const { data: adminResult, error: adminError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems);

  if (adminError) {
    console.log('   ❌ Admin insert failed:', adminError.message);
    throw adminError;
  } else {
    console.log('   ✅ Admin insert successful');
  }

  // Try with anon client (this is what real app uses)
  console.log('   🔧 Trying with anon client (real app simulation)...');
  const { data: anonResult, error: anonError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (anonError) {
    console.log('   ❌ Anon insert failed (this is the real app problem):', anonError.message);
    console.log('   📋 Error details:', {
      code: anonError.code,
      details: anonError.details,
      hint: anonError.hint
    });
  } else {
    console.log('   ✅ Anon insert successful (problem is fixed!)');
  }

  return { success: true, orderId, anonWorked: !anonError };
}

async function testCompleteCheckout() {
  console.log('🧪 Testing Complete Checkout Flow...\n');
  
  try {
    // Get test data
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1);
    
    const { data: menuItems } = await supabaseAdmin
      .from('menu_items')
      .select('id, name, price')
      .eq('is_available', true)
      .limit(2);
    
    const testUser = profiles[0];
    const items = [
      { id: menuItems[0].id, quantity: 1 },
      { id: menuItems[1].id, quantity: 2 }
    ];
    const total = menuItems[0].price + (menuItems[1].price * 2);
    
    console.log('📋 Test setup:');
    console.log('   User:', testUser.id);
    console.log('   Items:', items.length);
    console.log('   Total:', total);
    
    // Run the simulation
    const result = await simulateCheckout(testUser.id, items, total);
    
    if (result.anonWorked) {
      console.log('\n🎉 CHECKOUT FLOW IS FIXED!');
      console.log('✅ The real app should now work properly');
      console.log('✅ Order items will be created successfully');
    } else {
      console.log('\n⚠️  CHECKOUT ISSUE IDENTIFIED');
      console.log('❌ Real app will still fail to create order items');
      console.log('🔧 Authentication context needs to be fixed in the app');
    }
    
    // Cleanup
    await supabaseAdmin.from('order_items').delete().eq('order_id', result.orderId);
    await supabaseAdmin.from('orders').delete().eq('id', result.orderId);
    console.log('\n✅ Test cleanup complete');
    
  } catch (error) {
    console.error('\n❌ CHECKOUT TEST FAILED!');
    console.error('Error:', error.message);
  }
}

testCompleteCheckout();
