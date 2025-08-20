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
    // Only log in production or when debugging
    if (process.env.NODE_ENV === 'production' || process.env.DEBUG_AUTH) {
      console.log('🔧 Server action: Getting or creating profile for user', userId);
    }
    
    const supabase = getSupabaseAdmin();

    // Try to get existing profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!fetchError) {
      if (process.env.NODE_ENV === 'production' || process.env.DEBUG_AUTH) {
        console.log('✅ Profile found');
      }
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

export async function cancelDraftOrder(
  orderId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Server action: Canceling draft order:', orderId, 'for user:', userId);
    
    const supabase = getSupabaseAdmin();

    // First verify the order belongs to the user and is a draft
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, user_id, status, order_number')
      .eq('id', orderId)
      .eq('user_id', userId)
      .eq('status', 'draft')
      .single();

    if (fetchError || !order) {
      console.error('❌ Order not found or not accessible:', fetchError);
      return { success: false, error: 'Order not found or cannot be canceled' };
    }

    console.log('✅ Found draft order to cancel:', order.order_number);

    // Delete the order and all related order_items (cascade should handle this)
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (deleteError) {
      console.error('❌ Error deleting order:', deleteError);
      return { success: false, error: 'Failed to cancel order' };
    }

    console.log('✅ Order canceled successfully:', order.order_number);
    return { success: true };

  } catch (error) {
    console.error('❌ Cancel order error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getOrderForRetry(
  orderId: string,
  userId: string
): Promise<{ 
  success: boolean; 
  error?: string; 
  orderItems?: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    description?: string;
  }[];
  orderNumber?: string;
}> {
  try {
    console.log('🔄 Server action: Getting order for retry:', orderId, 'for user:', userId);
    
    const supabase = getSupabaseAdmin();

    // Get the draft order with menu items
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        status,
        order_items (
          menu_item_id,
          quantity,
          price,
          menu_items (
            id,
            name,
            description,
            price
          )
        )
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .eq('status', 'draft')
      .single();

    if (fetchError || !order) {
      console.error('❌ Order not found or not accessible:', fetchError);
      return { success: false, error: 'Order not found or cannot be retried' };
    }

    console.log('✅ Found draft order for retry:', order.order_number);

    // Convert order items to cart format
    interface OrderItemWithMenu {
      menu_item_id: string | null;
      quantity: number;
      price: number;
      menu_items?: {
        id: string;
        name: string;
        description?: string | null;
        price: number;
      } | null;
    }
    
    const cartItems = order.order_items.map((item: OrderItemWithMenu) => ({
      id: item.menu_items?.id || item.menu_item_id || 'unknown',
      name: item.menu_items?.name || 'Unknown Item',
      price: item.price,
      quantity: item.quantity,
      description: item.menu_items?.description || undefined,
    }));

    return { 
      success: true, 
      orderItems: cartItems,
      orderNumber: order.order_number || undefined
    };

  } catch (error) {
    console.error('❌ Get order for retry error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ============================================
// STAFF PANEL SERVER ACTIONS
// ============================================

export async function getStaffOrders() {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          menu_item_id,
          quantity,
          price,
          special_instructions,
          menu_items (
            name,
            category_id
          )
        ),
        profiles (
          full_name,
          email
        )
      `)
      .in('status', ['confirmed', 'preparing', 'ready'])
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Staff: Error fetching orders:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log(`✅ Staff: Fetched ${data?.length || 0} orders via server action`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('💥 Staff: Unexpected error fetching orders:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [] 
    };
  }
}

export async function getStaffBookings() {
  try {
    const supabase = getSupabaseAdmin();
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .gte('booking_date', today)
      .eq('status', 'confirmed')
      .order('booking_date', { ascending: true });

    if (error) {
      console.error('❌ Staff: Error fetching bookings:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log(`✅ Staff: Fetched ${data?.length || 0} bookings via server action`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('💥 Staff: Unexpected error fetching bookings:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [] 
    };
  }
}

export async function getStaffStats() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get all active orders
    const { count: activeOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['confirmed', 'preparing', 'ready'])
      .eq('payment_status', 'paid');

    // Get confirmed orders (not yet actioned)
    const { count: confirmedOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .eq('payment_status', 'paid');

    // Get orders in progress
    const { count: inProgressOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'preparing')
      .eq('payment_status', 'paid');

    // Get ready orders
    const { count: readyOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ready')
      .eq('payment_status', 'paid');

    // Get completed orders today
    const today = new Date().toISOString().split('T')[0];
    const { count: completedOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .eq('payment_status', 'paid')
      .gte('created_at', today + 'T00:00:00')
      .lt('created_at', today + 'T23:59:59');

    const stats = {
      activeOrders: activeOrders || 0,
      confirmedOrders: confirmedOrders || 0,
      inProgressOrders: inProgressOrders || 0,
      readyOrders: readyOrders || 0,
      completedOrders: completedOrders || 0,
    };

    console.log('✅ Staff: Fetched status-based stats via server action:', stats);
    return { success: true, data: stats };
  } catch (error) {
    console.error('💥 Staff: Unexpected error fetching stats:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: { 
        activeOrders: 0, 
        confirmedOrders: 0, 
        inProgressOrders: 0, 
        readyOrders: 0, 
        completedOrders: 0 
      }
    };
  }
}

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
