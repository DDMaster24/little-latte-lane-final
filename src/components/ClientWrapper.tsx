'use client';

import { useEffect, useState } from 'react';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/AuthProvider';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';
import StaffRedirect from '@/components/StaffRedirect';
import EditorNavigation from '@/components/EditorNavigation';
import { initializeSessionTracking } from '@/lib/session-storage';
import { useNativePushNotifications } from '@/hooks/useNativePushNotifications';
import { NotificationPermissionPrompt } from '@/components/NotificationPermissionPrompt';

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
  
  // Initialize native push notifications for Capacitor apps (Android/iOS)
  useNativePushNotifications();
  
  // Check if we're in React Bricks editor mode or staff kitchen view
  const isEditorMode = pathname?.startsWith('/admin/editor') || 
                       pathname?.startsWith('/admin/playground') ||
                       pathname?.includes('/preview');
  
  const isKitchenView = pathname?.includes('/kitchen-view');
  const shouldHideHeaderFooter = isEditorMode || isKitchenView;

  useEffect(() => {
    setIsClient(true);

    // Initialize session tracking for better authentication persistence
    initializeSessionTracking();

    // CRITICAL: Global App URL listener for deep links (Capacitor native apps)
    // This handles payment redirects from Yoco and automatically closes the browser
    console.log('🔍 [ClientWrapper] Checking Capacitor availability...');
    console.log('🔍 [ClientWrapper] Window defined:', typeof window !== 'undefined');
    console.log('🔍 [ClientWrapper] Capacitor in window:', typeof window !== 'undefined' && 'Capacitor' in window);
    
    if (typeof window !== 'undefined' && 'Capacitor' in window) {
      console.log('✅ [ClientWrapper] Capacitor detected - initializing app URL listener');
      
      import('@capacitor/app').then(({ App }) => {
        console.log('✅ [ClientWrapper] @capacitor/app imported successfully');
        
        import('@capacitor/browser').then(({ Browser }) => {
          console.log('✅ [ClientWrapper] @capacitor/browser imported successfully');
          
          // Set up global listener for app URL opens (deep links)
          App.addListener('appUrlOpen', async (data) => {
            console.log('🔗 [ClientWrapper] App URL opened:', data.url);
            console.log('🔗 [ClientWrapper] Full data object:', JSON.stringify(data, null, 2));
            
            // Check if this is a payment callback redirect
            const hasPaymentStatus = data.url.includes('payment=success') || 
                                    data.url.includes('payment=cancelled') || 
                                    data.url.includes('payment=failed');
            
            console.log('🔗 [ClientWrapper] Has payment status:', hasPaymentStatus);
            
            if (hasPaymentStatus) {
              console.log('💳 [ClientWrapper] Payment callback detected - closing browser');
              
              // Close the payment browser window
              setTimeout(async () => {
                console.log('💳 [ClientWrapper] Attempting to close browser...');
                try {
                  await Browser.close();
                  console.log('✅ [ClientWrapper] Payment browser closed successfully');
                } catch (err) {
                  console.log('ℹ️ [ClientWrapper] Browser already closed or not open:', err);
                }
              }, 500); // Brief delay to ensure page loads
            } else {
              console.log('ℹ️ [ClientWrapper] URL does not contain payment status - not closing browser');
            }
          });
          
          console.log('✅ [ClientWrapper] Global app URL listener registered');
        }).catch(err => {
          console.error('❌ [ClientWrapper] Failed to import @capacitor/browser:', err);
        });
      }).catch(err => {
        console.error('❌ [ClientWrapper] Failed to import @capacitor/app:', err);
      });
    } else {
      console.log('ℹ️ [ClientWrapper] Not a Capacitor app - skipping app URL listener');
    }

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
        
        {/* Notification Permission Prompt - Shows on first app launch */}
        <NotificationPermissionPrompt 
          autoShow={true}
          onPermissionGranted={() => {
            console.log('✅ User granted notification permissions');
          }}
        />
        
        {!isOnline && (
          <div className="bg-yellow-500 text-black text-center py-2 px-4 text-sm font-medium">
            You are currently offline. Some features may be limited.
          </div>
        )}
        
        {/* Conditional Layout - Hide Header/Footer in editor mode and kitchen view */}
        {!shouldHideHeaderFooter && <Header />}
        
        {/* Editor Navigation - Only show in editor mode */}
        {isEditorMode && <EditorNavigation />}
        
        <main className={shouldHideHeaderFooter ? 'min-h-screen relative pt-16' : 'flex-grow pt-24 xs:pt-28 sm:pt-32'}>
          {children}
        </main>
        
        {!shouldHideHeaderFooter && <FooterSection />}
      </AuthProvider>
    </QueryClientProvider>
  );

  return content;
}
