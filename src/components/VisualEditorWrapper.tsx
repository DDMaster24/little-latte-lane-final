'use client';

import { useState } from 'react';
import InlineVisualEditor from './VisualEditor/InlineVisualEditor';

interface VisualEditorWrapperProps {
  children: React.ReactNode;
}

export function VisualEditorWrapper({ children }: VisualEditorWrapperProps) {
  const [isEditorEnabled, setIsEditorEnabled] = useState(false);

  return (
    <InlineVisualEditor 
      isEnabled={isEditorEnabled} 
      onClose={() => setIsEditorEnabled(false)}
    >
      {children}
    </InlineVisualEditor>
  );
}
