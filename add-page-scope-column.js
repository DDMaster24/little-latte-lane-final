// Script to add missing page_scope column to theme_settings table
// This will be deleted after use
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function addPageScopeColumn() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    console.log('🔧 Adding page_scope column to theme_settings table...\n');
    
    // Use SQL to add the missing column
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE theme_settings 
        ADD COLUMN IF NOT EXISTS page_scope VARCHAR(255) DEFAULT 'global';
        
        -- Add index for better performance on page_scope queries
        CREATE INDEX IF NOT EXISTS idx_theme_settings_page_scope 
        ON theme_settings(page_scope);
        
        -- Add comment to explain the column
        COMMENT ON COLUMN theme_settings.page_scope IS 'Scope of the setting: homepage, menu, header, footer, global, etc.';
      `
    });
    
    if (error) {
      console.error('❌ Error adding page_scope column:', error);
      return;
    }
    
    console.log('✅ Successfully added page_scope column!');
    console.log('📝 Result:', data);
    
    // Now test by inserting a record with page_scope
    console.log('\n🧪 Testing page_scope column...');
    const { data: testData, error: testError } = await supabase
      .from('theme_settings')
      .insert({ 
        setting_key: 'test-page-scope', 
        setting_value: 'test-value',
        category: 'page_editor',
        page_scope: 'homepage'
      })
      .select()
      .single();
      
    if (testError) {
      console.log('❌ Test insert failed:', testError.message);
    } else {
      console.log('✅ Test insert succeeded:', testData);
      
      // Clean up test record
      await supabase.from('theme_settings').delete().eq('setting_key', 'test-page-scope');
      console.log('🧹 Cleaned up test record');
    }
    
  } catch (error) {
    console.error('❌ Error during schema update:', error.message);
  }
}

addPageScopeColumn();
