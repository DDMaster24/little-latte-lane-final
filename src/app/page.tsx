import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import WelcomingSection from '@/components/WelcomingSection';
import CategoriesSection from '@/components/CategoriesSection';
import EventsSpecialsSection from '@/components/EventsSpecialsSection';
import BookingsSection from '@/components/BookingsSection';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <main className="min-h-screen animate-fade-in">
      {/* PWA Install Prompt for QR Code Users */}
      <PWAInstallPrompt source="auto" />
      
      {/* Clean homepage - no page editor wrapper */}
      <ErrorBoundary>
        <WelcomingSection />
      </ErrorBoundary>
          
      {/* Full-width sections with consistent spacing and neon borders */}
      <div className="space-y-6 xs:space-y-8 sm:space-y-10 px-2 xs:px-3 sm:px-4 pb-8 xs:pb-10 sm:pb-12">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="w-full text-center py-8 xs:py-12 px-6 space-y-4 shadow-neon rounded-xl bg-black/20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonCyan mx-auto"></div>
                <p className="text-gray-300">Loading latest events and specials...</p>
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
                <div className="animate-bounce h-8 w-8 bg-neonPink rounded-full mx-auto"></div>
                <p className="text-gray-300">Setting up bookings...</p>
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
