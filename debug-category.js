// Debug the category filter issue
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function debugCategoryFilter() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log('🔍 DEBUGGING CATEGORY FILTER ISSUE\n');

  try {
    // 1. Check all homepage- settings regardless of category
    console.log('📊 Step 1: All homepage- settings (no category filter)');
    const { data: allHomepage, error: allError } = await supabase
      .from('theme_settings')
      .select('*')
      .like('setting_key', 'homepage-%');

    if (allError) {
      console.error('❌ Error:', allError);
    } else {
      console.log(`Found ${allHomepage.length} settings:`);
      allHomepage.forEach(setting => {
        console.log(`  - ${setting.setting_key}: "${setting.setting_value}" (category: "${setting.category}")`);
      });
    }

    // 2. Check page_editor category settings
    console.log('\n📊 Step 2: All page_editor category settings');
    const { data: pageEditor, error: pageError } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('category', 'page_editor');

    if (pageError) {
      console.error('❌ Error:', pageError);
    } else {
      console.log(`Found ${pageEditor.length} page_editor settings:`);
      pageEditor.forEach(setting => {
        console.log(`  - ${setting.setting_key}: "${setting.setting_value}"`);
      });
    }

    // 3. Check what usePageEditor query should return
    console.log('\n📊 Step 3: usePageEditor query simulation');
    const { data: usePageEditorResult, error: usePageEditorError } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('category', 'page_editor')
      .like('setting_key', 'homepage-%')
      .order('updated_at', { ascending: false });

    if (usePageEditorError) {
      console.error('❌ Error:', usePageEditorError);
    } else {
      console.log(`usePageEditor query would return ${usePageEditorResult.length} settings:`);
      usePageEditorResult.forEach(setting => {
        console.log(`  - ${setting.setting_key}: "${setting.setting_value}"`);
      });
    }

    // 4. Check ThemeLoader query simulation
    console.log('\n📊 Step 4: ThemeLoader query simulation');
    const { data: themeLoaderResult, error: themeLoaderError } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('category', 'page_editor')
      .like('setting_key', 'homepage-%');

    if (themeLoaderError) {
      console.error('❌ Error:', themeLoaderError);
    } else {
      console.log(`ThemeLoader query would return ${themeLoaderResult.length} settings:`);
      themeLoaderResult.forEach(setting => {
        console.log(`  - ${setting.setting_key}: "${setting.setting_value}"`);
      });
    }

    // 5. Find the specific hero-subheading setting
    console.log('\n📊 Step 5: Find specific hero-subheading setting');
    const { data: specificSetting, error: specificError } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('setting_key', 'homepage-hero-subheading');

    if (specificError) {
      console.error('❌ Error:', specificError);
    } else if (specificSetting && specificSetting.length > 0) {
      const setting = specificSetting[0];
      console.log('Found homepage-hero-subheading:');
      console.log(`  Key: ${setting.setting_key}`);
      console.log(`  Value: "${setting.setting_value}"`);
      console.log(`  Category: "${setting.category}"`);
      console.log(`  Created: ${setting.created_at}`);
      console.log(`  Updated: ${setting.updated_at}`);
    } else {
      console.log('❌ homepage-hero-subheading setting not found');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugCategoryFilter();
