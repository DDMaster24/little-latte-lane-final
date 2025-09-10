'use client';

import React, { useState } from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { TopBar } from '@/components/PageBuilder/TopBar';
import { SettingsPanel } from '@/components/PageBuilder/SettingsPanel';
import { Viewport } from '@/components/PageBuilder/Viewport';
import { EditableHeader } from '@/components/PageBuilder/EditableHeader';

export default function HeaderVisualEditor() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      <Editor
        resolver={{
          EditableHeader,
        }}
        enabled={enabled}
      >
        <TopBar 
          enabled={enabled} 
          setEnabled={setEnabled}
          pageTitle="Header & Navigation Editor"
          pageDescription="Edit site-wide header, logo, navigation menu"
        />
        
        <div className="flex h-screen">
          <div className="flex-1 overflow-y-auto">
            <Viewport>
              <Frame>
                <Element
                  is={EditableHeader}
                  canvas
                />
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
