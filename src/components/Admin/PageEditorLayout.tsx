'use client';

import { ReactNode } from 'react';

interface PageEditorLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function PageEditorLayout({ 
  children, 
  className = "" 
}: PageEditorLayoutProps) {
  return (
    <div className={`min-h-screen bg-darkBg text-white ${className}`}>
      {/* Add any shared editor layout elements here */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
