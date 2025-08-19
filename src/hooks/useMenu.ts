/**
 * Clean React Hook for Menu Data
 *
 * This replaces all the fragmented hooks with one clean, robust solution.
 * Uses the DataClient for consistent data fetching and caching.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { dataClient, type Category, type MenuItem } from '@/lib/dataClient';

interface UseMenuOptions {
  categoryId?: string;  // Fixed: UUIDs are strings, not numbers
  autoFetch?: boolean;
}

interface UseMenuResult {
  // Data
  categories: Category[];
  menuItems: MenuItem[];

  // State
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => Promise<void>;
  clearCache: () => void;
}

export function useMenu(options: UseMenuOptions = {}): UseMenuResult {
  const { categoryId, autoFetch = true } = options;

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (categoryId) {
        // Fetch specific category items
        const [categoriesResponse, itemsResponse] = await Promise.all([
          dataClient.getCategories(),
          dataClient.getMenuItems(categoryId),
        ]);

        if (categoriesResponse.error) {
          setError(categoriesResponse.error);
          return;
        }

        if (itemsResponse.error) {
          setError(itemsResponse.error);
          return;
        }

        setCategories(categoriesResponse.data || []);
        setMenuItems(itemsResponse.data || []);
      } else {
        // Fetch all menu data
        const response = await dataClient.getMenuData();

        if (response.error) {
          setError(response.error);
          return;
        }

        setCategories(response.data?.categories || []);
        setMenuItems(response.data?.menuItems || []);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load menu data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const clearCache = useCallback(() => {
    dataClient.clearCache();
  }, []);

  // Auto-fetch on mount and when categoryId changes
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    categories,
    menuItems,
    loading,
    error,
    refetch,
    clearCache,
  };
}
