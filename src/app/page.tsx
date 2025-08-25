import WelcomingSection from '@/components/WelcomingSection';
import EventsSpecialsSection from '@/components/EventsSpecialsSection';
import CategoriesSection from '@/components/CategoriesSection';
import BookingsSection from '@/components/BookingsSection';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CategorySkeleton, LoadingSpinner } from '@/components/LoadingComponents';
import VisualContentLoader from '@/components/VisualContentLoader';

export default function Home() {
  return (
    <>
      <VisualContentLoader pageScope="homepage" />
      <main className="min-h-screen animate-fade-in">
        <ErrorBoundary>
          <WelcomingSection />
        </ErrorBoundary>
        
        <div className="space-y-8 xs:space-y-12 sm:space-y-16">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="container-responsive text-center section-padding-sm space-y-4">
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
                <div className="container-responsive space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-48 h-10 bg-gradient-to-r from-neonCyan/30 via-neonPink/30 to-neonCyan/30 rounded-lg shimmer mx-auto" />
                    <div className="w-64 h-5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded shimmer mx-auto" />
                    <div className="flex justify-center space-x-4 mt-6">
                      <div className="w-24 h-8 bg-neonCyan/20 rounded-full shimmer" />
                      <div className="w-32 h-8 bg-neonPink/20 rounded-full shimmer" />
                    </div>
                  </div>
                  <CategorySkeleton count={6} className="grid-responsive-4 max-w-7xl mx-auto" />
                  <div className="flex justify-center">
                    <div className="w-48 h-12 bg-gradient-to-r from-neonCyan/30 to-neonPink/30 rounded-xl shimmer" />
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
                <div className="container-responsive text-center section-padding-sm space-y-4">
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
    </>
  );
}
