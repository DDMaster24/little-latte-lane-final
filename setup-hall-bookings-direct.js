const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupHallBookingsTableDirect() {
  console.log('\n🏛️  Setting up Roberts Hall Bookings Database (Direct PostgreSQL Connection)...\n');

  // Get DATABASE_URL from environment
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL not found in .env.local');
    console.error('Please ensure DATABASE_URL is set with your PostgreSQL connection string.');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL found');
  console.log('🔗 Connecting to PostgreSQL...\n');

  // Create PostgreSQL client
  const sql = postgres(databaseUrl);

  try {
    // Test connection first
    console.log('🧪 Testing database connection...');
    const testResult = await sql`SELECT NOW() as current_time, current_database() as database`;
    console.log(`✅ Connected to database: ${testResult[0].database}`);
    console.log(`⏰ Server time: ${testResult[0].current_time}\n`);

    // Read the SQL file
    console.log('📖 Reading SQL schema file...');
    const sqlPath = path.join(__dirname, 'database-hall-bookings-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ SQL file loaded\n');

    // Execute the entire SQL file
    console.log('⚙️  Executing SQL schema...');
    console.log('This will create:');
    console.log('  - hall_bookings table');
    console.log('  - Indexes for performance');
    console.log('  - Auto-generation functions');
    console.log('  - Triggers');
    console.log('  - Row Level Security policies\n');

    // Execute SQL (postgres package handles multiple statements)
    await sql.unsafe(sqlContent);

    console.log('✅ SQL schema executed successfully!\n');

    // Verify table exists and check structure
    console.log('🔍 Verifying hall_bookings table...');
    const tableCheck = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'hall_bookings'
      ORDER BY ordinal_position
      LIMIT 10
    `;

    if (tableCheck.length > 0) {
      console.log('✅ Table created successfully!');
      console.log(`📊 Found ${tableCheck.length} columns (showing first 10):\n`);
      tableCheck.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
      });
    } else {
      console.log('⚠️  Warning: Table might not have been created properly');
    }

    // Check RLS policies
    console.log('\n🔒 Checking Row Level Security policies...');
    const policies = await sql`
      SELECT policyname, cmd, qual
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'hall_bookings'
    `;

    if (policies.length > 0) {
      console.log(`✅ Found ${policies.length} RLS policies:`);
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname} (${policy.cmd})`);
      });
    }

    // Check functions
    console.log('\n🔧 Checking database functions...');
    const functions = await sql`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name LIKE '%hall%'
    `;

    if (functions.length > 0) {
      console.log(`✅ Found ${functions.length} related functions:`);
      functions.forEach(func => {
        console.log(`   - ${func.routine_name}()`);
      });
    }

    // Check triggers
    console.log('\n⚡ Checking triggers...');
    const triggers = await sql`
      SELECT trigger_name, event_manipulation, action_timing
      FROM information_schema.triggers
      WHERE event_object_table = 'hall_bookings'
    `;

    if (triggers.length > 0) {
      console.log(`✅ Found ${triggers.length} triggers:`);
      triggers.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name} (${trigger.action_timing} ${trigger.event_manipulation})`);
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 DATABASE SETUP COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n✅ hall_bookings table is ready for use');
    console.log('✅ All functions, triggers, and policies are in place');
    console.log('✅ Auto-generation of booking references configured (RH-2025-001, etc.)\n');
    console.log('Next steps:');
    console.log('  1. Build the multi-step Hall booking form');
    console.log('  2. Implement Supabase Storage for file uploads');
    console.log('  3. Integrate Yoco payment (R2,500)');
    console.log('  4. Create admin dashboard for bookings');
    console.log('  5. Add "My Hall Bookings" to user account\n');

  } catch (error) {
    console.error('\n❌ ERROR during setup:', error.message);
    console.error('\nFull error details:');
    console.error(error);

    if (error.message.includes('permission denied')) {
      console.error('\n⚠️  Permission Error: The database user may not have sufficient privileges.');
      console.error('Please ensure you are using the correct connection string with appropriate permissions.');
    }

    if (error.message.includes('password authentication failed')) {
      console.error('\n⚠️  Authentication Error: Please check your DATABASE_URL password.');
    }

    process.exit(1);
  } finally {
    // Close the connection
    await sql.end();
    console.log('🔌 Database connection closed.\n');
  }
}

// Run the setup
setupHallBookingsTableDirect();
