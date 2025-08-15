import WelcomingSection from '@/components/WelcomingSection';
import EventsSpecialsSection from '@/components/EventsSpecialsSection';
import CategoriesSection from '@/components/CategoriesSection';
import BookingsSection from '@/components/BookingsSection';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <main className="flex flex-col p-4">
      {' '}
      {/* Removed min-h-screen (handled in layout), added p-4 for consistent padding/margins */}
      <ErrorBoundary>
        <WelcomingSection /> {/* Welcome section */}
      </ErrorBoundary>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="text-center text-neonText py-4">
              Loading events...
            </div>
          }
        >
          <EventsSpecialsSection /> {/* Events and specials section */}
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="text-center text-neonText py-4">
              Loading categories...
            </div>
          }
        >
          <CategoriesSection /> {/* Categories section with loading fallback */}
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary>
        <BookingsSection /> {/* Bookings section ("Book Now" button) */}
      </ErrorBoundary>
      {/* Footer is in layout.tsx, so no need here */}
    </main>
  );
}
