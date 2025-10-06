'use server';

import { getSupabaseAdmin } from '@/lib/supabase-server';

// Order status management function
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = getSupabaseAdmin();
    
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('❌ Staff: Error updating order status:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Staff: Updated order ${orderId} status to ${status}`);
    return { success: true };
  } catch (error) {
    console.error('💥 Staff: Unexpected error updating order status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Stub implementations for menu management
export async function createMenuCategory(_categoryData: Record<string, unknown>) {
  return { success: false, message: 'Menu management moved to React Bricks CMS' };
}

export async function updateMenuCategory(_id: string, _categoryData: Record<string, unknown>) {
  return { success: false, message: 'Menu management moved to React Bricks CMS' };
}

export async function deleteMenuCategory(_id: string) {
  return { success: false, message: 'Menu management moved to React Bricks CMS' };
}

export async function createMenuItem(_menuItem: Record<string, unknown>) {
  return { success: false, message: 'Menu management moved to React Bricks CMS' };
}

export async function updateMenuItem(_id: string, _menuItem: Record<string, unknown>) {
  return { success: false, message: 'Menu management moved to React Bricks CMS' };
}

export async function deleteMenuItem(_id: string) {
  return { success: false, message: 'Menu management moved to React Bricks CMS' };
}

export async function getBookingInquiries() {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data: inquiries, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, data: inquiries };
  } catch (error) {
    console.error('Error fetching booking inquiries:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch inquiries' 
    };
  }
}

export async function uploadImage(formData: FormData) {
  try {
    const supabase = getSupabaseAdmin();
    const file = formData.get('file') as File;
    
    if (!file) {
      return { success: false, message: 'No file provided' };
    }

    const fileName = `uploads/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return { success: true, data: { path: data.path, url: urlData.publicUrl } };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}

/**
 * Safely delete a user and all their related data
 * Handles foreign key constraints by deleting in correct order
 */
export async function deleteUserCompletely(email: string) {
  try {
    const supabase = getSupabaseAdmin();
    
    console.log(`🗑️ Starting deletion process for user: ${email}`);

    // Step 1: Get user ID from auth.users by email
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return { success: false, error: 'Failed to fetch user from authentication' };
    }

    const user = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.error('❌ User not found with email:', email);
      return { success: false, error: 'User not found' };
    }

    const userId = user.id;
    console.log(`✅ Found user ID: ${userId}`);

    // Step 2: Delete related data in correct order (children before parents)
    
    // Delete notification history
    const { error: notifHistoryError } = await supabase
      .from('notification_history')
      .delete()
      .eq('user_id', userId);
    
    if (notifHistoryError) {
      console.error('⚠️ Error deleting notification history:', notifHistoryError);
    } else {
      console.log('✅ Deleted notification history');
    }

    // Delete notifications preferences
    const { error: notifsError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
    
    if (notifsError) {
      console.error('⚠️ Error deleting notifications:', notifsError);
    } else {
      console.log('✅ Deleted notifications preferences');
    }

    // Delete order items first (before orders)
    const { data: userOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId);

    if (userOrders && userOrders.length > 0) {
      const orderIds = userOrders.map(o => o.id);
      
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', orderIds);
      
      if (orderItemsError) {
        console.error('⚠️ Error deleting order items:', orderItemsError);
      } else {
        console.log(`✅ Deleted order items for ${orderIds.length} orders`);
      }
    }

    // Delete orders
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .eq('user_id', userId);
    
    if (ordersError) {
      console.error('⚠️ Error deleting orders:', ordersError);
    } else {
      console.log('✅ Deleted orders');
    }

    // Delete bookings
    const { error: bookingsError } = await supabase
      .from('bookings')
      .delete()
      .eq('user_id', userId);
    
    if (bookingsError) {
      console.error('⚠️ Error deleting bookings:', bookingsError);
    } else {
      console.log('✅ Deleted bookings');
    }

    // Delete staff requests
    const { error: staffReqError } = await supabase
      .from('staff_requests')
      .delete()
      .eq('user_id', userId);
    
    if (staffReqError) {
      console.error('⚠️ Error deleting staff requests:', staffReqError);
    } else {
      console.log('✅ Deleted staff requests');
    }

    // Delete contact submissions
    const { error: contactError } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('email', email);
    
    if (contactError) {
      console.error('⚠️ Error deleting contact submissions:', contactError);
    } else {
      console.log('✅ Deleted contact submissions');
    }

    // Step 3: Delete profile (has foreign key to auth.users)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('❌ Error deleting profile:', profileError);
      return { success: false, error: `Failed to delete profile: ${profileError.message}` };
    }
    
    console.log('✅ Deleted profile');

    // Step 4: Delete from auth.users (final step)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteAuthError) {
      console.error('❌ Error deleting auth user:', deleteAuthError);
      return { success: false, error: `Failed to delete authentication: ${deleteAuthError.message}` };
    }

    console.log(`🎉 Successfully deleted user: ${email}`);
    
    return { 
      success: true, 
      message: `User ${email} and all related data deleted successfully` 
    };

  } catch (error) {
    console.error('💥 Unexpected error during user deletion:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}