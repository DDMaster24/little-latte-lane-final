'use client';

import { InlineVisualEditor } from './VisualEditor/InlineVisualEditor';

interface VisualEditorWrapperProps {
  children: React.ReactNode;
}

export function VisualEditorWrapper({ children }: VisualEditorWrapperProps) {
  return (
    <InlineVisualEditor>
      {children}
    </InlineVisualEditor>
  );
}
