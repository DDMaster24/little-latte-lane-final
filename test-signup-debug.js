// Test signup process and database connectivity
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
  console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testDatabase() {
  console.log('🔍 Testing database connectivity...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (err) {
    console.error('💥 Database test failed:', err);
    return false;
  }
}

async function testAuthTrigger() {
  console.log('🔍 Testing auth trigger and profile creation...');
  
  const testEmail = `test-signup-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  
  try {
    console.log('📧 Creating test user with email:', testEmail);
    
    // Create user with admin API
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        username: 'testuser',
        address: '123 Test Street',
        phone: '+27123456789'
      }
    });
    
    if (userError) {
      console.error('❌ User creation failed:', userError);
      return;
    }
    
    console.log('✅ User created with ID:', userData.user.id);
    
    // Wait for trigger to execute
    console.log('⏱️ Waiting for trigger to create profile...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      console.log('📋 Profile error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details
      });
    } else {
      console.log('✅ Profile created successfully:', {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        created_at: profile.created_at
      });
    }
    
    // Check if metadata was properly transferred
    console.log('📋 User metadata:', userData.user.user_metadata);
    
    // Cleanup
    await supabase.auth.admin.deleteUser(userData.user.id);
    console.log('🧹 Test user deleted');
    
  } catch (err) {
    console.error('💥 Auth trigger test failed:', err);
  }
}

async function checkTriggerExists() {
  console.log('🔍 Checking if auth trigger exists...');
  
  try {
    // Use a simpler query to check for trigger
    const { data, error } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_object_table, action_statement')
      .eq('trigger_name', 'on_auth_user_created');
    
    if (error) {
      console.log('⚠️ Could not query triggers directly, trying alternative...');
      console.log('Error:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Auth trigger exists:', data[0]);
    } else {
      console.log('❌ Auth trigger NOT found in query results');
    }
  } catch (err) {
    console.error('💥 Trigger check failed:', err);
  }
}

async function main() {
  console.log('🚀 Starting signup debugging...\n');
  
  const dbConnected = await testDatabase();
  if (!dbConnected) return;
  
  await checkTriggerExists();
  await testAuthTrigger();
  
  console.log('\n✅ Debugging complete!');
}

main().catch(console.error);
