// Fix the auth trigger function
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function fixAuthTrigger() {
  console.log('🔧 Fixing auth trigger function...');
  
  const createFunctionSQL = `
-- Create or replace the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table with safe data extraction
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    address,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
`;

  try {
    // We need to execute this as raw SQL
    console.log('📝 Creating updated handle_new_user function...');
    
    // For now, let's create a migration file that can be applied manually
    console.log('✅ Function SQL prepared. This needs to be run in Supabase SQL editor.');
    
    return createFunctionSQL;
    
  } catch (err) {
    console.error('💥 Failed to fix auth trigger:', err);
    return null;
  }
}

async function testBasicInsert() {
  console.log('🔍 Testing basic profile insert...');
  
  try {
    const testId = crypto.randomUUID();
    const testEmail = `test-profile-${Date.now()}@example.com`;
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: testId,
        email: testEmail,
        full_name: 'Test User',
        phone: '+27123456789',
        address: '123 Test Street'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Basic profile insert failed:', error);
      return false;
    }
    
    console.log('✅ Basic profile insert successful:', data.id);
    
    // Cleanup
    await supabase.from('profiles').delete().eq('id', testId);
    console.log('🧹 Test profile cleaned up');
    
    return true;
  } catch (err) {
    console.error('💥 Basic insert test failed:', err);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting auth trigger fix...\n');
  
  const basicInsertWorks = await testBasicInsert();
  
  if (basicInsertWorks) {
    const fixSQL = await fixAuthTrigger();
    
    if (fixSQL) {
      console.log('\n📋 SQL to fix auth trigger:');
      console.log('=' .repeat(80));
      console.log(fixSQL);
      console.log('=' .repeat(80));
      console.log('\n💡 Please run this SQL in your Supabase SQL editor to fix the auth trigger.');
    }
  }
  
  console.log('\n✅ Auth trigger diagnosis complete!');
}

main().catch(console.error);
