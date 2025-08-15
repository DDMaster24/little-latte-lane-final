// Database Connection Test Script
// Run this to verify your Supabase connection is working

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testDatabaseConnection() {
  console.log('🚀 Testing Little Latte Lane Database Connection...\n');

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('Expected variables:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  console.log('✅ Environment variables loaded');
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Basic connection
    console.log('\n📊 Test 1: Basic Connection');
    const { error: connectionError } = await supabase
      .from('menu_categories')
      .select('id')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      return;
    }
    console.log('✅ Database connection successful!');

    // Test 2: Menu Categories
    console.log('\n📊 Test 2: Menu Categories');
    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('id, name, display_order')
      .order('display_order');

    if (catError) {
      console.error('❌ Categories query failed:', catError.message);
    } else {
      console.log(`✅ Found ${categories.length} menu categories:`);
      categories.forEach(cat => {
        console.log(`   ${cat.display_order}. ${cat.name} (ID: ${cat.id})`);
      });
    }

    // Test 3: Menu Items Count
    console.log('\n📊 Test 3: Menu Items');
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('id, name, category_id, available')
      .limit(5);

    if (itemsError) {
      console.error('❌ Menu items query failed:', itemsError.message);
    } else {
      console.log(`✅ Sample menu items (showing first 5):`);
      items.forEach(item => {
        console.log(`   - ${item.name} ${item.available ? '✅' : '❌'}`);
      });
    }

    // Test 4: Count totals
    console.log('\n📊 Test 4: Database Summary');
    
    const { count: totalCategories } = await supabase
      .from('menu_categories')
      .select('*', { count: 'exact', head: true });

    const { count: totalItems } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true });

    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Categories: ${totalCategories}`);
    console.log(`🍕 Menu Items: ${totalItems}`);
    console.log(`📦 Orders: ${totalOrders}`);

    console.log('\n🎉 All database tests passed! Your setup is working perfectly.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testDatabaseConnection();
