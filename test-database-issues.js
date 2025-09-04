/**
 * Test Database Issues Script
 * Run this to check current order number and menu item relationship status
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://awytuszmunxvthuizyur.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseIssues() {
  console.log('🔍 Testing database issues...\n');

  try {
    // 1. Check order numbers
    console.log('1. CHECKING ORDER NUMBERS:');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
    } else {
      console.log(`📊 Found ${orders.length} orders`);
      const nullOrderNumbers = orders.filter(order => !order.order_number);
      console.log(`🔴 Orders with NULL order_number: ${nullOrderNumbers.length}`);
      
      if (nullOrderNumbers.length > 0) {
        console.log('Sample orders with null order_number:');
        nullOrderNumbers.slice(0, 3).forEach(order => {
          console.log(`  - ID: ${order.id}, Created: ${order.created_at}, Total: R${order.total_amount}`);
        });
      }
    }

    // 2. Check order items relationships
    console.log('\n2. CHECKING ORDER ITEMS RELATIONSHIPS:');
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id, 
        menu_item_id, 
        price, 
        quantity, 
        special_instructions,
        menu_items!inner(name)
      `)
      .limit(10);

    if (itemsError) {
      console.error('❌ Error fetching order items:', itemsError);
    } else {
      console.log(`📊 Found ${orderItems.length} order items`);
      const nullMenuItems = orderItems.filter(item => !item.menu_item_id);
      console.log(`🔴 Order items with NULL menu_item_id: ${nullMenuItems.length}`);
      
      if (nullMenuItems.length > 0) {
        console.log('Sample order items with null menu_item_id:');
        nullMenuItems.slice(0, 3).forEach(item => {
          console.log(`  - ID: ${item.id}, Price: R${item.price}, Qty: ${item.quantity}`);
          if (item.special_instructions) {
            console.log(`    Instructions: ${item.special_instructions.substring(0, 100)}...`);
          }
        });
      }
    }

    // 3. Check if order sequence exists
    console.log('\n3. CHECKING ORDER NUMBER SEQUENCE:');
    const { data: sequences, error: seqError } = await supabase
      .rpc('pg_get_serial_sequence', { table_name: 'orders', column_name: 'order_number' });

    if (seqError) {
      console.log('🔴 Order number sequence does not exist yet');
    } else {
      console.log('✅ Order number sequence found:', sequences);
    }

    // 4. Check recent activity
    console.log('\n4. RECENT DATABASE ACTIVITY:');
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('order_number, status, payment_status, total_amount, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (recentError) {
      console.error('❌ Error fetching recent orders:', recentError);
    } else {
      console.log(`📊 Orders in last 7 days: ${recentOrders.length}`);
      console.log(`💰 Total revenue (last 7 days): R${recentOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toFixed(2)}`);
    }

    console.log('\n✅ Database analysis complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDatabaseIssues();
