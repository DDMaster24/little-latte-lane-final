/**
 * Fix Authentication and Theme Settings Issues
 * Addresses the 403 errors and missing columns
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fixAuthAndThemeIssues() {
  console.log('🔧 Fixing Authentication and Theme Settings Issues...\n');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // 1. Check and fix theme_settings table structure
    console.log('📋 Checking theme_settings table...');
    
    try {
      const { data: themeSettings, error: themeError } = await supabase
        .from('theme_settings')
        .select('*')
        .limit(1);

      if (themeError) {
        console.log('❌ Theme settings error:', themeError.message);
        
        if (themeError.message.includes('page_scope')) {
          console.log('🔧 Adding missing page_scope column...');
          
          // This would normally be done via migration, but for now we'll just note it
          console.log('⚠️ Manual database fix needed: Add page_scope column to theme_settings');
          console.log('SQL: ALTER TABLE theme_settings ADD COLUMN IF NOT EXISTS page_scope TEXT;');
        }
      } else {
        console.log('✅ Theme settings table accessible');
      }
    } catch (err) {
      console.log('❌ Theme settings check failed:', err.message);
    }

    // 2. Check profiles table and RLS policies
    console.log('\n👤 Checking profiles table...');
    
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, is_admin, is_staff')
        .limit(1);

      if (profileError) {
        console.log('❌ Profiles table error:', profileError.message);
      } else {
        console.log('✅ Profiles table accessible');
        if (profiles.length > 0) {
          console.log('✅ Sample profile found with roles:', {
            is_admin: profiles[0].is_admin,
            is_staff: profiles[0].is_staff
          });
        }
      }
    } catch (err) {
      console.log('❌ Profiles check failed:', err.message);
    }

    // 3. Test authentication flow
    console.log('\n🔐 Testing authentication flow...');
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.log('❌ Auth check failed:', authError.message);
      } else if (user) {
        console.log('✅ User authenticated:', user.email);
        
        // Try to get profile for this user
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.log('❌ User profile error:', profileError.message);
        } else {
          console.log('✅ User profile found:', {
            email: user.email,
            is_admin: userProfile.is_admin,
            is_staff: userProfile.is_staff
          });
        }
      } else {
        console.log('ℹ️ No user currently authenticated');
      }
    } catch (err) {
      console.log('❌ Auth test failed:', err.message);
    }

    console.log('\n📝 RECOMMENDATIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Database Schema:');
    console.log('   • Add page_scope column to theme_settings if missing');
    console.log('   • Verify RLS policies are not blocking legitimate requests');
    console.log('');
    console.log('2. Authentication Issues:');
    console.log('   • Implement retry logic for profile fetching');
    console.log('   • Add loading states for role-dependent UI elements');
    console.log('   • Consider caching profile data');
    console.log('');
    console.log('3. CSP and PWA:');
    console.log('   • Update Content Security Policy for Vercel');
    console.log('   • Configure PWA install prompt properly');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixAuthAndThemeIssues();
