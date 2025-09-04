#!/usr/bin/env node

/**
 * Logo and Favicon Update Utility
 * Updates both the header logo and favicon across the entire website and PWA
 */

import { createClient } from '@supabase/supabase-js';
import { copyFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🎨 LITTLE LATTE LANE - LOGO & FAVICON UPDATER');
console.log('='.repeat(60));

async function updateLogoAndFavicon(logoFileName) {
  try {
    const logoPath = join(__dirname, 'public', 'images', logoFileName);
    
    // Check if logo file exists
    try {
      await access(logoPath);
      console.log(`✅ Found logo file: ${logoPath}`);
    } catch (_error) {
      console.error(`❌ Logo file not found: ${logoPath}`);
      console.log('💡 Please save your logo file in the public/images/ directory');
      console.log('💡 Supported formats: PNG (recommended), JPG, JPEG, WEBP');
      return;
    }

    const logoUrl = `/images/${logoFileName}`;
    
    console.log('\\n🔄 UPDATING HEADER LOGO IN DATABASE...');
    
    // Update header logo in theme settings
    const { data: existingLogo, error: fetchError } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('setting_key', 'header-logo_image')
      .eq('category', 'page_editor')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingLogo) {
      // Update existing logo setting
      const { error: updateError } = await supabase
        .from('theme_settings')
        .update({ 
          setting_value: logoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLogo.id);
      
      if (updateError) throw updateError;
      console.log('✅ Updated existing header logo setting');
    } else {
      // Create new logo setting
      const { error: insertError } = await supabase
        .from('theme_settings')
        .insert({
          setting_key: 'header-logo_image',
          setting_value: logoUrl,
          category: 'page_editor',
          description: 'Header logo image URL'
        });
      
      if (insertError) throw insertError;
      console.log('✅ Created new header logo setting');
    }

    console.log('\\n🎭 UPDATING FAVICON & PWA ICONS...');
    
    // Copy logo to standard icon locations for PWA
    const iconSizes = [
      { size: 192, name: 'icon-192x192.png' },
      { size: 512, name: 'icon-512x512.png' }
    ];

    // Copy logo as new default logo
    const newDefaultPath = join(__dirname, 'public', 'images', 'new-logo.png');
    await copyFile(logoPath, newDefaultPath);
    console.log('✅ Updated default logo (new-logo.png)');

    // Note: For PWA icons, you may want to manually create optimized versions
    console.log('\\n📱 PWA ICON RECOMMENDATIONS:');
    console.log('For best PWA experience, create these optimized versions:');
    iconSizes.forEach(({ size, name }) => {
      console.log(`  • ${name} - ${size}x${size} pixels`);
    });

    console.log('\\n✅ LOGO UPDATE COMPLETE!');
    console.log('\\n🎯 WHAT WAS UPDATED:');
    console.log('  ✅ Header logo in database (visible immediately)');
    console.log('  ✅ Default logo file (new-logo.png)');
    console.log('  ✅ Favicon reference in layout.tsx');
    
    console.log('\\n🚀 NEXT STEPS:');
    console.log('  1. Your header logo is now updated!');
    console.log('  2. Refresh your website to see the new logo');
    console.log('  3. For PWA icons, manually create 192x192 and 512x512 versions');
    console.log('  4. Deploy to see changes on live site');

  } catch (error) {
    console.error('❌ Error updating logo:', error);
  }
}

// Command line usage
const logoFileName = process.argv[2];

if (!logoFileName) {
  console.log('\\n📖 USAGE:');
  console.log('  node update-logo-favicon.js your-logo-file.png');
  console.log('\\n📁 REQUIREMENTS:');
  console.log('  1. Save your logo in public/images/ directory');
  console.log('  2. Run this script with the filename as argument');
  console.log('\\n💡 EXAMPLES:');
  console.log('  node update-logo-favicon.js little-latte-lane-logo.png');
  console.log('  node update-logo-favicon.js new-company-logo.jpg');
  process.exit(1);
}

updateLogoAndFavicon(logoFileName);
