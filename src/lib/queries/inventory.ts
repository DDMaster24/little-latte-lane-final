/**
 * Inventory Management Queries
 * Centralized inventory operations and stock management
 */

import type { Database } from '@/types/supabase';
import { getSupabaseClient, getSupabaseServer } from '@/lib/supabase';

type Tables = Database['public']['Tables'];
type InventoryRow = Tables['inventory']['Row'];
type InventoryInsert = Tables['inventory']['Insert'];
type InventoryUpdate = Tables['inventory']['Update'];

export type LowStockItem = InventoryRow & {
  stock_percentage: number;
};

/**
 * Client-side inventory queries
 */
export class InventoryQueries {
  private client = getSupabaseClient();

  /**
   * Get all inventory items
   */
  async getAllInventory(): Promise<InventoryRow[]> {
    const { data, error } = await this.client
      .from('inventory')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(threshold = 20): Promise<LowStockItem[]> {
    const { data, error } = await this.client
      .from('inventory')
      .select('*')
      .lte('current_stock', threshold)
      .order('current_stock');

    if (error) throw error;

    return data.map(item => ({
      ...item,
      stock_percentage: (item.current_stock / item.max_stock) * 100,
    }));
  }

  /**
   * Get single inventory item
   */
  async getInventoryItem(id: number): Promise<InventoryRow | null> {
    const { data, error } = await this.client
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  /**
   * Update inventory stock
   */
  async updateStock(id: number, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<InventoryRow> {
    const currentItem = await this.getInventoryItem(id);
    if (!currentItem) throw new Error('Inventory item not found');

    let newStock: number;
    switch (operation) {
      case 'add':
        newStock = currentItem.stock_quantity + quantity;
        break;
      case 'subtract':
        newStock = Math.max(0, currentItem.stock_quantity - quantity);
        break;
      case 'set':
        newStock = Math.max(0, quantity);
        break;
    }

    const { data, error } = await this.client
      .from('inventory')
      .update({ 
        current_stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Add new inventory item
   */
  async addInventoryItem(item: InventoryInsert): Promise<InventoryRow> {
    const { data, error } = await this.client
      .from('inventory')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update inventory item
   */
  async updateInventoryItem(id: number, updates: InventoryUpdate): Promise<InventoryRow> {
    const { data, error } = await this.client
      .from('inventory')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete inventory item
   */
  async deleteInventoryItem(id: number): Promise<void> {
    const { error } = await this.client
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get inventory by category
   */
  async getInventoryByCategory(category: string): Promise<InventoryRow[]> {
    const { data, error } = await this.client
      .from('inventory')
      .select('*')
      .eq('category', category)
      .order('name');

    if (error) throw error;
    return data;
  }

  /**
   * Search inventory items
   */
  async searchInventory(query: string): Promise<InventoryRow[]> {
    const { data, error } = await this.client
      .from('inventory')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name');

    if (error) throw error;
    return data;
  }
}

/**
 * Server-side inventory queries
 */
export class ServerInventoryQueries {
  /**
   * Get inventory analytics
   */
  static async getInventoryAnalytics() {
    const supabase = await getSupabaseServer();
    
    // Get total items
    const { count: totalItems } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });

    // Get low stock items (less than min_stock)
    const { data: lowStockData } = await supabase
      .from('inventory')
      .select('current_stock, min_stock')
      .lt('current_stock', 'min_stock');

    // Get out of stock items
    const { count: outOfStockItems } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('current_stock', 0);

    // Calculate total inventory value
    const { data: allItems } = await supabase
      .from('inventory')
      .select('current_stock, cost_per_unit');

    const totalValue = allItems?.reduce((sum, item) => {
      return sum + (item.current_stock * item.cost_per_unit);
    }, 0) || 0;

    return {
      totalItems: totalItems || 0,
      lowStockItems: lowStockData?.length || 0,
      outOfStockItems: outOfStockItems || 0,
      totalValue: totalValue,
    };
  }

  /**
   * Get items that need reordering
   */
  static async getItemsNeedingReorder(): Promise<InventoryRow[]> {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .lt('current_stock', 'min_stock')
      .order('current_stock');

    if (error) throw error;
    return data;
  }

  /**
   * Bulk update inventory (server-side)
   */
  static async bulkUpdateInventory(updates: { id: number; updates: InventoryUpdate }[]): Promise<InventoryRow[]> {
    const supabase = await getSupabaseServer();
    const results: InventoryRow[] = [];

    for (const update of updates) {
      const { data, error } = await supabase
        .from('inventory')
        .update({
          ...update.updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.id)
        .select()
        .single();

      if (error) throw error;
      results.push(data);
    }

    return results;
  }

  /**
   * Get inventory categories
   */
  static async getInventoryCategories(): Promise<string[]> {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('inventory')
      .select('category')
      .order('category');

    if (error) throw error;

    // Get unique categories
    const categories = [...new Set(data.map(item => item.category))];
    return categories.filter(Boolean);
  }
}

// Singleton instance for client-side usage
export const inventoryQueries = new InventoryQueries();
