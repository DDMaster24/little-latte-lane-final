// Fix the existing homepage setting that has wrong category
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixExistingHomepageSettings() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log('🔧 FIXING EXISTING HOMEPAGE SETTINGS CATEGORY\n');

  try {
    // 1. Find all homepage settings with wrong category
    console.log('📊 Step 1: Finding homepage settings with wrong category');
    const { data: wrongCategorySettings, error: findError } = await supabase
      .from('theme_settings')
      .select('*')
      .like('setting_key', 'homepage-%')
      .neq('category', 'page_editor');

    if (findError) {
      console.error('❌ Error finding settings:', findError);
      return;
    }

    console.log(`Found ${wrongCategorySettings.length} settings with wrong category:`);
    wrongCategorySettings.forEach(setting => {
      console.log(`  - ${setting.setting_key}: category="${setting.category}" (should be "page_editor")`);
    });

    // 2. Update each setting to have correct category
    if (wrongCategorySettings.length > 0) {
      console.log('\n🔧 Step 2: Updating categories to "page_editor"');
      
      for (const setting of wrongCategorySettings) {
        const { error: updateError } = await supabase
          .from('theme_settings')
          .update({ 
            category: 'page_editor',
            updated_at: new Date().toISOString()
          })
          .eq('id', setting.id);

        if (updateError) {
          console.error(`❌ Error updating ${setting.setting_key}:`, updateError);
        } else {
          console.log(`✅ Updated ${setting.setting_key}: category now "page_editor"`);
        }
      }
    }

    // 3. Verify the fix
    console.log('\n✅ Step 3: Verifying the fix');
    const { data: verifySettings, error: verifyError } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('category', 'page_editor')
      .like('setting_key', 'homepage-%');

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
    } else {
      console.log(`✅ Now ${verifySettings.length} homepage settings have correct category:`);
      verifySettings.forEach(setting => {
        console.log(`  - ${setting.setting_key}: "${setting.setting_value}"`);
      });
    }

    // 4. Test the exact query that ThemeLoader uses
    console.log('\n🎯 Step 4: Testing ThemeLoader query');
    const { data: themeLoaderTest, error: themeLoaderError } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('category', 'page_editor')
      .like('setting_key', 'homepage-%');

    if (themeLoaderError) {
      console.error('❌ ThemeLoader query failed:', themeLoaderError);
    } else {
      console.log(`✅ ThemeLoader query now returns ${themeLoaderTest.length} settings:`);
      themeLoaderTest.forEach(setting => {
        console.log(`  - ${setting.setting_key}: "${setting.setting_value}"`);
      });
    }

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixExistingHomepageSettings();
