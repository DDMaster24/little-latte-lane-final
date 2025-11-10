const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function runMigration() {
  console.log('\n🔄 Updating hall_bookings table schema...\n');

  try {
    // Test connection
    const testResult = await sql`SELECT current_database() as database`;
    console.log(`✅ Connected to database: ${testResult[0].database}\n`);

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'database-hall-bookings-update.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📝 Executing migration SQL...\n');

    // Execute the migration
    await sql.unsafe(sqlContent);

    console.log('✅ Migration executed successfully!\n');

    // Verify the new columns
    const columns = await sql`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'hall_bookings'
      ORDER BY ordinal_position
    `;

    console.log('='.repeat(70));
    console.log('📊 UPDATED HALL_BOOKINGS TABLE STRUCTURE');
    console.log('='.repeat(70));
    console.log(`\nTotal columns: ${columns.length}\n`);

    columns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name}`);
      console.log(`   Type: ${col.data_type}`);
      console.log(`   Nullable: ${col.is_nullable}`);
      if (col.column_default) {
        console.log(`   Default: ${col.column_default}`);
      }
      console.log();
    });

    console.log('='.repeat(70));
    console.log('🎉 DATABASE UPDATE COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n✅ New columns added:');
    console.log('   • bank_name');
    console.log('   • bank_account_number');
    console.log('   • bank_branch_code');
    console.log('   • pdf_form_url (for generated PDF)');
    console.log('   • proof_of_payment_url (optional user upload)');
    console.log('   • music_details');
    console.log('   • catering_details');
    console.log('   • special_requirements');
    console.log('\n❌ Removed columns:');
    console.log('   • bank_proof_document_url (no longer needed)');
    console.log('   • samro_sampra_proof_url (no longer needed)');
    console.log();

  } catch (error) {
    console.error('\n❌ ERROR during migration:', error.message);
    console.error('\nFull error details:');
    console.error(error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
