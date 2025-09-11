'use client';

import { createContext, useState, ReactNode, useEffect } from 'react';

// Context to detect if we're in the editor
export const EditorContext = createContext(false);

// Context for component selection
export const SelectionContext = createContext<{
  selectedComponent: string | null;
  setSelectedComponent: (id: string | null) => void;
}>({
  selectedComponent: null,
  setSelectedComponent: () => {}
});

// Export the providers for convenience
export const EditorProvider = EditorContext.Provider;

// Create a proper SelectionProvider that manages state
export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  
  // Debug: Log state changes
  useEffect(() => {
    console.log('🎯 SelectionProvider: selectedComponent changed to:', selectedComponent);
  }, [selectedComponent]);
  
  return (
    <SelectionContext.Provider value={{ selectedComponent, setSelectedComponent }}>
      {children}
    </SelectionContext.Provider>
  );
};
