'use client';

import { ReactNode, useEffect } from 'react';
import { EditorModeProvider } from '@/contexts/EditorModeContext';

interface EditorLayoutProps {
  children: ReactNode;
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  // Add body class when editor is active
  useEffect(() => {
    // Add body class for global editor styles
    document.body.classList.add('editor-active');
    document.documentElement.classList.add('editor-active');
    
    return () => {
      // Clean up classes when editor unmounts
      document.body.classList.remove('editor-active');
      document.documentElement.classList.remove('editor-active');
    };
  }, []);

  return (
    <EditorModeProvider isEditorMode={true}>
      <div className="min-h-screen bg-darkBg editor-mode">
        {/* Editor-specific global styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* GLOBAL EDITOR MODE - Hide navigation when editor is active */
            body.editor-active header,
            body.editor-active footer,
            html.editor-active header,
            html.editor-active footer {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              height: 0 !important;
              overflow: hidden !important;
            }
            
            /* Ensure main content fills full viewport in editor mode */
            body.editor-active {
              overflow: hidden !important;
            }
            
            body.editor-active main {
              padding-top: 0 !important;
              margin-top: 0 !important;
              overflow-y: auto !important;
              height: 100vh !important;
            }
            
            /* Hide all navigation and headers in editor mode */
            .editor-mode header,
            .editor-mode nav,
            .editor-mode footer,
            .editor-mode [data-component="header"],
            .editor-mode [data-component="navigation"],
            .editor-mode [data-component="footer"] {
              display: none !important;
            }
            
            /* Target any navigation elements */
            .editor-mode .navigation,
            .editor-mode .header,
            .editor-mode .footer,
            .editor-mode [role="navigation"],
            .editor-mode [role="banner"],
            .editor-mode [role="contentinfo"] {
              display: none !important;
            }

            /* Disable all links in editor mode */
            .editor-mode a {
              pointer-events: none !important;
              cursor: default !important;
            }

            /* Re-enable pointer events for editable elements - AGGRESSIVE */
            .editor-mode [data-editable] {
              pointer-events: auto !important;
              cursor: pointer !important;
              position: relative !important;
              z-index: 10 !important;
            }

            /* Ensure editable children can be clicked - FORCE ENABLE */
            .editor-mode [data-editable] * {
              pointer-events: auto !important;
              cursor: pointer !important;
            }
            
            /* OVERRIDE any conflicting pointer-events */
            .editor-mode [data-editable]:hover * {
              pointer-events: auto !important;
              cursor: pointer !important;
            }

            /* Enhanced hover effects - NEON ORANGE theme */
            .editor-mode [data-editable]:hover {
              outline: 2px solid #FF4500 !important;
              outline-offset: 2px !important;
              box-shadow: 0 0 10px rgba(255, 69, 0, 0.5) !important;
              z-index: 100 !important;
            }

            /* Selected state - NEON ORANGE */
            .editor-mode [data-editable].selected {
              outline: 2px solid #FF4500 !important;
              outline-offset: 2px !important;
              box-shadow: 0 0 15px rgba(255, 69, 0, 0.8) !important;
              z-index: 100 !important;
            }

            /* Specific styles for different element types - NEON ORANGE variations */
            .editor-mode [data-editable*="icon"]:hover {
              outline: 2px solid #FF4500 !important;
              background: rgba(255, 69, 0, 0.1) !important;
            }

            .editor-mode [data-editable*="title"]:hover,
            .editor-mode [data-editable*="text"]:hover {
              outline: 2px solid #FF4500 !important;
              background: rgba(255, 69, 0, 0.1) !important;
            }

            .editor-mode [data-editable*="button"]:hover {
              outline: 2px solid #FF4500 !important;
              background: rgba(255, 69, 0, 0.1) !important;
            }

            .editor-mode [data-editable*="description"]:hover {
              outline: 2px solid #FF4500 !important;
              background: rgba(255, 69, 0, 0.1) !important;
            }
          `
        }} />
        
        {/* Render page content without navigation */}
        {children}
      </div>
    </EditorModeProvider>
  );
}
