'use client';

import React from 'react';
import { useEditorSelection } from '@/lib/pageEditor/EditorSelectionStore';
import { COMPONENT_TYPE_CONFIGS, getAvailableToolsForComponent } from '@/lib/pageEditor/ComponentRegistry';

interface HomepageEditorSidebarProps {
  selectedTool: 'text' | 'color' | 'background' | 'image';
}

export const HomepageEditorSidebar: React.FC<HomepageEditorSidebarProps> = ({
  selectedTool
}) => {
  const { 
    selectedComponent, 
    isEditMode, 
    saveStatus, 
    saveMessage,
    lastSaved 
  } = useEditorSelection();

  if (!isEditMode) {
    return (
      <div 
        className="w-80 bg-gray-800 border-l border-gray-700 p-4"
        onClick={(e) => e.stopPropagation()} // 🎯 PREVENT component deselection
      >
        <div className="text-center text-gray-400">
          <h3 className="text-lg font-semibold mb-2">Preview Mode</h3>
          <p className="text-sm">Turn on editing mode to see controls</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto"
      onClick={(e) => e.stopPropagation()} // 🎯 PREVENT component deselection
    >
      {/* Selected Component Info */}
      <div className="p-4 border-b border-gray-700 bg-gray-900/50">
        <h3 className="text-lg font-semibold text-white mb-3">
          📋 Selected Component
        </h3>
        
        {!selectedComponent ? (
          <div className="text-gray-400 text-sm text-center py-4 border-2 border-dashed border-gray-600 rounded-lg">
            <div className="mb-2">🎯</div>
            <div>Click any component on the homepage to start editing</div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Component Details */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {COMPONENT_TYPE_CONFIGS[selectedComponent.type].icon}
                </span>
                <span className="font-medium text-white">
                  {selectedComponent.name}
                </span>
              </div>
              <div className="text-xs text-gray-400 mb-2">
                Type: {selectedComponent.type}
              </div>
              <div className="text-xs text-gray-300">
                {selectedComponent.description}
              </div>
            </div>

            {/* Available Tools */}
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-300 mb-2">
                Available Tools:
              </div>
              <div className="flex flex-wrap gap-1">
                {getAvailableToolsForComponent(selectedComponent.id).map(tool => (
                  <span 
                    key={tool}
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedTool === tool 
                        ? 'bg-neonCyan text-black' 
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Save Status */}
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-300 mb-2">
                Save Status:
              </div>
              <div className="space-y-1 text-xs">
                {saveStatus === 'saving' && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span>Saving changes...</span>
                  </div>
                )}
                
                {saveStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Saved successfully</span>
                    {lastSaved && (
                      <span className="text-gray-400">
                        at {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
                
                {saveStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-400">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span>Save failed</span>
                  </div>
                )}
                
                {saveStatus === 'idle' && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>Ready to edit</span>
                  </div>
                )}
              </div>
              
              {saveMessage && (
                <div className={`mt-2 text-xs p-2 rounded ${
                  saveStatus === 'success' 
                    ? 'bg-green-500/20 text-green-300' 
                    : saveStatus === 'error'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {saveMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tool-Specific Controls */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">
          {selectedTool === 'text' && '🔤 Text Editor'}
          {selectedTool === 'color' && '🎨 Color Editor'}
          {selectedTool === 'background' && '🎨 Background Editor'}
          {selectedTool === 'image' && '�️ Image Editor'}
        </h3>
        
        {!selectedComponent && (
          <div className="text-gray-400 text-sm">
            Select a component to see editing options
          </div>
        )}

        {selectedComponent && !getAvailableToolsForComponent(selectedComponent.id).includes(selectedTool) && (
          <div className="text-yellow-400 text-sm bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30">
            ⚠️ The {selectedTool} tool is not available for {selectedComponent.type} components.
            <div className="mt-1 text-xs text-gray-400">
              Available tools: {getAvailableToolsForComponent(selectedComponent.id).join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* Tool Controls - Only show if tool is available for selected component */}
      {selectedComponent && getAvailableToolsForComponent(selectedComponent.id).includes(selectedTool) && (
        <>
          {/* Text Tool Controls */}
          {selectedTool === 'text' && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Size
                </label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  className="w-full"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => e.stopPropagation()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Text Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Bold
                  </button>
                  <button 
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Italic
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Color Tool Controls */}
          {selectedTool === 'color' && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Text Color
                </label>
                <input
                  type="color"
                  className="w-full h-12 border border-gray-600 rounded"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => e.stopPropagation()}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Quick Colors
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['#00FFFF', '#FF0066', '#FFFF00', '#00FF88', '#FF6600', '#9900FF', '#FF0000', '#FFFFFF'].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Background Tool Controls */}
          {selectedTool === 'background' && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Background Color
                </label>
                <input
                  type="color"
                  className="w-full h-12 border border-gray-600 rounded"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => e.stopPropagation()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gradient Options
                </label>
                <div className="space-y-2">
                  {[
                    'from-darkBg via-gray-900 to-darkBg',
                    'from-blue-900 via-purple-900 to-blue-900',
                    'from-green-900 via-teal-900 to-green-900',
                    'from-red-900 via-pink-900 to-red-900'
                  ].map((gradient) => (
                    <button
                      key={gradient}
                      className={`w-full h-8 rounded border border-gray-600 bg-gradient-to-r ${gradient}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Image Tool Controls */}
          {selectedTool === 'image' && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload New Image
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <div className="text-gray-400 mb-2">Drag & drop image here</div>
                  <button 
                    className="px-4 py-2 bg-neonCyan text-black rounded font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Choose File
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image Properties
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm text-gray-300">Maintain aspect ratio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm text-gray-300">Add rounded corners</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Debug Info for Development */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/30">
        <div className="text-xs text-gray-500">
          <div>Selected: {selectedComponent?.id || 'None'}</div>
          <div>Tool: {selectedTool}</div>
          <div>Status: {saveStatus}</div>
        </div>
      </div>
    </div>
  );
};
