#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testOrderNumbers() {
  console.log('🔍 Checking Order Number System...\n');

  try {
    // Check existing orders
    console.log('📋 Current Orders:');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return;
    }

    if (orders && orders.length > 0) {
      orders.forEach((order, index) => {
        console.log(`  ${index + 1}. Order ${order.id.substring(0, 8)}... | Order Number: ${order.order_number || 'NULL'} | Status: ${order.status} | Created: ${order.created_at}`);
      });
    } else {
      console.log('  No orders found in database');
    }

    // Check the sequence current value
    console.log('\n🔢 Order Number Sequence Status:');
    const { data: seqData, error: seqError } = await supabase
      .rpc('sql', { 
        query: "SELECT currval('order_number_seq') as current_value;" 
      });

    if (seqError) {
      console.log('  Sequence not yet used (normal for first order)');
    } else {
      console.log(`  Current sequence value: ${seqData[0]?.current_value || 'Not available'}`);
    }

    // Test creating a new order to see if trigger works
    console.log('\n🧪 Testing Order Number Generation:');
    
    // Get a real user ID from profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profileError || !profiles || profiles.length === 0) {
      console.log('❌ No user profiles found to test with');
      return;
    }
    
    const testUserId = profiles[0].id;
    console.log(`Using user ID: ${testUserId}`);
    
    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert({
        user_id: testUserId,
        total_amount: 25.00,
        status: 'draft',
        payment_status: 'awaiting_payment'
      })
      .select('id, order_number, status')
      .single();

    if (insertError) {
      console.error('❌ Error creating test order:', insertError);
      return;
    }

    console.log(`✅ Test order created successfully!`);
    console.log(`   Order ID: ${newOrder.id}`);
    console.log(`   Order Number: ${newOrder.order_number || 'FAILED - NULL'}`);
    console.log(`   Status: ${newOrder.status}`);

    // Clean up test order
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', newOrder.id);

    if (deleteError) {
      console.log('⚠️  Note: Test order not cleaned up, ID:', newOrder.id);
    } else {
      console.log('🧹 Test order cleaned up successfully');
    }

    // Check trigger exists
    console.log('\n🔧 Database Trigger Status:');
    const { data: triggerData, error: triggerError } = await supabase
      .rpc('sql', {
        query: `
          SELECT trigger_name, event_manipulation, action_timing 
          FROM information_schema.triggers 
          WHERE trigger_name = 'set_order_number_trigger';
        `
      });

    if (triggerError) {
      console.error('❌ Error checking trigger:', triggerError);
    } else if (triggerData && triggerData.length > 0) {
      console.log('✅ Order number trigger exists and is active');
      triggerData.forEach(trigger => {
        console.log(`   ${trigger.trigger_name}: ${trigger.action_timing} ${trigger.event_manipulation}`);
      });
    } else {
      console.log('❌ Order number trigger NOT found');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testOrderNumbers().then(() => {
  console.log('\n🏁 Order number system test completed');
});
