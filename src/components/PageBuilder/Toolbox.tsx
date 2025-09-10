'use client';

import React from 'react';
import { useEditor } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { EditableHeroSection } from './EditableHeroSection';
import { Plus } from 'lucide-react';

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
        
        {/* Add more components here as we build them */}
        <div className="text-sm text-gray-400 mt-4">
          More components coming soon...
        </div>
      </div>
    </div>
  );
};
