/**
 * Admin Operations Queries
 * Centralized admin-only operations and analytics
 */

import type { Database } from '@/types/supabase';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase-server';

type Tables = Database['public']['Tables'];
type ProfileRow = Tables['profiles']['Row'];

/**
 * Server-side admin queries
 */
export class ServerAdminQueries {
  /**
   * Get all users with their profiles
   */
  static async getAllUsers(): Promise<ProfileRow[]> {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: 'customer' | 'staff' | 'admin'): Promise<ProfileRow[]> {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(userId: string, newRole: 'customer' | 'staff' | 'admin'): Promise<ProfileRow> {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get comprehensive dashboard analytics
   */
  static async getDashboardAnalytics() {
    const supabase = await getSupabaseServer();
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

    // Orders analytics
    const { count: todayOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Revenue analytics
    const { data: todayRevenue } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .neq('status', 'cancelled');

    const { data: monthlyRevenue } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', `${thisMonth}-01T00:00:00.000Z`)
      .neq('status', 'cancelled');

    // Bookings analytics
    const { count: todayBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('date_time', `${today}T00:00:00.000Z`)
      .lt('date_time', `${today}T23:59:59.999Z`);

    const { count: pendingBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // User analytics
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: newUsersToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    return {
      orders: {
        today: todayOrders || 0,
        pending: pendingOrders || 0,
      },
      revenue: {
        today: todayRevenue?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
        monthly: monthlyRevenue?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
      },
      bookings: {
        today: todayBookings || 0,
        pending: pendingBookings || 0,
      },
      users: {
        total: totalUsers || 0,
        newToday: newUsersToday || 0,
      },
    };
  }

  /**
   * Get top selling items analytics
   */
  static async getTopSellingItems(limit = 10) {
    const supabase = await getSupabaseServer();
    
    // Get aggregated order items first
    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select('menu_item_id, quantity');

    if (orderError) throw orderError;

    // Aggregate quantities by menu item
    const itemQuantities = orderItems.reduce((acc, item) => {
      if (item.menu_item_id) {
        acc[item.menu_item_id] = (acc[item.menu_item_id] || 0) + item.quantity;
      }
      return acc;
    }, {} as Record<string, number>);

    // Get menu items details
    const topItemIds = Object.entries(itemQuantities)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id); // Keep as string UUIDs

    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .in('id', topItemIds);

    if (menuError) throw menuError;

    // Combine data
    return menuItems
      .map(item => ({
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        total_quantity: itemQuantities[item.id] || 0,
      }))
      .sort((a, b) => b.total_quantity - a.total_quantity);
  }
}

/**
 * Admin queries requiring service role
 */
export class AdminQueries {
  /**
   * Delete user (admin only - requires service role)
   */
  static async deleteUser(userId: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    
    // Delete user profile first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) throw profileError;

    // Delete auth user (requires admin client)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) throw authError;
  }

  /**
   * Force update any table (admin only)
   */
  static async forceUpdate<T>(
    table: keyof Database['public']['Tables'],
    id: string,
    updates: Record<string, unknown>
  ): Promise<T> {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  /**
   * Bulk operations (admin only)
   */
  static async bulkUpdate<T>(
    table: keyof Database['public']['Tables'],
    updates: { id: string; data: Record<string, unknown> }[]
  ): Promise<T[]> {
    const supabase = getSupabaseAdmin();
    
    const results: T[] = [];
    
    for (const update of updates) {
      const { data, error } = await supabase
        .from(table)
        .update(update.data)
        .eq('id', update.id)
        .select()
        .single();
      
      if (error) throw error;
      results.push(data as T);
    }
    
    return results;
  }
}
