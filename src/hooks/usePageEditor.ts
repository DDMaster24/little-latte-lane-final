'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import type { Database } from '@/types/supabase';

type ThemeSetting = Database['public']['Tables']['theme_settings']['Row'];
type ThemeSettingInsert = Database['public']['Tables']['theme_settings']['Insert'];

interface UsePageEditorReturn {
  pageSettings: ThemeSetting[];
  isLoading: boolean;
  isAdmin: boolean;
  savePageSetting: (setting: Omit<ThemeSettingInsert, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  getElementSetting: (elementId: string) => ThemeSetting | undefined;
  updateElementContent: (elementId: string, content: string) => Promise<void>;
  deleteSetting: (settingId: number) => Promise<void>;
}

/**
 * Custom hook for page editor operations
 * Manages page settings, admin authentication, and database operations
 */
export function usePageEditor(pageScope: string, adminUserId?: string): UsePageEditorReturn {
  const [pageSettings, setPageSettings] = useState<ThemeSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = getSupabaseClient();

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          
          setIsAdmin(profile?.is_admin === true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [supabase]);

  // Load page settings
  useEffect(() => {
    const loadPageSettings = async () => {
      if (!isAdmin) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Since page_scope column doesn't exist, use setting_key prefix pattern
        // Format: "pageScope-elementId" (e.g., "homepage-main-heading")
        const { data, error } = await supabase
          .from('theme_settings')
          .select('*')
          .eq('category', 'page_editor')
          .like('setting_key', `${pageScope}-%`)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error loading page settings:', error);
          return;
        }

        setPageSettings(data || []);
      } catch (error) {
        console.error('Error loading page settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPageSettings();
  }, [supabase, pageScope, isAdmin]);

  // Save page setting
  const savePageSetting = useCallback(async (setting: Omit<ThemeSettingInsert, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isAdmin) throw new Error('Admin access required');

    console.log('🔍 DEBUG: usePageEditor savePageSetting called with:', setting);

    try {
      // Ensure setting_key includes pageScope prefix for organization
      const settingKey = setting.setting_key.startsWith(`${pageScope}-`) 
        ? setting.setting_key 
        : `${pageScope}-${setting.setting_key}`;

      // Use server action for better error handling and debugging
      const { saveThemeSetting } = await import('@/app/admin/actions');
      const result = await saveThemeSetting({
        setting_key: settingKey,
        setting_value: setting.setting_value || '',
        category: setting.category || 'page_editor'
      });

      console.log('🔍 DEBUG: Server action result:', result);

      if (!result.success) {
        throw new Error(result.message || 'Save operation failed');
      }

      const data = result.data;
      if (!data) {
        throw new Error('No data returned from save operation');
      }

      // Update local state
      setPageSettings(prev => {
        const existingIndex = prev.findIndex(s => 
          s.setting_key === settingKey && 
          s.category === (setting.category || 'page_editor')
        );
        
        if (existingIndex >= 0) {
          return prev.map((s, i) => i === existingIndex ? data : s);
        } else {
          return [data, ...prev];
        }
      });

      console.log('✅ savePageSetting completed successfully');

    } catch (error) {
      console.error('❌ savePageSetting failed:', error);
      throw error;
    }
  }, [isAdmin, pageScope]);

  // Get element setting
  const getElementSetting = useCallback((elementId: string): ThemeSetting | undefined => {
    // Handle both prefixed and non-prefixed element IDs
    const settingKey = elementId.startsWith(`${pageScope}-`) ? elementId : `${pageScope}-${elementId}`;
    return pageSettings.find(setting => setting.setting_key === settingKey);
  }, [pageSettings, pageScope]);

  // Update element content
  const updateElementContent = useCallback(async (elementId: string, content: string) => {
    if (!isAdmin || !adminUserId) throw new Error('Admin access required');

    // Ensure proper setting key format with pageScope prefix
    const settingKey = elementId.startsWith(`${pageScope}-`) ? elementId : `${pageScope}-${elementId}`;

    await savePageSetting({
      setting_key: settingKey,
      setting_value: content,
      category: 'page_editor'
    });
  }, [savePageSetting, isAdmin, adminUserId, pageScope]);

  // Delete setting
  const deleteSetting = useCallback(async (settingId: number) => {
    if (!isAdmin) throw new Error('Admin access required');

    const { error } = await supabase
      .from('theme_settings')
      .delete()
      .eq('id', settingId);

    if (error) throw error;

    // Update local state
    setPageSettings(prev => prev.filter(s => s.id !== settingId));
  }, [supabase, isAdmin]);

  return {
    pageSettings,
    isLoading,
    isAdmin,
    savePageSetting,
    getElementSetting,
    updateElementContent,
    deleteSetting
  };
}
