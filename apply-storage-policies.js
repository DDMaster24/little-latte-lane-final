const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function applyStoragePolicies() {
  console.log('\n📋 Applying Supabase Storage RLS Policies...\n');

  try {
    // Test connection
    const testResult = await sql`SELECT current_database() as database`;
    console.log(`✅ Connected to database: ${testResult[0].database}\n`);

    // Check if policies already exist
    const existingPolicies = await sql`
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'storage'
      AND tablename = 'objects'
    `;

    console.log(`📊 Found ${existingPolicies.length} existing storage policies\n`);

    // Policy 1: Users can upload documents
    console.log('Creating policy: "Users can upload documents"...');
    try {
      await sql`
        CREATE POLICY "Users can upload documents"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'documents' AND
          (storage.foldername(name))[1] IN ('hall-bookings')
        )
      `;
      console.log('✅ Policy "Users can upload documents" created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Policy "Users can upload documents" already exists\n');
      } else {
        throw error;
      }
    }

    // Policy 2: Public can view documents
    console.log('Creating policy: "Public can view documents"...');
    try {
      await sql`
        CREATE POLICY "Public can view documents"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'documents')
      `;
      console.log('✅ Policy "Public can view documents" created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Policy "Public can view documents" already exists\n');
      } else {
        throw error;
      }
    }

    // Policy 3: Users can update their own documents
    console.log('Creating policy: "Users can update own documents"...');
    try {
      await sql`
        CREATE POLICY "Users can update own documents"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[2])
        WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[2])
      `;
      console.log('✅ Policy "Users can update own documents" created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Policy "Users can update own documents" already exists\n');
      } else {
        throw error;
      }
    }

    // Policy 4: Users can delete their own documents
    console.log('Creating policy: "Users can delete own documents"...');
    try {
      await sql`
        CREATE POLICY "Users can delete own documents"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[2])
      `;
      console.log('✅ Policy "Users can delete own documents" created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Policy "Users can delete own documents" already exists\n');
      } else {
        throw error;
      }
    }

    // Verify all policies are in place
    const finalPolicies = await sql`
      SELECT policyname, cmd, qual
      FROM pg_policies
      WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname LIKE '%documents%'
      ORDER BY policyname
    `;

    console.log('='.repeat(70));
    console.log('📊 STORAGE POLICIES VERIFICATION');
    console.log('='.repeat(70));
    console.log(`\n✅ Total storage policies for "documents" bucket: ${finalPolicies.length}\n`);

    finalPolicies.forEach((policy, index) => {
      console.log(`${index + 1}. ${policy.policyname}`);
      console.log(`   Command: ${policy.cmd}`);
      console.log();
    });

    console.log('='.repeat(70));
    console.log('🎉 STORAGE RLS POLICIES APPLIED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('\n✅ All 4 policies are now active:');
    console.log('   1. Users can upload documents (INSERT)');
    console.log('   2. Public can view documents (SELECT)');
    console.log('   3. Users can update own documents (UPDATE)');
    console.log('   4. Users can delete own documents (DELETE)');
    console.log('\n📂 Protected folder structure:');
    console.log('   documents/');
    console.log('   └── hall-bookings/');
    console.log('       ├── bank-proofs/');
    console.log('       └── samro-proofs/\n');

  } catch (error) {
    console.error('\n❌ ERROR applying storage policies:', error.message);
    console.error('\nFull error details:');
    console.error(error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

applyStoragePolicies();
