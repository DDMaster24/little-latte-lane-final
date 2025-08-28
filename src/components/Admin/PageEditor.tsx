'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Palette, X } from 'lucide-react';
import { usePageEditor } from '@/hooks/usePageEditor';

interface PageEditorProps {
  children: React.ReactNode;
  pageScope: string;
}

export function PageEditor({ children, pageScope }: PageEditorProps) {
  const [isEditorActive, setIsEditorActive] = useState(false);
  const { isAdmin } = usePageEditor(pageScope);

  const toggleEditor = useCallback(() => {
    setIsEditorActive(!isEditorActive);
  }, [isEditorActive]);

  // If not admin, just return children without editor
  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Floating Editor Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleEditor}
          className={`flex items-center gap-2 shadow-lg transition-all duration-200 ${
            isEditorActive 
              ? "bg-neonPink hover:bg-neonPink/80 text-white" 
              : "bg-neonCyan hover:bg-neonCyan/80 text-darkBg"
          }`}
        >
          {isEditorActive ? (
            <>
              <X className="h-4 w-4" />
              Exit Editor
            </>
          ) : (
            <>
              <Palette className="h-4 w-4" />
              Edit Page
            </>
          )}
        </Button>
      </div>

      {/* Editor Active Indicator */}
      {isEditorActive && (
        <div className="fixed top-4 left-4 z-40">
          <div className="p-3 bg-darkBg/90 border border-neonCyan rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-neonPink rounded-full animate-pulse" />
              <span className="text-sm text-white font-medium">Page Editor Active</span>
              <span className="text-xs text-neonCyan">{pageScope}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Editor Overlay */}
      <div className={isEditorActive ? "cursor-crosshair" : ""}>
        {children}
      </div>
    </div>
  );
}
