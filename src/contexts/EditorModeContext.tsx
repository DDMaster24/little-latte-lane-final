'use client';

import { createContext, useContext, ReactNode } from 'react';

interface EditorModeContextType {
  isEditorMode: boolean;
}

const EditorModeContext = createContext<EditorModeContextType>({
  isEditorMode: false,
});

export const useEditorMode = () => useContext(EditorModeContext);

interface EditorModeProviderProps {
  children: ReactNode;
  isEditorMode?: boolean;
}

export function EditorModeProvider({ children, isEditorMode = false }: EditorModeProviderProps) {
  return (
    <EditorModeContext.Provider value={{ isEditorMode }}>
      {children}
    </EditorModeContext.Provider>
  );
}
