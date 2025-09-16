'use client';

import { useEffect, useState } from 'react';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import StaffRedirect from '@/components/StaffRedirect';
import EditorNavigation from '@/components/EditorNavigation';

// Create a client instance for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function ClientWrapper({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  
  // Check if we're in React Bricks editor mode
  const isEditorMode = pathname?.startsWith('/admin/editor') || 
                       pathname?.startsWith('/admin/playground') ||
                       pathname?.includes('/preview');

  useEffect(() => {
    setIsClient(true);

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Staff Auto-Redirect: Redirects staff users to kitchen view */}
        <StaffRedirect />
        
        {!isOnline && (
          <div className="bg-yellow-500 text-black text-center py-2 px-4 text-sm font-medium">
            You are currently offline. Some features may be limited.
          </div>
        )}
        
        {/* Conditional Layout - Hide Header/Footer in editor mode for more space */}
        {!isEditorMode && <Header />}
        
        {/* Editor Navigation - Only show in editor mode */}
        {isEditorMode && <EditorNavigation />}
        
        <main className={isEditorMode ? 'min-h-screen relative pt-16' : 'flex-grow'}>
          {children}
        </main>
        
        {!isEditorMode && <FooterSection />}
        
        {/* PWA Install Prompt - shows when triggered */}
        <PWAInstallPrompt source="auto" />
        
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
    </QueryClientProvider>
  );

  return content;
}
