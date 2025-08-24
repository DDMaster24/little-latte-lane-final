'use client';

import { useVisualEditor } from '@/hooks/useVisualEditor';

interface VisualEditorWrapperProps {
  children: React.ReactNode;
}

export function VisualEditorWrapper({ children }: VisualEditorWrapperProps) {
  // Initialize the visual editor hook
  useVisualEditor();

  return <>{children}</>;
}
