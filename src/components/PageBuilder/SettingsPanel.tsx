'use client';

import React from 'react';
import { useEditor } from '@craftjs/core';

export const SettingsPanel = () => {
  console.log('🔍 SettingsPanel Updated - Version 4.0 - Fixed Resolver Access - ', new Date().toISOString());
  
  const { selected, selectedNodeId } = useEditor((state, query) => {
    const currentNodeId = state.events.selected;
    let selected;
    
    if (currentNodeId && typeof currentNodeId === 'string') {
      const node = state.nodes[currentNodeId];
      if (node) {
        // Get the resolver differently - from the query object
        const resolver = query.getOptions().resolver;
        console.log('🔍 Resolver found:', resolver ? Object.keys(resolver) : 'No resolver');
        console.log('🔍 Node data:', node.data);
        
        const componentType = node.data.type;
        let componentName = '';
        let settingsComponent = null;
        
        // Better component name detection
        if (typeof componentType === 'string') {
          componentName = componentType;
        } else if (componentType && typeof componentType === 'function') {
          componentName = componentType.name || componentType.displayName || 'Component';
        } else if (componentType && typeof componentType === 'object') {
          // Handle different object types
          if ('resolvedName' in componentType) {
            componentName = (componentType as any).resolvedName;
          } else if ('name' in componentType) {
            componentName = (componentType as any).name;
          } else if ('displayName' in componentType) {
            componentName = (componentType as any).displayName;
          }
        }
        
        // Try to find settings component in resolver
        if (resolver && componentName) {
          const resolvedComponent = resolver[componentName];
          if (resolvedComponent && typeof resolvedComponent === 'function') {
            settingsComponent = (resolvedComponent as any).craft?.related?.settings;
          }
        }
        
        // If still no settings found, try all components in resolver
        if (!settingsComponent && resolver) {
          Object.keys(resolver).forEach(key => {
            const comp = resolver[key];
            if (comp && typeof comp === 'function') {
              const craft = (comp as any).craft;
              if (craft && craft.related && craft.related.settings) {
                // Check if this might be our component by comparing some properties
                if (key.includes('Welcoming') || key.includes('EditableWelcoming')) {
                  settingsComponent = craft.related.settings;
                  componentName = key;
                }
              }
            }
          });
        }
        
        selected = {
          id: currentNodeId,
          name: node.data.displayName || node.data.name || componentName || 'Component',
          settings: settingsComponent,
          isDeletable: node.data.displayName !== 'Root',
          hasSettings: !!settingsComponent,
          componentName: componentName,
          resolver: resolver,
          nodeData: node.data,
          allResolverKeys: resolver ? Object.keys(resolver) : []
        };
      }
    }
    
    return {
      selected,
      selectedNodeId: currentNodeId
    };
  });

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
            {selected?.nodeData ? (
              <div className="mt-2">
                <strong>Raw Node Type:</strong>
                <div className="text-xs text-green-300 mt-1 font-mono">
                  {typeof selected.nodeData.type === 'function' 
                    ? `Function: ${selected.nodeData.type.name}`
                    : JSON.stringify(selected.nodeData.type, null, 2)
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
