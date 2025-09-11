'use client';

import { useState, useEffect } from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { 
  CraftText, 
  CraftImage, 
  CraftContainer, 
  CraftButton 
} from './CraftEditor/SimpleCraftComponents';
import {
  CraftHeroSection,
  CraftCategoriesSection,
  CraftEventsSection
} from './CraftEditor/CraftHomepageSections';
import WelcomingSection from './WelcomingSection';
import EventsSpecialsSection from './EventsSpecialsSection';
import CategoriesSection from './CategoriesSection';
import BookingsSection from './BookingsSection';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { Edit, Eye, Save } from 'lucide-react';
import { useCraftPageData } from '@/hooks/useCraftPageData';

interface EditableHomepageProps {
  enableEditing?: boolean;
}

export default function EditableHomepage({ enableEditing = false }: EditableHomepageProps) {
  const { profile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { savePage, loadPage, isSaving } = useCraftPageData('homepage');

  // Only show edit controls to admins
  const canEdit = profile?.is_admin && enableEditing;

  // Load saved content on mount
  useEffect(() => {
    const loadPageContent = async () => {
      try {
        const savedData = await loadPage();
        if (savedData) {
          // TODO: Load saved Craft.js state
          console.log('Loaded saved content:', savedData);
        }
      } catch (error) {
        console.error('Failed to load page content:', error);
      }
    };

    if (editMode) {
      loadPageContent();
    }
  }, [editMode, loadPage]);

  const handleSave = async () => {
    try {
      // TODO: Get current Craft.js state and save
      await savePage({});
      setHasUnsavedChanges(false);
      console.log('Page saved successfully');
    } catch (error) {
      console.error('Failed to save page:', error);
    }
  };

  const toggleEditMode = () => {
    if (editMode && hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to exit edit mode?');
      if (!confirmLeave) return;
    }
    setEditMode(!editMode);
    setHasUnsavedChanges(false);
  };

  // Edit Mode - Craft.js Editor
  if (editMode && canEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Edit Mode Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-semibold">Editing Homepage</h1>
            {hasUnsavedChanges && (
              <span className="text-yellow-400 text-sm">● Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={toggleEditMode}
              variant="outline"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        {/* Craft.js Editor */}
        <Editor
          resolver={{
            CraftText,
            CraftImage,
            CraftContainer,
            CraftButton,
            CraftHeroSection,
            CraftCategoriesSection,
            CraftEventsSection
          }}
          onRender={(render) => (
            <div className="min-h-screen">
              {render.render}
            </div>
          )}
        >
          <Frame>
            <Element
              is={CraftContainer}
              backgroundColor="transparent"
              padding={0}
              canvas
            >
              <Element is={CraftHeroSection} />
              <Element is={CraftEventsSection} />
              <Element is={CraftCategoriesSection} />
            </Element>
          </Frame>
        </Editor>
      </div>
    );
  }

  // Normal View - Your existing homepage
  return (
    <main className="min-h-screen animate-fade-in relative">
      {/* Edit Button for Admins */}
      {canEdit && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={toggleEditMode}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Page
          </Button>
        </div>
      )}

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
