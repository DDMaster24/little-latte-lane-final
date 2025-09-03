'use client';

import { Suspense } from 'react';
import HomepageEditor from '@/components/Admin/HomepageEditor';
import WelcomingSection from '@/components/WelcomingSection';
import EventsSpecialsSection from '@/components/EventsSpecialsSection';
import CategoriesSection from '@/components/CategoriesSection';
import BookingsSection from '@/components/BookingsSection';
import { LoadingSpinner } from '@/components/LoadingComponents';

export default function AdminHomepageEditorPage() {
  return (
    <div className="min-h-screen bg-darkBg">
      <Suspense fallback={<LoadingSpinner />}>
        <HomepageEditor>
          <main className="min-h-screen animate-fade-in">
            {/* Homepage sections for editing */}
            <WelcomingSection />
            
            <div className="space-y-8 xs:space-y-12 sm:space-y-16">
              <EventsSpecialsSection />
              <CategoriesSection />
              <BookingsSection />
            </div>
          </main>
        </HomepageEditor>
      </Suspense>
    </div>
  );
}
