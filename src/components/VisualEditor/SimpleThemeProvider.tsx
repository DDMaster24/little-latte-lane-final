'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

interface ThemeContextType {
  getSetting: (key: string, defaultValue?: string) => string;
  updateSetting: (key: string, value: string) => Promise<void>;
  isEditorMode: boolean;
  setEditorMode: (enabled: boolean) => void;
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

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  );

  // Apply theme settings to CSS custom properties
  const applyCSSVariables = useCallback((themeSettings: Record<string, string>) => {
    const root = document.documentElement;
    
    // Apply color settings
    if (themeSettings.primary_color) {
      root.style.setProperty('--theme-primary', themeSettings.primary_color);
    }
    if (themeSettings.secondary_color) {
      root.style.setProperty('--theme-secondary', themeSettings.secondary_color);
    }
    if (themeSettings.accent_color) {
      root.style.setProperty('--theme-accent', themeSettings.accent_color);
    }
  }, []);

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
        settingsMap[setting.setting_key] = setting.setting_value;
      });

      setSettings(settingsMap);
      
      // Apply CSS custom properties
      applyCSSVariables(settingsMap);
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, applyCSSVariables]);

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
        throw error;
      }

      // Update local state
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      // Apply CSS immediately
      applyCSSVariables(newSettings);
    } catch (error) {
      console.error('Failed to update theme setting:', error);
      throw error;
    }
  }, [supabase, settings, applyCSSVariables]);

  // Get a setting value with fallback
  const getSetting = useCallback((key: string, defaultValue = '') => {
    return settings[key] || defaultValue;
  }, [settings]);

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
    getSetting,
    updateSetting,
    isEditorMode,
    setEditorMode,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
