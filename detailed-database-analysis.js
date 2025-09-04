/**
 * Detailed Database Analysis Script
 * Check what's actually working vs what needs fixing
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://awytuszmunxvthuizyur.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function detailedAnalysis() {
  console.log('🔍 DETAILED DATABASE ANALYSIS\n');

  try {
    // 1. All orders analysis
    console.log('1. ALL ORDERS ANALYSIS:');
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ Error:', ordersError);
    } else {
      console.log(`📊 Total orders in database: ${allOrders.length}`);
      
      if (allOrders.length > 0) {
        console.log('📋 Order details:');
        allOrders.forEach((order, index) => {
          console.log(`  ${index + 1}. Order #${order.order_number || 'NULL'} (ID: ${order.id.substring(0, 8)})`);
          console.log(`      Status: ${order.status} | Payment: ${order.payment_status}`);
          console.log(`      Total: R${order.total_amount} | Created: ${new Date(order.created_at).toLocaleDateString()}`);
          console.log(`      Delivery: ${order.delivery_method || 'Not specified'}`);
          if (order.special_instructions) {
            console.log(`      Instructions: ${order.special_instructions.substring(0, 50)}...`);
          }
          console.log('');
        });
      }
    }

    // 2. Order items detailed analysis
    console.log('\n2. ORDER ITEMS DETAILED ANALYSIS:');
    const { data: allOrderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        orders!inner(order_number),
        menu_items(name, category_id)
      `)
      .order('created_at', { ascending: false });

    if (itemsError) {
      console.error('❌ Error:', itemsError);
    } else {
      console.log(`📊 Total order items: ${allOrderItems.length}`);
      
      if (allOrderItems.length > 0) {
        console.log('📋 Order items breakdown:');
        allOrderItems.forEach((item, index) => {
          console.log(`  ${index + 1}. Order #${item.orders?.order_number} - Item ID: ${item.id.substring(0, 8)}`);
          console.log(`      Menu Item ID: ${item.menu_item_id ? item.menu_item_id.substring(0, 8) + '...' : 'NULL'}`);
          console.log(`      Menu Item Name: ${item.menu_items?.name || 'Not found'}`);
          console.log(`      Quantity: ${item.quantity} | Price: R${item.price}`);
          if (item.special_instructions) {
            console.log(`      Instructions: ${item.special_instructions.substring(0, 50)}...`);
          }
          console.log('');
        });
      }
    }

    // 3. Menu items and categories check
    console.log('\n3. MENU SYSTEM CHECK:');
    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true);

    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true);

    if (catError || menuError) {
      console.error('❌ Error fetching menu data:', catError || menuError);
    } else {
      console.log(`📊 Active categories: ${categories.length}`);
      console.log(`📊 Available menu items: ${menuItems.length}`);
      
      categories.forEach(cat => {
        const itemsInCategory = menuItems.filter(item => item.category_id === cat.id);
        console.log(`  - ${cat.name}: ${itemsInCategory.length} items`);
      });
    }

    // 4. User profiles check
    console.log('\n4. USER PROFILES CHECK:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_admin, is_staff, created_at');

    if (profilesError) {
      console.error('❌ Error:', profilesError);
    } else {
      console.log(`📊 Total user profiles: ${profiles.length}`);
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.full_name || 'No name'} (${profile.email})`);
        console.log(`      Role: ${profile.role} | Admin: ${profile.is_admin} | Staff: ${profile.is_staff}`);
        console.log(`      Created: ${new Date(profile.created_at).toLocaleDateString()}`);
        console.log('');
      });
    }

    // 5. Database triggers and functions check
    console.log('\n5. DATABASE FUNCTIONS CHECK:');
    try {
      // Test if order number generation function exists
      const { data: testResult, error: testError } = await supabase
        .rpc('generate_order_number')
        .single();

      if (testError) {
        console.log('🔴 generate_order_number function: NOT FOUND');
      } else {
        console.log('✅ generate_order_number function: EXISTS');
        console.log(`   Sample result: ${testResult}`);
      }
    } catch (error) {
      console.log('🔴 generate_order_number function: ERROR testing');
    }

    console.log('\n✅ DETAILED ANALYSIS COMPLETE!');
    console.log('\n📋 SUMMARY:');
    console.log('==========================================');
    console.log(`Orders: ${allOrders?.length || 0}`);
    console.log(`Order Items: ${allOrderItems?.length || 0}`);
    console.log(`Menu Categories: ${categories?.length || 0}`);
    console.log(`Menu Items: ${menuItems?.length || 0}`);
    console.log(`User Profiles: ${profiles?.length || 0}`);

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
detailedAnalysis();
