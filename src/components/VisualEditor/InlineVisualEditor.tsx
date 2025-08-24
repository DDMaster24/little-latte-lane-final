'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

interface InlineVisualEditorProps {
  children: React.ReactNode;
}

export function InlineVisualEditor({ children }: InlineVisualEditorProps) {
  const searchParams = useSearchParams();
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if editor mode is active
  useEffect(() => {
    const editorMode = searchParams.get('editor') === 'true';
    const adminMode = searchParams.get('admin') === 'true';
    setIsEditorMode(editorMode && adminMode);
  }, [searchParams]);

  // Handle sidebar resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (!isEditorMode) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* Left Sidebar - Design Tools */}
      <div
        ref={sidebarRef}
        className="fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-700 shadow-2xl"
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Sidebar Header */}
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-neonCyan to-neonPink rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-black">LL</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">Visual Editor</h1>
              <p className="text-gray-400 text-xs">Professional Design Studio</p>
            </div>
          </div>
          <button
            onClick={() => {
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('editor');
              newUrl.searchParams.delete('admin');
              window.location.href = newUrl.toString();
            }}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="h-full overflow-y-auto pb-16">
          {/* Element Inspector */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-medium text-sm mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-neonCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
              </svg>
              Element Inspector
            </h3>
            {selectedElement ? (
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Selected Element:</div>
                <div className="text-sm text-white font-mono bg-gray-700 px-2 py-1 rounded">
                  {selectedElement.tagName.toLowerCase()}
                </div>
                <div className="text-xs text-gray-400 mt-2 break-words">
                  {selectedElement.textContent?.slice(0, 50)}...
                </div>
                <button
                  onClick={() => setSelectedElement(null)}
                  className="mt-2 text-xs text-gray-400 hover:text-white"
                >
                  Clear selection
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
                </svg>
                <p className="text-sm">Click an element to start editing</p>
                <button
                  onClick={() => {
                    // Demo selection for testing
                    const testElement = document.querySelector('h1');
                    if (testElement) {
                      setSelectedElement(testElement as HTMLElement);
                    }
                  }}
                  className="mt-2 text-xs text-neonCyan hover:text-cyan-400"
                >
                  Demo: Select first heading
                </button>
              </div>
            )}
          </div>

          {/* Design Tools Placeholder */}
          <div className="p-4 space-y-4">
            {/* Content Panel */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium text-sm mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-neonCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Content
              </h4>
              <textarea
                placeholder="Select an element to edit its content..."
                className="w-full h-20 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 resize-none focus:border-neonCyan focus:outline-none"
                disabled={!selectedElement}
              />
            </div>

            {/* Typography Panel */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium text-sm mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-neonCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Typography
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Font Family</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs">
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Poppins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Weight</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs">
                    <option>Normal</option>
                    <option>Medium</option>
                    <option>Bold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Colors Panel */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium text-sm mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-neonCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
                </svg>
                Colors
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Text</label>
                  <div className="relative">
                    <input type="color" className="w-full h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Background</label>
                  <div className="relative">
                    <input type="color" className="w-full h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Effects Panel */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium text-sm mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-neonCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Effects
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Border Radius</label>
                  <input type="range" className="w-full" min="0" max="20" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Opacity</label>
                  <input type="range" className="w-full" min="0" max="100" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                disabled={!selectedElement}
              >
                Preview
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-neonCyan to-neonPink hover:from-cyan-400 hover:to-pink-400 text-black rounded-lg text-sm font-bold transition-all"
                disabled={!selectedElement}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="absolute top-0 right-0 w-1 h-full bg-gray-700 hover:bg-neonCyan cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        />
      </div>

      {/* Main Content Area */}
      <div
        ref={contentRef}
        className="h-full overflow-auto bg-gradient-to-br from-gray-900 to-black"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {/* Content Area Header */}
        <div className="h-16 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between px-6 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Live Preview Mode</span>
            </div>
            <div className="text-gray-400 text-sm">
              Click any text element to start editing
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors">
              Reset
            </button>
            <button className="px-3 py-1 bg-neonCyan hover:bg-cyan-400 text-black rounded text-xs font-medium transition-colors">
              Publish
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="relative">
          {children}
          
          {/* Inline Editor Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* This will contain our hover and selection overlays */}
          </div>
        </div>
      </div>
    </div>
  );
}
