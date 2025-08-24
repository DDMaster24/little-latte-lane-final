// Debug address field issue in signup
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugAddressIssue() {
  console.log('🔍 DEBUGGING ADDRESS FIELD ISSUE');
  console.log('='.repeat(50));
  
  try {
    // 1. Check profiles table structure
    console.log('\n1️⃣ Checking profiles table structure...');
    const { data: profilesInfo, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table structure:');
      if (profilesInfo && profilesInfo.length > 0) {
        Object.keys(profilesInfo[0]).forEach(key => {
          console.log(`   - ${key}: ${typeof profilesInfo[0][key]} (${profilesInfo[0][key]})`);
        });
      } else {
        console.log('   No profiles found - let\'s check the schema');
      }
    }

    // 2. Test address field specifically
    console.log('\n2️⃣ Testing address field insertion...');
    const testUserId = '00000000-0000-0000-0000-000000000001'; // Fake UUID for test
    
    const { data: insertTest, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        full_name: 'Test User',
        phone: '+27123456789',
        address: '123 Test Street, Test City'
      })
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      console.log('   Code:', insertError.code);
      console.log('   Details:', insertError.details);
    } else {
      console.log('✅ Insert test successful:', insertTest);
      
      // Clean up test record
      await supabase.from('profiles').delete().eq('id', testUserId);
      console.log('🧹 Test record cleaned up');
    }

    // 3. Check auth users and their metadata
    console.log('\n3️⃣ Checking auth users metadata...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth users error:', authError.message);
    } else {
      console.log(`✅ Found ${authUsers.users.length} auth users`);
      authUsers.users.forEach(user => {
        console.log(`\n   User: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Metadata:`, user.raw_user_meta_data);
        console.log(`   App Metadata:`, user.app_metadata);
      });
    }

    // 4. Check current profiles vs auth users
    console.log('\n4️⃣ Comparing profiles vs auth users...');
    const { data: profiles, error: profilesFetchError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesFetchError) {
      console.error('❌ Profiles fetch error:', profilesFetchError.message);
    } else {
      console.log(`✅ Found ${profiles.length} profiles`);
      profiles.forEach(profile => {
        console.log(`\n   Profile: ${profile.email}`);
        console.log(`   Full name: ${profile.full_name}`);
        console.log(`   Phone: ${profile.phone}`);
        console.log(`   Address: "${profile.address}" (${typeof profile.address})`);
        console.log(`   Created: ${profile.created_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 DEBUG COMPLETE');
}

debugAddressIssue()
  .then(() => {
    console.log('\n✨ Debug completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
