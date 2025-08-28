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
  deleteSetting: (settingId: string) => Promise<void>;
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
        
        const { data, error } = await supabase
          .from('theme_settings')
          .select('*')
          .eq('category', 'page_editor')
          .eq('page_scope', pageScope)
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

    const { data, error } = await supabase
      .from('theme_settings')
      .upsert([{
        ...setting,
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'setting_key,page_scope,category'
      })
      .select()
      .single();

    if (error) throw error;

    // Update local state
    setPageSettings(prev => {
      const existing = prev.find(s => s.setting_key === setting.setting_key);
      if (existing) {
        return prev.map(s => s.setting_key === setting.setting_key ? data : s);
      } else {
        return [data, ...prev];
      }
    });
  }, [supabase, isAdmin]);

  // Get element setting
  const getElementSetting = useCallback((elementId: string): ThemeSetting | undefined => {
    return pageSettings.find(setting => setting.setting_key === elementId);
  }, [pageSettings]);

  // Update element content
  const updateElementContent = useCallback(async (elementId: string, content: string) => {
    if (!isAdmin || !adminUserId) throw new Error('Admin access required');

    await savePageSetting({
      setting_key: elementId,
      setting_value: content,
      category: 'page_editor',
      page_scope: pageScope,
      created_by: adminUserId
    });
  }, [savePageSetting, isAdmin, adminUserId, pageScope]);

  // Delete setting
  const deleteSetting = useCallback(async (settingId: string) => {
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
