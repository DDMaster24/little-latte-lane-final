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

// ============================================================================
// Menu Management Actions - Categories, Items, Variations, Add-ons
// ============================================================================

// Category Management
export async function createMenuCategory(categoryData: {
  name: string;
  description?: string | null;
  display_order?: number | null;
  is_active?: boolean | null;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('menu_categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Created menu category:', data.name);
    return { success: true, data, message: 'Category created successfully' };
  } catch (error) {
    console.error('❌ Error creating category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create category'
    };
  }
}

export async function updateMenuCategory(id: string, categoryData: Partial<{
  name: string;
  description: string | null;
  display_order: number | null;
  is_active: boolean | null;
}>) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('menu_categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Updated menu category:', data.name);
    return { success: true, data, message: 'Category updated successfully' };
  } catch (error) {
    console.error('❌ Error updating category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update category'
    };
  }
}

export async function deleteMenuCategory(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log('✅ Deleted menu category');
    return { success: true, message: 'Category deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete category'
    };
  }
}

// Menu Item Management
export async function createMenuItem(menuItem: {
  name: string;
  description?: string | null;
  price: number;
  category_id?: string | null;
  is_available?: boolean | null;
  image_url?: string | null;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('menu_items')
      .insert(menuItem)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Created menu item:', data.name);
    return { success: true, data, message: 'Menu item created successfully' };
  } catch (error) {
    console.error('❌ Error creating menu item:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create menu item'
    };
  }
}

export async function updateMenuItem(id: string, menuItem: Partial<{
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  is_available: boolean | null;
  image_url: string | null;
}>) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('menu_items')
      .update(menuItem)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Updated menu item:', data.name);
    return { success: true, data, message: 'Menu item updated successfully' };
  } catch (error) {
    console.error('❌ Error updating menu item:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update menu item'
    };
  }
}

export async function deleteMenuItem(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log('✅ Deleted menu item');
    return { success: true, message: 'Menu item deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting menu item:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete menu item'
    };
  }
}

// ============================================================================
// Item Variations Management (Small/Medium/Large, etc.)
// ============================================================================

export async function createItemVariation(variationData: {
  menu_item_id: string;
  name: string;
  price_adjustment: number;
  is_default?: boolean;
  display_order?: number;
  is_available?: boolean;
}) {
  try {
    const supabase = getSupabaseAdmin();

    // If this is set as default, unset other defaults for this item
    if (variationData.is_default) {
      await (supabase as any)
        .from('menu_item_variations')
        .update({ is_default: false })
        .eq('menu_item_id', variationData.menu_item_id);
    }

    const { data, error } = await (supabase as any)
      .from('menu_item_variations')
      .insert(variationData)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Created item variation:', data.name);
    return { success: true, data, message: 'Variation created successfully' };
  } catch (error) {
    console.error('❌ Error creating variation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create variation'
    };
  }
}

export async function updateItemVariation(id: string, variationData: Partial<{
  name: string;
  price_adjustment: number;
  is_default: boolean | null;
  display_order: number | null;
  is_available: boolean | null;
}>) {
  try {
    const supabase = getSupabaseAdmin();

    // If setting as default, unset other defaults for this item
    if (variationData.is_default) {
      const { data: variation } = await (supabase as any)
        .from('menu_item_variations')
        .select('menu_item_id')
        .eq('id', id)
        .single();

      if (variation) {
        await (supabase as any)
          .from('menu_item_variations')
          .update({ is_default: false })
          .eq('menu_item_id', variation.menu_item_id)
          .neq('id', id);
      }
    }

    const { data, error } = await (supabase as any)
      .from('menu_item_variations')
      .update(variationData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Updated item variation:', data.name);
    return { success: true, data, message: 'Variation updated successfully' };
  } catch (error) {
    console.error('❌ Error updating variation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update variation'
    };
  }
}

export async function deleteItemVariation(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await (supabase as any)
      .from('menu_item_variations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log('✅ Deleted item variation');
    return { success: true, message: 'Variation deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting variation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete variation'
    };
  }
}

// ============================================================================
// Add-ons Management (Boba, pizza toppings, etc.)
// ============================================================================

export async function createAddon(addonData: {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  display_order?: number;
  is_available?: boolean;
}) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await (supabase as any)
      .from('menu_addons')
      .insert(addonData)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Created add-on:', data.name);
    return { success: true, data, message: 'Add-on created successfully' };
  } catch (error) {
    console.error('❌ Error creating add-on:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create add-on'
    };
  }
}

export async function updateAddon(id: string, addonData: Partial<{
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  display_order: number | null;
  is_available: boolean | null;
}>) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await (supabase as any)
      .from('menu_addons')
      .update(addonData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Updated add-on:', data.name);
    return { success: true, data, message: 'Add-on updated successfully' };
  } catch (error) {
    console.error('❌ Error updating add-on:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update add-on'
    };
  }
}

export async function deleteAddon(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await (supabase as any)
      .from('menu_addons')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log('✅ Deleted add-on');
    return { success: true, message: 'Add-on deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting add-on:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete add-on'
    };
  }
}

// ============================================================================
// Link Add-ons to Items or Categories
// ============================================================================

export async function linkAddonToItem(linkData: {
  menu_item_id?: string;
  category_id?: string;
  addon_id: string;
  is_required?: boolean;
  max_quantity?: number;
}) {
  try {
    const supabase = getSupabaseAdmin();

    // Validate: must have either menu_item_id OR category_id, not both
    if ((!linkData.menu_item_id && !linkData.category_id) ||
        (linkData.menu_item_id && linkData.category_id)) {
      return {
        success: false,
        message: 'Must link to either a specific item OR a category, not both or neither'
      };
    }

    const { data, error } = await (supabase as any)
      .from('menu_item_addons')
      .insert(linkData)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Linked add-on to', linkData.menu_item_id ? 'item' : 'category');
    return { success: true, data, message: 'Add-on linked successfully' };
  } catch (error) {
    console.error('❌ Error linking add-on:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to link add-on'
    };
  }
}

export async function unlinkAddon(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await (supabase as any)
      .from('menu_item_addons')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log('✅ Unlinked add-on');
    return { success: true, message: 'Add-on unlinked successfully' };
  } catch (error) {
    console.error('❌ Error unlinking add-on:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to unlink add-on'
    };
  }
}

export async function updateAddonLink(id: string, linkData: Partial<{
  is_required: boolean;
  max_quantity: number;
}>) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await (supabase as any)
      .from('menu_item_addons')
      .update(linkData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Updated add-on link');
    return { success: true, data, message: 'Add-on link updated successfully' };
  } catch (error) {
    console.error('❌ Error updating add-on link:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update add-on link'
    };
  }
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