import WelcomingSection from '@/components/WelcomingSection';
import EventsSpecialsSection from '@/components/EventsSpecialsSection';
import CategoriesSection from '@/components/CategoriesSection';
import BookingsSection from '@/components/BookingsSection';
import ThemeLoader from '@/components/ThemeLoader';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CategorySkeleton, LoadingSpinner } from '@/components/LoadingComponents';

export default function Home() {
  return (
    <main className="min-h-screen animate-fade-in">
      {/* Load saved theme styles and text */}
      <ThemeLoader pageName="homepage" />
      
      {/* PWA Install Prompt for QR Code Users */}
      <PWAInstallPrompt source="auto" />
      
      {/* Clean homepage - no page editor wrapper */}
      <ErrorBoundary>
        <WelcomingSection />
      </ErrorBoundary>
          
      {/* Full-width sections with consistent spacing and neon borders */}
      <div className="space-y-6 xs:space-y-8 sm:space-y-10 px-2 xs:px-3 sm:px-4">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="w-full text-center py-8 xs:py-12 px-6 space-y-4 shadow-neon rounded-xl bg-black/20">
                <LoadingSpinner 
                  size="lg" 
                  variant="dots" 
                  text="Loading latest events and specials..." 
                />
                <div className="max-w-2xl mx-auto space-y-3">
                  <div className="w-3/4 h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded shimmer mx-auto" />
                  <div className="w-1/2 h-3 bg-gray-700 rounded shimmer mx-auto" />
                </div>
              </div>
            }
          >
            <EventsSpecialsSection />
          </Suspense>
        </ErrorBoundary>
        
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="w-full shadow-neon rounded-xl bg-black/20">
                <div className="text-center py-8 xs:py-12 px-6 space-y-4">
                  <div className="w-48 h-10 bg-gradient-to-r from-neonCyan/30 via-neonPink/30 to-neonCyan/30 rounded-lg shimmer mx-auto" />
                  <div className="w-64 h-5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded shimmer mx-auto" />
                  <div className="flex justify-center space-x-4 mt-6">
                    <div className="w-24 h-8 bg-neonCyan/20 rounded-full shimmer" />
                    <div className="w-32 h-8 bg-neonPink/20 rounded-full shimmer" />
                  </div>
                </div>
                <div className="px-4 xs:px-6 sm:px-8 pb-8 xs:pb-12">
                  <CategorySkeleton count={4} className="grid-responsive-4 max-w-7xl mx-auto" />
                  <div className="flex justify-center mt-8">
                    <div className="w-48 h-12 bg-gradient-to-r from-neonCyan/30 to-neonPink/30 rounded-xl shimmer" />
                  </div>
                </div>
              </div>
            }
          >
            <CategoriesSection />
          </Suspense>
        </ErrorBoundary>
        
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="w-full text-center py-8 xs:py-12 px-6 space-y-4 shadow-neon rounded-xl bg-black/20">
                <LoadingSpinner 
                  size="md" 
                  variant="bounce" 
                  text="Setting up bookings..." 
                />
              </div>
            }
          >
            <div className="animate-bounce-in">
              <BookingsSection />
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
        </main>
  );
}
