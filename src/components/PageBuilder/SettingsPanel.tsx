'use client';

import React from 'react';
import { useEditor } from '@craftjs/core';

export const SettingsPanel = (): React.ReactElement => {
  console.log('🔍 SettingsPanel Updated - Version 7.0 - Simplified Safe Version - ', new Date().toISOString());
  
  // Simple, safe approach
  const { selectedNodeId, nodes } = useEditor((state) => {
    try {
      const selected = state.events?.selected;
      const selectedId = selected && selected.size > 0 ? Array.from(selected)[0] : null;
      
      console.log('🔍 Simple check - Selected ID:', selectedId);
      console.log('🔍 Simple check - All nodes:', Object.keys(state.nodes || {}));
      
      return {
        selectedNodeId: selectedId,
        nodes: state.nodes || {}
      };
    } catch (error) {
      console.error('🔍 Error in useEditor:', error);
      return {
        selectedNodeId: null,
        nodes: {}
      };
    }
  });

  // Simple debug info
  const debugInfo = {
    nodeId: selectedNodeId || 'None',
    hasNode: selectedNodeId && nodes[selectedNodeId as string] ? 'Yes' : 'No',
    nodeType: 'Unknown'
  };

  if (selectedNodeId && nodes[selectedNodeId as string]) {
    const node = nodes[selectedNodeId as string];
    const componentType = node?.data?.type;
    
    if (typeof componentType === 'function') {
      debugInfo.nodeType = `Function: ${componentType.name || 'Anonymous'}`;
    } else if (typeof componentType === 'string') {
      debugInfo.nodeType = `String: ${componentType}`;
    } else {
      debugInfo.nodeType = `Other: ${typeof componentType}`;
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold text-white mb-4">Settings</h3>
      
      <div className="mb-4 p-3 bg-gray-700 rounded text-xs">
        <div className="text-yellow-400 font-semibold mb-2">🔍 Simple Debug Info:</div>
        <div className="space-y-1 text-gray-300">
          <div><strong>Node ID:</strong> {debugInfo.nodeId}</div>
          <div><strong>Has Node:</strong> {debugInfo.hasNode}</div>
          <div><strong>Node Type:</strong> {debugInfo.nodeType}</div>
        </div>
      </div>
      
      <div className="text-sm text-gray-400">
        Select a component to edit its settings
      </div>
    </div>
  );
};
