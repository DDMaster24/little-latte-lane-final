'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// CSS for visual editor hover effects and Photoshop-style interface
const visualEditorStyles = `
  .visual-editor-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    z-index: 1000;
  }

  .visual-editor-content {
    position: relative;
    z-index: 1001;
    background: transparent;
  }

  .visual-editor-hover {
    outline: 5px solid #00ffff !important;
    outline-offset: 3px !important;
    position: relative !important;
    cursor: pointer !important;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.8) !important;
    transition: all 0.2s ease !important;
  }

  .visual-editor-hover::before {
    content: 'Click to edit';
    position: absolute;
    top: -35px;
    left: 0;
    background: linear-gradient(45deg, #00ffff, #0099cc);
    color: #000;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
    z-index: 9999;
    pointer-events: none;
    box-shadow: 0 4px 15px rgba(0, 255, 255, 0.5);
    border: 1px solid #00ffff;
  }

  .visual-editor-selected {
    outline: 5px solid #ff00ff !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 25px rgba(255, 0, 255, 0.9) !important;
    background: rgba(255, 0, 255, 0.1) !important;
  }

  .visual-editor-editing {
    outline: 5px solid #ffff00 !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 30px rgba(255, 255, 0, 0.9) !important;
    background: rgba(255, 255, 0, 0.1) !important;
  }

  /* Text element targeting */
  h1, h2, h3, h4, h5, h6, p, span, div, a, li, td, th, label, button:not(.visual-editor-tool):not(.visual-editor-close) {
    transition: all 0.2s ease !important;
  }

  /* Active editing styles */
  [contenteditable="true"] {
    outline: 5px solid #ffff00 !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 30px rgba(255, 255, 0, 0.9) !important;
    background: rgba(255, 255, 0, 0.1) !important;
    cursor: text !important;
  }
`;

interface ElementChange {
  element: HTMLElement;
  property: string;
  oldValue: string;
  newValue: string;
  timestamp: number;
}

interface InlineVisualEditorProps {
  children: React.ReactNode;
  isEnabled: boolean;
  onClose: () => void;
}

type ToolType = 'cursor' | 'text' | 'color' | 'typography' | 'spacing';

interface ListenerStore {
  mouseenter: () => void;
  mouseleave: () => void;
  click: (e: Event) => void;
}

const InlineVisualEditor: React.FC<InlineVisualEditorProps> = ({
  children,
  isEnabled,
  onClose
}) => {
  const [activeTool, setActiveTool] = useState<ToolType>('cursor');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [changeHistory, setChangeHistory] = useState<ElementChange[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  // Add styles to document
  useEffect(() => {
    if (!isEnabled) return;

    const styleId = 'visual-editor-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = visualEditorStyles;

    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [isEnabled]);

  const selectElement = useCallback((element: HTMLElement) => {
    // Clear previous selection
    if (selectedElement) {
      selectedElement.classList.remove('visual-editor-selected', 'visual-editor-editing');
      if (isTextEditing) {
        setIsTextEditing(false);
        selectedElement.contentEditable = 'false';
        selectedElement.blur();
        window.getSelection()?.removeAllRanges();
      }
    }

    // Set new selection
    setSelectedElement(element);
    element.classList.add('visual-editor-selected');
    element.classList.remove('visual-editor-hover');
  }, [selectedElement, isTextEditing]);

  const startTextEditing = useCallback(() => {
    if (!selectedElement) return;

    setIsTextEditing(true);
    selectedElement.classList.add('visual-editor-editing');
    selectedElement.classList.remove('visual-editor-selected');
    selectedElement.contentEditable = 'true';
    selectedElement.focus();

    // Select all text
    const range = document.createRange();
    range.selectNodeContents(selectedElement);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [selectedElement]);

  const stopTextEditing = useCallback(() => {
    if (!selectedElement || !isTextEditing) return;

    setIsTextEditing(false);
    selectedElement.contentEditable = 'false';
    selectedElement.classList.remove('visual-editor-editing');
    selectedElement.classList.add('visual-editor-selected');
    selectedElement.blur();

    // Clear selection
    window.getSelection()?.removeAllRanges();
  }, [selectedElement, isTextEditing]);

  // Enhanced hover detection targeting specific text elements
  const addElementIndicators = useCallback(() => {
    if (!isEnabled || !editorRef.current) return;

    const textElements = editorRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, li, td, th, label, button:not(.visual-editor-tool):not(.visual-editor-close)');
    
    textElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      const handleMouseEnter = () => {
        if (!isTextEditing && activeTool !== 'cursor') {
          htmlElement.classList.add('visual-editor-hover');
        }
      };

      const handleMouseLeave = () => {
        htmlElement.classList.remove('visual-editor-hover');
      };

      const handleClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isTextEditing && selectedElement && selectedElement !== htmlElement) {
          stopTextEditing();
        }
        
        selectElement(htmlElement);
        
        // Auto-switch to text tool if clicking on text element
        if (activeTool === 'cursor' || activeTool === 'text') {
          setActiveTool('text');
          if (activeTool === 'text') {
            startTextEditing();
          }
        }
      };

      htmlElement.addEventListener('mouseenter', handleMouseEnter);
      htmlElement.addEventListener('mouseleave', handleMouseLeave);
      htmlElement.addEventListener('click', handleClick);

      // Store event listeners for cleanup
      (htmlElement as HTMLElement & { _visualEditorListeners?: ListenerStore })._visualEditorListeners = {
        mouseenter: handleMouseEnter,
        mouseleave: handleMouseLeave,
        click: handleClick
      };
    });
  }, [isEnabled, isTextEditing, selectedElement, activeTool, selectElement, startTextEditing, stopTextEditing]);

  const removeElementIndicators = useCallback(() => {
    if (!editorRef.current) return;

    const elements = editorRef.current.querySelectorAll('*');
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement & { _visualEditorListeners?: ListenerStore };
      const listeners = htmlElement._visualEditorListeners;
      
      if (listeners) {
        htmlElement.removeEventListener('mouseenter', listeners.mouseenter);
        htmlElement.removeEventListener('mouseleave', listeners.mouseleave);
        htmlElement.removeEventListener('click', listeners.click);
        delete htmlElement._visualEditorListeners;
      }
      
      htmlElement.classList.remove('visual-editor-hover', 'visual-editor-selected', 'visual-editor-editing');
    });
  }, []);

  useEffect(() => {
    if (isEnabled) {
      const timer = setTimeout(addElementIndicators, 100);
      return () => {
        clearTimeout(timer);
        removeElementIndicators();
      };
    } else {
      removeElementIndicators();
    }
  }, [isEnabled, addElementIndicators, removeElementIndicators]);

  const applyStyle = (property: string, value: string) => {
    if (!selectedElement) return;

    const oldValue = selectedElement.style.getPropertyValue(property) || 
                     window.getComputedStyle(selectedElement).getPropertyValue(property);

    selectedElement.style.setProperty(property, value);

    // Record change
    const change: ElementChange = {
      element: selectedElement,
      property,
      oldValue,
      newValue: value,
      timestamp: Date.now()
    };

    setChangeHistory(prev => [...prev, change]);
  };

  const getToolName = (tool: ToolType): string => {
    switch (tool) {
      case 'cursor': return 'Select';
      case 'text': return 'Text Editor';
      case 'color': return 'Color Editor';
      case 'typography': return 'Typography';
      case 'spacing': return 'Spacing';
      default: return 'Tool';
    }
  };

  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900" data-visual-editor="true">
      {/* Photoshop-style Tool Palette */}
      <div className="visual-editor-sidebar fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-700 shadow-2xl" style={{ width: '80px' }}>
        {/* Header with Logo */}
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-center">
          <div className="w-10 h-10 bg-gradient-to-r from-neonCyan to-neonPink rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-black">LL</span>
          </div>
        </div>

        {/* Tool Buttons */}
        <div className="p-3 space-y-3">
          {/* Cursor Tool */}
          <button
            onClick={() => setActiveTool('cursor')}
            className={`w-full h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
              activeTool === 'cursor' 
                ? 'bg-neonCyan border-neonCyan text-black shadow-lg shadow-neonCyan/50' 
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
            }`}
            title="Select Tool (Click elements to select)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
            </svg>
          </button>

          {/* Text Tool */}
          <button
            onClick={() => setActiveTool('text')}
            className={`w-full h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
              activeTool === 'text' 
                ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/50' 
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
            }`}
            title="Text Editor (Click text to edit directly)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Color Tool */}
          <button
            onClick={() => setActiveTool('color')}
            className={`w-full h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
              activeTool === 'color' 
                ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/50' 
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
            }`}
            title="Color Editor (Change text and background colors)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11a2 2 0 112.828 2.828l-6.364 6.364A2 2 0 018 21H6l2-2 6.364-6.364z" />
            </svg>
          </button>

          {/* Typography Tool */}
          <button
            onClick={() => setActiveTool('typography')}
            className={`w-full h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
              activeTool === 'typography' 
                ? 'bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/50' 
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
            }`}
            title="Typography (Font size, weight, family)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 20l4-16m4 16l4-16M6 9h12" />
            </svg>
          </button>

          {/* Spacing Tool */}
          <button
            onClick={() => setActiveTool('spacing')}
            className={`w-full h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
              activeTool === 'spacing' 
                ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/50' 
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
            }`}
            title="Spacing (Padding, margins, layout)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        {/* Tool Info */}
        {activeTool !== 'cursor' && (
          <div className="absolute bottom-20 left-3 right-3 bg-gray-800 rounded-lg p-2 border border-gray-600">
            <div className="text-xs text-gray-300 text-center font-medium">
              {getToolName(activeTool)}
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              {selectedElement ? 'Element selected' : 'Click element to select'}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="absolute bottom-3 left-3 right-3">
          <button
            onClick={() => {
              removeElementIndicators();
              setSelectedElement(null);
              setIsTextEditing(false);
              onClose();
            }}
            className="w-full h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close Editor
          </button>
        </div>
      </div>

      {/* Floating Tool Options Panel */}
      {activeTool !== 'cursor' && selectedElement && (
        <div className="fixed left-20 top-20 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-2xl z-50" style={{ width: '250px' }}>
          <h3 className="text-white font-medium text-sm mb-3 flex items-center">
            {activeTool === 'text' && <>📝 Text Editor</>}
            {activeTool === 'color' && <>🎨 Color Editor</>}
            {activeTool === 'typography' && <>🔤 Typography</>}
            {activeTool === 'spacing' && <>📦 Spacing</>}
          </h3>

          {activeTool === 'color' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 mb-2">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    onChange={(e) => applyStyle('color', e.target.value)}
                    className="w-12 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="#000000"
                    onChange={(e) => applyStyle('color', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    onChange={(e) => applyStyle('background-color', e.target.value)}
                    className="w-12 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="transparent"
                    onChange={(e) => applyStyle('background-color', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTool === 'typography' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 mb-2">Font Size</label>
                <input
                  type="range"
                  min="8"
                  max="72"
                  onChange={(e) => applyStyle('font-size', `${e.target.value}px`)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-2">Font Weight</label>
                <select
                  onChange={(e) => applyStyle('font-weight', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                >
                  <option value="400">Normal</option>
                  <option value="600">Semi Bold</option>
                  <option value="700">Bold</option>
                </select>
              </div>
            </div>
          )}

          {activeTool === 'spacing' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 mb-2">Padding</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  onChange={(e) => applyStyle('padding', `${e.target.value}px`)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-2">Margin</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  onChange={(e) => applyStyle('margin', `${e.target.value}px`)}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {activeTool === 'text' && (
            <div className="space-y-3">
              {isTextEditing ? (
                <button
                  onClick={stopTextEditing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded px-3 py-2 text-sm font-medium transition-colors"
                >
                  ✓ Save Text Changes
                </button>
              ) : (
                <button
                  onClick={startTextEditing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2 text-sm font-medium transition-colors"
                >
                  ✏️ Edit Text Content
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="h-full overflow-auto bg-gradient-to-br from-gray-900 to-black" style={{ marginLeft: '80px' }}>
        {/* Top Status Bar */}
        <div className="h-16 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between px-6 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">
                Visual Editor Active
              </span>
            </div>
            {selectedElement && (
              <div className="text-gray-400 text-sm">
                Selected: <span className="text-white font-medium">
                  {selectedElement.tagName.toLowerCase()}
                  {selectedElement.className && `.${selectedElement.className.split(' ')[0]}`}
                </span>
              </div>
            )}
            {activeTool !== 'cursor' && (
              <div className="text-neonCyan text-sm">
                Tool: <span className="font-medium">{getToolName(activeTool)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-400">
              Hover elements to highlight
            </div>
            <button
              onClick={() => addElementIndicators()}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => setChangeHistory([])}
              disabled={changeHistory.length === 0}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-xs transition-colors"
            >
              Clear Changes ({changeHistory.length})
            </button>
            <button className="px-3 py-1 bg-neonCyan hover:bg-cyan-400 text-black rounded text-xs font-medium transition-colors">
              Save All
            </button>
          </div>
        </div>

        {/* Page Content with Visual Editor */}
        <div className="relative">
          <div ref={editorRef} className="visual-editor-content">
            {children}
          </div>
          
          {/* Bottom Status */}
          <div className="fixed bottom-6 right-6 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600 rounded-xl px-4 py-3 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-neonCyan rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-semibold">
                  {getToolName(activeTool)}
                </span>
              </div>
              
              {selectedElement && (
                <>
                  <div className="w-px h-6 bg-gray-600"></div>
                  <div className="text-gray-300 text-sm">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-neonPink rounded-full mr-2"></span>
                      {selectedElement.tagName.toLowerCase()}
                    </span>
                  </div>
                </>
              )}
              
              {changeHistory.length > 0 && (
                <>
                  <div className="w-px h-6 bg-gray-600"></div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    <span className="text-neonCyan text-sm font-medium">
                      {changeHistory.length} change{changeHistory.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineVisualEditor;
