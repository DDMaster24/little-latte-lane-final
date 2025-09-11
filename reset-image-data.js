import sql from './db.js'

async function resetImageData() {
  try {
    console.log('🔄 Resetting image data to working defaults...');

    // Reset image data to working defaults
    await sql`
      DELETE FROM theme_settings 
      WHERE setting_key IN ('editor_imageUrl', 'editor_imageSize')
    `;

    await sql`
      INSERT INTO theme_settings (setting_key, setting_value, category)
      VALUES 
        ('editor_imageUrl', '/images/logo.svg', 'editor'),
        ('editor_imageSize', '{"width":200,"height":200}', 'editor')
    `;

    console.log('✅ Image data reset successfully!');
    console.log('📸 Image URL: /images/logo.svg');
    console.log('📏 Image Size: 200x200');

  } catch (error) {
    console.error('❌ Failed to reset image data:', error);
  } finally {
    await sql.end();
  }
}

resetImageData();
