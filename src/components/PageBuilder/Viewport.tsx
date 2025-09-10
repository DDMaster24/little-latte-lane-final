'use client';

import React from 'react';
import { useEditor } from '@craftjs/core';

interface ViewportProps {
  children: React.ReactNode;
}

export const Viewport: React.FC<ViewportProps> = ({ children }) => {
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  return (
    <div 
      className={`bg-gray-100 min-h-screen ${enabled ? 'p-4' : ''}`}
      style={{
        transition: 'padding 0.3s ease'
      }}
    >
      <div className={`${enabled ? 'shadow-lg rounded-lg overflow-hidden' : ''} bg-white min-h-full`}>
        {children}
      </div>
      
      {/* Global styles for editor mode */}
      {enabled && (
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Hover effect for editable components */
            [data-cy="component-wrapper"]:hover {
              outline: 2px solid #ef4444 !important;
              outline-offset: 2px;
              box-shadow: 0 0 10px rgba(239, 68, 68, 0.5) !important;
              cursor: pointer !important;
              transition: all 0.2s ease-in-out;
            }
            
            /* Selection effect for selected components */
            [data-cy="component-wrapper"].ring-blue-500 {
              outline: 3px solid #3b82f6 !important;
              outline-offset: 2px;
              box-shadow: 0 0 15px rgba(59, 130, 246, 0.7) !important;
              background: rgba(59, 130, 246, 0.05) !important;
            }
            
            /* Better visual feedback for ContentEditable elements */
            [contenteditable="true"]:hover {
              background-color: rgba(239, 68, 68, 0.1) !important;
              border-radius: 4px;
              transition: background-color 0.2s ease;
            }
            
            [contenteditable="true"]:focus {
              background-color: rgba(59, 130, 246, 0.1) !important;
              outline: 2px solid #3b82f6 !important;
              outline-offset: 1px;
              border-radius: 4px;
            }
            
            /* Smooth transitions for all editor interactions */
            [data-cy="component-wrapper"] {
              transition: all 0.2s ease-in-out;
            }
          `
        }} />
      )}
    </div>
  );
};
