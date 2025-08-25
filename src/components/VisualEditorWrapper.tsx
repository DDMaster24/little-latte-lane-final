'use client';

import { useState, useEffect } from 'react';
import InlineVisualEditor from './VisualEditor/InlineVisualEditor';

interface VisualEditorWrapperProps {
  children: React.ReactNode;
}

export function VisualEditorWrapper({ children }: VisualEditorWrapperProps) {
  const [isEditorEnabled, setIsEditorEnabled] = useState(false);

  useEffect(() => {
    // Check URL parameters to auto-enable the editor
    const urlParams = new URLSearchParams(window.location.search);
    const editorMode = urlParams.get('editor') === 'true';
    const adminMode = urlParams.get('admin') === 'true';
    
    if (editorMode && adminMode) {
      setIsEditorEnabled(true);
    }
  }, []);

  const handleCloseEditor = () => {
    setIsEditorEnabled(false);
    // Remove editor parameters from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('editor');
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <InlineVisualEditor 
      isEnabled={isEditorEnabled} 
      onClose={handleCloseEditor}
    >
      {children}
    </InlineVisualEditor>
  );
}
