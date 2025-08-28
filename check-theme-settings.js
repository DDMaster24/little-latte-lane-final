// Quick script to check current theme_settings table structure and data
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkThemeSettings() {
  console.log('🔍 Checking theme_settings table structure and data...\n');
  
  try {
    // Get all theme_settings data
    const { data, error } = await supabase
      .from('theme_settings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`📊 Found ${data?.length || 0} theme_settings records:\n`);
    
    if (data && data.length > 0) {
      data.forEach((setting, index) => {
        console.log(`Record ${index + 1}:`);
        console.log(`  ID: ${setting.id}`);
        console.log(`  Key: ${setting.setting_key}`);
        console.log(`  Value: ${setting.setting_value}`);
        console.log(`  Category: ${setting.category}`);
        console.log(`  Page Scope: ${setting.page_scope}`);
        console.log(`  Created: ${setting.created_at}`);
        console.log(`  Updated: ${setting.updated_at}`);
        console.log(`  Created By: ${setting.created_by}`);
        console.log('---');
      });
      
      // Analyze the data structure
      const categories = [...new Set(data.map(d => d.category).filter(Boolean))];
      const pageScopes = [...new Set(data.map(d => d.page_scope).filter(Boolean))];
      const settingKeys = [...new Set(data.map(d => d.setting_key))];
      
      console.log('\n📋 Data Analysis:');
      console.log(`Categories used: ${categories.join(', ') || 'None'}`);
      console.log(`Page scopes used: ${pageScopes.join(', ') || 'None'}`);
      console.log(`Setting keys: ${settingKeys.join(', ')}`);
      
    } else {
      console.log('📝 Table exists but no data found.');
      console.log('This means we have a clean slate for our page editor implementation.');
    }
    
  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

checkThemeSettings();
