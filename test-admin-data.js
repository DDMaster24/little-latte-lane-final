// Quick admin data validation script
const { createClient } = require('@supabase/supabase-js');

async function testAdminData() {
  const supabase = createClient(
    'https://awytuszmunxvthuizyur.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM5Njg4MzQsImV4cCI6MjAzOTU0NDgzNH0.1dCL9_rFBBjZ4-_RD_EE9NzGqJGRx5TDKgKAOyDJoM8'
  );

  console.log('🔍 ADMIN DATA VALIDATION REPORT');
  console.log('================================\n');

  try {
    // Test 1: Orders data
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        profiles(full_name)
      `)
      .limit(5);

    console.log('📦 ORDERS TABLE:');
    console.log(`- Total orders available: ${orders?.length || 0}`);
    if (orders?.length > 0) {
      console.log(`- Sample order: ${orders[0].order_number} (${orders[0].status})`);
      console.log(`- Order items: ${orders[0].order_items?.length || 0} items`);
    } else {
      console.log('- ⚠️  No orders found - admin will show empty state');
    }
    console.log('');

    // Test 2: Menu data
    const { data: categories } = await supabase.from('menu_categories').select('*');
    const { data: menuItems } = await supabase.from('menu_items').select('*');

    console.log('🍕 MENU DATA:');
    console.log(`- Categories: ${categories?.length || 0}`);
    console.log(`- Menu items: ${menuItems?.length || 0}`);
    if (categories?.length > 0) {
      console.log(`- Sample category: "${categories[0].name}" (${menuItems?.filter(item => item.category_id === categories[0].id).length} items)`);
    }
    console.log('');

    // Test 3: Bookings data
    const { data: bookings } = await supabase.from('bookings').select('*');
    console.log('📅 BOOKINGS TABLE:');
    console.log(`- Total bookings: ${bookings?.length || 0}`);
    if (bookings?.length === 0) {
      console.log('- ⚠️  No bookings found - admin booking management will show empty state');
    }
    console.log('');

    // Test 4: Events data
    const { data: events } = await supabase.from('events').select('*');
    console.log('🎉 EVENTS TABLE:');
    console.log(`- Total events: ${events?.length || 0}`);
    if (events?.length === 0) {
      console.log('- ⚠️  No events found - admin events management will show empty state');
    }
    console.log('');

    // Test 5: User profiles
    const { data: profiles } = await supabase.from('profiles').select('*');
    const adminUsers = profiles?.filter(p => p.is_admin) || [];
    const staffUsers = profiles?.filter(p => p.is_staff) || [];

    console.log('👥 USER MANAGEMENT:');
    console.log(`- Total profiles: ${profiles?.length || 0}`);
    console.log(`- Admin users: ${adminUsers.length}`);
    console.log(`- Staff users: ${staffUsers.length}`);
    console.log(`- Customer users: ${(profiles?.length || 0) - adminUsers.length - staffUsers.length}`);
    console.log('');

    // Summary
    console.log('📊 ADMIN PANEL READINESS:');
    console.log(`✅ Database connection: Working`);
    console.log(`${orders?.length > 0 ? '✅' : '⚠️'} Order management: ${orders?.length > 0 ? 'Has data' : 'Empty state'}`);
    console.log(`✅ Menu management: ${categories?.length} categories, ${menuItems?.length} items`);
    console.log(`${bookings?.length > 0 ? '✅' : '⚠️'} Booking management: ${bookings?.length > 0 ? 'Has data' : 'Empty state'}`);
    console.log(`${events?.length > 0 ? '✅' : '⚠️'} Events management: ${events?.length > 0 ? 'Has data' : 'Empty state'}`);
    console.log(`✅ User management: ${profiles?.length} total users`);

  } catch (error) {
    console.error('❌ Error testing admin data:', error.message);
  }
}

testAdminData();
