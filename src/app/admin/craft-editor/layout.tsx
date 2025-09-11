'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from 'react-hot-toast';

// Special layout for craft editor - NO header/footer
export default function CraftEditorLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {/* Editor-only content - no header, no footer */}
      <main className="min-h-screen">{children}</main>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #10b981',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#1f2937',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1f2937',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
