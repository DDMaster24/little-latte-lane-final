'use client';

import { useEffect } from 'react';
import { usePageEditor } from '@/hooks/usePageEditor';
import { useAuth } from '@/components/AuthProvider';

interface StyleLoaderProps {
  pageScope: string;
}

export default function StyleLoader({ pageScope }: StyleLoaderProps) {
  const { user } = useAuth();
  const { pageSettings, isLoading } = usePageEditor(pageScope, user?.id);

  useEffect(() => {
    if (isLoading || !pageSettings.length) return;

    console.log('🎨 Loading saved page styles...', pageSettings.length, 'settings found');

    // Apply all saved styles
    pageSettings.forEach(setting => {
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
  }, [pageSettings, isLoading]);

  return null; // This component doesn't render anything
}
