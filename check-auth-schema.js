// Check current database schema and functions
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkProfilesTable() {
  console.log('🔍 Checking profiles table structure...');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Profiles table error:', error);
      return;
    }
    
    console.log('✅ Profiles table accessible');
    
    // Check existing profiles count
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`📊 Current profiles count: ${count}`);
    }
  } catch (err) {
    console.error('💥 Profiles check failed:', err);
  }
}

async function testClientSignup() {
  console.log('🔍 Testing client-side signup...');
  
  const testEmail = `test-client-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  
  try {
    // Use client-side auth like the actual form
    const clientSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('📧 Attempting client signup with:', testEmail);
    
    const { data, error } = await clientSupabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: 'testuser',
          address: '123 Test Street',
          phone: '+27123456789'
        }
      }
    });
    
    if (error) {
      console.error('❌ Client signup failed:', error);
      console.log('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      return;
    }
    
    console.log('✅ Client signup successful!');
    console.log('User ID:', data.user?.id);
    console.log('User email:', data.user?.email);
    console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
    
    if (data.user?.id) {
      // Check if profile was created
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Profile creation failed:', profileError);
      } else {
        console.log('✅ Profile created:', {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address
        });
      }
      
      // Cleanup - delete user
      await supabase.auth.admin.deleteUser(data.user.id);
      console.log('🧹 Test user cleaned up');
    }
    
  } catch (err) {
    console.error('💥 Client signup test failed:', err);
  }
}

async function main() {
  console.log('🚀 Starting database schema check...\n');
  
  await checkProfilesTable();
  await testClientSignup();
  
  console.log('\n✅ Schema check complete!');
}

main().catch(console.error);
