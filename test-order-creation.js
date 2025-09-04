/**
 * Test Order Creation Flow
 * This script simulates the exact order creation process to identify where order items are failing
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://awytuszmunxvthuizyur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTA0MzAsImV4cCI6MjA3MDgyNjQzMH0.UaljSLQF38JBcZ05JbuMGfzvDlSOFr_frBdSb8ATWlY';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM';

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testOrderCreation() {
  console.log('🧪 Testing Order Creation Flow with Admin Access...\n');
  
  try {
    // Test with admin client to bypass RLS
    console.log('📋 Step 1: Checking real data with admin access...');
    
    // Check actual orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, status, user_id, total_amount, created_at')
      .limit(10);
    
    if (ordersError) {
      console.log('❌ Orders query failed:', ordersError.message);
      throw ordersError;
    }
    
    console.log(`✅ Found ${orders.length} orders:`);
    orders.forEach(order => {
      console.log(`   - ${order.order_number}: ${order.status} (R${order.total_amount}) - ${order.created_at}`);
    });
    
    // Check actual order items
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('id, order_id, menu_item_id, quantity, price, created_at')
      .limit(20);
    
    if (itemsError) {
      console.log('❌ Order items query failed:', itemsError.message);
      throw itemsError;
    }
    
    console.log(`\n✅ Found ${orderItems.length} order items:`);
    orderItems.forEach(item => {
      console.log(`   - Order ${item.order_id}: ${item.quantity}x Item ${item.menu_item_id} (R${item.price})`);
    });
    
    // Check if there's a mismatch between orders and order items
    const orderIds = orders.map(o => o.id);
    const itemOrderIds = [...new Set(orderItems.map(i => i.order_id))];
    
    console.log('\n� Order vs Order Items Analysis:');
    console.log(`   - Orders found: ${orders.length}`);
    console.log(`   - Order items found: ${orderItems.length}`);
    console.log(`   - Unique orders with items: ${itemOrderIds.length}`);
    
    const ordersWithoutItems = orderIds.filter(id => !itemOrderIds.includes(id));
    const itemsWithoutOrders = itemOrderIds.filter(id => !orderIds.includes(id));
    
    if (ordersWithoutItems.length > 0) {
      console.log(`   ❌ Orders without items: ${ordersWithoutItems.length}`);
      ordersWithoutItems.forEach(orderId => {
        const order = orders.find(o => o.id === orderId);
        console.log(`      - ${order?.order_number} (${order?.status})`);
      });
    }
    
    if (itemsWithoutOrders.length > 0) {
      console.log(`   ❌ Orphaned order items: ${itemsWithoutOrders.length}`);
    }
    
    if (ordersWithoutItems.length === 0 && itemsWithoutOrders.length === 0) {
      console.log('   ✅ All orders have items and all items have orders');
    }
    
    // Get user info for these orders
    const userIds = [...new Set(orders.map(o => o.user_id).filter(id => id))];
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);
    
    if (profilesError) {
      console.log('❌ Profiles query failed:', profilesError.message);
    } else {
      console.log(`\n✅ Found ${profiles.length} user profiles for these orders:`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.full_name || profile.email} (${profile.id})`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ ANALYSIS FAILED!');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
  }
}

testOrderCreation();
