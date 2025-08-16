/**
 * Debug Authentication State
 * 
 * This script helps debug authentication issues by checking:
 * 1. Current session state
 * 2. Profile data
 * 3. Auth state changes
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://awytuszmunxvthuizyur.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MjMxMzQsImV4cCI6MjA1MDE5OTEzNH0.VKb6Bw2Vj7Zx2vrFr9HgdgW-Dd5dJPnMTN6CQ2Qkr9s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAuth() {
  console.log('🔍 Authentication Debug Start');
  console.log('==================================');
  
  try {
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
      return;
    }
    
    if (!session) {
      console.log('❌ No active session found');
      return;
    }
    
    console.log('✅ Active session found');
    console.log('📧 User email:', session.user.email);
    console.log('🆔 User ID:', session.user.id);
    console.log('⏰ Session expires at:', new Date(session.expires_at * 1000));
    
    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, username, address, phone')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Error getting profile:', profileError);
      console.log('💡 This might be the issue - profile not found or accessible');
    } else {
      console.log('✅ Profile found');
      console.log('👤 Username:', profile.username || 'Not set');
      console.log('🎭 Role:', profile.role || 'Not set');
    }
    
    // Test profiles table access
    const { data: _profilesTest, error: profilesTestError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (profilesTestError) {
      console.error('❌ Cannot access profiles table:', profilesTestError);
      console.log('💡 This indicates RLS policy issues');
    } else {
      console.log('✅ Profiles table accessible');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
  
  console.log('==================================');
  console.log('🏁 Authentication Debug Complete');
}

debugAuth();
