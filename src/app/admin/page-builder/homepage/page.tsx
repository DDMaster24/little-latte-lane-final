'use client';

import React, { useState } from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { EditableHomepageContent } from '@/components/PageBuilder/EditableHomepageContent';
import { HomepageEditorToolbar } from '@/components/PageBuilder/HomepageEditorToolbar';
import { HomepageEditorSidebar } from '@/components/PageBuilder/HomepageEditorSidebar';
import EditableWelcomingSection from '@/components/PageBuilder/EditableWelcomingSection';

// Editor for homepage content only - no navigation/header/footer
export default function HomepageEditor() {
  const [selectedTool, setSelectedTool] = useState<'text' | 'color' | 'background' | 'image'>('text');

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      <Editor
        resolver={{
          EditableHomepageContent,
          EditableWelcomingSection,
        }}
        enabled={true} // Always enabled for our new system
      >
        {/* Fixed Toolbar at Top */}
        <HomepageEditorToolbar 
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
        />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area - Shows ONLY Homepage Content */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <Frame>
              <Element
                is={EditableHomepageContent}
                selectedTool={selectedTool}
                canvas
              />
            </Frame>
          </div>
          
          {/* Right Sidebar - Editing Controls */}
          <HomepageEditorSidebar 
            selectedTool={selectedTool}
          />
        </div>
      </Editor>
    </div>
  );
}
