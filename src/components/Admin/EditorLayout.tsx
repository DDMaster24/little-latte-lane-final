'use client';

import { ReactNode } from 'react';

interface EditorLayoutProps {
  children: ReactNode;
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  return (
    <div className="min-h-screen bg-darkBg editor-mode">
      {/* Editor-specific global styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Hide all navigation and headers in editor mode */
          .editor-mode header,
          .editor-mode nav,
          .editor-mode footer,
          .editor-mode [data-component="header"],
          .editor-mode [data-component="navigation"],
          .editor-mode [data-component="footer"] {
            display: none !important;
          }
          
          /* Hide any other navigation elements */
          .editor-mode .navigation,
          .editor-mode .header,
          .editor-mode .footer,
          .editor-mode [role="navigation"],
          .editor-mode [role="banner"],
          .editor-mode [role="contentinfo"] {
            display: none !important;
          }
        `
      }} />
      
      {/* Render page content without navigation */}
      {children}
    </div>
  );
}
