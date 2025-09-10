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
    </div>
  );
};
