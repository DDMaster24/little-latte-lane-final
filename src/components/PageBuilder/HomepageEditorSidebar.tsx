'use client';

import React from 'react';
import { useEditor } from '@craftjs/core';

interface HomepageEditorSidebarProps {
  selectedTool: 'text' | 'color' | 'image' | 'toggle';
  enabled: boolean;
}

export const HomepageEditorSidebar: React.FC<HomepageEditorSidebarProps> = ({
  selectedTool,
  enabled
}) => {
  const { selected } = useEditor((state) => ({
    selected: state.events.selected
  }));

  if (!enabled) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
        <div className="text-center text-gray-400">
          <h3 className="text-lg font-semibold mb-2">Preview Mode</h3>
          <p className="text-sm">Turn on editing mode to see controls</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
      {/* Tool-Specific Controls */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">
          {selectedTool === 'text' && '🔤 Text Editor'}
          {selectedTool === 'color' && '🎨 Color Editor'}
          {selectedTool === 'image' && '🖼️ Image Editor'}
          {selectedTool === 'toggle' && '👁️ Section Visibility'}
        </h3>
        
        {!selected && (
          <div className="text-gray-400 text-sm">
            Click any component on the homepage to start editing
          </div>
        )}
      </div>

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
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Text Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">
                Bold
              </button>
              <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">
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
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Background Color
            </label>
            <input
              type="color"
              className="w-full h-12 border border-gray-600 rounded"
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
                  className="w-8 h-8 rounded border border-gray-600"
                  style={{ backgroundColor: color }}
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
              <button className="px-4 py-2 bg-neonCyan text-black rounded font-medium">
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
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-300">Maintain aspect ratio</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-300">Add rounded corners</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Tool Controls */}
      {selectedTool === 'toggle' && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Section Visibility
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Carousel Section</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Events & Specials</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Categories Section</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Bookings Section</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Component Info */}
      {selected && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            <strong className="text-white">Selected:</strong> Component
          </div>
        </div>
      )}
    </div>
  );
};
