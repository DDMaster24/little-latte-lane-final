// Simple Database Test - Service Key Version
// This bypasses RLS policies to test basic connectivity

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testWithServiceKey() {
  console.log('🔧 Testing Database with Service Key (bypasses RLS)...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing service key credentials');
    return;
  }

  console.log('✅ Using service key for admin access');
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  // Create client with service key (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Test database structure
    console.log('\n📊 Testing Database Structure...');

    // Test menu categories
    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('id, name, display_order')
      .order('display_order');

    if (catError) {
      console.error('❌ Categories test failed:', catError.message);
      return;
    }

    console.log(`✅ Menu Categories: ${categories.length} found`);
    console.log('📋 Categories:');
    categories.forEach(cat => {
      console.log(`   ${cat.display_order}. ${cat.name} (ID: ${cat.id})`);
    });

    // Test menu items count
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('id, name, price, is_available, category_id')
      .limit(10);

    if (itemsError) {
      console.error('❌ Menu items test failed:', itemsError.message);
      return;
    }

    console.log(`\n✅ Menu Items: Sample of ${items.length} items`);
    items.forEach(item => {
      console.log(`   - ${item.name}: R${item.price} ${item.is_available ? '✅' : '❌'}`);
    });

    // Test other tables
    console.log('\n📊 Testing Table Accessibility...');

    // Get counts from all main tables
    const tables = [
      'profiles',
      'menu_categories', 
      'menu_items',
      'orders',
      'order_items',
      'bookings',
      'events',
      'staff_requests'
    ];

    for (const table of tables) {
      try {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        console.log(`   ${table}: ${count} records`);
      } catch (error) {
        console.log(`   ${table}: ❌ Error - ${error.message}`);
      }
    }

    console.log('\n🎉 Database structure test completed!');
    console.log('\n💡 Next step: Apply RLS policy fixes to enable proper user access');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testWithServiceKey();
