const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking environment variables...');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Found' : '❌ Missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Found' : '❌ Missing');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkSchema() {
  console.log('\n🔍 Testing database connection...');
  
  try {
    // Check if theme_settings table exists
    const { data, error } = await supabase
      .from('theme_settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ theme_settings table check failed:', error.message);
    } else {
      console.log('✅ theme_settings table exists');
      console.log('📋 Sample data structure:', data);
    }

    // Get table info from information_schema
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'theme_settings' })
      .single();

    if (tableError) {
      console.log('⚠️  Could not get detailed table info:', tableError.message);
    } else {
      console.log('📊 Table info:', tableInfo);
    }

  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
}

checkSchema();
