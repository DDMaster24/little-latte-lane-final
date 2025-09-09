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
        
        // Load all theme_settings for this page using setting_key prefix pattern
        const { data: settings, error } = await supabase
          .from('theme_settings')
          .select('*')
          .eq('category', 'page_editor')
          .like('setting_key', `${pageName}-%`);

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
          // Remove the pageScope prefix to get the actual element ID
          const elementId = setting.setting_key.replace(`${pageName}-`, '');
          
          // Handle text content
          if (!elementId.includes('_color') && 
              !elementId.includes('_background') && 
              !elementId.includes('_content') && 
              !elementId.includes('_background_image')) {
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
          
          // Handle background styles (including gradients)
          if (elementId.includes('_background') && !elementId.includes('_background_image')) {
            const baseElementId = elementId.replace('_background', '');
            const element = document.querySelector(`[data-editable="${baseElementId}"]`) as HTMLElement;
            if (element && setting.setting_value) {
              // Check if it's a gradient or solid color
              if (setting.setting_value.includes('gradient')) {
                element.style.background = setting.setting_value;
                element.style.backgroundImage = setting.setting_value;
                console.log('🌈 Applied gradient:', baseElementId, setting.setting_value);
              } else {
                element.style.backgroundColor = setting.setting_value;
                console.log('🖼️ Applied background:', baseElementId, setting.setting_value);
              }
            }
          }
          
          // Handle background image styles
          if (elementId.includes('_background_image')) {
            const baseElementId = elementId.replace('_background_image', '');
            const element = document.querySelector(`[data-editable="${baseElementId}"]`) as HTMLElement;
            if (element && setting.setting_value) {
              element.style.backgroundImage = `url('${setting.setting_value}')`;
              element.style.backgroundSize = 'cover';
              element.style.backgroundPosition = 'center';
              element.style.backgroundRepeat = 'no-repeat';
              console.log('🖼️ Applied background image:', baseElementId, setting.setting_value);
            }
          }
          
          // Handle icon/content changes
          if (elementId.includes('_content')) {
            const baseElementId = elementId.replace('_content', '');
            const element = document.querySelector(`[data-editable="${baseElementId}"]`) as HTMLElement;
            if (element && setting.setting_value) {
              // Check if it's an emoji or image URL
              if (setting.setting_value.length === 1 && /^\p{Emoji}$/u.test(setting.setting_value)) {
                // It's an emoji
                element.textContent = setting.setting_value;
                console.log('😀 Applied emoji icon:', baseElementId, setting.setting_value);
              } else if (setting.setting_value.startsWith('http')) {
                // It's an image URL
                element.innerHTML = `<img src="${setting.setting_value}" alt="Icon" style="width: 100%; height: 100%; object-fit: contain;" />`;
                console.log('🖼️ Applied image icon:', baseElementId, setting.setting_value);
              }
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
