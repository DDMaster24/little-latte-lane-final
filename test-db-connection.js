// Quick test to verify our database connection and theme_settings table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test 1: Basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Basic connection failed:', healthError);
      return;
    }
    console.log('✅ Basic connection successful');
    
    // Test 2: Theme settings table exists and can be queried
    const { data: themeData, error: themeError } = await supabase
      .from('theme_settings')
      .select('*')
      .limit(5);
    
    if (themeError) {
      console.error('❌ Theme settings table error:', themeError);
      return;
    }
    
    console.log('✅ Theme settings table accessible');
    console.log('📊 Theme settings count:', themeData?.length || 0);
    
    if (themeData && themeData.length > 0) {
      console.log('🎨 Sample theme settings:');
      themeData.forEach(setting => {
        console.log(`  - ${setting.setting_key}: ${setting.setting_value} (${setting.category})`);
      });
    } else {
      console.log('📝 No theme settings found - this is normal for a fresh database');
    }
    
    // Test 3: Menu categories (verify existing data)
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('name, is_active')
      .limit(5);
    
    if (categoriesError) {
      console.error('❌ Menu categories error:', categoriesError);
      return;
    }
    
    console.log('✅ Menu categories table accessible');
    console.log('🍽️ Categories count:', categoriesData?.length || 0);
    
    console.log('\n🎉 All database tests passed! Connection is working properly.');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the test
testConnection();
