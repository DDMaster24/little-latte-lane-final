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
   * Handles both regular categories and showcase categories
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

    // Process showcase categories to show items with linked add-ons
    const processedData = await Promise.all(
      (data as CategoryWithItems[]).map(async (category) => {
        if (category.is_showcase) {
          // Get items for showcase category
          const showcaseItems = await this.getShowcaseItems(category.id);
          return { ...category, menu_items: showcaseItems };
        }
        return category;
      })
    );

    return processedData;
  }

  /**
   * Get menu items for a showcase category
   * Returns all menu items that have add-ons linked to this category
   */
  private async getShowcaseItems(categoryId: string): Promise<MenuItemRow[]> {
    // Step 1: Get all add-ons linked to this showcase category
    const { data: addonLinks, error: addonError } = await this.client
      .from('menu_item_addons')
      .select('addon_id')
      .eq('category_id', categoryId);

    if (addonError) throw addonError;
    if (!addonLinks || addonLinks.length === 0) return [];

    const addonIds = addonLinks.map(link => link.addon_id);

    // Step 2: Get all menu items that have these add-ons
    const { data: itemLinks, error: itemError } = await this.client
      .from('menu_item_addons')
      .select('menu_item_id')
      .in('addon_id', addonIds)
      .not('menu_item_id', 'is', null);

    if (itemError) throw itemError;
    if (!itemLinks || itemLinks.length === 0) return [];

    // Get unique menu item IDs
    const uniqueItemIds = [...new Set(itemLinks.map(link => link.menu_item_id).filter((id): id is string => id !== null))];

    // Step 3: Fetch the actual menu items
    const { data: items, error: itemsError } = await this.client
      .from('menu_items')
      .select('*')
      .in('id', uniqueItemIds)
      .eq('is_available', true)
      .order('name');

    if (itemsError) throw itemsError;
    return items || [];
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
   * Handles both regular categories and showcase categories
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

    // Process showcase categories to show items with linked add-ons
    const processedData = await Promise.all(
      (data as CategoryWithItems[]).map(async (category) => {
        if (category.is_showcase) {
          // Get items for showcase category
          const showcaseItems = await ServerMenuQueries.getShowcaseItems(category.id);
          return { ...category, menu_items: showcaseItems };
        }
        return category;
      })
    );

    return processedData;
  }

  /**
   * Get menu items for a showcase category (server-side)
   * Returns all menu items that have add-ons linked to this category
   */
  private static async getShowcaseItems(categoryId: string): Promise<MenuItemRow[]> {
    const supabase = await getSupabaseServer();

    // Step 1: Get all add-ons linked to this showcase category
    const { data: addonLinks, error: addonError } = await supabase
      .from('menu_item_addons')
      .select('addon_id')
      .eq('category_id', categoryId);

    if (addonError) throw addonError;
    if (!addonLinks || addonLinks.length === 0) return [];

    const addonIds = addonLinks.map(link => link.addon_id);

    // Step 2: Get all menu items that have these add-ons
    const { data: itemLinks, error: itemError } = await supabase
      .from('menu_item_addons')
      .select('menu_item_id')
      .in('addon_id', addonIds)
      .not('menu_item_id', 'is', null);

    if (itemError) throw itemError;
    if (!itemLinks || itemLinks.length === 0) return [];

    // Get unique menu item IDs
    const uniqueItemIds = [...new Set(itemLinks.map(link => link.menu_item_id).filter((id): id is string => id !== null))];

    // Step 3: Fetch the actual menu items
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .in('id', uniqueItemIds)
      .eq('is_available', true)
      .order('name');

    if (itemsError) throw itemsError;
    return items || [];
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
