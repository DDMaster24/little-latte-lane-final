'use client';

import { useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';

interface ThemeLoaderProps {
  pageName: string;
}

export default function ThemeLoader({ pageName }: ThemeLoaderProps) {
  useEffect(() => {
    const loadSavedStyles = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Load all theme_settings for this page
        const { data: settings, error } = await supabase
          .from('theme_settings')
          .select('*')
          .eq('category', 'page_editor')
          .eq('page_scope', pageName);

        if (error) {
          console.error('Error loading theme settings:', error);
          return;
        }

        if (!settings || settings.length === 0) {
          console.log('No saved theme settings found for page:', pageName);
          return;
        }

        console.log('🎨 Loading saved page styles...', settings.length, 'settings found');

        // Apply all saved styles
        settings.forEach(setting => {
          const elementId = setting.setting_key;
          
          // Handle text content
          if (!elementId.includes('_color') && !elementId.includes('_background')) {
            const element = document.querySelector(`[data-editable="${elementId}"]`);
            if (element && setting.setting_value) {
              element.textContent = setting.setting_value;
              console.log('📝 Applied text:', elementId, setting.setting_value);
            }
          }
          
          // Handle color styles
          if (elementId.includes('_color')) {
            const baseElementId = elementId.replace('_color', '');
            const element = document.querySelector(`[data-editable="${baseElementId}"]`) as HTMLElement;
            if (element && setting.setting_value) {
              element.style.color = setting.setting_value;
              console.log('🎨 Applied color:', baseElementId, setting.setting_value);
            }
          }
          
          // Handle background styles
          if (elementId.includes('_background')) {
            const baseElementId = elementId.replace('_background', '');
            const element = document.querySelector(`[data-editable="${baseElementId}"]`) as HTMLElement;
            if (element && setting.setting_value) {
              element.style.backgroundColor = setting.setting_value;
              console.log('🖼️ Applied background:', baseElementId, setting.setting_value);
            }
          }
        });
      } catch (error) {
        console.error('Error loading saved theme data:', error);
      }
    };

    // Load styles after a short delay to ensure DOM is ready
    const timer = setTimeout(loadSavedStyles, 100);
    
    return () => clearTimeout(timer);
  }, [pageName]);

  return null; // This component doesn't render anything
}
