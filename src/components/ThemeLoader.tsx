'use client';

import { useEffect } from 'react';

interface ThemeLoaderProps {
  pageName: string;
}

export default function ThemeLoader({ pageName }: ThemeLoaderProps) {
  useEffect(() => {
    const loadSavedStyles = async () => {
      try {
        // Get all editable elements on the page
        const editableElements = document.querySelectorAll('[data-editable]');
        
        for (const element of editableElements) {
          const elementId = element.getAttribute('data-editable');
          if (!elementId) continue;

          // Load saved styles
          try {
            const stylesResponse = await fetch(`/api/page-editor/styles?pageName=${pageName}&elementId=${elementId}`);
            const stylesResult = await stylesResponse.json();
            
            if (stylesResult.success && stylesResult.styles && Object.keys(stylesResult.styles).length > 0) {
              const htmlElement = element as HTMLElement;
              const styles = stylesResult.styles;
              
              // Apply saved styles
              Object.entries(styles).forEach(([property, value]) => {
                if (value && value !== 'unset') {
                  // Convert camelCase to kebab-case for CSS properties
                  const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
                  htmlElement.style.setProperty(cssProperty, value as string);
                }
              });
              
              console.log(`Applied saved styles to ${elementId}:`, styles);
            }
          } catch (error) {
            console.error(`Error loading styles for ${elementId}:`, error);
          }

          // Load saved text
          try {
            const textResponse = await fetch(`/api/page-editor/text?pageName=${pageName}&elementId=${elementId}`);
            const textResult = await textResponse.json();
            
            if (textResult.success && textResult.text) {
              const htmlElement = element as HTMLElement;
              
              // Special handling for different element types
              if (htmlElement.tagName === 'INPUT' || htmlElement.tagName === 'TEXTAREA') {
                (htmlElement as HTMLInputElement).value = textResult.text;
              } else {
                htmlElement.textContent = textResult.text;
              }
              
              console.log(`Applied saved text to ${elementId}:`, textResult.text);
            }
          } catch (error) {
            console.error(`Error loading text for ${elementId}:`, error);
          }
        }
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
