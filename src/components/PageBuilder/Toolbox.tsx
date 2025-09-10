'use client';

import React from 'react';
import { useEditor } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { EditableHeroSection } from './EditableHeroSection';
import { EditableText } from './EditableText';
import { EditableContainer } from './EditableContainer';
import { EditableCategoryCard } from './EditableCategoryCard';
import { EditableHeader } from './EditableHeader';
import { FullHomepage } from './FullHomepage';
import { Plus, Type, Box, Grid3x3, Layout, Navigation } from 'lucide-react';

export const Toolbox = () => {
  const { connectors } = useEditor();

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold text-white mb-4">Components</h3>
      
      <div className="space-y-2">
        <div
          ref={(ref) => {
            if (ref) {
              connectors.create(ref, <EditableHeroSection />);
            }
          }}
        >
          <Button
            variant="outline"
            className="w-full justify-start text-white border-gray-600 hover:bg-gray-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Hero Section
          </Button>
        </div>

        <div
          ref={(ref) => {
            if (ref) {
              connectors.create(ref, <EditableText />);
            }
          }}
        >
          <Button
            variant="outline"
            className="w-full justify-start text-white border-gray-600 hover:bg-gray-700"
          >
            <Type className="w-4 h-4 mr-2" />
            Text Block
          </Button>
        </div>

        <div
          ref={(ref) => {
            if (ref) {
              connectors.create(ref, <EditableContainer />);
            }
          }}
        >
          <Button
            variant="outline"
            className="w-full justify-start text-white border-gray-600 hover:bg-gray-700"
          >
            <Box className="w-4 h-4 mr-2" />
            Container
          </Button>
        </div>

        <div
          ref={(ref) => {
            if (ref) {
              connectors.create(ref, <EditableHeader />);
            }
          }}
        >
          <Button
            variant="outline"
            className="w-full justify-start text-white border-gray-600 hover:bg-gray-700"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Header & Navigation
          </Button>
        </div>

        <div
          ref={(ref) => {
            if (ref) {
              connectors.create(ref, <EditableCategoryCard />);
            }
          }}
        >
          <Button
            variant="outline"
            className="w-full justify-start text-white border-gray-600 hover:bg-gray-700"
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            Category Card
          </Button>
        </div>

        <div
          ref={(ref) => {
            if (ref) {
              connectors.create(ref, <FullHomepage />);
            }
          }}
        >
          <Button
            variant="outline"
            className="w-full justify-start text-white border-gray-600 hover:bg-gray-700"
          >
            <Layout className="w-4 h-4 mr-2" />
            Full Homepage Template
          </Button>
        </div>
        
        {/* Add more components here as we build them */}
        <div className="text-sm text-gray-400 mt-4">
          More components coming soon...
        </div>
      </div>
    </div>
  );
};
