'use client';

import { useEffect, useState } from 'react';
import { ReactNode } from 'react';
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import { VisualEditorWrapper } from '@/components/VisualEditorWrapper';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';

export function ClientWrapper({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isVisualEditorMode, setIsVisualEditorMode] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check for visual editor mode from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const editorMode = urlParams.get('editor') === 'true';
    const adminMode = urlParams.get('admin') === 'true';
    setIsVisualEditorMode(editorMode && adminMode);

    // Service Worker registration - simplified
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // Delay SW registration to avoid blocking main thread
      const registerSW = async () => {
        try {
          await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none', // Prevent caching issues
          });
        } catch (error) {
          console.warn('Service Worker registration failed:', error);
        }
      };

      // Register after page load
      setTimeout(registerSW, 2000); // Delay to prevent blocking
    }

    // Simple network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  const content = (
    <AuthProvider>
      {!isOnline && (
        <div className="bg-yellow-500 text-black text-center py-2 px-4 text-sm font-medium">
          You are currently offline. Some features may be limited.
        </div>
      )}
      
      {/* Conditional layout based on visual editor mode */}
      {isVisualEditorMode ? (
        // In visual editor mode, just show the page content
        children
      ) : (
        // Normal mode with header and footer
        <>
          <Header />
          <main className="flex-grow">{children}</main>
          <FooterSection />
        </>
      )}
      
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

  // Wrap with visual editor if in editor mode
  if (isVisualEditorMode) {
    return (
      <VisualEditorWrapper>
        {content}
      </VisualEditorWrapper>
    );
  }

  return content;
}
