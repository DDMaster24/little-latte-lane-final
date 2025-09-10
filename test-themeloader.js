// Test script to debug ThemeLoader behavior
// This will be deleted after use
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testThemeLoaderLogic() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log('🔍 TESTING THEMELOADER LOGIC\n');

  try {
    // 1. Get the actual homepage settings from database
    console.log('📊 Step 1: Fetching homepage settings from database');
    const { data: settings, error } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('category', 'page_editor')
      .like('setting_key', 'homepage-%');

    if (error) {
      console.error('❌ Error fetching settings:', error);
      return;
    }

    console.log(`Found ${settings.length} homepage settings:`);
    settings.forEach(setting => {
      console.log(`  - ${setting.setting_key}: "${setting.setting_value}"`);
    });

    // 2. Simulate what ThemeLoader does
    console.log('\n🎨 Step 2: Simulating ThemeLoader processing');
    
    settings.forEach(setting => {
      // This is the logic from ThemeLoader
      const elementId = setting.setting_key.replace('homepage-', '');
      
      console.log(`\n🔍 Processing setting: ${setting.setting_key}`);
      console.log(`  After removing prefix: elementId = "${elementId}"`);
      console.log(`  Setting value: "${setting.setting_value}"`);
      console.log(`  Looking for DOM element: [data-editable="${elementId}"]`);
      
      // Check what type of content this is
      const isColor = elementId.includes('_color');
      const isBackground = elementId.includes('_background') && !elementId.includes('_background_image');
      const isContent = elementId.includes('_content');
      const isBackgroundImage = elementId.includes('_background_image');
      const isText = !isColor && !isBackground && !isContent && !isBackgroundImage;
      
      console.log(`  Content type analysis:`);
      console.log(`    - isText: ${isText}`);
      console.log(`    - isColor: ${isColor}`);
      console.log(`    - isBackground: ${isBackground}`);
      console.log(`    - isContent: ${isContent}`);
      console.log(`    - isBackgroundImage: ${isBackgroundImage}`);
      
      if (isText) {
        console.log(`  ✅ Would apply as text content to element with data-editable="${elementId}"`);
      } else if (isColor) {
        const baseElementId = elementId.replace('_color', '');
        console.log(`  ✅ Would apply as color to element with data-editable="${baseElementId}"`);
      } else if (isBackground) {
        const baseElementId = elementId.replace('_background', '');
        console.log(`  ✅ Would apply as background to element with data-editable="${baseElementId}"`);
      }
    });

    // 3. Check what the WelcomingSection expects
    console.log('\n🏠 Step 3: What WelcomingSection expects');
    const expectedElements = [
      'main-heading',
      'hero-subheading', 
      'now-open-badge',
      'service-options-badge',
      'cta-heading',
      'cta-description',
      'quality-feature-text',
      'location-feature-text', 
      'parking-feature-text'
    ];
    
    console.log('WelcomingSection has these data-editable elements:');
    expectedElements.forEach(elementId => {
      const hasMatchingSetting = settings.some(s => s.setting_key === `homepage-${elementId}`);
      console.log(`  - data-editable="${elementId}" ${hasMatchingSetting ? '✅ HAS SETTING' : '❌ NO SETTING'}`);
    });

    // 4. Test exact match
    console.log('\n🎯 Step 4: Testing specific case');
    const heroSubheadingSetting = settings.find(s => s.setting_key === 'homepage-hero-subheading');
    if (heroSubheadingSetting) {
      console.log('Found hero-subheading setting:');
      console.log(`  Key: ${heroSubheadingSetting.setting_key}`);
      console.log(`  Value: "${heroSubheadingSetting.setting_value}"`);
      console.log(`  After prefix removal: "hero-subheading"`);
      console.log(`  Should match element: [data-editable="hero-subheading"]`);
      console.log(`  Should set textContent to: "${heroSubheadingSetting.setting_value}"`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testThemeLoaderLogic();
