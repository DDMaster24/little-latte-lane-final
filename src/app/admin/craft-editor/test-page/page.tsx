'use client';

import { useState, useEffect, useContext } from 'react';
import { TestPageHeading } from '../../../../components/TestPageComponents/TestPageHeading';
import { EditorProvider, SelectionProvider, SelectionContext } from '../../../../contexts/EditorContext';
import { Save, Eye, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Top Navigation Toolbar
const EditorToolbar = ({ onSave, isSaving, hasUnsavedChanges }: { 
  onSave: () => void; 
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}) => {
  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Exit Editor</span>
          </Link>
          
          <div className="h-6 w-px bg-gray-600"></div>
          
          <span className="text-gray-400 text-sm">Test Page Editor</span>
          
          {!hasUnsavedChanges && (
            <span className="text-yellow-400 text-xs bg-yellow-400/10 px-2 py-1 rounded">
              All changes saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/test-page"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
          >
            <Eye className="h-4 w-4" />
            View Live Site
          </Link>
          
          <button
            onClick={onSave}
            disabled={isSaving || hasUnsavedChanges}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Tool Panel Component
const ToolPanel = ({ 
  onSaveChange 
}: { 
  onSaveChange?: () => void;
}) => {
  const { selectedComponent, setSelectedComponent } = useContext(SelectionContext);
  
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [fontSize, setFontSize] = useState(48);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [appliedChanges, setAppliedChanges] = useState(false);
  const [showGradientEditor, setShowGradientEditor] = useState(false); // Hidden by default - click "Add Gradient" to show
  const [gradientType, setGradientType] = useState<'text' | 'background'>('text');
  const [gradientDirection, setGradientDirection] = useState('to right');
  const [gradientColor1, setGradientColor1] = useState('#ff00ff');
  const [gradientColor2, setGradientColor2] = useState('#00ffff');
  const [gradientColor3, setGradientColor3] = useState('#ff00ff');
  const [useThreeColors, setUseThreeColors] = useState(false);

  // Debug: Log context values
  useEffect(() => {
    console.log('🔍 Main page context values:', { 
      selectedComponent, 
      setSelectedComponent: typeof setSelectedComponent 
    });
  });

  // Debug: Log when selectedComponent changes
  useEffect(() => {
    console.log('🎯 ToolPanel selectedComponent changed:', selectedComponent);
  }, [selectedComponent]);

  // Neon theme colors from your website
  const neonColors = [
    '#00ffff', // Neon Cyan
    '#ff00ff', // Neon Pink/Magenta
    '#00ff00', // Neon Green
    '#ffff00', // Neon Yellow
    '#ff6600', // Neon Orange
    '#ffffff', // White
    '#8a2be2', // Blue Violet
    '#ff1493'  // Deep Pink
  ];

  // Live color update functions
  const updateTextColor = (color: string) => {
    setTextColor(color);
    window.postMessage({
      type: 'UPDATE_COMPONENT_STYLE',
      color: color
    }, '*');
  };

  const updateBackgroundColor = (color: string) => {
    setBackgroundColor(color);
    window.postMessage({
      type: 'UPDATE_COMPONENT_STYLE',
      backgroundColor: color
    }, '*');
  };

  const updateFontSize = (size: number) => {
    setFontSize(size);
    window.postMessage({
      type: 'UPDATE_COMPONENT_STYLE',
      fontSize: size
    }, '*');
  };

  // Live gradient update function
  const updateLiveGradient = () => {
    const gradientValue = useThreeColors
      ? `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2}, ${gradientColor3})`
      : `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2})`;
    
    if (gradientType === 'text') {
      updateTextColor(gradientValue);
    } else {
      updateBackgroundColor(gradientValue);
    }
  };

  const resetComponent = () => {
    setTextColor('#ffffff');
    setBackgroundColor('transparent');
    setFontSize(48);
    setHasChanges(false);
    setAppliedChanges(false);
    
    window.postMessage({
      type: 'RESET_COMPONENT'
    }, '*');
  };

  if (!selectedComponent) {
    return (
      <div className="bg-gray-800 p-4 rounded border border-gray-700 h-full">
        <p className="text-gray-400 text-center py-8">
          Click on a component to start editing
        </p>
      </div>
    );
  }

  if (selectedComponent === 'unknown') {
    return (
      <div className="bg-gray-800 p-4 rounded border border-gray-700 h-full">
        <p className="text-gray-400 text-center py-8">
          Unknown component selected
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded border border-gray-700 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">🛠️ Style Tools</h3>
        <button
          onClick={() => setSelectedComponent(null)}
          className="text-gray-400 hover:text-white text-sm"
        >
          ✕ Close
        </button>
      </div>

      <div className="bg-green-900/20 border border-green-600 rounded p-3 mb-6">
        <h4 className="text-green-400 font-medium text-sm mb-1">Selected Component</h4>
        <p className="text-green-300 text-sm capitalize">{selectedComponent}</p>
      </div>

      {/* Workflow Status */}
      <div className="bg-blue-900/20 border border-blue-600 rounded p-3 mb-6">
        <h4 className="text-blue-400 font-medium text-sm mb-2">📋 Workflow Status</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-300">Component Selected</span>
            <span className="text-green-400">✅ Ready</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-300">Live Updates</span>
            <span className="text-green-400">✅ Active</span>
          </div>
        </div>
      </div>

      {/* Live updating tools - no loading state needed */}
      <div className="space-y-6">
        <div>
          {/* Text Color Section */}
          <div className="mb-4">
            <h4 className="text-white font-medium mb-3">🎨 Text Color</h4>
            <div className="space-y-3">
              <input
                type="color"
                value={textColor.startsWith('linear-gradient') ? '#ffffff' : textColor}
                onChange={(e) => updateTextColor(e.target.value)}
                className="w-full h-10 rounded border border-gray-600 bg-gray-700"
              />
              
              {/* Neon Color Presets */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => updateTextColor('#ffffff')}
                  className="w-full h-8 rounded border border-gray-600"
                  style={{ backgroundColor: '#ffffff' }}
                  title="White"
                />
                {neonColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => updateTextColor(color)}
                    className="w-full h-8 rounded border border-gray-600"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Background Color Section */}
          <div className="mb-4">
            <h4 className="text-white font-medium mb-3">🖼️ Background Color</h4>
            <div className="space-y-3">
              <input
                type="color"
                value={backgroundColor === 'transparent' ? '#000000' : backgroundColor}
                onChange={(e) => updateBackgroundColor(e.target.value)}
                className="w-full h-10 rounded border border-gray-600 bg-gray-700"
              />
              
              <button
                onClick={() => updateBackgroundColor('transparent')}
                className="w-full py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
              >
                🔍 Transparent
              </button>
            </div>
          </div>

          {/* Font Size Section */}
          <div className="mb-6">
            <h4 className="text-white font-medium mb-3">📏 Font Size</h4>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => updateFontSize(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>12px</span>
              <span className="text-white font-medium">{fontSize}px</span>
              <span>72px</span>
            </div>
          </div>

          {/* Gradient Editor Section - Working Version */}
          <div className="border-t border-gray-700 pt-6">
            {!showGradientEditor ? (
              <div className="text-center">
                <button
                  onClick={() => setShowGradientEditor(true)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all shadow-lg"
                >
                  ✨ Add Gradient Effect
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">🌈 Live Gradient Editor</h4>
                  <button
                    onClick={() => setShowGradientEditor(false)}
                    className="py-1 px-3 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-500"
                  >
                    ✕ Close
                  </button>
                </div>
                <p className="text-gray-400">Gradient controls coming soon...</p>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={resetComponent}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-medium"
            >
              🔄 Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
                    <button
                      onClick={() => setGradientType('text')}
                      className={`py-1 px-3 rounded text-xs font-medium ${
                        gradientType === 'text'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Text
                    </button>
                    <button
                      onClick={() => setGradientType('background')}
                      className={`py-1 px-3 rounded text-xs font-medium ${
                        gradientType === 'background'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Background
                    </button>
                    <button
                      onClick={() => setShowGradientEditor(false)}
                      className="py-1 px-3 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                {/* Direction Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Direction</label>
                  <select
                    value={gradientDirection}
                    onChange={(e) => {
                      setGradientDirection(e.target.value);
                      // Trigger live update after direction change
                      setTimeout(updateLiveGradient, 10);
                    }}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  >
                    <option value="to right">→ To Right</option>
                    <option value="to left">← To Left</option>
                    <option value="to bottom">↓ To Bottom</option>
                    <option value="to top">↑ To Top</option>
                    <option value="45deg">↗ Diagonal</option>
                  </select>
                </div>

                {/* Color Inputs with Live Updates */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Color 1</label>
                    <input
                      type="color"
                      value={gradientColor1}
                      onChange={(e) => {
                        setGradientColor1(e.target.value);
                        // Trigger live update immediately
                        setTimeout(updateLiveGradient, 10);
                      }}
                      className="w-full h-10 rounded border border-gray-600 bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Color 2</label>
                    <input
                      type="color"
                      value={gradientColor2}
                      onChange={(e) => {
                        setGradientColor2(e.target.value);
                        // Trigger live update immediately
                        setTimeout(updateLiveGradient, 10);
                      }}
                      className="w-full h-10 rounded border border-gray-600 bg-gray-700"
                    />
                  </div>
                  
                  {/* Three Color Toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="threeColors"
                      checked={useThreeColors}
                      onChange={(e) => {
                        setUseThreeColors(e.target.checked);
                        // Trigger live update after toggle
                        setTimeout(updateLiveGradient, 10);
                      }}
                      className="rounded"
                    />
                    <label htmlFor="threeColors" className="text-sm text-gray-300">Use 3 colors</label>
                  </div>
                  
                  {useThreeColors && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Color 3</label>
                      <input
                        type="color"
                        value={gradientColor3}
                        onChange={(e) => {
                          setGradientColor3(e.target.value);
                          // Trigger live update immediately
                          setTimeout(updateLiveGradient, 10);
                        }}
                        className="w-full h-10 rounded border border-gray-600 bg-gray-700"
                      />
                    </div>
                  )}
                </div>

                {/* Quick Preset Buttons with Live Updates */}
                <div className="border-t border-gray-600 pt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-3">🎨 Gradient Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setGradientColor1('#ff00ff');
                        setGradientColor2('#00ffff');
                        setUseThreeColors(false);
                        // Trigger live update immediately
                        setTimeout(updateLiveGradient, 10);
                      }}
                      className="py-2 px-3 bg-gradient-to-r from-pink-500 to-cyan-500 rounded text-white text-xs font-medium hover:shadow-lg transition-all"
                    >
                      Neon Pink→Cyan
                    </button>
                    <button
                      onClick={() => {
                        setGradientColor1('#00ff00');
                        setGradientColor2('#ffff00');
                        setUseThreeColors(false);
                        // Trigger live update immediately
                        setTimeout(updateLiveGradient, 10);
                      }}
                      className="py-2 px-3 bg-gradient-to-r from-green-500 to-yellow-500 rounded text-white text-xs font-medium hover:shadow-lg transition-all"
                    >
                      Neon Green→Yellow
                    </button>
                    <button
                      onClick={() => {
                        setGradientColor1('#ff00ff');
                        setGradientColor2('#00ffff');
                        setGradientColor3('#ff00ff');
                        setUseThreeColors(true);
                        // Trigger live update immediately
                        setTimeout(updateLiveGradient, 10);
                      }}
                      className="py-2 px-3 bg-gradient-to-r from-pink-500 via-cyan-500 to-pink-500 rounded text-white text-xs font-medium hover:shadow-lg transition-all"
                    >
                      Neon Rainbow
                    </button>
                    <button
                      onClick={() => {
                        setGradientColor1('#8a2be2');
                        setGradientColor2('#ff1493');
                        setUseThreeColors(false);
                        // Trigger live update immediately
                        setTimeout(updateLiveGradient, 10);
                      }}
                      className="py-2 px-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded text-white text-xs font-medium hover:shadow-lg transition-all"
                    >
                      Purple→Pink
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={resetComponent}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-medium"
            >
              🔄 Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TestPageEditor() {
  const [allChangesSaved, setAllChangesSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Save function for the toolbar
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Test page saved successfully');
      setAllChangesSaved(true);
    } catch (error) {
      console.error('❌ Failed to save test page:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle clicking outside to deselect components
  const handlePageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // If clicking on the editor background (not on components or tool panel)
    if (target.closest('.tool-panel') || target.closest('[data-component]')) {
      return; // Don't deselect if clicking on tools or components
    }
    
    // Deselect component if clicking elsewhere
    // Note: This will be handled by SelectionContext
  };

  return (
    <EditorProvider value={true}>
      <SelectionProvider>
        <div className="min-h-screen bg-gray-100">
          {/* Add CSS for editable components */}
          <style jsx global>{`
            .editable-component:hover {
              border: 2px solid #ff6600 !important;
              box-shadow: 0 0 10px rgba(255, 102, 0, 0.3);
            }
            .editable-component.selected {
              border: 2px solid #ff0000 !important;
              box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
            }
          `}</style>
          
          <EditorToolbar 
            onSave={handleSave}
            isSaving={isSaving}
            hasUnsavedChanges={!allChangesSaved}
          />
          
          <div className="flex h-[calc(100vh-73px)]">
            {/* Main Editor Area - Exact replica of test page */}
            <div 
              className="flex-1 overflow-hidden"
              onClick={handlePageClick}
            >
              {/* EXACT Test Page Content */}
              <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <TestPageHeading />
                  <p className="text-gray-400">This is our simple test page with one editable heading</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Refresh to see changes
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tool Panel */}
            <div className="w-80 bg-gray-900 border-l border-gray-700 tool-panel">
              <ToolPanel />
            </div>
          </div>
        </div>
      </SelectionProvider>
    </EditorProvider>
  );
}
