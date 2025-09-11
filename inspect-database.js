import sql from './db.js'

async function inspectDatabase() {
  try {
    console.log('✅ Connecting to Supabase database...\n');

    // Test connection and list all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('📋 CURRENT TABLES:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // Check theme_settings table specifically
    console.log('\n🎨 CHECKING THEME_SETTINGS TABLE:');
    try {
      const themeStructure = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'theme_settings' 
        ORDER BY ordinal_position;
      `;
      
      if (themeStructure.length > 0) {
        console.log('  ✅ theme_settings table exists!');
        console.log('  Columns:');
        themeStructure.forEach(col => {
          console.log(`    - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        // Check existing data
        const sampleData = await sql`SELECT * FROM theme_settings LIMIT 5`;
        console.log(`\n  📊 Sample data (${sampleData.length} rows):`);
        sampleData.forEach(row => {
          console.log(`    ${JSON.stringify(row)}`);
        });
      } else {
        console.log('  ❌ theme_settings table does not exist');
      }
    } catch (error) {
      console.log(`  ❌ Error checking theme_settings: ${error.message}`);
    }

    console.log('\n🎯 DATABASE INSPECTION COMPLETE');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await sql.end();
  }
}

inspectDatabase();
