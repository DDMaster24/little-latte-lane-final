'use client';

import { useState, useCallback } from 'react';

export interface CraftPageData {
  nodes: Record<string, any>;
  page: string;
  lastModified: string;
}

export const useCraftPageData = (pageName: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save page data to database
  const savePage = useCallback(async (craftData: any) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/save-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: pageName,
          data: {
            nodes: craftData,
            page: pageName,
            lastModified: new Date().toISOString(),
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save page');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [pageName]);

  // Load page data from database
  const loadPage = useCallback(async (): Promise<CraftPageData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/save-page?page=${pageName}`);
      
      if (!response.ok) {
        throw new Error('Failed to load page');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [pageName]);

  // Export page as JSON for backup
  const exportPage = useCallback(async () => {
    try {
      const pageData = await loadPage();
      if (pageData) {
        const dataStr = JSON.stringify(pageData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${pageName}-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
    }
  }, [pageName, loadPage]);

  return {
    savePage,
    loadPage,
    exportPage,
    isLoading,
    isSaving,
    error,
  };
};
