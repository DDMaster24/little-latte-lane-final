'use client';

import { ReactNode, useEffect } from 'react';
import { EditorModeProvider } from '@/contexts/EditorModeContext';

interface EditorLayoutProps {
  children: ReactNode;
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  // Clean setup - add necessary body classes
  useEffect(() => {
    document.body.classList.add('editor-active', 'editor-mode');
    
    return () => {
      document.body.classList.remove('editor-active', 'editor-mode');
    };
  }, []);

  return (
    <EditorModeProvider isEditorMode={true}>
      <div className="min-h-screen">
        {/* MINIMAL editor styles with targeted white background fixes */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Hide navigation in editor mode only */
            body.editor-active header,
            body.editor-active footer,
            body.editor-active nav[role="navigation"] {
              display: none !important;
            }
            
            /* TARGET ONLY BODY/HTML - not content containers */
            body.editor-active,
            body.editor-active html {
              background-color: #111827 !important;
            }
            
            /* Only fix obvious white backgrounds, not containers */
            body.editor-active [class*="bg-white"]:not(section):not([data-editable]) {
              background-color: #111827 !important;
            }
            
            /* Clean element selection styling */
            .editor-mode [data-editable] {
              cursor: pointer;
              position: relative;
              transition: all 0.2s ease;
            }
            
            /* NEON ORANGE HOVER EFFECT */
            .editor-mode [data-editable]:hover {
              outline: 3px solid #FF4500 !important;
              outline-offset: 2px !important;
              box-shadow: 0 0 15px rgba(255, 69, 0, 0.6), 0 0 30px rgba(255, 69, 0, 0.3) !important;
              transition: all 0.2s ease !important;
            }
            
            /* NEON RED SELECTED STATE WITH PULSING ANIMATION */
            .editor-mode [data-editable].selected {
              outline: 3px solid #FF0040 !important;
              outline-offset: 2px !important;
              box-shadow: 0 0 20px rgba(255, 0, 64, 0.8), 0 0 40px rgba(255, 0, 64, 0.4) !important;
              background: rgba(255, 0, 64, 0.1) !important;
              z-index: 100 !important;
              animation: neonSelectedPulse 2s infinite ease-in-out !important;
            }
            
            /* Ensure selected state overrides hover with enhanced glow */
            .editor-mode [data-editable].selected:hover {
              outline: 3px solid #FF0040 !important;
              outline-offset: 2px !important;
              box-shadow: 0 0 30px rgba(255, 0, 64, 1.0), 0 0 60px rgba(255, 0, 64, 0.6) !important;
              animation: neonSelectedPulse 1.5s infinite ease-in-out !important;
            }
            
            /* Pulsing animation for selected elements */
            @keyframes neonSelectedPulse {
              0%, 100% {
                box-shadow: 0 0 20px rgba(255, 0, 64, 0.8), 0 0 40px rgba(255, 0, 64, 0.4);
              }
              50% {
                box-shadow: 0 0 25px rgba(255, 0, 64, 0.9), 0 0 50px rgba(255, 0, 64, 0.5);
              }
            }
            
            /* Enhanced visibility for nested elements */
            .editor-mode [data-editable] [data-editable]:hover {
              outline: 3px solid #FF4500 !important;
              outline-offset: 2px !important;
              z-index: 50 !important;
            }
            
            .editor-mode [data-editable] [data-editable].selected {
              outline: 3px solid #FF0040 !important;
              outline-offset: 2px !important;
              z-index: 101 !important;
            }
          `
        }} />
        
        {children}
      </div>
    </EditorModeProvider>
  );
}
