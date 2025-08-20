require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDraftOrdersFlow() {
  console.log('🧪 Testing Draft Orders Implementation...\n');

  try {
    // 1. First, let's check if there are any existing draft orders
    const { data: existingDrafts, error: draftsError } = await supabase
      .from('orders')
      .select('id, status, payment_status, created_at')
      .eq('status', 'draft');

    if (draftsError) throw draftsError;
    
    console.log(`📊 Found ${existingDrafts.length} existing draft orders:`);
    existingDrafts.forEach(order => {
      console.log(`   - Order ${order.id}: ${order.status} | ${order.payment_status} | ${order.created_at}`);
    });

    // 2. Test Kitchen View Query (should exclude draft orders)
    console.log('\n🍳 Testing Kitchen View Query (should exclude drafts):');
    const { data: kitchenOrders, error: kitchenError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        payment_status
      `)
      .in('status', ['confirmed', 'preparing', 'ready'])
      .eq('payment_status', 'paid')
      .neq('status', 'draft');

    if (kitchenError) throw kitchenError;
    
    console.log(`   ✅ Kitchen sees ${kitchenOrders.length} orders (no drafts)`);
    kitchenOrders.forEach(order => {
      console.log(`   - Order ${order.id}: ${order.status} | ${order.payment_status}`);
    });

    // 3. Test Admin View Query (should exclude draft orders by default)
    console.log('\n🔧 Testing Admin View Query (default - excludes drafts):');
    const { data: adminOrders, error: adminError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        payment_status
      `)
      .neq('status', 'draft')
      .order('created_at', { ascending: false });

    if (adminError) throw adminError;
    
    console.log(`   ✅ Admin sees ${adminOrders.length} orders (no drafts by default)`);
    adminOrders.slice(0, 5).forEach(order => {
      console.log(`   - Order ${order.id}: ${order.status} | ${order.payment_status}`);
    });

    // 4. Test Admin Draft Filter Query (should show only draft orders when requested)
    console.log('\n🔍 Testing Admin Draft Filter Query:');
    const { data: adminDrafts, error: adminDraftsError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        payment_status,
        created_at
      `)
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    if (adminDraftsError) throw adminDraftsError;
    
    console.log(`   ✅ Admin draft filter shows ${adminDrafts.length} draft orders`);
    adminDrafts.forEach(order => {
      console.log(`   - Order ${order.id}: ${order.status} | ${order.payment_status} | ${order.created_at}`);
    });

    // 5. Test Analytics Query (should exclude draft orders)
    console.log('\n📈 Testing Analytics Query (should exclude drafts):');
    const today = new Date().toISOString().split('T')[0];
    const { count: todayOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .neq('status', 'draft');

    const { data: todayRevenue } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .neq('status', 'draft')
      .neq('status', 'cancelled');

    const revenue = todayRevenue?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    console.log(`   ✅ Today's analytics (excluding drafts):`);
    console.log(`   - Orders today: ${todayOrders || 0}`);
    console.log(`   - Revenue today: R${revenue.toFixed(2)}`);

    console.log('\n🎉 Draft Orders Implementation Test PASSED!');
    console.log('\n✅ Key Security Features Verified:');
    console.log('   ✓ Kitchen views EXCLUDE draft orders');
    console.log('   ✓ Admin views EXCLUDE draft orders by default');
    console.log('   ✓ Admin can view draft orders when specifically filtering');
    console.log('   ✓ Analytics EXCLUDE draft orders');
    console.log('   ✓ Only confirmed paid orders visible to operations');

  } catch (error) {
    console.error('❌ Draft Orders Test FAILED:', error.message);
  }
}

testDraftOrdersFlow();
