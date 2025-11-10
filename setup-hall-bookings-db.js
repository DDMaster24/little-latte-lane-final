const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupHallBookingsTable() {
  console.log('\n🏛️  Setting up Roberts Hall Bookings Database...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database-hall-bookings-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements (simple split by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments and empty statements
      if (statement.trim().startsWith('--') || statement.trim().length < 5) {
        continue;
      }

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);

        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          // Try alternative method - direct query for CREATE TABLE
          if (statement.includes('CREATE TABLE')) {
            console.log('   Using alternative creation method...');
            // We'll handle this differently - Supabase doesn't allow direct SQL execution
            // We need to use the Supabase dashboard or migration files
            console.log('   ⚠️  Table creation requires Supabase Dashboard or Migration');
          } else {
            console.log(`   ❌ Error: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log('   ✅ Success');
          successCount++;
        }
      } catch (err) {
        console.log(`   ⚠️  ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));

    // Verify table exists
    console.log('\n🔍 Verifying hall_bookings table...');
    const { data, error } = await supabase
      .from('hall_bookings')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Table verification failed:', error.message);
      console.log('\n📋 MANUAL SETUP REQUIRED:');
      console.log('   Please run the SQL in: database-hall-bookings-schema.sql');
      console.log('   Via Supabase Dashboard > SQL Editor\n');
      return false;
    } else {
      console.log('✅ Table exists and is accessible!');
      console.log('\n🎉 Database setup complete!\n');
      return true;
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n📋 MANUAL SETUP REQUIRED:');
    console.log('   Please run the SQL in: database-hall-bookings-schema.sql');
    console.log('   Via Supabase Dashboard > SQL Editor\n');
    return false;
  }
}

setupHallBookingsTable();
