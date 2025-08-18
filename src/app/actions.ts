'use server'; // Marks as server actions

import { supabaseServer } from '@/lib/supabaseServer'; // Use server client with service key
import { getSupabaseServer } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export async function checkEmailExists(email: string): Promise<boolean> {
  const trimmedEmail = email.trim().toLowerCase();
  const { data: users, error } = await supabaseServer.auth.admin.listUsers();

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
    
    const supabase = await getSupabaseServer();

    // Check if profile exists
    const { data: _existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // Profile doesn't exist, create it first
      console.log('📝 Creating new profile for user:', userId);
      
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          [field]: value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (createError) {
        console.error('❌ Error creating profile:', createError);
        return { success: false, error: createError.message };
      }

      console.log('✅ Profile created successfully');
      return { success: true };
    }

    if (checkError) {
      console.error('❌ Error checking profile:', checkError);
      return { success: false, error: checkError.message };
    }

    // Update existing profile
    const updateData = {
      [field]: value,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log('✅ Profile updated successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Server action error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
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
    
    const supabase = await getSupabaseServer();

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
