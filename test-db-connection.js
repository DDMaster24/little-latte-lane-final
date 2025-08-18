// Test database connection to verify live data access
const { createClient } = require('@supabase/supabase-js');

// Environment variables from .env.local
const supabaseUrl = 'https://awytuszmunxvthuizyur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTA0MzAsImV4cCI6MjA3MDgyNjQzMH0.UaljSLQF38JBcZ05JbuMGfzvDlSOFr_frBdSb8ATWlY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('🔗 Testing live Supabase database connection...\n');

  try {
    // Test 1: Check all tables exist and get row counts
    console.log('📊 Checking table structure and data counts:');
    
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
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.log(`❌ ${table}: Error - ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count} records`);
      }
    }

    // Test 2: Sample menu data
    console.log('\n🍽️ Sample menu categories:');
    const { data: categories } = await supabase
      .from('menu_categories')
      .select('id, name, description')
      .limit(5);
    
    categories?.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.id})`);
    });

    // Test 3: Sample menu items  
    console.log('\n🥤 Sample menu items:');
    const { data: items } = await supabase
      .from('menu_items')
      .select('name, price, category_id')
      .limit(5);
    
    items?.forEach(item => {
      console.log(`  - ${item.name}: R${item.price}`);
    });

    // Test 4: Check database functions
    console.log('\n🔧 Testing database functions:');
    
    const functions = [
      'is_admin',
      'is_staff_or_admin', 
      'get_user_role'
    ];
    
    for (const func of functions) {
      try {
        const { data, error } = await supabase.rpc(func);
        if (error) {
          console.log(`❌ Function ${func}: ${error.message}`);
        } else {
          console.log(`✅ Function ${func}: Working (returned: ${data})`);
        }
      } catch (err) {
        console.log(`❌ Function ${func}: ${err.message}`);
      }
    }

    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testDatabaseConnection().then(() => process.exit(0));
