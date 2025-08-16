import WelcomingSection from '@/components/WelcomingSection';
import EventsSpecialsSection from '@/components/EventsSpecialsSection';
import CategoriesSection from '@/components/CategoriesSection';
import BookingsSection from '@/components/BookingsSection';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CategorySkeleton, LoadingSpinner } from '@/components/LoadingComponents';

export default function Home() {
  return (
    <main className="flex flex-col p-4 space-y-8 animate-fade-in">
      <ErrorBoundary>
        <WelcomingSection />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="text-center py-8">
              <LoadingSpinner size="md" text="Loading latest events and specials..." />
            </div>
          }
        >
          <EventsSpecialsSection />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-48 h-8 bg-gradient-to-r from-gray-700 to-gray-600 rounded mx-auto mb-4 shimmer" />
                <div className="w-64 h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded mx-auto shimmer" />
              </div>
              <CategorySkeleton count={6} />
            </div>
          }
        >
          <CategoriesSection />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary>
        <div className="animate-bounce-in">
          <BookingsSection />
        </div>
      </ErrorBoundary>
    </main>
  );
}
