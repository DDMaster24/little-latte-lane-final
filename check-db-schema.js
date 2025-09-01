// Quick Database Schema Check
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://awytuszmunxvthuizyur.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM'
);

async function checkDatabaseSchema() {
  console.log('🔍 DATABASE SCHEMA VERIFICATION\n');

  // Check orders table columns
  console.log('📋 ORDERS TABLE STRUCTURE:');
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (data && data[0]) {
      console.log('   Columns found:', Object.keys(data[0]).join(', '));
    } else {
      console.log('   No data found or table empty');
    }
    if (error) console.log('   Error:', error.message);
  } catch (e) {
    console.log('   Error:', e.message);
  }

  // Check order_items table columns
  console.log('\n📦 ORDER_ITEMS TABLE STRUCTURE:');
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .limit(1);
    
    if (data && data[0]) {
      console.log('   Columns found:', Object.keys(data[0]).join(', '));
    } else {
      console.log('   No data found or table empty');
    }
    if (error) console.log('   Error:', error.message);
  } catch (e) {
    console.log('   Error:', e.message);
  }

  // Check for missing columns specifically
  console.log('\n🔎 CHECKING CRITICAL MISSING COLUMNS:');
  
  const criticalChecks = [
    { table: 'orders', column: 'estimated_ready_time', type: 'text' },
    { table: 'orders', column: 'completed_at', type: 'timestamptz' },
    { table: 'order_items', column: 'unit_price', type: 'decimal' },
    { table: 'order_items', column: 'menu_item_id', type: 'uuid' }
  ];

  for (const check of criticalChecks) {
    try {
      const { data, error } = await supabase
        .from(check.table)
        .select(check.column)
        .limit(1);
      
      if (!error) {
        console.log(`   ✅ ${check.table}.${check.column} EXISTS`);
      } else {
        console.log(`   ❌ ${check.table}.${check.column} MISSING - ${error.message}`);
      }
    } catch (e) {
      console.log(`   ❌ ${check.table}.${check.column} MISSING - ${e.message}`);
    }
  }
}

checkDatabaseSchema().catch(console.error);
