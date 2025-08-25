'use client';

import { useState, useEffect } from 'react';

interface ElementInfo {
  element: HTMLElement;
  id: string;
  type: string;
  content: string;
  styles: CSSStyleDeclaration;
  selector: string;
  isEditable: boolean;
}

interface DesignToolsProps {
  selectedElement: ElementInfo | null;
  onElementUpdate: (element: HTMLElement, property: string, value: string) => void;
}

export function DesignTools({ selectedElement, onElementUpdate }: DesignToolsProps) {
  const [activeTab, setActiveTab] = useState('content');
  const [elementStyles, setElementStyles] = useState<Record<string, string>>({});

  // Update local styles when element changes
  useEffect(() => {
    if (selectedElement) {
      const computedStyles = window.getComputedStyle(selectedElement.element);
      setElementStyles({
        fontSize: computedStyles.fontSize,
        fontWeight: computedStyles.fontWeight,
        fontFamily: computedStyles.fontFamily,
        color: rgbToHex(computedStyles.color),
        backgroundColor: rgbToHex(computedStyles.backgroundColor),
        padding: computedStyles.padding,
        margin: computedStyles.margin,
        borderRadius: computedStyles.borderRadius,
        textAlign: computedStyles.textAlign,
        lineHeight: computedStyles.lineHeight,
      });
    }
  }, [selectedElement]);

  // Convert RGB to Hex
  const rgbToHex = (rgb: string): string => {
    if (rgb.startsWith('#')) return rgb;
    if (rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return '#000000';
    
    const match = rgb.match(/\d+/g);
    if (!match) return '#000000';
    
    const [r, g, b] = match.map(num => parseInt(num));
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  // Apply style change
  const applyStyle = (property: string, value: string) => {
    if (!selectedElement) return;
    
    selectedElement.element.style.setProperty(property, value);
    setElementStyles(prev => ({ ...prev, [property]: value }));
    onElementUpdate(selectedElement.element, property, value);
    
    console.log(`Applied ${property}: ${value} to element`);
  };

  // Get current style value with fallback
  const getCurrentValue = (property: string, fallback: string = ''): string => {
    return elementStyles[property] || fallback;
  };

  const tabs = [
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'typography', label: 'Typography', icon: '🔤' },
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'spacing', label: 'Spacing', icon: '📦' },
    { id: 'effects', label: 'Effects', icon: '✨' },
  ];

  if (!selectedElement) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
          </svg>
          <p className="text-sm">Select an element to access design tools</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-gray-700 px-2">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-neonCyan text-neonCyan'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Text Content</label>
              <textarea
                value={selectedElement.content}
                onChange={(e) => {
                  selectedElement.element.textContent = e.target.value;
                  selectedElement.content = e.target.value;
                }}
                className="w-full h-24 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm resize-none focus:border-neonCyan focus:outline-none"
                placeholder="Enter text content..."
              />
            </div>
            
            {selectedElement.type === 'link' && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Link URL</label>
                <input
                  type="url"
                  value={(selectedElement.element as HTMLAnchorElement).href || ''}
                  onChange={(e) => {
                    (selectedElement.element as HTMLAnchorElement).href = e.target.value;
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-neonCyan focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Font Family</label>
              <select
                value={getCurrentValue('fontFamily').split(',')[0].replace(/['"]/g, '')}
                onChange={(e) => applyStyle('font-family', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-neonCyan focus:outline-none"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Georgia">Georgia</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Font Size</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="8"
                    max="72"
                    value={parseInt(getCurrentValue('fontSize', '16px'))}
                    onChange={(e) => applyStyle('font-size', `${e.target.value}px`)}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-400 w-8 text-right">
                    {getCurrentValue('fontSize', '16px')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Font Weight</label>
                <select
                  value={getCurrentValue('fontWeight', '400')}
                  onChange={(e) => applyStyle('font-weight', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-xs focus:border-neonCyan focus:outline-none"
                >
                  <option value="300">Light</option>
                  <option value="400">Normal</option>
                  <option value="500">Medium</option>
                  <option value="600">Semi Bold</option>
                  <option value="700">Bold</option>
                  <option value="800">Extra Bold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Text Alignment</label>
              <div className="grid grid-cols-4 gap-1">
                {['left', 'center', 'right', 'justify'].map((align) => (
                  <button
                    key={align}
                    onClick={() => applyStyle('text-align', align)}
                    className={`p-2 rounded border text-xs transition-colors ${
                      getCurrentValue('textAlign') === align
                        ? 'bg-neonCyan/20 border-neonCyan text-neonCyan'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {align.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Line Height</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={parseFloat(getCurrentValue('lineHeight', '1.5'))}
                  onChange={(e) => applyStyle('line-height', e.target.value)}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8 text-right">
                  {parseFloat(getCurrentValue('lineHeight', '1.5')).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={getCurrentValue('color', '#ffffff')}
                  onChange={(e) => applyStyle('color', e.target.value)}
                  className="w-12 h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={getCurrentValue('color', '#ffffff')}
                  onChange={(e) => applyStyle('color', e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs font-mono focus:border-neonCyan focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={getCurrentValue('backgroundColor', '#000000')}
                  onChange={(e) => applyStyle('background-color', e.target.value)}
                  className="w-12 h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={getCurrentValue('backgroundColor', '#000000')}
                  onChange={(e) => applyStyle('background-color', e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs font-mono focus:border-neonCyan focus:outline-none"
                />
              </div>
              <button
                onClick={() => applyStyle('background-color', 'transparent')}
                className="mt-2 text-xs text-gray-400 hover:text-gray-300"
              >
                Make transparent
              </button>
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Brand Colors</label>
              <div className="grid grid-cols-6 gap-2">
                {[
                  '#00ffff', '#ff0080', '#0066ff', '#ff6600', '#00ff00', '#ffff00',
                  '#ffffff', '#cccccc', '#666666', '#000000', '#ff0000', '#800080'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => applyStyle('color', color)}
                    className="w-8 h-8 rounded border border-gray-600 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spacing' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Padding</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-400">All sides</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={parseInt(getCurrentValue('padding', '0px')) || 0}
                      onChange={(e) => applyStyle('padding', `${e.target.value}px`)}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-400 w-8 text-right">
                      {parseInt(getCurrentValue('padding', '0px')) || 0}px
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Margin</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-400">All sides</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={parseInt(getCurrentValue('margin', '0px')) || 0}
                      onChange={(e) => applyStyle('margin', `${e.target.value}px`)}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-400 w-8 text-right">
                      {parseInt(getCurrentValue('margin', '0px')) || 0}px
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Border Radius</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={parseInt(getCurrentValue('borderRadius', '0px')) || 0}
                  onChange={(e) => applyStyle('border-radius', `${e.target.value}px`)}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8 text-right">
                  {parseInt(getCurrentValue('borderRadius', '0px')) || 0}px
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Opacity</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedElement.element.style.opacity || '1'}
                  onChange={(e) => applyStyle('opacity', e.target.value)}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8 text-right">
                  {Math.round((parseFloat(selectedElement.element.style.opacity || '1')) * 100)}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Box Shadow</label>
              <div className="space-y-2">
                <button
                  onClick={() => applyStyle('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)')}
                  className="w-full text-left p-2 bg-gray-700 border border-gray-600 rounded text-xs text-gray-300 hover:bg-gray-600"
                >
                  Small shadow
                </button>
                <button
                  onClick={() => applyStyle('box-shadow', '0 10px 15px rgba(0, 0, 0, 0.2)')}
                  className="w-full text-left p-2 bg-gray-700 border border-gray-600 rounded text-xs text-gray-300 hover:bg-gray-600"
                >
                  Medium shadow
                </button>
                <button
                  onClick={() => applyStyle('box-shadow', '0 20px 25px rgba(0, 0, 0, 0.3)')}
                  className="w-full text-left p-2 bg-gray-700 border border-gray-600 rounded text-xs text-gray-300 hover:bg-gray-600"
                >
                  Large shadow
                </button>
                <button
                  onClick={() => applyStyle('box-shadow', 'none')}
                  className="w-full text-left p-2 bg-gray-700 border border-gray-600 rounded text-xs text-gray-300 hover:bg-gray-600"
                >
                  No shadow
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
