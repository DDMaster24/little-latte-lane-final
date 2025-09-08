/**
 * Check Live Opening Hours Data
 * This will show us exactly what opening hours are stored in your live database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkLiveOpeningHours() {
  console.log('🔍 Checking live opening hours data...\n');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Check carousel_panels table for opening hours
    console.log('📋 Checking carousel_panels table...');
    const { data: carouselData, error: carouselError } = await supabase
      .from('carousel_panels')
      .select('*')
      .eq('panel_id', 'opening-hours');

    if (carouselError) {
      console.log('❌ Carousel error:', carouselError.message);
    } else if (carouselData && carouselData.length > 0) {
      console.log('✅ Found carousel opening hours data:');
      console.log(JSON.stringify(carouselData[0], null, 2));
    } else {
      console.log('⚠️ No carousel opening hours panel found');
    }

    // Check theme_settings table for opening hours
    console.log('\n📋 Checking theme_settings table...');
    const { data: themeData, error: themeError } = await supabase
      .from('theme_settings')
      .select('*')
      .ilike('setting_key', '%hour%');

    if (themeError) {
      console.log('❌ Theme settings error:', themeError.message);
    } else if (themeData && themeData.length > 0) {
      console.log('✅ Found theme settings with hours:');
      themeData.forEach(setting => {
        console.log(`- ${setting.setting_key}: ${setting.setting_value}`);
      });
    } else {
      console.log('⚠️ No opening hours found in theme_settings');
    }

    // Check for any other tables that might contain opening hours
    console.log('\n📋 Checking for other tables with opening hours...');
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_table_names');

    if (!tablesError && tablesData) {
      console.log('Available tables:', tablesData);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkLiveOpeningHours();
