'use client';

import React, { useState, useCallback } from 'react';

interface StyleProperties {
  // Content
  text?: string;
  
  // Colors
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  
  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  textAlign?: string;
  textDecoration?: string;
  
  // Layout & Spacing
  width?: string;
  height?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  
  // Border & Effects
  borderRadius?: string;
  borderWidth?: string;
  borderStyle?: string;
  boxShadow?: string;
  opacity?: string;
  
  // Position
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: string;
}

interface AdvancedEditorPanelProps {
  _element: HTMLElement;
  elementId: string;
  initialStyles: StyleProperties;
  onStyleChange: (styles: StyleProperties) => void;
  onSave: () => void;
  onCancel: () => void;
  onApply: () => void;
}

export function AdvancedEditorPanel({
  _element,
  elementId,
  initialStyles,
  onStyleChange,
  onSave,
  onCancel,
  onApply
}: AdvancedEditorPanelProps) {
  const [styles, setStyles] = useState<StyleProperties>(initialStyles);
  const [activeTab, setActiveTab] = useState<'content' | 'colors' | 'typography' | 'layout' | 'effects'>('content');

  // Common font families for professional websites
  const fontFamilies = [
    { name: 'Inter (Modern Sans)', value: 'Inter, system-ui, sans-serif' },
    { name: 'Roboto (Google)', value: 'Roboto, Arial, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, Arial, sans-serif' },
    { name: 'Poppins (Rounded)', value: 'Poppins, system-ui, sans-serif' },
    { name: 'Montserrat (Elegant)', value: 'Montserrat, sans-serif' },
    { name: 'Lato (Humanist)', value: 'Lato, Arial, sans-serif' },
    { name: 'Source Sans Pro', value: 'Source Sans Pro, Arial, sans-serif' },
    { name: 'Arial (Classic)', value: 'Arial, sans-serif' },
    { name: 'Georgia (Serif)', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Courier New (Mono)', value: 'Courier New, monospace' },
  ];

  // Professional color presets
  const colorPresets = [
    // Neon theme (current)
    '#00FFFF', '#FF00FF', '#0066FF', '#00FF66',
    // Professional neutrals
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    // Professional blues
    '#0066CC', '#004080', '#0080FF', '#0099CC',
    // Professional greens
    '#009966', '#00CC66', '#66CC00', '#009933',
    // Professional reds
    '#CC0000', '#FF3333', '#CC3366', '#990033',
    // Professional purples
    '#6600CC', '#9933CC', '#CC00CC', '#663399',
  ];

  const updateStyle = useCallback((property: keyof StyleProperties, value: string) => {
    const newStyles = { ...styles, [property]: value };
    setStyles(newStyles);
    onStyleChange(newStyles);
  }, [styles, onStyleChange]);

  const renderContentTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-neonCyan mb-2">Text Content</label>
        <textarea
          value={styles.text || ''}
          onChange={(e) => updateStyle('text', e.target.value)}
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-neonCyan"
          rows={3}
          placeholder="Enter your text content..."
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-neonCyan mb-2">Text Alignment</label>
        <div className="grid grid-cols-4 gap-2">
          {['left', 'center', 'right', 'justify'].map((align) => (
            <button
              key={align}
              onClick={() => updateStyle('textAlign', align)}
              className={`p-2 rounded text-xs font-medium border transition-colors ${
                styles.textAlign === align
                  ? 'bg-neonCyan text-black border-neonCyan'
                  : 'bg-gray-700 text-white border-gray-600 hover:border-neonCyan/50'
              }`}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderColorsTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-neonCyan mb-2">Text Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={styles.color || '#ffffff'}
            onChange={(e) => updateStyle('color', e.target.value)}
            className="w-12 h-8 rounded border border-gray-600 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={styles.color || '#ffffff'}
            onChange={(e) => updateStyle('color', e.target.value)}
            className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-neonCyan"
            placeholder="#ffffff"
          />
        </div>
        
        <div className="grid grid-cols-8 gap-1 mt-2">
          {colorPresets.map((color) => (
            <button
              key={color}
              onClick={() => updateStyle('color', color)}
              className="w-6 h-6 rounded border border-gray-600 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neonCyan mb-2">Background Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={styles.backgroundColor || '#transparent'}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            className="w-12 h-8 rounded border border-gray-600 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={styles.backgroundColor || 'transparent'}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-neonCyan"
            placeholder="transparent"
          />
        </div>
        
        <div className="grid grid-cols-8 gap-1 mt-2">
          {colorPresets.map((color) => (
            <button
              key={color}
              onClick={() => updateStyle('backgroundColor', color)}
              className="w-6 h-6 rounded border border-gray-600 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neonCyan mb-2">Opacity</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={styles.opacity || '1'}
            onChange={(e) => updateStyle('opacity', e.target.value)}
            className="flex-1"
          />
          <span className="text-xs text-gray-300 w-8">{((parseFloat(styles.opacity || '1')) * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );

  const renderTypographyTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-neonCyan mb-2">Font Family</label>
        <select
          value={styles.fontFamily || ''}
          onChange={(e) => updateStyle('fontFamily', e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-neonCyan"
        >
          <option value="">Default Font</option>
          {fontFamilies.map((font) => (
            <option key={font.value} value={font.value}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neonCyan mb-2">Font Size</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="8"
              max="72"
              value={parseInt(styles.fontSize || '16')}
              onChange={(e) => updateStyle('fontSize', e.target.value + 'px')}
              className="flex-1"
            />
            <input
              type="text"
              value={styles.fontSize || '16px'}
              onChange={(e) => updateStyle('fontSize', e.target.value)}
              className="w-16 p-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-neonCyan"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neonCyan mb-2">Line Height</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={parseFloat(styles.lineHeight || '1.5')}
              onChange={(e) => updateStyle('lineHeight', e.target.value)}
              className="flex-1"
            />
            <span className="text-xs text-gray-300 w-8">{styles.lineHeight || '1.5'}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neonCyan mb-2">Font Weight</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Light', value: '300' },
            { label: 'Normal', value: '400' },
            { label: 'Medium', value: '500' },
            { label: 'Semi Bold', value: '600' },
            { label: 'Bold', value: '700' },
            { label: 'Extra Bold', value: '800' },
          ].map((weight) => (
            <button
              key={weight.value}
              onClick={() => updateStyle('fontWeight', weight.value)}
              className={`p-2 rounded text-xs font-medium border transition-colors ${
                styles.fontWeight === weight.value
                  ? 'bg-neonCyan text-black border-neonCyan'
                  : 'bg-gray-700 text-white border-gray-600 hover:border-neonCyan/50'
              }`}
            >
              {weight.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neonCyan mb-2">Width</label>
          <input
            type="text"
            value={styles.width || 'auto'}
            onChange={(e) => updateStyle('width', e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-neonCyan"
            placeholder="auto, 100px, 50%"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-neonCyan mb-2">Height</label>
          <input
            type="text"
            value={styles.height || 'auto'}
            onChange={(e) => updateStyle('height', e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-neonCyan"
            placeholder="auto, 100px, 50%"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neonCyan mb-2">Padding</label>
        <div className="grid grid-cols-4 gap-2">
          <input
            type="text"
            value={styles.paddingTop || '0'}
            onChange={(e) => updateStyle('paddingTop', e.target.value)}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-neonCyan text-center"
            placeholder="Top"
          />
          <input
            type="text"
            value={styles.paddingRight || '0'}
            onChange={(e) => updateStyle('paddingRight', e.target.value)}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-neonCyan text-center"
            placeholder="Right"
          />
          <input
            type="text"
            value={styles.paddingBottom || '0'}
            onChange={(e) => updateStyle('paddingBottom', e.target.value)}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-neonCyan text-center"
            placeholder="Bottom"
          />
          <input
            type="text"
            value={styles.paddingLeft || '0'}
            onChange={(e) => updateStyle('paddingLeft', e.target.value)}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-neonCyan text-center"
            placeholder="Left"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neonCyan mb-2">Margin</label>
        <div className="grid grid-cols-4 gap-2">
          <input
            type="text"
            value={styles.marginTop || '0'}
            onChange={(e) => updateStyle('marginTop', e.target.value)}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-neonCyan text-center"
            placeholder="Top"
          />
          <input
            type="text"
            value={styles.marginRight || '0'}
            onChange={(e) => updateStyle('marginRight', e.target.value)}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-neonCyan text-center"
            placeholder="Right"
          />
          <input
            type="text"
            value={styles.marginBottom || '0'}
            onChange={(e) => updateStyle('marginBottom', e.target.value)}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-neonCyan text-center"
            placeholder="Bottom"
          />
          <input
            type="text"
            value={styles.marginLeft || '0'}
            onChange={(e) => updateStyle('marginLeft', e.target.value)}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-neonCyan text-center"
            placeholder="Left"
          />
        </div>
      </div>
    </div>
  );

  const renderEffectsTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-neonCyan mb-2">Border Radius</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="50"
            value={parseInt(styles.borderRadius || '0')}
            onChange={(e) => updateStyle('borderRadius', e.target.value + 'px')}
            className="flex-1"
          />
          <input
            type="text"
            value={styles.borderRadius || '0px'}
            onChange={(e) => updateStyle('borderRadius', e.target.value)}
            className="w-16 p-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-neonCyan"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neonCyan mb-2">Border</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            value={styles.borderWidth || '0px'}
            onChange={(e) => updateStyle('borderWidth', e.target.value)}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-neonCyan"
            placeholder="Width"
          />
          <select
            value={styles.borderStyle || 'solid'}
            onChange={(e) => updateStyle('borderStyle', e.target.value)}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-neonCyan"
          >
            <option value="none">None</option>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
          <input
            type="color"
            value={styles.borderColor || '#666666'}
            onChange={(e) => updateStyle('borderColor', e.target.value)}
            className="w-full h-8 rounded border border-gray-600 bg-transparent cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neonCyan mb-2">Box Shadow</label>
        <select
          value={styles.boxShadow || 'none'}
          onChange={(e) => updateStyle('boxShadow', e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-neonCyan"
        >
          <option value="none">No Shadow</option>
          <option value="0 1px 3px rgba(0,0,0,0.12)">Small Shadow</option>
          <option value="0 4px 6px rgba(0,0,0,0.1)">Medium Shadow</option>
          <option value="0 10px 15px rgba(0,0,0,0.1)">Large Shadow</option>
          <option value="0 0 20px rgba(0,255,255,0.3)">Neon Glow</option>
          <option value="0 0 30px rgba(255,0,255,0.3)">Pink Glow</option>
        </select>
      </div>
    </div>
  );

  return (
    <div 
      id="advanced-visual-editor-panel"
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-h-[80vh] bg-gray-900 border border-neonCyan rounded-xl shadow-2xl shadow-neonCyan/20 z-50 overflow-hidden"
      style={{ 
        backdropFilter: 'blur(10px)',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95))'
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-neonCyan/20 to-neonPink/20 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-neonCyan">Visual Editor Pro</h3>
            <p className="text-xs text-gray-400">Editing: {elementId}</p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-red-600 transition-colors flex items-center justify-center text-white"
          >
            ×
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 bg-gray-800">
        {[
          { id: 'content' as const, label: '📝', title: 'Content' },
          { id: 'colors' as const, label: '🎨', title: 'Colors' },
          { id: 'typography' as const, label: '🔤', title: 'Typography' },
          { id: 'layout' as const, label: '📐', title: 'Layout' },
          { id: 'effects' as const, label: '✨', title: 'Effects' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 p-3 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-neonCyan text-black'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            title={tab.title}
          >
            <div className="text-center">
              <div className="text-sm">{tab.label}</div>
              <div className="text-xs">{tab.title}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'colors' && renderColorsTab()}
        {activeTab === 'typography' && renderTypographyTab()}
        {activeTab === 'layout' && renderLayoutTab()}
        {activeTab === 'effects' && renderEffectsTab()}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex gap-2">
          <button
            onClick={onApply}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Apply Preview
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-neonCyan to-neonPink text-black rounded-lg font-bold transition-all hover:scale-105"
          >
            Save Changes
          </button>
        </div>
        <button
          onClick={onCancel}
          className="w-full mt-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
