'use client';

import React from 'react';
import { useNode } from '@craftjs/core';

// Import your existing homepage components
import WelcomingSection from '@/components/WelcomingSection';
import CategoriesSection from '@/components/CategoriesSection';
import EventsSpecialsSection from '@/components/EventsSpecialsSection';
import BookingsSection from '@/components/BookingsSection';

interface EditableHomepageContentProps {
  selectedTool: 'text' | 'color' | 'image' | 'toggle';
}

export const EditableHomepageContent: React.FC<EditableHomepageContentProps> = ({
  selectedTool
}) => {
  return (
    <div className="space-y-0">
      {/* Welcoming Section */}
      <EditableWelcomingSection selectedTool={selectedTool} />
      
      {/* Events & Specials Section */}
      <EditableEventsSpecialsSection selectedTool={selectedTool} />
      
      {/* Categories Section */}
      <EditableCategoriesSection selectedTool={selectedTool} />
      
      {/* Bookings Section */}
      <EditableBookingsSection selectedTool={selectedTool} />
    </div>
  );
};

// Editable Welcoming Section Wrapper
const EditableWelcomingSection: React.FC<{ selectedTool: string }> = ({ selectedTool: _selectedTool }) => {
  const {
    connectors: { connect },
    selected
  } = useNode((state) => ({
    selected: state.events.selected
  }));

  return (
    <div
      ref={(ref) => {
        if (ref) connect(ref as HTMLElement);
      }}
      className={`${
        selected ? 'ring-4 ring-orange-500/60' : ''
      } transition-all duration-200 hover:bg-orange-500/5 cursor-pointer relative group`}
    >
      {selected && (
        <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-br-md z-10">
          Editing: Welcome Section
        </div>
      )}
      <WelcomingSection />
    </div>
  );
};

// Editable Events & Specials Section Wrapper
const EditableEventsSpecialsSection: React.FC<{ selectedTool: string }> = ({ selectedTool: _selectedTool }) => {
  const {
    connectors: { connect },
    selected
  } = useNode((state) => ({
    selected: state.events.selected
  }));

  return (
    <div
      ref={(ref) => {
        if (ref) connect(ref as HTMLElement);
      }}
      className={`${
        selected ? 'ring-4 ring-orange-500/60' : ''
      } transition-all duration-200 hover:bg-orange-500/5 cursor-pointer relative group`}
    >
      {selected && (
        <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-br-md z-10">
          Editing: Events & Specials
        </div>
      )}
      <EventsSpecialsSection />
    </div>
  );
};

// Editable Categories Section Wrapper
const EditableCategoriesSection: React.FC<{ selectedTool: string }> = ({ selectedTool: _selectedTool }) => {
  const {
    connectors: { connect },
    selected
  } = useNode((state) => ({
    selected: state.events.selected
  }));

  return (
    <div
      ref={(ref) => {
        if (ref) connect(ref as HTMLElement);
      }}
      className={`${
        selected ? 'ring-4 ring-orange-500/60' : ''
      } transition-all duration-200 hover:bg-orange-500/5 cursor-pointer relative group`}
    >
      {selected && (
        <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-br-md z-10">
          Editing: Categories
        </div>
      )}
      <CategoriesSection />
    </div>
  );
};

// Editable Bookings Section Wrapper
const EditableBookingsSection: React.FC<{ selectedTool: string }> = ({ selectedTool: _selectedTool }) => {
  const {
    connectors: { connect },
    selected
  } = useNode((state) => ({
    selected: state.events.selected
  }));

  return (
    <div
      ref={(ref) => {
        if (ref) connect(ref as HTMLElement);
      }}
      className={`${
        selected ? 'ring-4 ring-orange-500/60' : ''
      } transition-all duration-200 hover:bg-orange-500/5 cursor-pointer relative group`}
    >
      {selected && (
        <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-br-md z-10">
          Editing: Bookings Section
        </div>
      )}
      <BookingsSection />
    </div>
  );
};

export default EditableHomepageContent;
