'use client';

import React, { useState } from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { TopBar } from '@/components/PageBuilder/TopBar';
import { SettingsPanel } from '@/components/PageBuilder/SettingsPanel';
import { Viewport } from '@/components/PageBuilder/Viewport';
import { EditableText } from '@/components/PageBuilder/EditableText';
import { EditableContainer } from '@/components/PageBuilder/EditableContainer';

export default function MenuVisualEditor() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <Editor
        resolver={{
          EditableText,
          EditableContainer,
        }}
        enabled={enabled}
      >
        <TopBar 
          enabled={enabled} 
          setEnabled={setEnabled}
          pageTitle="Menu Page Editor"
          pageDescription="Edit menu categories, descriptions, and layout"
        />
        
        <div className="flex flex-1 overflow-hidden">
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
                    text="🍽️ Menu Page"
                    fontSize="48px"
                    textAlign="center"
                    fontWeight="bold"
                    color="#00FFFF"
                    tagName="h1"
                  />
                  <Element
                    is={EditableText}
                    text="Menu page content will be loaded here. Click any element to edit."
                    fontSize="18px"
                    textAlign="center"
                    color="#ffffff"
                    tagName="p"
                  />
                </Element>
              </Frame>
            </Viewport>
          </div>
          
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
