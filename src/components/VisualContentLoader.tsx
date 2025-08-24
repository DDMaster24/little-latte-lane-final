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
        
        console.log('🔄 VisualContentLoader: Loading content for page:', currentPageScope);
        
        const result = await loadVisualContent(currentPageScope);
        
        console.log('📥 VisualContentLoader: Load result:', result);
        
        if (result.success && result.data) {
          const entries = Object.entries(result.data);
          console.log('📝 VisualContentLoader: Found', entries.length, 'saved changes to apply');
          
          // Apply saved content to elements
          entries.forEach(([settingKey, content]) => {
            console.log('🔧 Processing setting:', settingKey, '→', content.substring(0, 50) + '...');
            
            // Parse the setting key: visual_text_elementId
            const keyParts = settingKey.split('_');
            if (keyParts.length >= 3 && keyParts[0] === 'visual' && keyParts[1] === 'text') {
              const elementId = keyParts.slice(2).join('_');
              console.log('🎯 Looking for element with ID:', elementId);
              
              // Find the element by data-visual-id or try to match by content
              let element = document.querySelector(`[data-visual-id="${elementId}"]`) as HTMLElement;
              
              if (!element) {
                // Fallback: try to match by reconstructing the ID pattern
                const [tagName] = elementId.split('_');
                const elements = document.querySelectorAll(tagName);
                
                console.log(`🔍 Fallback search: Found ${elements.length} ${tagName} elements`);
                
                elements.forEach((el, index) => {
                  const reconstructedId = `${tagName}_${(el.textContent || '').slice(0, 20).replace(/\s+/g, '_').toLowerCase()}_${index}`;
                  console.log(`🔍 Checking element ${index}: "${reconstructedId}" vs "${elementId}"`);
                  if (reconstructedId === elementId) {
                    element = el as HTMLElement;
                    console.log('✅ Found matching element!');
                  }
                });
              } else {
                console.log('✅ Found element by data-visual-id');
              }
              
              if (element) {
                const oldContent = element.textContent;
                if (oldContent !== content) {
                  element.textContent = content;
                  console.log('✅ Applied change:', oldContent, '→', content);
                } else {
                  console.log('ℹ️ Content already matches, no change needed');
                }
              } else {
                console.log('❌ Could not find element for:', elementId);
              }
            }
          });
          
          // Apply saved styles if available
          if (result.styles) {
            console.log('🎨 VisualContentLoader: Found saved styles for', Object.keys(result.styles).length, 'elements');
            
            Object.entries(result.styles).forEach(([elementId, styles]) => {
              console.log('🎨 Applying styles to element:', elementId, styles);
              
              // Find the element
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
              
              if (element) {
                // Apply each style property
                Object.entries(styles).forEach(([property, value]) => {
                  if (value && value !== '' && value !== 'transparent') {
                    element.style.setProperty(property, value);
                    console.log('✅ Applied style:', property, '=', value);
                  }
                });
              } else {
                console.log('❌ Could not find element for styles:', elementId);
              }
            });
          }
        } else {
          console.log('⚠️ VisualContentLoader: No content to apply or load failed:', result.error);
        }
      } catch (error) {
        console.error('❌ VisualContentLoader: Error loading visual content:', error);
      }
    };

    // Wait for the page to be fully loaded before applying content
    console.log('⏰ VisualContentLoader: Scheduling content load in 500ms');
    const timer = setTimeout(loadAndApplyContent, 500);
    
    return () => clearTimeout(timer);
  }, [pageScope]);

  // This component doesn't render anything visible
  return null;
}

export default VisualContentLoader;
