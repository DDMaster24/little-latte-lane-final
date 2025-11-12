/**
 * Menu Data Queries
 * Centralized menu and category operations
 */

import type { Database } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase-client';
import { getSupabaseServer } from '@/lib/supabase-server';

type Tables = Database['public']['Tables'];
type MenuItemRow = Tables['menu_items']['Row'];
type CategoryRow = Tables['menu_categories']['Row'];

// Type definitions
export type MenuItemWithCategory = MenuItemRow & {
  menu_categories: CategoryRow | null;
};

export type CategoryWithItems = CategoryRow & {
  menu_items: MenuItemRow[];
};

/**
 * Client-side menu queries
 */
export class MenuQueries {
  private client = getSupabaseClient();

  /**
   * Get all active categories with their menu items
   */
  async getCategoriesWithItems(): Promise<CategoryWithItems[]> {
    const { data, error } = await this.client
      .from('menu_categories')
      .select(`
        *,
        menu_items (*)
      `)
      .eq('is_active', true)
      .order('display_order')
      .order('name', { referencedTable: 'menu_items' });

    if (error) throw error;
    return data as CategoryWithItems[];
  }

  /**
   * Get all active menu items with category info
   */
  async getMenuItemsWithCategories(): Promise<MenuItemWithCategory[]> {
    const { data, error } = await this.client
      .from('menu_items')
      .select(`
        *,
        menu_categories (*)
      `)
      .eq('is_available', true)
      .order('name');

    if (error) throw error;
    return data as MenuItemWithCategory[];
  }

  /**
   * Get menu items by category
   */
  async getMenuItemsByCategory(categoryId: string): Promise<MenuItemRow[]> {
    const { data, error } = await this.client
      .from('menu_items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .order('name');

    if (error) throw error;
    return data;
  }

  /**
   * Get single menu item with category
   */
  async getMenuItem(id: string): Promise<MenuItemWithCategory | null> {
    const { data, error } = await this.client
      .from('menu_items')
      .select(`
        *,
        menu_categories (*)
      `)
      .eq('id', id)
      .eq('is_available', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as MenuItemWithCategory;
  }

  /**
   * Search menu items
   */
  async searchMenuItems(query: string): Promise<MenuItemWithCategory[]> {
    const { data, error } = await this.client
      .from('menu_items')
      .select(`
        *,
        menu_categories (*)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_available', true)
      .order('name');

    if (error) throw error;
    return data as MenuItemWithCategory[];
  }
}

/**
 * Server-side menu queries
 */
export class ServerMenuQueries {
  /**
   * Get all active categories with their menu items (server-side)
   */
  static async getCategoriesWithItems(): Promise<CategoryWithItems[]> {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('menu_categories')
      .select(`
        *,
        menu_items (*)
      `)
      .eq('is_active', true)
      .order('display_order')
      .order('name', { referencedTable: 'menu_items' });

    if (error) throw error;
    return data as CategoryWithItems[];
  }

  /**
   * Get menu items by category (server-side)
   */
  static async getMenuItemsByCategory(categoryId: string): Promise<MenuItemRow[]> {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .order('name');

    if (error) throw error;
    return data;
  }
}

// Singleton instance for client-side usage
export const menuQueries = new MenuQueries();
