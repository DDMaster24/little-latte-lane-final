/**
 * User Role Setup Script
 * Sets up proper user roles and permissions for testing and admin access
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create admin client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupUserRoles() {
  console.log('🚀 Starting user role setup...\n');

  try {
    // Step 1: Get all current users from auth.users
    console.log('📋 Current users in auth.users:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }

    authUsers.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id}) - Created: ${user.created_at}`);
    });

    console.log('\n📋 Current profiles:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.email} - Role: ${profile.role || 'customer'} - Admin: ${profile.is_admin} - Staff: ${profile.is_staff}`);
    });

    console.log('\n🎯 Setting up target user roles...\n');

    // Target user configurations
    const targetUsers = [
      {
        email: 'admin@lll.co.za',
        role: 'admin',
        is_admin: true,
        is_staff: true,
        full_name: 'Admin User',
        description: 'Admin with full system access'
      },
      {
        email: 'staff@lll.co.za',
        role: 'staff',
        is_admin: false,
        is_staff: true,
        full_name: 'Staff User',
        description: 'Staff with kitchen and order management access'
      },
      {
        email: 'user@lll.co.za',
        role: 'customer',
        is_admin: false,
        is_staff: false,
        full_name: 'Customer User',
        description: 'Regular customer access only'
      },
      {
        email: 'ddmaster124@gmail.com',
        role: 'super_admin',
        is_admin: true,
        is_staff: true,
        full_name: 'Darius (Super Admin)',
        description: 'God role - complete system control'
      }
    ];

    // Process each target user
    for (const targetUser of targetUsers) {
      console.log(`🔧 Processing: ${targetUser.email}`);
      
      // Check if user exists in auth.users
      const authUser = authUsers.users.find(u => u.email === targetUser.email);
      
      if (!authUser) {
        console.log(`  ❌ User ${targetUser.email} not found in auth.users`);
        console.log(`  💡 Please create this user in Supabase Dashboard first`);
        continue;
      }

      // Check if profile exists
      const existingProfile = profiles.find(p => p.email === targetUser.email);
      
      if (existingProfile) {
        // Update existing profile
        console.log(`  🔄 Updating existing profile for ${targetUser.email}`);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: targetUser.role,
            is_admin: targetUser.is_admin,
            is_staff: targetUser.is_staff,
            full_name: targetUser.full_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', authUser.id);

        if (updateError) {
          console.log(`  ❌ Error updating profile: ${updateError.message}`);
        } else {
          console.log(`  ✅ Profile updated successfully`);
          console.log(`     Role: ${targetUser.role} | Admin: ${targetUser.is_admin} | Staff: ${targetUser.is_staff}`);
        }
      } else {
        // Create new profile
        console.log(`  ➕ Creating new profile for ${targetUser.email}`);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: targetUser.email,
            role: targetUser.role,
            is_admin: targetUser.is_admin,
            is_staff: targetUser.is_staff,
            full_name: targetUser.full_name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.log(`  ❌ Error creating profile: ${insertError.message}`);
        } else {
          console.log(`  ✅ Profile created successfully`);
          console.log(`     Role: ${targetUser.role} | Admin: ${targetUser.is_admin} | Staff: ${targetUser.is_staff}`);
        }
      }
    }

    // Handle user deletion
    console.log('\n🗑️  Processing user deletion...');
    const userToDelete = 'dariusschutte124@gmail.com';
    const deleteUser = authUsers.users.find(u => u.email === userToDelete);
    
    if (deleteUser) {
      console.log(`🔍 Found user to delete: ${userToDelete}`);
      
      // First delete profile
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deleteUser.id);

      if (profileDeleteError) {
        console.log(`  ❌ Error deleting profile: ${profileDeleteError.message}`);
      } else {
        console.log(`  ✅ Profile deleted successfully`);
      }

      // Then delete auth user
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(deleteUser.id);
      
      if (authDeleteError) {
        console.log(`  ❌ Error deleting auth user: ${authDeleteError.message}`);
      } else {
        console.log(`  ✅ Auth user deleted successfully`);
      }
    } else {
      console.log(`  ℹ️  User ${userToDelete} not found (may already be deleted)`);
    }

    console.log('\n🎉 User role setup completed!');
    console.log('\n📊 Final Summary:');
    console.log('1. admin@lll.co.za - Full admin access (customer + staff + admin)');
    console.log('2. staff@lll.co.za - Staff access (customer + staff panel)');
    console.log('3. user@lll.co.za - Customer access only');
    console.log('4. ddmaster124@gmail.com - Super Admin (god role)');
    console.log('5. dariusschutte124@gmail.com - Deleted');

  } catch (error) {
    console.error('❌ Error in user role setup:', error);
  }
}

// Run the setup
setupUserRoles();
