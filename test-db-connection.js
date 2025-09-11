import sql from './db.js'

async function testConnection() {
  try {
    console.log('🧪 Testing official database connection...\n');

    // Test basic connection
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Basic connection successful:', result[0]);

    // Check theme_settings table
    const themeTest = await sql`
      SELECT COUNT(*) as count 
      FROM theme_settings
    `;
    console.log('✅ theme_settings table accessible:', themeTest[0]);

    // Test inserting editor data
    await sql`
      INSERT INTO theme_settings (setting_key, setting_value, category)
      VALUES ('test_editor_connection', 'working', 'editor')
      ON CONFLICT (setting_key) 
      DO UPDATE SET 
        setting_value = 'working',
        updated_at = NOW()
    `;
    console.log('✅ Insert/Update test successful');

    // Clean up test data
    await sql`DELETE FROM theme_settings WHERE setting_key = 'test_editor_connection'`;
    console.log('✅ Cleanup successful');

    console.log('\n🎯 DATABASE CONNECTION FULLY OPERATIONAL!');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await sql.end();
  }
}

testConnection();
