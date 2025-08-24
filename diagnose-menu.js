// Diagnose menu database schema issues
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function diagnoseMenuSchema() {
  console.log('🔍 DIAGNOSING MENU DATABASE SCHEMA');
  console.log('='.repeat(50));
  
  try {
    // 1. Check menu_categories table structure
    console.log('\n1️⃣ Checking menu_categories table...');
    const { data: categoriesInfo, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('*')
      .limit(1);
    
    if (categoriesError) {
      console.error('❌ menu_categories error:', categoriesError.message);
      console.log('   Code:', categoriesError.code);
      console.log('   Details:', categoriesError.details);
    } else {
      console.log('✅ menu_categories table accessible');
      if (categoriesInfo && categoriesInfo.length > 0) {
        console.log('   Columns:', Object.keys(categoriesInfo[0]));
      } else {
        console.log('   Table exists but is empty');
      }
    }

    // 2. Check menu_items table structure
    console.log('\n2️⃣ Checking menu_items table...');
    const { data: itemsInfo, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .limit(1);
    
    if (itemsError) {
      console.error('❌ menu_items error:', itemsError.message);
    } else {
      console.log('✅ menu_items table accessible');
      if (itemsInfo && itemsInfo.length > 0) {
        console.log('   Columns:', Object.keys(itemsInfo[0]));
      } else {
        console.log('   Table exists but is empty');
      }
    }

    // 3. Check what tables exist in the database
    console.log('\n3️⃣ Checking all tables in public schema...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      console.log('⚠️  Cannot access table list:', tablesError.message);
    } else {
      console.log('📋 Tables in database:');
      tables?.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

    // 4. Try to get menu data count
    console.log('\n4️⃣ Checking data counts...');
    
    try {
      const { count: categoriesCount } = await supabase
        .from('menu_categories')
        .select('*', { count: 'exact', head: true });
      console.log(`   menu_categories: ${categoriesCount} records`);
    } catch (err) {
      console.log('   menu_categories: Error getting count');
    }

    try {
      const { count: itemsCount } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });
      console.log(`   menu_items: ${itemsCount} records`);
    } catch (err) {
      console.log('   menu_items: Error getting count');
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 DIAGNOSIS COMPLETE');
}

diagnoseMenuSchema()
  .then(() => {
    console.log('\n✨ Diagnosis completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
