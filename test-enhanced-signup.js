// Test the enhanced signup form with fallback profile creation
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testEnhancedSignup() {
  console.log('🔍 Testing enhanced signup process...');
  
  const testEmail = `test-enhanced-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  const testData = {
    full_name: 'Test User Enhanced',
    phone: '+27123456789',
    address: '123 Enhanced Test Street'
  };
  
  try {
    console.log('📧 Starting enhanced signup with:', testEmail);
    
    // Step 1: Create the user account (like our enhanced form)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: testData
      }
    });

    if (authError) {
      console.error('❌ Auth signup failed:', authError);
      return;
    }

    console.log('✅ User account created:', authData.user?.id);

    if (!authData.user?.id) {
      console.error('❌ No user ID returned');
      return;
    }

    // Step 2: Wait and check if profile was created by trigger
    console.log('⏱️ Waiting for trigger to create profile...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    let profileExists = false;
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (!checkError && existingProfile) {
      console.log('✅ Profile created by trigger:', existingProfile);
      profileExists = true;
    } else {
      console.log('⚠️ Profile not created by trigger, creating manually...');
      
      // Step 3: Manual profile creation (fallback)
      const { data: manualProfile, error: manualError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: testData.full_name,
          phone: testData.phone,
          address: testData.address,
        })
        .select()
        .single();

      if (manualError) {
        console.error('❌ Manual profile creation failed:', manualError);
      } else {
        console.log('✅ Profile created manually:', manualProfile);
        profileExists = true;
      }
    }

    if (profileExists) {
      console.log('🎉 Enhanced signup process successful!');
      
      // Test that we can retrieve the profile
      const { data: finalProfile, error: finalError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (!finalError && finalProfile) {
        console.log('📋 Final profile data:', {
          id: finalProfile.id,
          email: finalProfile.email,
          full_name: finalProfile.full_name,
          phone: finalProfile.phone,
          address: finalProfile.address
        });
      }
    }

    // Cleanup - note: in production we wouldn't delete the user
    console.log('🧹 Cleaning up test user...');
    // We can't delete the user with anon key, so we'll leave it
    console.log('ℹ️ Test user will remain (normal in testing)');

  } catch (err) {
    console.error('💥 Enhanced signup test failed:', err);
  }
}

async function main() {
  console.log('🚀 Starting enhanced signup test...\n');
  
  await testEnhancedSignup();
  
  console.log('\n✅ Enhanced signup test complete!');
}

main().catch(console.error);
