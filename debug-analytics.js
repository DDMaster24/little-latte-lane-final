const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 DEBUGGING ANALYTICS DATA');
console.log('Supabase URL:', supabaseUrl ? 'Set ✅' : 'Missing ❌');
console.log('Service Key:', supabaseKey ? 'Set ✅' : 'Missing ❌');

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAnalytics() {
  try {
    console.log('\n📊 CHECKING DATABASE CONTENT:');
    
    // Check profiles count
    const { data: profiles, count: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email', { count: 'exact' });
    
    console.log('\n👥 PROFILES TABLE:');
    console.log('Count:', profilesCount);
    console.log('Error:', profilesError);
    console.log('Sample profiles:', profiles?.slice(0, 3));
    
    // Check orders count and content
    const { data: orders, count: ordersCount, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact' });
    
    console.log('\n🛒 ORDERS TABLE:');
    console.log('Count:', ordersCount);
    console.log('Error:', ordersError);
    console.log('Sample orders:', orders?.slice(0, 3));
    
    // Check order_items 
    const { data: orderItems, count: itemsCount, error: itemsError } = await supabase
      .from('order_items')
      .select('*', { count: 'exact' });
    
    console.log('\n📝 ORDER_ITEMS TABLE:');
    console.log('Count:', itemsCount);
    console.log('Error:', itemsError);
    console.log('Sample items:', orderItems?.slice(0, 3));
    
    // Check menu_items
    const { data: menuItems, count: menuCount, error: menuError } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact' });
    
    console.log('\n🍕 MENU_ITEMS TABLE:');
    console.log('Count:', menuCount);
    console.log('Error:', menuError);
    console.log('Sample items:', menuItems?.slice(0, 3));
    
    // Test the exact query used by analytics
    console.log('\n🔍 TESTING ANALYTICS QUERY:');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const { data: analyticsOrders, error: analyticsError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price,
          menu_items (name)
        )
      `)
      .gte('created_at', startDate.toISOString());
    
    console.log('Analytics query result:');
    console.log('Orders count:', analyticsOrders?.length || 0);
    console.log('Error:', analyticsError);
    console.log('Sample order with items:', analyticsOrders?.[0]);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugAnalytics();