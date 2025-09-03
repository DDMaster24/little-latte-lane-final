'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';

export interface ThemeSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'color' | 'font' | 'number' | 'text' | 'image' | 'json';
  category: 'colors' | 'typography' | 'layout' | 'content' | 'images';
  page_scope: string;
  description?: string;
}

interface ThemeContextType {
  settings: Record<string, string>;
  isEditorMode: boolean;
  setEditorMode: (enabled: boolean) => void;
  updateSetting: (key: string, value: string) => Promise<void>;
  getSetting: (key: string, defaultValue?: string) => string;
  applyTheme: () => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  // Load theme settings from database
  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.error('Error loading theme settings:', error);
        return;
      }

      const settingsMap: Record<string, string> = {};
      data?.forEach((setting) => {
        if (setting.setting_value) {
          settingsMap[setting.setting_key] = setting.setting_value;
        }
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Update a setting in the database
  const updateSetting = useCallback(async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('theme_settings')
        .upsert({ 
          setting_key: key, 
          setting_value: value 
        }, { 
          onConflict: 'setting_key' 
        });

      if (error) {
        console.error('Error updating theme setting:', error);
        return;
      }

      // Update local state immediately
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));

      // Apply theme changes immediately
      applyTheme();
    } catch (error) {
      console.error('Failed to update theme setting:', error);
    }
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get a setting value with fallback
  const getSetting = useCallback((key: string, defaultValue = '') => {
    return settings[key] || defaultValue;
  }, [settings]);

  // Apply theme to CSS custom properties
  const applyTheme = useCallback(() => {
    const root = document.documentElement;
    
    // Apply color settings
    root.style.setProperty('--theme-primary', getSetting('primary_color', '#00FFFF'));
    root.style.setProperty('--theme-secondary', getSetting('secondary_color', '#FF00FF'));
    root.style.setProperty('--theme-accent', getSetting('accent_color', '#0066FF'));
    root.style.setProperty('--theme-bg-primary', getSetting('background_primary', '#111827'));
    root.style.setProperty('--theme-bg-secondary', getSetting('background_secondary', '#1F2937'));
    root.style.setProperty('--theme-text-primary', getSetting('text_primary', '#FFFFFF'));
    root.style.setProperty('--theme-text-secondary', getSetting('text_secondary', '#9CA3AF'));

    // Apply typography settings
    root.style.setProperty('--theme-font-primary', getSetting('font_family_primary', 'Inter, system-ui, sans-serif'));
    root.style.setProperty('--theme-font-secondary', getSetting('font_family_secondary', 'Inter, system-ui, sans-serif'));
    root.style.setProperty('--theme-font-size-base', getSetting('font_size_base', '16') + 'px');
    root.style.setProperty('--theme-font-size-heading', getSetting('font_size_heading', '48') + 'px');
    root.style.setProperty('--theme-line-height-base', getSetting('line_height_base', '1.5'));

    // Apply layout settings
    root.style.setProperty('--theme-container-max-width', getSetting('container_max_width', '1200') + 'px');
    root.style.setProperty('--theme-section-padding', getSetting('section_padding', '96') + 'px');
    root.style.setProperty('--theme-border-radius', getSetting('border_radius', '12') + 'px');
  }, [getSetting]);

  // Check for editor mode in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editorParam = urlParams.get('editor');
    if (editorParam === 'true') {
      setIsEditorMode(true);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Apply theme when settings change
  useEffect(() => {
    if (!loading) {
      applyTheme();
    }
  }, [settings, loading, applyTheme]);

  const setEditorMode = useCallback((enabled: boolean) => {
    setIsEditorMode(enabled);
    
    // Update URL without page reload
    const url = new URL(window.location.href);
    if (enabled) {
      url.searchParams.set('editor', 'true');
    } else {
      url.searchParams.delete('editor');
    }
    window.history.replaceState({}, '', url.toString());
  }, []);

  const value: ThemeContextType = {
    settings,
    isEditorMode,
    setEditorMode,
    updateSetting,
    getSetting,
    applyTheme,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
