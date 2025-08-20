'use server'; // Marks as server actions

import { getSupabaseAdmin } from '@/lib/supabase-server'; // Use server client with service key
import type { Database } from '@/types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export async function checkEmailExists(email: string): Promise<boolean> {
  const trimmedEmail = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();
  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error listing users:', error);
    return false; // Assume not exists on error for security
  }

  return users.users.some((user) => user.email?.toLowerCase() === trimmedEmail);
}

export async function updateUserProfile(
  userId: string,
  field: string,
  value: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔧 Server action: Updating profile field', field, 'for user', userId);
    console.log('🔧 Server action: New value:', value);
    
    const supabase = getSupabaseAdmin();
    console.log('🔧 Server action: Got Supabase ADMIN client (service role)');

    // Check if profile exists
    const { data: _existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('🔧 Server action: Profile check result:', { 
      exists: !checkError, 
      error: checkError?.message,
      code: checkError?.code 
    });

    if (checkError && checkError.code === 'PGRST116') {
      // Profile doesn't exist, create it first
      console.log('📝 Server action: Creating new profile for user:', userId);
      
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          [field]: value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (createError) {
        console.error('❌ Server action: Error creating profile:', createError);
        return { success: false, error: `Create failed: ${createError.message}` };
      }

      console.log('✅ Server action: Profile created successfully');
      return { success: true };
    }

    if (checkError) {
      console.error('❌ Server action: Error checking profile:', checkError);
      return { success: false, error: `Check failed: ${checkError.message}` };
    }

    // Update existing profile
    console.log('🔧 Server action: Updating existing profile...');
    const updateData = {
      [field]: value,
      updated_at: new Date().toISOString(),
    };
    console.log('🔧 Server action: Update data:', updateData);

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Server action: Error updating profile:', updateError);
      return { success: false, error: `Update failed: ${updateError.message}` };
    }

    console.log('✅ Server action: Profile updated successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Server action: Unexpected error:', error);
    return { 
      success: false, 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export async function getOrCreateUserProfile(
  userId: string,
  userEmail?: string
): Promise<{ 
  success: boolean; 
  profile?: ProfileRow; 
  error?: string 
}> {
  try {
    console.log('🔧 Server action: Getting or creating profile for user', userId);
    
    const supabase = getSupabaseAdmin();

    // Try to get existing profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!fetchError) {
      console.log('✅ Profile found');
      return { success: true, profile };
    }

    if (fetchError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('📝 Creating new profile for user:', userId);
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          full_name: null,
          phone: null,
          address: null,
          is_admin: false,
          is_staff: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (createError) {
        console.error('❌ Error creating profile:', createError);
        return { success: false, error: createError.message };
      }

      console.log('✅ Profile created successfully');
      return { success: true, profile: newProfile };
    }

    console.error('❌ Error fetching profile:', fetchError);
    return { success: false, error: fetchError.message };

  } catch (error) {
    console.error('❌ Server action error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
