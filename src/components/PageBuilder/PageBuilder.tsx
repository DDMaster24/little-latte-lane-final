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
    <div className="h-screen bg-gray-900 flex flex-col">
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
        
        <div className="flex flex-1 overflow-hidden">
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
                  is={EditableContainer}
                  backgroundColor="#1a1a1a"
                  padding="40px"
                  canvas
                >
                  <Element
                    is={EditableText}
                    text="🎨 Visual Page Builder"
                    fontSize="32px"
                    textAlign="center"
                    fontWeight="bold"
                    color="#00FFFF"
                    tagName="h1"
                  />
                  <Element
                    is={EditableText}
                    text="Drag components from the left panel to start building your page!"
                    fontSize="18px"
                    textAlign="center"
                    color="#ffffff"
                    tagName="p"
                  />
                </Element>
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
