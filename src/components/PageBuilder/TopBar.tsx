'use client';

import React from 'react';
import { useEditor } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { Save, Eye, Edit, Download } from 'lucide-react';

interface TopBarProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ enabled, setEnabled }) => {
  const { actions, query, canUndo, canRedo } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const handleSave = () => {
    const json = query.serialize();
    console.log('Saving page data:', json);
    // TODO: Save to database
    alert('Page saved successfully!');
  };

  const handleExport = () => {
    const json = query.serialize();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page-layout.json';
    a.click();
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-white">Little Latte Lane - Page Builder</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant={enabled ? "default" : "outline"}
            size="sm"
            onClick={() => setEnabled(!enabled)}
            className="flex items-center space-x-2"
          >
            {enabled ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            <span>{enabled ? 'Preview' : 'Edit'}</span>
          </Button>
        </div>
      </div>
      
      {enabled && (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => actions.history.undo()}
            disabled={!canUndo}
            className="text-white border-gray-600"
          >
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => actions.history.redo()}
            disabled={!canRedo}
            className="text-white border-gray-600"
          >
            Redo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center space-x-2 text-white border-gray-600"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </Button>
        </div>
      )}
    </div>
  );
};
