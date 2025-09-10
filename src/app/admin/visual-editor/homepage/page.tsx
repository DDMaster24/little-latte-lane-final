'use client';

import React, { useState } from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { TopBar } from '@/components/PageBuilder/TopBar';
import { SettingsPanel } from '@/components/PageBuilder/SettingsPanel';
import { Viewport } from '@/components/PageBuilder/Viewport';

// Import the actual homepage components to make them editable
import { EditableWelcomingSection } from '@/components/PageBuilder/EditableWelcomingSection';
import { EditableEventsSpecialsSection } from '@/components/PageBuilder/EditableEventsSpecialsSection';
import { EditableCategoriesSection } from '@/components/PageBuilder/EditableCategoriesSection';
import { EditableBookingsSection } from '@/components/PageBuilder/EditableBookingsSection';

export default function HomepageVisualEditor() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <Editor
        resolver={{
          EditableWelcomingSection,
          EditableEventsSpecialsSection,
          EditableCategoriesSection,
          EditableBookingsSection,
        }}
        enabled={enabled}
      >
        {/* Top Navigation Bar */}
        <TopBar 
          enabled={enabled} 
          setEnabled={setEnabled}
          pageTitle="Homepage"
        />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Main Canvas Area - Shows actual homepage content */}
          <div className="flex-1 overflow-y-auto">
            <Viewport>
              <Frame>
                {/* This renders the actual homepage structure but with editable components */}
                <div className="min-h-screen animate-fade-in">
                  {/* Welcoming Section (Carousel) - Editable */}
                  <Element
                    is={EditableWelcomingSection}
                    canvas
                  />
                  
                  {/* Main content sections with consistent spacing */}
                  <div className="space-y-6 xs:space-y-8 sm:space-y-10 px-2 xs:px-3 sm:px-4 pb-8 xs:pb-10 sm:pb-12">
                    {/* Events & Specials Section - Editable */}
                    <Element
                      is={EditableEventsSpecialsSection}
                      canvas
                    />
                    
                    {/* Categories Section - Editable */}
                    <Element
                      is={EditableCategoriesSection}
                      canvas
                    />
                    
                    {/* Bookings Section - Editable */}
                    <Element
                      is={EditableBookingsSection}
                      canvas
                    />
                  </div>
                </div>
              </Frame>
            </Viewport>
          </div>
          
          {/* Right Sidebar - Settings Panel */}
          {enabled && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
              <SettingsPanel />
            </div>
          )}
        </div>
      </Editor>
    </div>
  );
}
