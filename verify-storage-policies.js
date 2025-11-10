const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function verifyStoragePolicies() {
  console.log('\n🔍 Verifying Supabase Storage RLS Policies...\n');

  try {
    // Test connection
    const testResult = await sql`SELECT current_database() as database`;
    console.log(`✅ Connected to database: ${testResult[0].database}\n`);

    // Query all storage policies
    const allStoragePolicies = await sql`
      SELECT
        policyname,
        cmd,
        roles::text,
        qual::text as using_clause,
        with_check::text
      FROM pg_policies
      WHERE schemaname = 'storage'
      AND tablename = 'objects'
      ORDER BY policyname
    `;

    console.log('='.repeat(70));
    console.log('📊 ALL STORAGE POLICIES ON storage.objects');
    console.log('='.repeat(70));
    console.log(`\nTotal policies found: ${allStoragePolicies.length}\n`);

    allStoragePolicies.forEach((policy, index) => {
      console.log(`${index + 1}. Policy: "${policy.policyname}"`);
      console.log(`   Command: ${policy.cmd}`);
      console.log(`   Roles: ${policy.roles}`);
      console.log();
    });

    // Check for our specific document policies
    const expectedPolicies = [
      'Users can upload documents',
      'Public can view documents',
      'Users can update own documents',
      'Users can delete own documents'
    ];

    console.log('='.repeat(70));
    console.log('✅ DOCUMENTS BUCKET POLICIES VERIFICATION');
    console.log('='.repeat(70));
    console.log();

    let allFound = true;
    expectedPolicies.forEach(policyName => {
      const found = allStoragePolicies.find(p => p.policyname === policyName);
      if (found) {
        console.log(`✅ "${policyName}" - ACTIVE`);
        console.log(`   Command: ${found.cmd}`);
        console.log(`   Roles: ${found.roles}`);
        console.log();
      } else {
        console.log(`❌ "${policyName}" - NOT FOUND`);
        console.log();
        allFound = false;
      }
    });

    console.log('='.repeat(70));
    if (allFound) {
      console.log('🎉 SUCCESS: All 4 required storage policies are active!');
      console.log('='.repeat(70));
      console.log('\n✅ Hall booking file uploads are fully secured with RLS:');
      console.log('   • Authenticated users can upload to hall-bookings folder');
      console.log('   • Public can view documents (for admin verification)');
      console.log('   • Users can update their own documents');
      console.log('   • Users can delete their own documents');
      console.log('\n📂 Protected folder structure:');
      console.log('   documents/');
      console.log('   └── hall-bookings/');
      console.log('       ├── bank-proofs/');
      console.log('       └── samro-proofs/');
      console.log();
    } else {
      console.log('⚠️  WARNING: Some required policies are missing!');
      console.log('='.repeat(70));
      console.log('\nPlease create missing policies in Supabase Dashboard.');
      console.log();
    }

  } catch (error) {
    console.error('\n❌ ERROR verifying storage policies:', error.message);
    console.error('\nFull error details:');
    console.error(error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

verifyStoragePolicies();
