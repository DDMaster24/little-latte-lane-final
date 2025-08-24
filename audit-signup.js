// Audit signup functionality against live database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function auditSignupSystem() {
  console.log('🔍 SIGNUP SYSTEM AUDIT');
  console.log('='.repeat(50));
  
  try {
    // 1. Check if profiles table exists and its structure
    console.log('\n1️⃣ Checking profiles table structure...');
    const { data: profilesInfo, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
      console.log('   Sample structure:', Object.keys(profilesInfo[0] || {}));
    }

    // 2. Check current profiles count
    const { count: profileCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`   Current profiles count: ${profileCount}`);
    }

    // 3. Check auth.users table access
    console.log('\n2️⃣ Checking auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth users error:', authError.message);
    } else {
      console.log(`✅ Auth users accessible (${authUsers.users.length} users)`);
      
      // Check for users without profiles
      if (authUsers.users.length > 0) {
        const userIds = authUsers.users.map(u => u.id);
        const { data: matchingProfiles } = await supabase
          .from('profiles')
          .select('id')
          .in('id', userIds);
        
        const usersWithoutProfiles = userIds.filter(id => 
          !matchingProfiles?.find(p => p.id === id)
        );
        
        if (usersWithoutProfiles.length > 0) {
          console.log(`⚠️  Found ${usersWithoutProfiles.length} users without profiles:`);
          usersWithoutProfiles.forEach(id => {
            const user = authUsers.users.find(u => u.id === id);
            console.log(`   - ${user.email} (${id})`);
          });
        } else {
          console.log('✅ All auth users have profiles');
        }
      }
    }

    // 4. Check for handle_new_user function
    console.log('\n3️⃣ Checking handle_new_user function...');
    const { data: functionExists, error: funcError } = await supabase.rpc('handle_new_user');
    
    if (funcError) {
      if (funcError.message.includes('function') && funcError.message.includes('does not exist')) {
        console.log('❌ handle_new_user function does NOT exist');
      } else {
        console.log('⚠️  Function exists but error calling it:', funcError.message);
      }
    } else {
      console.log('✅ handle_new_user function exists and callable');
    }

    // 5. Check triggers on auth.users
    console.log('\n4️⃣ Checking database triggers...');
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('*')
      .eq('event_object_table', 'users');
    
    if (triggerError) {
      console.log('⚠️  Cannot access trigger information:', triggerError.message);
    } else {
      console.log(`Found ${triggers?.length || 0} triggers on users table`);
      triggers?.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name}: ${trigger.action_timing} ${trigger.event_manipulation}`);
      });
    }

  } catch (error) {
    console.error('❌ Audit failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 AUDIT COMPLETE');
}

// Test a real signup attempt
async function testSignup() {
  console.log('\n🧪 TESTING SIGNUP PROCESS');
  console.log('='.repeat(50));
  
  const testEmail = `test.user.${Date.now()}@gmail.com`;
  const testPassword = 'Test123!@#';
  
  try {
    console.log(`\n📝 Attempting signup with: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          phone: '+27123456789',
          address: '123 Test Street'
        }
      }
    });
    
    if (error) {
      console.error('❌ Signup failed:', error.message);
      return;
    }
    
    console.log('✅ Signup successful!');
    console.log('   User ID:', data.user?.id);
    console.log('   Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
    
    // Check if profile was created
    if (data.user?.id) {
      console.log('\n🔍 Checking if profile was created...');
      
      // Wait a moment for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Profile not created:', profileError.message);
        console.log('   This confirms the signup issue exists!');
      } else {
        console.log('✅ Profile created successfully:');
        console.log('   Full name:', profile.full_name);
        console.log('   Phone:', profile.phone);
        console.log('   Address:', profile.address);
      }
      
      // Clean up test user
      console.log('\n🧹 Cleaning up test user...');
      await supabase.auth.admin.deleteUser(data.user.id);
      console.log('✅ Test user cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test signup failed:', error.message);
  }
}

// Run the audit
auditSignupSystem()
  .then(() => testSignup())
  .then(() => {
    console.log('\n✨ Audit and test completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
