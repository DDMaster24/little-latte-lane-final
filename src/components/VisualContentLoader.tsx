'use client';

import { useEffect } from 'react';
import { loadVisualContent } from '@/lib/actions/visualEditorActions';

interface VisualContentLoaderProps {
  pageScope?: string;
}

export function VisualContentLoader({ pageScope }: VisualContentLoaderProps) {
  useEffect(() => {
    const loadAndApplyContent = async () => {
      try {
        const currentPageScope = pageScope || (
          window.location.pathname === '/' ? 'homepage' : window.location.pathname.replace('/', '')
        );
        
        const result = await loadVisualContent(currentPageScope);
        
        if (result.success && result.data) {
          // Apply saved content to elements
          Object.entries(result.data).forEach(([settingKey, content]) => {
            // Parse the setting key: visual_text_elementId
            const keyParts = settingKey.split('_');
            if (keyParts.length >= 3 && keyParts[0] === 'visual' && keyParts[1] === 'text') {
              const elementId = keyParts.slice(2).join('_');
              
              // Find the element by data-visual-id or try to match by content
              let element = document.querySelector(`[data-visual-id="${elementId}"]`) as HTMLElement;
              
              if (!element) {
                // Fallback: try to match by reconstructing the ID pattern
                const [tagName] = elementId.split('_');
                const elements = document.querySelectorAll(tagName);
                
                elements.forEach((el, index) => {
                  const reconstructedId = `${tagName}_${(el.textContent || '').slice(0, 20).replace(/\s+/g, '_').toLowerCase()}_${index}`;
                  if (reconstructedId === elementId) {
                    element = el as HTMLElement;
                  }
                });
              }
              
              if (element && element.textContent !== content) {
                element.textContent = content;
              }
            }
          });
        }
      } catch (error) {
        console.error('Error loading visual content:', error);
      }
    };

    // Wait for the page to be fully loaded before applying content
    const timer = setTimeout(loadAndApplyContent, 500);
    
    return () => clearTimeout(timer);
  }, [pageScope]);

  // This component doesn't render anything visible
  return null;
}

export default VisualContentLoader;
