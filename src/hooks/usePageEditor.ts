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

    // First, try to find existing setting
    const { data: existing } = await supabase
      .from('theme_settings')
      .select('id')
      .eq('setting_key', setting.setting_key)
      .eq('page_scope', setting.page_scope || '')
      .eq('category', setting.category || '')
      .single();

    let data;
    let error;

    if (existing) {
      // Update existing record
      const result = await supabase
        .from('theme_settings')
        .update({
          setting_value: setting.setting_value,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase
        .from('theme_settings')
        .insert([{
          ...setting,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) throw error;
    if (!data) throw new Error('No data returned from save operation');

    // Update local state
    setPageSettings(prev => {
      const existingIndex = prev.findIndex(s => 
        s.setting_key === setting.setting_key && 
        s.page_scope === setting.page_scope && 
        s.category === setting.category
      );
      
      if (existingIndex >= 0) {
        return prev.map((s, i) => i === existingIndex ? data : s);
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
