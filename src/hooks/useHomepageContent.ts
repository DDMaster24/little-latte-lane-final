import { useState, useEffect, useCallback } from 'react';
import { HomepageContentService, HomepageContentData, DEFAULT_HOMEPAGE_CONTENT } from '@/lib/services/HomepageContentService';
import { useAuth } from '@/components/AuthProvider';

interface UseHomepageContentReturn {
  content: HomepageContentData;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  updateContent: (key: keyof HomepageContentData, value: string) => Promise<void>;
  saveContent: (content: Partial<HomepageContentData>) => Promise<void>;
  resetContent: () => Promise<void>;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
}

/**
 * Hook for managing homepage content with database persistence
 * Provides real-time loading, saving, and auto-persistence
 */
export function useHomepageContent(): UseHomepageContentReturn {
  const { profile } = useAuth();
  const isStaffOrAdmin = profile?.is_staff || profile?.is_admin;

  // State management
  const [content, setContent] = useState<HomepageContentData>(DEFAULT_HOMEPAGE_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  /**
   * Load content from database on mount
   */
  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔄 useHomepageContent: Loading content...');
        const loadedContent = await HomepageContentService.loadHomepageContent();
        
        setContent(loadedContent);
        setHasUnsavedChanges(false);
        console.log('✅ useHomepageContent: Content loaded successfully');
        
      } catch (err) {
        console.error('❌ useHomepageContent: Error loading content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
        // Keep default content on error
        setContent(DEFAULT_HOMEPAGE_CONTENT);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  /**
   * Update a single content field and save to database
   */
  const updateContent = useCallback(async (
    key: keyof HomepageContentData, 
    value: string
  ) => {
    if (!isStaffOrAdmin) {
      console.warn('🚫 Non-admin user attempted to update content');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      console.log(`💾 useHomepageContent: Updating ${key} with value:`, value);

      // Update local state immediately for responsive UI
      setContent(prev => ({
        ...prev,
        [key]: value
      }));

      // Save to database
      await HomepageContentService.saveHomepageContentField(key, value);
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log(`✅ useHomepageContent: Successfully updated ${key}`);

    } catch (err) {
      console.error(`❌ useHomepageContent: Error updating ${key}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      setHasUnsavedChanges(true);
    } finally {
      setSaving(false);
    }
  }, [isStaffOrAdmin]);

  /**
   * Save multiple content fields to database
   */
  const saveContent = useCallback(async (partialContent: Partial<HomepageContentData>) => {
    if (!isStaffOrAdmin) {
      console.warn('🚫 Non-admin user attempted to save content');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      console.log('💾 useHomepageContent: Saving multiple fields:', Object.keys(partialContent));

      // Update local state immediately
      setContent(prev => ({
        ...prev,
        ...partialContent
      }));

      // Save to database
      await HomepageContentService.saveHomepageContent(partialContent);
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('✅ useHomepageContent: Successfully saved content');

    } catch (err) {
      console.error('❌ useHomepageContent: Error saving content:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      setHasUnsavedChanges(true);
    } finally {
      setSaving(false);
    }
  }, [isStaffOrAdmin]);

  /**
   * Reset content to defaults
   */
  const resetContent = useCallback(async () => {
    if (!isStaffOrAdmin) {
      console.warn('🚫 Non-admin user attempted to reset content');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      console.log('🔄 useHomepageContent: Resetting to defaults...');

      // Reset to defaults
      await HomepageContentService.resetHomepageContent();
      setContent(DEFAULT_HOMEPAGE_CONTENT);
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('✅ useHomepageContent: Content reset to defaults');

    } catch (err) {
      console.error('❌ useHomepageContent: Error resetting content:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset content');
    } finally {
      setSaving(false);
    }
  }, [isStaffOrAdmin]);

  return {
    content,
    isLoading,
    isSaving,
    error,
    updateContent,
    saveContent,
    resetContent,
    hasUnsavedChanges,
    lastSaved
  };
}
