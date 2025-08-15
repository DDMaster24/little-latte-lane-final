// Debug Menu Categories Issue
// This will help us identify what's wrong with the menu loading

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function debugMenuIssue() {
  console.log('🔍 Debugging Menu Categories Issue...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  console.log('✅ Environment variables loaded');
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  // Test with anonymous key (what the website uses)
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Try to fetch menu categories (what the website does)
    console.log('\n🔍 Test 1: Fetch Menu Categories (Anonymous User)');
    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (catError) {
      console.error('❌ Categories query failed:', catError.message);
      console.error('❌ Error details:', catError);
    } else {
      console.log(`✅ Successfully fetched ${categories.length} categories`);
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (Active: ${cat.is_active})`);
      });
    }

    // Test 2: Try without the is_active filter
    console.log('\n🔍 Test 2: Fetch All Categories (No Filter)');
    const { data: allCategories, error: allCatError } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order');

    if (allCatError) {
      console.error('❌ All categories query failed:', allCatError.message);
    } else {
      console.log(`✅ Found ${allCategories.length} total categories`);
    }

    // Test 3: Check if we can access menu_items
    console.log('\n🔍 Test 3: Fetch Menu Items');
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .limit(5);

    if (itemsError) {
      console.error('❌ Menu items query failed:', itemsError.message);
    } else {
      console.log(`✅ Found ${items.length} menu items`);
    }

    // Test 4: Check table permissions
    console.log('\n🔍 Test 4: Check RLS Policy Status');
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('pg_tables')
      .select('*');

    if (rlsError) {
      console.log('❌ Cannot check RLS status:', rlsError.message);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

debugMenuIssue();
