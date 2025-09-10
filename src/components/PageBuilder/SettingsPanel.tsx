'use client';

import React from 'react';
import { useEditor } from '@craftjs/core';

export const SettingsPanel = () => {
  const { selected } = useEditor((state) => {
    const currentNodeId = state.events.selected;
    let selected;
    
    if (currentNodeId && typeof currentNodeId === 'string') {
      const node = state.nodes[currentNodeId];
      if (node) {
        selected = {
          id: currentNodeId,
          name: node.data.displayName || node.data.name,
          settings: node.related && node.related.settings,
          isDeletable: node.data.displayName !== 'Root'
        };
      }
    }
    
    return {
      selected
    };
  });

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold text-white mb-4">Settings</h3>
      
      {selected ? (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">
            {selected.name}
          </h4>
          {selected.settings && React.createElement(selected.settings)}
        </div>
      ) : (
        <div className="text-sm text-gray-400">
          Select a component to edit its settings
        </div>
      )}
    </div>
  );
};
