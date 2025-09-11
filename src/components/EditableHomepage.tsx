'use client';

import WelcomingSection from './WelcomingSection';
import EventsSpecialsSection from './EventsSpecialsSection';
import CategoriesSection from './CategoriesSection';
import BookingsSection from './BookingsSection';

interface EditableHomepageProps {
  enableEditing?: boolean;
}

export default function EditableHomepage({ enableEditing: _enableEditing = false }: EditableHomepageProps) {
  // Simple homepage without Craft JS - using our custom editor system instead
  return (
    <main className="min-h-screen animate-fade-in relative">
      {/* Your existing homepage content */}
      <WelcomingSection />
      
      <div className="space-y-6 xs:space-y-8 sm:space-y-10 px-2 xs:px-3 sm:px-4 pb-8 xs:pb-10 sm:pb-12">
        <EventsSpecialsSection />
        <CategoriesSection />
        <BookingsSection />
      </div>
    </main>
  );
}
