'use client';

import React from 'react';
import { useEditor } from '@craftjs/core';

export const SettingsPanel = () => {
  console.log('🔍 SettingsPanel Updated - Version 5.0 - Direct Node Access - ', new Date().toISOString());
  
  const { selectedNodeIds, nodes, resolver } = useEditor((state) => {
    const currentSelectedIds = state.events.selected;
    const allNodes = state.nodes;
    
    console.log('🔍 All nodes:', Object.keys(allNodes));
    console.log('🔍 Selected node IDs:', currentSelectedIds);
    
    return {
      selectedNodeIds: currentSelectedIds,
      nodes: allNodes,
      resolver: state.options?.resolver || {}
    };
  });

  // Get the first selected node ID
  const selectedNodeId = selectedNodeIds ? Array.from(selectedNodeIds)[0] : null;
  console.log('🔍 Processing node ID:', selectedNodeId);

  // Process the selected node data
  let selected = null;
  
  if (selectedNodeId && nodes[selectedNodeId]) {
    const node = nodes[selectedNodeId];
    console.log('🔍 Processing node:', node);
    
    const componentType = node.data.type;
    let componentName = 'Unknown';
    let settingsComponent = null;
    
    // Direct component name detection
    if (typeof componentType === 'function') {
      componentName = componentType.name || componentType.displayName || 'Function Component';
      console.log('🔍 Component function name:', componentName);
      
      // Check if this function has craft settings
      if ((componentType as any).craft?.related?.settings) {
        settingsComponent = (componentType as any).craft.related.settings;
        console.log('🔍 Found settings on component function:', settingsComponent);
      }
    } else if (typeof componentType === 'string') {
      componentName = componentType;
      console.log('🔍 Component string name:', componentName);
    }
    
    // Also try checking resolver
    if (resolver && Object.keys(resolver).length > 0) {
      console.log('🔍 Resolver keys:', Object.keys(resolver));
      
      Object.keys(resolver).forEach(key => {
        const comp = resolver[key];
        console.log('🔍 Checking resolver component:', key, comp);
        
        if (comp && (comp as any).craft?.related?.settings) {
          console.log('🔍 Found settings in resolver for:', key);
          if (key === componentName || key.includes('Welcoming')) {
            settingsComponent = (comp as any).craft.related.settings;
            componentName = key;
          }
        }
      });
    }
    
    selected = {
      id: selectedNodeId,
      name: node.data.displayName || node.data.name || componentName,
      settings: settingsComponent,
      hasSettings: !!settingsComponent,
      componentName: componentName,
      nodeData: node.data,
      allResolverKeys: resolver ? Object.keys(resolver) : [],
      rawComponentType: componentType
    };
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold text-white mb-4">Settings</h3>
      
      {/* Debug info */}
      {selectedNodeId && (
        <div className="mb-4 p-3 bg-gray-700 rounded text-xs">
          <div className="text-yellow-400 font-semibold mb-2">🔍 Debug Info:</div>
          <div className="space-y-1 text-gray-300">
            <div><strong>Node ID:</strong> {selectedNodeId}</div>
            <div><strong>Component Name:</strong> {selected?.componentName || 'Unknown'}</div>
            <div><strong>Has Settings:</strong> {selected?.hasSettings ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Settings Component:</strong> {selected?.settings?.name || 'None'}</div>
            
            {/* Show available resolver keys */}
            {selected?.allResolverKeys && selected.allResolverKeys.length > 0 ? (
              <div className="mt-2">
                <strong>Available Components:</strong>
                <div className="text-xs text-blue-300 mt-1">
                  {selected.allResolverKeys.join(', ')}
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <strong>Available Components:</strong>
                <div className="text-xs text-red-300 mt-1">
                  No resolver or empty resolver found
                </div>
              </div>
            )}
            
            {/* Show raw node type for debugging */}
            {selected?.rawComponentType ? (
              <div className="mt-2">
                <strong>Raw Node Type:</strong>
                <div className="text-xs text-green-300 mt-1 font-mono">
                  {typeof selected.rawComponentType === 'function' 
                    ? `Function: ${selected.rawComponentType.name || 'Anonymous'}`
                    : JSON.stringify(selected.rawComponentType, null, 2)
                  }
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <strong>Raw Node Type:</strong>
                <div className="text-xs text-red-300 mt-1">
                  No node data available
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {selected ? (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">
            {selected.name}
          </h4>
          {selected.settings ? (
            React.createElement(selected.settings)
          ) : (
            <div className="text-sm text-yellow-400">
              No settings available for this component
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-400">
          Select a component to edit its settings
        </div>
      )}
    </div>
  );
};
