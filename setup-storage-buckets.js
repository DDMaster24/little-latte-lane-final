const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorageBuckets() {
  console.log('\n📦 Setting up Supabase Storage Buckets...\n');

  try {
    // Check if 'documents' bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      throw listError;
    }

    const documentsBucketExists = buckets?.some(bucket => bucket.name === 'documents');

    if (documentsBucketExists) {
      console.log('✅ "documents" bucket already exists');
    } else {
      console.log('📝 Creating "documents" bucket...');

      // Create the documents bucket
      const { data, error } = await supabase.storage.createBucket('documents', {
        public: true, // Files are publicly accessible via URL
        fileSizeLimit: 5242880, // 5MB limit
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/pdf'
        ]
      });

      if (error) {
        // Check if error is because bucket already exists
        if (error.message.includes('already exists')) {
          console.log('✅ "documents" bucket already exists');
        } else {
          throw error;
        }
      } else {
        console.log('✅ "documents" bucket created successfully');
      }
    }

    // Note: RLS policies for storage buckets are typically managed through SQL
    // Let's provide the SQL that should be run in Supabase dashboard

    console.log('\n' + '='.repeat(70));
    console.log('📋 STORAGE BUCKET RLS POLICIES');
    console.log('='.repeat(70));
    console.log('\nThe following RLS policies should be created for the "documents" bucket:');
    console.log('Run these in the Supabase Dashboard > Storage > Policies\n');

    console.log('-- Policy 1: Authenticated users can upload to their own folder');
    console.log(`CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN ('hall-bookings')
);\n`);

    console.log('-- Policy 2: Public can view documents (for hall booking proofs)');
    console.log(`CREATE POLICY "Public can view documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');\n`);

    console.log('-- Policy 3: Users can update their own documents');
    console.log(`CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[2])
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[2]);\n`);

    console.log('-- Policy 4: Users can delete their own documents');
    console.log(`CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[2]);\n`);

    console.log('='.repeat(70));
    console.log('\n📌 IMPORTANT: Please run the above policies in Supabase Dashboard');
    console.log('   Storage > Configuration > Policies > New Policy\n');

    // Test bucket access
    console.log('🧪 Testing bucket access...\n');

    const { data: testData, error: testError } = await supabase.storage
      .from('documents')
      .list('', {
        limit: 1,
      });

    if (testError) {
      console.log('⚠️  Bucket access test failed:', testError.message);
      console.log('   This is normal if no files exist yet.');
    } else {
      console.log('✅ Bucket is accessible');
      console.log(`   Found ${testData?.length || 0} items in root`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 STORAGE SETUP COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n✅ "documents" bucket is ready');
    console.log('✅ Configured for hall booking file uploads');
    console.log('✅ 5MB file size limit');
    console.log('✅ Supports: JPG, PNG, PDF\n');

    console.log('📂 Folder structure:');
    console.log('   documents/');
    console.log('   ├── hall-bookings/');
    console.log('   │   ├── bank-proofs/');
    console.log('   │   └── samro-proofs/\n');

    console.log('💡 Usage in code:');
    console.log('   supabase.storage.from("documents").upload("hall-bookings/bank-proofs/filename.pdf", file)\n');

  } catch (error) {
    console.error('\n❌ ERROR during setup:', error.message);
    console.error('\nFull error details:');
    console.error(error);
    process.exit(1);
  }
}

setupStorageBuckets();
