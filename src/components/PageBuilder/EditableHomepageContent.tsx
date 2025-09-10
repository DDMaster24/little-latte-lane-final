'use client';

import React from 'react';
import EditableWelcomingSection from './EditableWelcomingSection';
import CategoriesSection from '@/components/CategoriesSection';
import EventsSpecialsSection from '@/components/EventsSpecialsSection';
import BookingsSection from '@/components/BookingsSection';

interface EditableHomepageContentProps {
  selectedTool: 'text' | 'color' | 'background' | 'image';
}

export const EditableHomepageContent: React.FC<EditableHomepageContentProps> = ({
  selectedTool
}) => {
  return (
    <div className="space-y-0">
      {/* Editable Welcoming Section - Fully clickable individual elements */}
      <EditableWelcomingSection 
        isEditMode={true}
        selectedTool={selectedTool}
      />
      
      {/* Events & Specials Section - Coming soon for individual editing */}
      <EventsSpecialsSection />
      
      {/* Categories Section - Coming soon for individual editing */}
      <CategoriesSection />
      
      {/* Bookings Section - Coming soon for individual editing */}
      <BookingsSection />
    </div>
  );
};

export default EditableHomepageContent;
