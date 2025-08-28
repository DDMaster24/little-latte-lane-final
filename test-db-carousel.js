const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testConnection() {
  try {
    // Test connection by checking existing tables
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
    } else {
      console.log('✅ Database connection successful!');
      console.log('📋 Please execute the SQL in create-carousel-panels-table.sql manually in Supabase SQL Editor');
      console.log('🔗 Go to: https://supabase.com/dashboard/project/awytuszmunxvthuizyur/sql');
    }
  } catch (err) {
    console.error('Script error:', err.message);
  }
}

testConnection();
