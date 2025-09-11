'use client';

import { useState, useContext } from 'react';
import Image from 'next/image';
import { TestPageHeading } from '../../../../components/TestPageComponents/TestPageHeading';
import { TestPageImage } from '../../../../components/TestPageComponents/TestPageImage';
import { EditorProvider, SelectionProvider, SelectionContext } from '../../../../contexts/EditorContext';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Top Navigation Toolbar
const EditorToolbar = ({ onSave, isSaving, hasUnsavedChanges }: { 
  onSave: () => void; 
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}) => {
  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit Editor
          </Link>
          
          <div className="h-6 w-px bg-gray-600"></div>
          
          <span className="text-gray-400 text-sm">Test Page Editor</span>
          
          {hasUnsavedChanges && (
            <span className="text-yellow-400 text-xs bg-yellow-400/10 px-2 py-1 rounded">
              • Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/test-page"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
          >
            <Eye className="h-4 w-4" />
            View Live Site
          </Link>
          
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Save Changes"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Tool Panel Component
const ToolPanel = () => {
  const { selectedComponent, setSelectedComponent } = useContext(SelectionContext);
  
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [fontSize, setFontSize] = useState(48);
  const [imageUrl, setImageUrl] = useState('');
  const [imageSize, setImageSize] = useState({ width: 100, height: 100 });

  // Component type detection
  const getComponentType = (componentId: string | null) => {
    if (!componentId) return null;
    
    // Detect component type based on ID or other criteria
    if (componentId.includes('Heading') || componentId.includes('Text')) {
      return 'text';
    } else if (componentId.includes('Image') || componentId.includes('Photo')) {
      return 'image';
    } else if (componentId.includes('Mixed') || componentId.includes('Card')) {
      return 'mixed'; // Components with both text and image
    }
    
    // Default to text for now
    return 'text';
  };

  const componentType = getComponentType(selectedComponent);

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

  // Neon gradient presets
  const neonGradients = [
    'linear-gradient(45deg, #00ffff, #ff00ff)', // Cyan to Pink
    'linear-gradient(45deg, #ff00ff, #00ff00)', // Pink to Green
    'linear-gradient(45deg, #ffff00, #ff6600)', // Yellow to Orange
    'linear-gradient(45deg, #00ffff, #8a2be2)', // Cyan to Purple
    'linear-gradient(90deg, #ff1493, #00ffff)', // Pink to Cyan
    'linear-gradient(135deg, #00ff00, #ffff00)', // Green to Yellow
    'radial-gradient(circle, #ff00ff, #00ffff)', // Radial Pink to Cyan
    'radial-gradient(circle, #ffff00, #ff6600)', // Radial Yellow to Orange
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

  // New gradient functions
  const updateTextGradient = (gradient: string) => {
    setTextColor(gradient);
    window.postMessage({
      type: 'UPDATE_COMPONENT_STYLE',
      color: gradient
    }, '*');
  };

  const updateBackgroundGradient = (gradient: string) => {
    setBackgroundColor(gradient);
    window.postMessage({
      type: 'UPDATE_COMPONENT_STYLE',
      backgroundColor: gradient
    }, '*');
  };

  // Image tool functions
  const updateImage = (url: string) => {
    setImageUrl(url);
    window.postMessage({
      type: 'UPDATE_COMPONENT_STYLE',
      imageUrl: url
    }, '*');
  };

  const updateImageSize = (width: number, height: number) => {
    setImageSize({ width, height });
    window.postMessage({
      type: 'UPDATE_COMPONENT_STYLE',
      imageSize: { width, height }
    }, '*');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateFontSize = (size: number) => {
    setFontSize(size);
    window.postMessage({
      type: 'UPDATE_COMPONENT_STYLE',
      fontSize: size
    }, '*');
  };

  const resetComponent = () => {
    setTextColor('#ffffff');
    setBackgroundColor('transparent');
    setFontSize(48);
    
    window.postMessage({
      type: 'RESET_COMPONENT'
    }, '*');
  };

  if (!selectedComponent) {
    return (
      <div className="bg-gray-800 p-4 rounded border border-gray-700 h-full">
        <h3 className="text-lg font-semibold text-white mb-4">🛠️ Style Tools</h3>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎨</div>
          <p className="text-gray-400 mb-2 text-base">No component selected</p>
          <p className="text-gray-500 text-sm">Click on a component to start styling</p>
        </div>
      </div>
    );
  }

  if (!selectedComponent || (selectedComponent !== 'TestPageHeading' && selectedComponent !== 'TestPageImage')) {
    return (
      <div className="bg-gray-800 p-4 rounded border border-gray-700 h-full">
        <h3 className="text-lg font-semibold text-white mb-4">🛠️ Style Tools</h3>
        <p className="text-gray-400 text-center py-8">
          {selectedComponent ? 'Unknown component selected' : 'Select a component to edit'}
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
        <h4 className="text-green-400 font-medium text-sm mb-1 flex items-center gap-2">
          📝 Selected Component
        </h4>
        <p className="text-green-300 text-sm font-mono">{selectedComponent}</p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-400">Component Type</span>
            <span className="text-cyan-400 uppercase font-mono">
              {componentType === 'text' && '📝 TEXT'}
              {componentType === 'image' && '🖼️ IMAGE'}  
              {componentType === 'mixed' && '📝🖼️ MIXED'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-400">Live Updates</span>
            <span className="text-green-400">✅ Active</span>
          </div>
        </div>
      </div>

      {/* Text Color Control - Only for text/mixed components */}
      {(componentType === 'text' || componentType === 'mixed') && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">🌈 Text Color</label>
            
            {/* Color Input */}
            <input
              type="color"
              value={textColor.startsWith('linear-gradient') ? '#ffffff' : textColor}
              onChange={(e) => updateTextColor(e.target.value)}
              className="w-full h-10 rounded border border-gray-600 mb-3"
            />
            
            {/* Neon Color Palette */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {neonColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => updateTextColor(color)}
                  className="w-full h-8 rounded border-2 border-gray-600 hover:border-white transition-colors"
                  style={{ backgroundColor: color }}
                  title={`Neon Color ${index + 1}`}
                />
              ))}
            </div>

            {/* Gradient Palette */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-400 mb-2">✨ Gradient Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {neonGradients.map((gradient, index) => (
                  <button
                    key={index}
                    onClick={() => updateTextGradient(gradient)}
                    className="w-full h-6 rounded border-2 border-gray-600 hover:border-white transition-colors"
                    style={{ background: gradient }}
                    title={`Gradient ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Background Color Control */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">🎨 Background Color</label>
            
            <input
              type="color"
              value={backgroundColor === 'transparent' ? '#000000' : backgroundColor.startsWith('linear-gradient') ? '#000000' : backgroundColor}
              onChange={(e) => updateBackgroundColor(e.target.value)}
              className="w-full h-10 rounded border border-gray-600 mb-2"
            />
            
            {/* Background Gradient Palette */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-400 mb-2">✨ Background Gradients</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {neonGradients.map((gradient, index) => (
                  <button
                    key={index}
                    onClick={() => updateBackgroundGradient(gradient)}
                    className="w-full h-6 rounded border-2 border-gray-600 hover:border-white transition-colors"
                    style={{ background: gradient }}
                    title={`Background Gradient ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            <button
              onClick={() => updateBackgroundColor('transparent')}
              className="w-full py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">⚪</span>
              Transparent
            </button>
          </div>

          {/* Font Size Control */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">📏 Font Size</label>
            
            <div className="space-y-2">
              <input
                type="range"
                min="12"
                max="72"
                value={fontSize}
                onChange={(e) => updateFontSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>12px</span>
                <span className="font-medium text-white">{fontSize}px</span>
                <span>72px</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Tools - Only for image/mixed components */}
      {(componentType === 'image' || componentType === 'mixed') && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">🖼️ Image Tools</label>
            
            {/* Image Upload */}
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium cursor-pointer flex items-center justify-center gap-2 transition-colors"
              >
                📁 Upload Image
              </label>
            </div>

            {/* Image Size Controls */}
            {imageUrl && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">📏 Image Width</label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    value={imageSize.width}
                    onChange={(e) => updateImageSize(parseInt(e.target.value), imageSize.height)}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>50px</span>
                    <span className="font-medium text-white">{imageSize.width}px</span>
                    <span>500px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">📏 Image Height</label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    value={imageSize.height}
                    onChange={(e) => updateImageSize(imageSize.width, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>50px</span>
                    <span className="font-medium text-white">{imageSize.height}px</span>
                    <span>500px</span>
                  </div>
                </div>

                {/* Image Preview */}
                <div className="border border-gray-600 rounded p-2 bg-gray-900">
                  <Image 
                    src={imageUrl} 
                    alt="Preview" 
                    width={imageSize.width}
                    height={imageSize.height}
                    className="w-full max-h-32 object-contain rounded"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
  );
};

export default function TestPageEditor() {
  const [allChangesSaved, setAllChangesSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Save function for the toolbar
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Trigger a refresh of all components to ensure they're in sync
      window.postMessage({
        type: 'RESET_COMPONENT'
      }, '*');
      
      // Give components time to reload from database
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Test page refreshed successfully - all changes saved');
      setAllChangesSaved(true);
      
    } catch (error) {
      console.error('❌ Failed to refresh test page:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SelectionProvider>
        <EditorProvider value={true}>
          <div className="min-h-screen bg-gray-100">
            <EditorToolbar 
              onSave={handleSave}
              isSaving={isSaving}
              hasUnsavedChanges={!allChangesSaved}
            />
            
            <div className="flex h-[calc(100vh-73px)]">
              {/* Main Preview Area */}
              <div className="flex-1 p-2 overflow-hidden">
                <div className="h-full border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-black rounded p-6 h-[calc(100%-60px)] editor-background">
                    <TestPageHeading />
                    
                    <div className="flex justify-center mt-8">
                      <TestPageImage />
                    </div>
                    
                    <p className="text-gray-400 text-center mt-8 editor-background">
                      This is our test page with editable heading and image components
                    </p>
                    
                    <div className="mt-8 text-center editor-background">
                      <button 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Test both text and image editing
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Tool Panel */}
              <div className="w-[400px] p-2">
                <ToolPanel />
              </div>
            </div>
          </div>
        </EditorProvider>
      </SelectionProvider>
    </>
  );
}
