/**
 * Update Logo Path in Database
 * Changes from logo.jpg to Logo.png
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function updateLogoPath() {
  console.log('🔄 Updating logo path in database...\n');
  
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Check current logo setting
    console.log('📋 Checking current logo setting...');
    const { data: currentSetting, error: fetchError } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('setting_key', 'header_logo_url')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching current setting:', fetchError);
      return;
    }

    if (currentSetting) {
      console.log('✅ Current logo URL:', currentSetting.setting_value);
    } else {
      console.log('ℹ️ No existing logo setting found');
    }

    // Update to new logo path
    console.log('\n🔄 Updating to new logo: /images/Logo.png');
    
    let data, error;
    
    if (currentSetting) {
      // Update existing setting
      const updateResult = await supabase
        .from('theme_settings')
        .update({
          setting_value: '/images/Logo.png',
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'header_logo_url');
      
      data = updateResult.data;
      error = updateResult.error;
    } else {
      // Insert new setting
      const insertResult = await supabase
        .from('theme_settings')
        .insert({
          setting_key: 'header_logo_url',
          setting_value: '/images/Logo.png',
          updated_at: new Date().toISOString()
        });
      
      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      console.error('❌ Error updating logo:', error);
      return;
    }

    console.log('✅ Logo path updated successfully!');
    
    // Verify the update
    console.log('\n🔍 Verifying update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('setting_key', 'header_logo_url')
      .single();

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    console.log('✅ Verified new logo URL:', verifyData.setting_value);
    console.log('📅 Updated at:', verifyData.updated_at);
    
    console.log('\n🎉 Logo update complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 The new Logo.png will now be used across the site');
    console.log('🔄 Changes will be visible after page refresh');
    console.log('📈 Expected improvements:');
    console.log('   • Better image quality (PNG vs JPG)');
    console.log('   • Transparent background support');
    console.log('   • Faster loading (smaller file size)');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the update
updateLogoPath();
