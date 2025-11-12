/**
 * Clean React Hook for Menu Data
 *
 * This replaces all the fragmented hooks with one clean, robust solution.
 * Uses the DataClient for consistent data fetching and caching.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Category, MenuItem } from '@/lib/dataClient';

// Lazy import to avoid potential circular dependencies
const getDataClient = async () => {
  const { dataClient } = await import('@/lib/dataClient');
  return dataClient;
};

interface UseMenuOptions {
  categoryId?: string;  // Fixed: UUIDs are strings, not numbers
  autoFetch?: boolean;
}

interface UseMenuResult {
  // Data
  categories: Category[];
  sections: Category[];  // Add sections to the return type
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
  const [sections, setSections] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dataClient = await getDataClient();

      if (categoryId) {
        // Fetch categories first to check if this is a showcase category
        const categoriesResponse = await dataClient.getCategories();

        if (categoriesResponse.error) {
          setError(categoriesResponse.error);
          return;
        }

        const categories = categoriesResponse.data || [];
        const selectedCategory = categories.find(c => c.id === categoryId);

        // Check if this is a showcase category
        const isShowcase = selectedCategory?.is_showcase === true;

        // Fetch items based on category type
        const [sectionsResponse, itemsResponse] = await Promise.all([
          dataClient.getSections(),
          isShowcase && selectedCategory?.name
            ? dataClient.getShowcaseItems(selectedCategory.name)
            : dataClient.getMenuItems(categoryId),
        ]);

        if (sectionsResponse.error) {
          setError(sectionsResponse.error);
          return;
        }

        if (itemsResponse.error) {
          setError(itemsResponse.error);
          return;
        }

        setCategories(categories);
        setSections(sectionsResponse.data || []);
        setMenuItems(itemsResponse.data || []);
      } else {
        // Fetch all menu data including sections
        const [menuResponse, sectionsResponse] = await Promise.all([
          dataClient.getMenuData(),
          dataClient.getSections(),
        ]);

        if (menuResponse.error) {
          setError(menuResponse.error);
          return;
        }

        if (sectionsResponse.error) {
          setError(sectionsResponse.error);
          return;
        }

        setCategories(menuResponse.data?.categories || []);
        setSections(sectionsResponse.data || []);
        setMenuItems(menuResponse.data?.menuItems || []);
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

  const clearCache = useCallback(async () => {
    const dataClient = await getDataClient();
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
    sections,
    menuItems,
    loading,
    error,
    refetch,
    clearCache,
  };
}
