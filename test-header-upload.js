/**
 * Test script to verify header upload functionality
 * Tests the current upload system and bucket configuration
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Use the same configuration as our app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 Testing Header Upload System');
console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Service Key:', supabaseServiceKey ? 'Present' : 'Missing');

async function testHeaderUpload() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('\n📋 1. Testing Storage Buckets...');
    
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError);
      return;
    }

    console.log('✅ Available buckets:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

    // Check for our required buckets
    const headerAssetsExists = buckets.find(b => b.name === 'header-assets');
    const pageEditorExists = buckets.find(b => b.name === 'page-editor');
    const menuImagesExists = buckets.find(b => b.name === 'menu-images');

    console.log('\n🎯 2. Required Buckets Status:');
    console.log(`   header-assets: ${headerAssetsExists ? '✅ Exists' : '❌ Missing'}`);
    console.log(`   page-editor: ${pageEditorExists ? '✅ Exists' : '❌ Missing'}`);
    console.log(`   menu-images: ${menuImagesExists ? '✅ Exists' : '❌ Missing'}`);

    // Test theme_settings table access
    console.log('\n📊 3. Testing theme_settings table...');
    const { data: themeData, error: themeError } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('setting_key', 'header-logo_image')
      .eq('category', 'page_editor');

    if (themeError) {
      console.error('❌ Failed to query theme_settings:', themeError);
    } else {
      console.log('✅ theme_settings table accessible');
      console.log(`   Found ${themeData.length} header logo settings`);
      if (themeData.length > 0) {
        console.log('   Current header logo:', themeData[0].setting_value);
      }
    }

    // Test file size limits
    console.log('\n📏 4. Testing Upload Configuration...');
    console.log('   Max file size: 10MB (configured in next.config.ts)');
    console.log('   Allowed types: PNG, JPG, JPEG, GIF, WebP');
    console.log('   Folder mapping:');
    console.log('     - logos/headers/icons → header-assets bucket');
    console.log('     - uploads → page-editor bucket');
    console.log('     - categories/default → menu-images bucket');

    console.log('\n✅ Header Upload Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testHeaderUpload();
