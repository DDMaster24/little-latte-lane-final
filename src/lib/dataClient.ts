/**
 * Data Client - Single Source of Truth for all data fetching
 *
 * This replaces all the fragmented hooks with one clean, robust solution.
 * Built with proper TypeScript, error handling, and caching.
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Consistent type definitions
export interface Category {
  id: string;  // UUID in our database
  name: string;
  description: string | null;
  image_url: string | null;
  display_order: number;  // Changed from sort_order
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;  // UUID in our database
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;  // UUID in our database
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Response wrapper for consistent API responses
interface DataResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Simple, robust cache implementation
class DataCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Singleton instances
const cache = new DataCache();
const supabase = createClientComponentClient<Database>();

// Main data client class
export class DataClient {
  private static instance: DataClient;

  static getInstance(): DataClient {
    if (!DataClient.instance) {
      DataClient.instance = new DataClient();
    }
    return DataClient.instance;
  }

  private constructor() {}

  // Test database connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('menu_categories').select('id').limit(1);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  // Fetch categories with proper error handling and caching
  async getCategories(useCache = true): Promise<DataResponse<Category[]>> {
    const cacheKey = 'categories';

    try {
      // Check cache first
      if (useCache) {
        const cached = cache.get<Category[]>(cacheKey);
        if (cached) {
          return { data: cached, error: null, loading: false };
        }
      }

      // Fetch from database
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        return { data: null, error: error.message, loading: false };
      }

      const categories = data || [];

      // Cache the result
      cache.set(cacheKey, categories);

      return { data: categories, error: null, loading: false };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : 'Failed to load categories';
      return { data: null, error, loading: false };
    }
  }

  // Fetch menu items with proper error handling and caching
  async getMenuItems(
    categoryId?: number,
    useCache = true
  ): Promise<DataResponse<MenuItem[]>> {
    const cacheKey = `menu-items-${categoryId || 'all'}`;

    try {
      // Check cache first
      if (useCache) {
        const cached = cache.get<MenuItem[]>(cacheKey);
        if (cached) {
          return { data: cached, error: null, loading: false };
        }
      }

      // Build query
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      query = query.order('name', { ascending: true }); // Order by name since we don't have sort_order

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message, loading: false };
      }

      const menuItems = data || [];

      // Cache the result
      cache.set(cacheKey, menuItems);

      return { data: menuItems, error: null, loading: false };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : 'Failed to load menu items';
      return { data: null, error, loading: false };
    }
  }

  // Get both categories and menu items in one optimized call
  async getMenuData(useCache = true): Promise<
    DataResponse<{
      categories: Category[];
      menuItems: MenuItem[];
    }>
  > {
    const cacheKey = 'full-menu-data';

    try {
      // Check cache first
      if (useCache) {
        const cached = cache.get<{
          categories: Category[];
          menuItems: MenuItem[];
        }>(cacheKey);
        if (cached) {
          return { data: cached, error: null, loading: false };
        }
      }

      // Fetch both in parallel for better performance
      const [categoriesResponse, menuItemsResponse] = await Promise.all([
        this.getCategories(false), // Don't use cache since we're handling it here
        this.getMenuItems(undefined, false), // Don't use cache since we're handling it here
      ]);

      if (categoriesResponse.error) {
        return { data: null, error: categoriesResponse.error, loading: false };
      }

      if (menuItemsResponse.error) {
        return { data: null, error: menuItemsResponse.error, loading: false };
      }

      const result = {
        categories: categoriesResponse.data || [],
        menuItems: menuItemsResponse.data || [],
      };

      // Cache the combined result
      cache.set(cacheKey, result);

      return { data: result, error: null, loading: false };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : 'Failed to load menu data';
      return { data: null, error, loading: false };
    }
  }

  // Clear all cache
  clearCache(): void {
    cache.clear();
  }

  // Clear specific cache entry
  clearCacheEntry(key: string): void {
    cache.delete(key);
  }
}

// Export singleton instance
export const dataClient = DataClient.getInstance();
