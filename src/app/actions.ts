'use server'; // Marks as server actions

import { getSupabaseAdmin } from '@/lib/supabase-server'; // Use server client with service key

// Define types for better type safety
interface ActivityItem {
  time: string;
  action: string;
  type: 'order' | 'payment' | 'user';
}

interface _PopularItem {
  name: string;
  orders: number;
}

interface _DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  pendingOrders: number;
  averageOrderValue: number;
  todayRevenue: number;
  todayOrders: number;
}

interface OrderItem {
  menu_items?: {
    name?: string;
  } | null;
  quantity?: number;
  price?: number;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_admin: boolean | null;
  is_staff: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

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
    
    const cartItems = (order.order_items as unknown as OrderItemWithMenu[])?.map((item: OrderItemWithMenu) => ({
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
          email,
          phone
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

export async function getAllOrdersForAdmin() {
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
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false })
      .limit(200); // Limit to prevent overwhelming the UI

    if (error) {
      console.error('❌ Admin: Error fetching all orders:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log('✅ Admin: Successfully fetched all orders:', data?.length || 0);
    return { success: true, data: (data || []), error: null };

  } catch (error) {
    console.error('❌ Admin: Exception fetching all orders:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      data: [] 
    };
  }
}

export async function getAnalyticsDataForAdmin() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get orders with order items and menu items for analytics
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price,
          menu_items (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ Analytics: Error fetching orders:', ordersError);
      return { success: false, error: ordersError.message, orders: [], userCount: 0 };
    }

    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (userError) {
      console.error('❌ Analytics: Error fetching user count:', userError);
      return { success: false, error: userError.message, orders: [], userCount: 0 };
    }

    console.log('✅ Analytics: Successfully fetched orders:', orders?.length || 0);
    console.log('✅ Analytics: Successfully fetched user count:', userCount || 0);
    
    return { 
      success: true, 
      orders: (orders || []) as unknown as OrderItem[], 
      userCount: userCount || 0,
      error: null 
    };

  } catch (error) {
    console.error('❌ Analytics: Exception fetching data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      orders: [],
      userCount: 0
    };
  }
}

export async function getStaffOrderHistory() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    
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
          email,
          phone
        )
      `)
      .in('status', ['completed', 'delivered'])
      .eq('payment_status', 'paid')
      .gte('updated_at', startOfDay)
      .lt('updated_at', endOfDay)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Staff: Error fetching order history:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log(`✅ Staff: Fetched ${data?.length || 0} completed orders via server action`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('💥 Staff: Unexpected error fetching order history:', error);
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
          email,
          phone
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

// ============================================
// ADMIN PANEL SERVER ACTIONS
// ============================================

export async function getAdminDashboardStats() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get today's date range for today-specific stats
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    
    // Get all paid orders for total stats
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .eq('payment_status', 'paid');

    if (ordersError) {
      console.error('❌ Admin: Error fetching orders for stats:', ordersError);
      return { success: false, error: ordersError.message };
    }

    // Get today's orders
    const { data: todayOrders, error: todayError } = await supabase
      .from('orders')
      .select('id, total_amount')
      .eq('payment_status', 'paid')
      .gte('created_at', startOfDay)
      .lt('created_at', endOfDay);

    if (todayError) {
      console.error('❌ Admin: Error fetching today orders:', todayError);
      return { success: false, error: todayError.message };
    }

    // Get active users count (users who have placed orders)
    const { count: activeUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('❌ Admin: Error fetching users count:', usersError);
    }

    // Get pending orders
    const { count: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed'])
      .eq('payment_status', 'paid');

    if (pendingError) {
      console.error('❌ Admin: Error fetching pending orders:', pendingError);
    }

    // Calculate stats
    const totalOrders = allOrders?.length || 0;
    const totalRevenue = allOrders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
    const todayOrdersCount = todayOrders?.length || 0;
    const todayRevenue = todayOrders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const stats = {
      totalRevenue,
      totalOrders,
      activeUsers: activeUsers || 0,
      pendingOrders: pendingOrders || 0,
      averageOrderValue,
      todayRevenue,
      todayOrders: todayOrdersCount,
    };

    console.log('✅ Admin: Fetched dashboard stats:', stats);
    return { success: true, data: stats };
  } catch (error) {
    console.error('💥 Admin: Unexpected error fetching dashboard stats:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getAdminPopularItems() {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        menu_items (
          name
        )
      `)
      .limit(1000); // Reasonable limit for aggregation

    if (error) {
      console.error('❌ Admin: Error fetching popular items:', error);
      return { success: false, error: error.message, data: [] };
    }

    // Aggregate popular items
    const itemCounts: Record<string, number> = {};
    data?.forEach(item => {
      const name = (item as unknown as { menu_items?: { name?: string } }).menu_items?.name || 'Unknown Item';
      itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 0);
    });

    const popularItems = Object.entries(itemCounts)
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 4);

    console.log('✅ Admin: Fetched popular items:', popularItems);
    return { success: true, data: popularItems };
  } catch (error) {
    console.error('💥 Admin: Unexpected error fetching popular items:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [] 
    };
  }
}

export async function getAdminRecentActivity() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get recent orders
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        payment_status,
        created_at,
        updated_at,
        profiles (
          full_name,
          email
        )
      `)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.error('❌ Admin: Error fetching recent orders:', ordersError);
      return { success: false, error: ordersError.message, data: [] };
    }

    // Get recent user registrations
    const { data: recentUsers, error: usersError } = await supabase
      .from('profiles')
      .select('email, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) {
      console.error('❌ Admin: Error fetching recent users:', usersError);
    }

    // Combine and format activity
    const activities: ActivityItem[] = [];

    // Add order activities
    recentOrders?.forEach(order => {
      const dateString = order.updated_at || order.created_at;
      if (!dateString) return;
      
      const timeAgo = getTimeAgo(new Date(dateString));
      
      if (order.payment_status === 'paid' && order.status === 'confirmed') {
        activities.push({
          time: timeAgo,
          action: `New order ${order.order_number || order.id.slice(0, 8)} - R${Number(order.total_amount || 0).toFixed(2)}`,
          type: 'order' as const
        });
      } else if (order.status === 'completed') {
        activities.push({
          time: timeAgo,
          action: `Order ${order.order_number || order.id.slice(0, 8)} completed`,
          type: 'order' as const
        });
      } else if (order.payment_status === 'paid') {
        activities.push({
          time: timeAgo,
          action: `Payment completed for order ${order.order_number || order.id.slice(0, 8)}`,
          type: 'payment' as const
        });
      }
    });

    // Add user registration activities
    recentUsers?.forEach(user => {
      if (!user.created_at) return;
      
      const timeAgo = getTimeAgo(new Date(user.created_at));
      activities.push({
        time: timeAgo,
        action: `New user registration: ${user.email}`,
        type: 'user' as const
      });
    });

    // Sort by most recent and limit
    const sortedActivities = activities
      .sort((a, b) => {
        // Simple time comparison - newer activities first
        const aTime = a.time.includes('min') ? parseInt(a.time) : 
                     a.time.includes('hour') ? parseInt(a.time) * 60 : 
                     parseInt(a.time) * 60 * 24;
        const bTime = b.time.includes('min') ? parseInt(b.time) : 
                     b.time.includes('hour') ? parseInt(b.time) * 60 : 
                     parseInt(b.time) * 60 * 24;
        return aTime - bTime;
      })
      .slice(0, 5);

    console.log('✅ Admin: Fetched recent activity:', sortedActivities);
    return { success: true, data: sortedActivities };
  } catch (error) {
    console.error('💥 Admin: Unexpected error fetching recent activity:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [] 
    };
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} mins ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else {
    return `${diffDays} days ago`;
  }
}

export async function getAdminOrders() {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          phone
        ),
        order_items (
          *,
          menu_items (
            name,
            price,
            category
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Admin: Error fetching orders:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log(`✅ Admin: Fetched ${data?.length || 0} orders via server action`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('💥 Admin: Unexpected error fetching orders:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [] 
    };
  }
}

export async function getAdminAnalytics(period: 'day' | 'week' | 'month') {
  try {
    const supabase = getSupabaseAdmin();
    
    const now = new Date();
    let startDate: Date;
    
    if (period === 'day') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const { data: periodOrders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (name, price)
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());

    if (error) {
      console.error('❌ Admin Analytics error:', error);
      return { success: false, error: error.message, data: null };
    }

    const orders = periodOrders || [];
    
    // Calculate analytics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.total_amount || 0);
    }, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const statusBreakdown = orders.reduce((acc: Record<string, number>, order) => {
      const status = order.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const completedOrders = statusBreakdown['completed'] || 0;
    const pendingOrders = (statusBreakdown['pending'] || 0) + (statusBreakdown['confirmed'] || 0);
    const cancelledOrders = statusBreakdown['cancelled'] || 0;
    
    // Calculate most popular items
    const itemCounts: Record<string, { quantity: number; revenue: number }> = {};
    orders.forEach(order => {
      (order.order_items as unknown as OrderItem[])?.forEach((item: OrderItem) => {
        const name = item.menu_items?.name || 'Unknown Item';
        if (!itemCounts[name]) {
          itemCounts[name] = { quantity: 0, revenue: 0 };
        }
        itemCounts[name].quantity += item.quantity || 0;
        itemCounts[name].revenue += (item.price || 0) * (item.quantity || 0);
      });
    });
    
    const mostPopularItems = Object.entries(itemCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    // Calculate revenue by period (simplified - just current period)
    const revenueByPeriod = [{
      date: startDate.toISOString().split('T')[0],
      revenue: totalRevenue,
      orders: totalOrders
    }];

    const analytics = {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      statusBreakdown,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      mostPopularItems,
      revenueByPeriod
    };

    console.log(`✅ Admin Analytics for ${period}:`, analytics);
    return { success: true, data: analytics };
  } catch (error) {
    console.error('💥 Admin: Unexpected error calculating analytics:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null 
    };
  }
}

/**
 * Server-side order creation action
 * This bypasses RLS issues by using server-side authentication
 */
export async function createOrderServerAction(orderData: {
  userId: string;
  items: {
    id: string;
    quantity: number;
    price?: number;
    name?: string;
    customization?: Record<string, unknown>;
  }[];
  total: number;
  deliveryType: string;
  deliveryAddress?: string;
  specialInstructions?: string;
}) {
  try {
    console.log('🔄 Server-side order creation for user:', orderData.userId);
    
    const supabase = getSupabaseAdmin();
    
    // Verify user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', orderData.userId)
      .single();
    
    if (profileError || !profile) {
      throw new Error('User not found');
    }
    
    console.log('✅ User verified:', profile.email);
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.userId,
        total_amount: orderData.total,
        status: 'draft',
        payment_status: 'awaiting_payment',
        delivery_method: orderData.deliveryType,
        delivery_address: orderData.deliveryAddress || null,
        special_instructions: orderData.specialInstructions || null,
        created_at: new Date().toISOString(),
      })
      .select('id, order_number')
      .single();
    
    if (orderError) throw orderError;
    
    console.log('✅ Order created:', order.order_number);
    
    // Create order items
    const orderItems = [];
    
    for (const item of orderData.items) {
      if (item.customization?.isCustomized) {
        // Customized item
        orderItems.push({
          order_id: order.id,
          menu_item_id: null,
          quantity: item.quantity,
          price: item.price || 0,
          special_instructions: JSON.stringify({
            type: 'customized',
            customized_id: item.id,
            name: item.name || 'Custom Item',
            customization_details: item.customization,
          }),
        });
      } else {
        // Regular menu item
        const { data: menuItem, error: menuError } = await supabase
          .from('menu_items')
          .select('price, name')
          .eq('id', item.id)
          .single();
        
        if (menuError || !menuItem) {
          throw new Error(`Menu item ${item.id} not found`);
        }
        
        orderItems.push({
          order_id: order.id,
          menu_item_id: item.id,
          quantity: item.quantity,
          price: parseFloat(menuItem.price.toString()),
        });
      }
    }
    
    // Insert order items using service role (bypasses RLS)
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('❌ Order items creation failed:', itemsError);
      throw itemsError;
    }
    
    console.log('✅ Order items created:', orderItems.length);
    
    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    };
    
  } catch (error) {
    console.error('❌ Server-side order creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}