'use client';

import React, { useState } from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { Toolbox } from './Toolbox';
import { SettingsPanel } from './SettingsPanel';
import { TopBar } from './TopBar';
import { EditableHeroSection } from './EditableHeroSection';
import { EditableText } from './EditableText';
import { EditableContainer } from './EditableContainer';
import { EditableCategoryCard } from './EditableCategoryCard';
import { EditableHeader } from './EditableHeader';
import { FullHomepage } from './FullHomepage';
import { Viewport } from './Viewport';

export const PageBuilder = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      <Editor
        resolver={{
          EditableHeroSection,
          EditableText,
          EditableContainer,
          EditableCategoryCard,
          EditableHeader,
          FullHomepage,
        }}
        enabled={enabled}
      >
        {/* Top Navigation Bar */}
        <TopBar enabled={enabled} setEnabled={setEnabled} />
        
        <div className="flex h-screen">
          {/* Left Sidebar - Component Toolbox */}
          {enabled && (
            <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
              <Toolbox />
            </div>
          )}
          
          {/* Main Canvas Area */}
          <div className="flex-1 overflow-y-auto">
            <Viewport>
              <Frame>
                <Element
                  is={FullHomepage}
                  canvas
                />
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
};
