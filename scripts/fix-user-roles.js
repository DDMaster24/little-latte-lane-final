/**
 * Fix User Role Issues
 * Addresses the role constraint and foreign key deletion issues
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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserRoleIssues() {
  console.log('🔧 Fixing user role issues...\n');

  try {
    // Fix 1: Update ddmaster124@gmail.com to admin role (not super_admin)
    console.log('🎯 Fix 1: Setting ddmaster124@gmail.com as admin with super privileges...');
    
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const superUser = authUsers.users.find(u => u.email === 'ddmaster124@gmail.com');
    
    if (superUser) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',  // Use 'admin' instead of 'super_admin'
          is_admin: true,
          is_staff: true,
          full_name: 'Darius (Super Admin)',
          updated_at: new Date().toISOString()
        })
        .eq('id', superUser.id);

      if (updateError) {
        console.log(`❌ Error updating super user: ${updateError.message}`);
      } else {
        console.log(`✅ ddmaster124@gmail.com updated successfully as admin with full privileges`);
      }
    }

    // Fix 2: Handle user deletion with foreign key constraints
    console.log('\n🗑️ Fix 2: Handling user deletion with foreign key constraints...');
    
    const userToDelete = authUsers.users.find(u => u.email === 'dariusschutte124@gmail.com');
    
    if (userToDelete) {
      console.log(`🔍 Found user: dariusschutte124@gmail.com`);
      
      // First, check if user has any orders
      const { data: userOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userToDelete.id);

      if (ordersError) {
        console.log(`❌ Error checking orders: ${ordersError.message}`);
      } else {
        console.log(`📊 User has ${userOrders.length} orders`);
        
        if (userOrders.length > 0) {
          console.log(`⚠️  Cannot delete user with existing orders. Options:`);
          console.log(`   1. Delete orders first (destructive)`);
          console.log(`   2. Keep user but deactivate (recommended)`);
          console.log(`   3. Transfer orders to another user`);
          
          // Option 2: Deactivate instead of delete
          console.log(`🔄 Deactivating user instead of deleting...`);
          
          const { error: deactivateError } = await supabase
            .from('profiles')
            .update({
              role: 'inactive',
              is_admin: false,
              is_staff: false,
              full_name: 'Deactivated User',
              updated_at: new Date().toISOString()
            })
            .eq('id', userToDelete.id);

          if (deactivateError) {
            console.log(`❌ Error deactivating user: ${deactivateError.message}`);
          } else {
            console.log(`✅ User deactivated successfully (profile set to inactive)`);
          }
        } else {
          // No orders, safe to delete
          const { error: profileDeleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userToDelete.id);

          if (profileDeleteError) {
            console.log(`❌ Error deleting profile: ${profileDeleteError.message}`);
          } else {
            console.log(`✅ Profile deleted successfully`);
            
            const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userToDelete.id);
            
            if (authDeleteError) {
              console.log(`❌ Error deleting auth user: ${authDeleteError.message}`);
            } else {
              console.log(`✅ Auth user deleted successfully`);
            }
          }
        }
      }
    } else {
      console.log(`ℹ️  User dariusschutte124@gmail.com not found`);
    }

    // Final status check
    console.log('\n📊 Final user status check...');
    const { data: finalProfiles } = await supabase
      .from('profiles')
      .select('email, role, is_admin, is_staff, full_name')
      .order('email');

    console.log('\n🎉 Current user setup:');
    finalProfiles.forEach((profile, index) => {
      const roleInfo = profile.is_admin ? '👑 ADMIN' : profile.is_staff ? '👨‍💼 STAFF' : '👤 CUSTOMER';
      console.log(`${index + 1}. ${profile.email} - ${roleInfo} (${profile.role})`);
      console.log(`   Name: ${profile.full_name || 'Not set'}`);
    });

  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
  }
}

fixUserRoleIssues();
