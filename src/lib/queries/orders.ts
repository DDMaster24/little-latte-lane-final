/**
 * Order Management Queries
 * Centralized order operations and order item management
 */

import type { Database } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase-client';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase-server';
import { updateOrderStatusSimple, type SimpleOrderStatus } from '@/lib/orderStatusNotifications';

type Tables = Database['public']['Tables'];
type OrderRow = Tables['orders']['Row'];
type OrderInsert = Tables['orders']['Insert'];
type OrderUpdate = Tables['orders']['Update'];
type OrderItemRow = Tables['order_items']['Row'];
type OrderItemInsert = Tables['order_items']['Insert'];
type MenuItemRow = Tables['menu_items']['Row'];

export type OrderWithItems = OrderRow & {
  order_items: (OrderItemRow & {
    menu_item: MenuItemRow | null;
  })[];
};

export type CreateOrderData = {
  items: {
    menu_item_id: number;
    quantity: number;
    unit_price?: number;
    special_instructions?: string;
  }[];
  delivery_type: 'pickup' | 'dine_in' | 'delivery';
  delivery_address?: string;
  special_instructions?: string;
  user_details?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  };
};

/**
 * Client-side order queries
 */
export class OrderQueries {
  private client = getSupabaseClient();

  /**
   * Get user's orders with items
   */
  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const { data, error } = await this.client
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as OrderWithItems[];
  }

  /**
   * Get single order with items
   */
  async getOrder(orderId: string): Promise<OrderWithItems | null> {
    const { data, error } = await this.client
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items (*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as OrderWithItems;
  }

  /**
   * Create new order
   */
  async createOrder(userId: string, orderData: CreateOrderData): Promise<OrderWithItems> {
    // Calculate total
    const total = orderData.items.reduce((sum, item) => {
      return sum + (item.unit_price || 0) * item.quantity;
    }, 0);

    // Create order
    const orderInsert: OrderInsert = {
      user_id: userId,
      order_number: `ORDER-${Date.now()}`, // Generate a simple order number
      status: 'pending',
      total_amount: total,
      special_instructions: orderData.special_instructions || null,
    };

    const { data: order, error: orderError } = await this.client
      .from('orders')
      .insert(orderInsert)
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItemsInsert: OrderItemInsert[] = orderData.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id.toString(),
      quantity: item.quantity,
      price: item.unit_price || 0,
      special_instructions: item.special_instructions || null,
    }));

    const { error: itemsError } = await this.client
      .from('order_items')
      .insert(orderItemsInsert);

    if (itemsError) throw itemsError;

    // Return the complete order
    return await this.getOrder(order.id) as OrderWithItems;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<OrderRow> {
    const { data, error } = await this.client
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Cancel order (if pending)
   */
  async cancelOrder(orderId: string): Promise<OrderRow> {
    const { data, error } = await this.client
      .from('orders')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('status', 'pending') // Only allow cancelling pending orders
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * Server-side order queries
 */
export class ServerOrderQueries {
  /**
   * Get all orders (admin only) - excludes draft orders by default
   */
  static async getAllOrders(): Promise<OrderWithItems[]> {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items (*)
        )
      `)
      .neq('status', 'draft') // Exclude draft orders - they are not real orders until payment confirmed
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as OrderWithItems[];
  }

  /**
   * Get orders by status
   */
  static async getOrdersByStatus(status: string): Promise<OrderWithItems[]> {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items (*)
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as OrderWithItems[];
  }

  /**
   * Update order status (server-side) with simplified notifications
   */
  static async updateOrderStatus(
    orderId: string, 
    status: string,
    additionalData?: {
      estimatedReadyTime?: string;
      completionTime?: string;
    }
  ): Promise<OrderRow> {
    // Use the simplified notification system for status updates
    const success = await updateOrderStatusSimple(
      orderId,
      status as SimpleOrderStatus,
      additionalData
    );

    if (!success) {
      throw new Error('Failed to update order status');
    }

    // Return the updated order data
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from('orders')
      .select()
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get order analytics
   */
  static async getOrderAnalytics() {
    const supabase = await getSupabaseServer();
    
    // Get total orders today (excluding draft orders)
    const today = new Date().toISOString().split('T')[0];
    const { count: todayOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .neq('status', 'draft'); // Exclude draft orders from analytics

    // Get total revenue today (excluding draft orders)
    const { data: todayRevenue } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .neq('status', 'draft') // Exclude draft orders from revenue
      .neq('status', 'cancelled');

    const revenue = todayRevenue?.reduce((sum: number, order: { total_amount: number | null }) => sum + (order.total_amount || 0), 0) || 0;

    // Get confirmed orders count (real pending orders for business operations)
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed'); // Confirmed orders are the real "pending" business orders

    return {
      todayOrders: todayOrders || 0,
      todayRevenue: revenue,
      pendingOrders: pendingOrders || 0,
    };
  }
}

/**
 * Admin order queries (service role required)
 */
export class AdminOrderQueries {
  /**
   * Cleanup draft orders (admin operation)
   */
  static async cleanupDraftOrders(): Promise<number> {
    const supabase = getSupabaseAdmin();
    
    // Delete orders older than 1 hour that are still draft/pending with no items
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { count } = await supabase
      .from('orders')
      .delete({ count: 'exact' })
      .eq('status', 'pending')
      .lt('created_at', oneHourAgo)
      .is('order_items', null);

    return count || 0;
  }

  /**
   * Force update order (admin operation)
   */
  static async forceUpdateOrder(orderId: string, updates: OrderUpdate): Promise<OrderRow> {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Singleton instance for client-side usage
export const orderQueries = new OrderQueries();
