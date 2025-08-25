// Test script to verify admin dashboard data integration
const { createClient } = require('@supabase/supabase-js');

// Use the same environment variables as the app
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminDashboardData() {
  console.log('🔧 Testing Admin Dashboard Data Integration...\n');

  try {
    // Test 1: Check database connection
    console.log('1. Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message);
      return;
    }
    console.log('✅ Database connection successful\n');

    // Test 2: Get dashboard stats data
    console.log('2. Testing dashboard stats...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at, payment_status');
    
    if (ordersError) {
      console.error('❌ Orders query failed:', ordersError.message);
      return;
    }

    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
    const paidOrders = orders?.filter(order => order.payment_status === 'paid') || [];
    
    console.log(`✅ Found ${totalOrders} total orders`);
    console.log(`✅ Total revenue: R${totalRevenue.toFixed(2)}`);
    console.log(`✅ Paid orders: ${paidOrders.length}\n`);

    // Test 3: Get popular items
    console.log('3. Testing popular items...');
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        menu_items (
          name
        )
      `)
      .limit(100);

    if (itemsError) {
      console.error('❌ Order items query failed:', itemsError.message);
      return;
    }

    const itemCounts = {};
    orderItems?.forEach(item => {
      const name = item.menu_items?.name || 'Unknown Item';
      itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 0);
    });

    const popularItems = Object.entries(itemCounts)
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 4);

    console.log(`✅ Found ${orderItems?.length || 0} order items`);
    console.log('✅ Popular items:', popularItems);
    console.log('');

    // Test 4: Get user count
    console.log('4. Testing user count...');
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (userError) {
      console.error('❌ User count query failed:', userError.message);
      return;
    }

    console.log(`✅ Found ${userCount || 0} registered users\n`);

    // Test 5: Check pending orders
    console.log('5. Testing pending orders...');
    const { count: pendingCount, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed'])
      .eq('payment_status', 'paid');

    if (pendingError) {
      console.error('❌ Pending orders query failed:', pendingError.message);
      return;
    }

    console.log(`✅ Found ${pendingCount || 0} pending orders\n`);

    // Summary
    console.log('📊 ADMIN DASHBOARD INTEGRATION TEST RESULTS:');
    console.log('=============================================');
    console.log(`Total Orders: ${totalOrders}`);
    console.log(`Total Revenue: R${totalRevenue.toFixed(2)}`);
    console.log(`Paid Orders: ${paidOrders.length}`);
    console.log(`Active Users: ${userCount || 0}`);
    console.log(`Pending Orders: ${pendingCount || 0}`);
    console.log(`Popular Items Found: ${popularItems.length}`);
    console.log('');
    console.log('🎉 Admin dashboard data integration is ready!');
    console.log('👉 All server actions should work correctly with live data');

  } catch (error) {
    console.error('💥 Unexpected error during testing:', error);
  }
}

testAdminDashboardData();
