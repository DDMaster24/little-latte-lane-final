'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  X, 
  Type, 
  Palette, 
  Image as ImageIcon, 
  Menu,
  Coffee,
  Utensils,
  Eye,
  EyeOff,
  AlertCircle,
  Paintbrush,
  Tag,
  FileText,
  Settings,
  RefreshCw
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { usePageEditor } from '@/hooks/usePageEditor';
import SimpleImageEditor from './SimpleImageEditor';

// Theme colors from tailwind.config.js
const THEME_COLORS = [
  '#00FFFF', // neonCyan
  '#FF00FF', // neonPink  
  '#1A1A1A', // darkBg
  '#7DD3FC', // neonCyan-200
  '#F8BBD9', // neonPink-200
  '#0D9488', // teal-600
  '#7C3AED', // violet-600
  '#DC2626', // red-600
  '#EA580C', // orange-600
  '#CA8A04', // yellow-600
  '#16A34A', // green-600
  '#2563EB'  // blue-600
];

const GRADIENT_PRESETS = [
  { name: 'Neon Cyan', value: 'linear-gradient(45deg, #00FFFF, #7DD3FC)' },
  { name: 'Neon Pink', value: 'linear-gradient(45deg, #FF00FF, #F8BBD9)' },
  { name: 'Cyber Blue', value: 'linear-gradient(135deg, #0D9488, #2563EB)' },
  { name: 'Retro Purple', value: 'linear-gradient(45deg, #7C3AED, #FF00FF)' },
  { name: 'Sunset Orange', value: 'linear-gradient(135deg, #EA580C, #CA8A04)' },
  { name: 'Matrix Green', value: 'linear-gradient(45deg, #16A34A, #00FFFF)' }
];

interface MenuPageEditorProps {
  children: React.ReactNode;
}

// Menu-specific element types
type MenuElementType = 
  | 'menu-title' 
  | 'menu-subtitle' 
  | 'section-title' 
  | 'category-name' 
  | 'category-description' 
  | 'category-icon'
  | 'browse-button'
  | 'menu-icons'
  | 'section-header'
  | 'unknown';

interface ElementConfig {
  type: MenuElementType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: 'titles' | 'content' | 'navigation' | 'visual';
}

// Get menu element configuration based on data-editable attribute
function getMenuElementConfig(editableId: string): ElementConfig {
  // Menu page titles and headers
  if (editableId.includes('menu-page-title') || editableId.includes('menu-title-text')) {
    return {
      type: 'menu-title',
      label: 'Menu Page Title',
      icon: Menu,
      description: 'Main menu page heading',
      category: 'titles'
    };
  }
  
  if (editableId.includes('menu-page-subtitle')) {
    return {
      type: 'menu-subtitle',
      label: 'Menu Subtitle',
      icon: FileText,
      description: 'Menu page description text',
      category: 'titles'
    };
  }

  // Section headers and content
  if (editableId.includes('section') && editableId.includes('title')) {
    return {
      type: 'section-title',
      label: 'Section Title',
      icon: Tag,
      description: 'Menu section heading (Drinks, Food, etc.)',
      category: 'titles'
    };
  }

  // Category elements
  if (editableId.includes('category-name')) {
    return {
      type: 'category-name',
      label: 'Category Name',
      icon: Coffee,
      description: 'Individual category title',
      category: 'content'
    };
  }

  if (editableId.includes('category-description')) {
    return {
      type: 'category-description',
      label: 'Category Description',
      icon: FileText,
      description: 'Category description text',
      category: 'content'
    };
  }

  if (editableId.includes('category-icon') || editableId.includes('menu-title-icon')) {
    return {
      type: 'category-icon',
      label: 'Category Icon',
      icon: ImageIcon,
      description: 'Category or menu icon/emoji',
      category: 'visual'
    };
  }

  // Browse button and navigation
  if (editableId.includes('browse-menu')) {
    return {
      type: 'browse-button',
      label: 'Browse Menu Button',
      icon: Utensils,
      description: 'Browse all menu items button',
      category: 'navigation'
    };
  }

  // Menu icons and visual elements
  if (editableId.includes('icon')) {
    return {
      type: 'menu-icons',
      label: 'Menu Icons',
      icon: ImageIcon,
      description: 'Menu page icons and emojis',
      category: 'visual'
    };
  }

  return {
    type: 'unknown',
    label: 'Menu Element',
    icon: Settings,
    description: 'Editable menu page element',
    category: 'content'
  };
}

export default function MenuPageEditor({ children }: MenuPageEditorProps) {
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [editingText, setEditingText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [editableId, setEditableId] = useState('');
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [_selectedTool, _setSelectedTool] = useState<'text' | 'color' | 'image'>('text');
  const [isSaving, setIsSaving] = useState(false);
  
  // Enhanced color picker state
  const [selectedColor, setSelectedColor] = useState('#00FFFF');
  const [gradientColor1, setGradientColor1] = useState('#00FFFF');
  const [gradientColor2, setGradientColor2] = useState('#FF00FF');
  const [gradientDirection, setGradientDirection] = useState<'to right' | 'to left' | 'to bottom' | 'to top' | '45deg' | '135deg'>('to right');
  const [colorMode, setColorMode] = useState<'text' | 'background'>('text');
  const [_textValue, _setTextValue] = useState('');
  
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'color' | 'image'>('text');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const _colorPickerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { savePageSetting, isLoading } = usePageEditor('menu');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Save text changes using the page editor hook
  const saveTextChange = async (elementId: string, content: string) => {
    try {
      setSaveError(null);
      await savePageSetting({
        setting_key: elementId,
        setting_value: content,
        category: 'page_editor'
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save text';
      setSaveError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Save style changes using the page editor hook
  const saveStyleChange = async (elementId: string, property: string, value: string) => {
    try {
      setSaveError(null);
      await savePageSetting({
        setting_key: `${elementId}_${property}`,
        setting_value: value,
        category: 'page_editor'
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save style';
      setSaveError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Smart navigation blocking - allow essential browser shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow essential browser shortcuts
      const allowedKeys = [
        'F12',           // DevTools
        'F5',            // Refresh
        'Escape',        // Cancel/escape
      ];
      
      const allowedCombos = [
        { ctrl: true, key: 'r' },      // Ctrl+R (Reload)
        { ctrl: true, shift: true, key: 'R' }, // Ctrl+Shift+R (Hard reload)
        { ctrl: true, shift: true, key: 'I' }, // Ctrl+Shift+I (DevTools)
        { ctrl: true, shift: true, key: 'J' }, // Ctrl+Shift+J (Console)
        { ctrl: true, key: 'u' },      // Ctrl+U (View source)
        { ctrl: true, key: 's' },      // Ctrl+S (Save)
        { alt: true, key: 'Tab' },     // Alt+Tab (Switch apps)
      ];
      
      const isAllowedKey = allowedKeys.includes(e.key);
      const isAllowedCombo = allowedCombos.some(combo => 
        (combo.ctrl ? e.ctrlKey : true) &&
        (combo.shift ? e.shiftKey : true) &&
        (combo.alt ? e.altKey : true) &&
        e.key.toLowerCase() === combo.key.toLowerCase()
      );
      
      // Block navigation if not allowed
      if (!isAllowedKey && !isAllowedCombo) {
        // Block common navigation keys
        if (['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11'].includes(e.key) ||
            (e.altKey && ['ArrowLeft', 'ArrowRight'].includes(e.key)) ||
            (e.ctrlKey && ['w', 't', 'n'].includes(e.key.toLowerCase()))) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Enhanced element detection for menu page
  const attachEventListeners = useCallback(() => {
    const elements = document.querySelectorAll('[data-editable]');
    
    setDebugInfo(`Found ${elements.length} editable elements`);
    
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const editableId = htmlElement.getAttribute('data-editable') || '';
      
      console.log(`[MenuPageEditor] Element ${index + 1}:`, {
        editableId,
        tagName: htmlElement.tagName,
        textContent: htmlElement.textContent?.slice(0, 50),
        classList: Array.from(htmlElement.classList)
      });

      // Enhanced hover effect for menu elements
      const handleMouseEnter = () => {
        if (isPreviewMode) return;
        
        htmlElement.style.outline = '2px solid #ff6b35';
        htmlElement.style.outlineOffset = '2px';
        htmlElement.style.backgroundColor = 'rgba(255, 107, 53, 0.1)';
        htmlElement.style.cursor = 'pointer';
        htmlElement.style.transition = 'all 0.2s ease';
      };

      const handleMouseLeave = () => {
        if (selectedElement !== htmlElement) {
          htmlElement.style.outline = '';
          htmlElement.style.outlineOffset = '';
          htmlElement.style.backgroundColor = '';
          htmlElement.style.cursor = '';
        }
      };

      const handleClick = (e: Event) => {
        if (isPreviewMode) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        console.log(`[MenuPageEditor] Clicked element:`, {
          editableId,
          element: htmlElement,
          textContent: htmlElement.textContent
        });

        // Clear previous selection
        if (selectedElement && selectedElement !== htmlElement) {
          selectedElement.style.outline = '';
          selectedElement.style.backgroundColor = '';
        }

        // Select new element
        setSelectedElement(htmlElement);
        setEditableId(editableId);
        setEditingText(htmlElement.textContent || '');
        setOriginalText(htmlElement.textContent || '');
        _setTextValue(htmlElement.textContent || ''); // Sync textValue state
        setIsToolbarVisible(true);
        setActiveTab('text');

        // Visual feedback for selected element
        htmlElement.style.outline = '3px solid #ff0080';
        htmlElement.style.backgroundColor = 'rgba(255, 0, 128, 0.15)';
        htmlElement.style.transition = 'all 0.3s ease';

        // Get current color for enhanced color picker
        const computedStyle = window.getComputedStyle(htmlElement);
        setSelectedColor(computedStyle.color || '#00FFFF');
      };

      htmlElement.addEventListener('mouseenter', handleMouseEnter);
      htmlElement.addEventListener('mouseleave', handleMouseLeave);
      htmlElement.addEventListener('click', handleClick);
    });
  }, [isPreviewMode, selectedElement]);

  // Initialize event listeners
  useEffect(() => {
    // Delay to ensure DOM is ready
    const timer = setTimeout(attachEventListeners, 1000);
    return () => clearTimeout(timer);
  }, [attachEventListeners]);

  // Handle saving text changes
  const handleSaveText = async () => {
    if (!selectedElement || !editableId || editingText === originalText) return;

    try {
      // Update DOM immediately for instant feedback
      selectedElement.textContent = editingText;
      
      // Save to database
      const result = await saveTextChange(editableId, editingText);
      
      if (result.success) {
        setOriginalText(editingText);
        setPendingChanges(prev => ({ ...prev, [editableId]: editingText }));
        setHasUnsavedChanges(true);
        
        // Auto-save timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        
        console.log(`[MenuPageEditor] Saved text change for ${editableId}`);
      } else {
        console.error('[MenuPageEditor] Failed to save text change:', result.error);
        // Revert DOM change on failure
        selectedElement.textContent = originalText;
      }
    } catch (error) {
      console.error('[MenuPageEditor] Error saving text:', error);
      selectedElement.textContent = originalText;
    }
  };

  // Enhanced color application function  
  const handleColorApply = async () => {
    if (!selectedElement || !editableId) return;

    setIsSaving(true);
    
    try {
      const property = colorMode === 'text' ? 'color' : 'backgroundColor';
      let newValue: string;
      
      // Check if we're applying a gradient (only for background)
      if (colorMode === 'background' && (gradientColor1 !== gradientColor2)) {
        newValue = `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2})`;
        selectedElement.style.background = newValue;
      } else {
        newValue = selectedColor;
        selectedElement.style[property] = newValue;
      }

      // Save to database
      const result = await saveStyleChange(editableId, property, newValue);
      
      if (result.success) {
        setPendingChanges(prev => ({ ...prev, [`${editableId}_${property}`]: newValue }));
        setHasUnsavedChanges(true);
        console.log(`[MenuPageEditor] Applied ${colorMode} color: ${newValue}`);
      } else {
        console.error('[MenuPageEditor] Failed to save color change:', result.error);
      }
    } catch (error) {
      console.error('[MenuPageEditor] Error applying color:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Clear gradient
  const handleClearGradient = () => {
    if (!selectedElement) return;
    
    selectedElement.style.background = '';
    selectedElement.style.backgroundImage = '';
    console.log('[MenuPageEditor] Gradient cleared');
  };

  // Apply gradient preset
  const handleGradientPreset = (gradient: string) => {
    if (!selectedElement) return;
    
    selectedElement.style.background = gradient;
    
    // Parse gradient to update color picker values
    const colorMatch = gradient.match(/#[a-fA-F0-9]{6}/g);
    if (colorMatch && colorMatch.length >= 2) {
      setGradientColor1(colorMatch[0]);
      setGradientColor2(colorMatch[1]);
    }
    
    console.log(`[MenuPageEditor] Applied gradient preset: ${gradient}`);
  };

  // Handle image changes
  const handleImageChange = async (imageUrl: string) => {
    if (!selectedElement || !editableId) return;

    try {
      // Check if element contains an image or emoji
      const isEmojiElement = selectedElement.textContent && /[\u{1F300}-\u{1F9FF}]/u.test(selectedElement.textContent);
      
      if (isEmojiElement) {
        // For emoji elements, treat the imageUrl as new emoji/text content
        selectedElement.textContent = imageUrl;
        
        const result = await saveTextChange(editableId, imageUrl);
        if (result.success) {
          console.log(`[MenuPageEditor] Updated emoji/icon for ${editableId}: ${imageUrl}`);
        }
      } else {
        // For actual images, update src or background
        const imgElement = selectedElement.querySelector('img');
        if (imgElement) {
          imgElement.src = imageUrl;
        } else {
          selectedElement.style.backgroundImage = `url(${imageUrl})`;
        }
        
        const result = await saveStyleChange(editableId, 'backgroundImage', `url(${imageUrl})`);
        if (result.success) {
          console.log(`[MenuPageEditor] Updated image for ${editableId}: ${imageUrl}`);
        }
      }
      
      setShowImageEditor(false);
      setPendingChanges(prev => ({ ...prev, [`${editableId}_image`]: imageUrl }));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('[MenuPageEditor] Error updating image:', error);
    }
  };

  // Reset selection
  const handleCancel = () => {
    if (selectedElement) {
      selectedElement.style.outline = '';
      selectedElement.style.backgroundColor = '';
      selectedElement.textContent = originalText;
    }
    setSelectedElement(null);
    setIsToolbarVisible(false);
    setEditingText('');
    setOriginalText('');
    setEditableId('');
    setShowImageEditor(false);
  };

  // Get element configuration
  const elementConfig = editableId ? getMenuElementConfig(editableId) : null;
  const ElementIcon = elementConfig?.icon || Menu;

  // Category color coding
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'titles': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'content': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'navigation': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'visual': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="relative min-h-screen bg-darkBg">
      {/* Enhanced Floating Toolbar */}
      {isToolbarVisible && selectedElement && elementConfig && (
        <div className="fixed top-20 left-4 z-50 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl p-4 w-80 animate-in slide-in-from-left-2 duration-300">
          {/* Toolbar Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neonCyan/10 rounded-lg">
                <ElementIcon className="h-5 w-5 text-neonCyan" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{elementConfig.label}</h3>
                <Badge className={`text-xs ${getCategoryColor(elementConfig.category)}`}>
                  {elementConfig.category}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tool Tabs */}
          <div className="flex bg-gray-800/50 rounded-lg p-1 mb-4">
            {[
              { id: 'text', label: 'Text', icon: Type },
              { id: 'color', label: 'Color', icon: Palette },
              { id: 'image', label: 'Image', icon: ImageIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'text' | 'color' | 'image')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tool Content */}
          <div className="space-y-4">
            {/* Text Editing */}
            {activeTab === 'text' && (
              <div className="space-y-3">
                <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                  Edit Content
                </label>
                {elementConfig.type === 'category-description' || editingText.length > 50 ? (
                  <Textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white text-sm resize-none"
                    rows={3}
                    placeholder="Enter description..."
                  />
                ) : (
                  <Input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white text-sm"
                    placeholder="Enter text..."
                  />
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveText}
                    disabled={editingText === originalText || isLoading}
                    className="flex-1 bg-neonCyan hover:bg-neonCyan/80 text-darkBg text-xs font-medium h-8"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={() => setEditingText(originalText)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700/50 text-xs h-8"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {/* Enhanced Color Editor with Gradient Support */}
            {activeTab === 'color' && (
              <div className="space-y-3">
                {/* Color Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-300">Mode:</span>
                  <Button
                    onClick={() => setColorMode('text')}
                    variant={colorMode === 'text' ? 'default' : 'outline'}
                    size="sm"
                    className={
                      colorMode === 'text'
                        ? 'border-2 border-neonCyan shadow-[0_0_8px_2px_#00FFFF55] text-white text-xs px-3 py-1'
                        : 'border border-gray-500 text-gray-300 text-xs px-3 py-1'
                    }
                  >
                    Text
                  </Button>
                  <Button
                    onClick={() => setColorMode('background')}
                    variant={colorMode === 'background' ? 'default' : 'outline'}
                    size="sm"
                    className={
                      colorMode === 'background'
                        ? 'border-2 border-neonPink shadow-[0_0_8px_2px_#FF00FF55] text-white text-xs px-3 py-1'
                        : 'border border-gray-500 text-gray-300 text-xs px-3 py-1'
                    }
                  >
                    Background
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Color Picker Section */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-gray-300">Color Picker</h3>
                    <HexColorPicker
                      color={selectedColor}
                      onChange={setSelectedColor}
                      style={{ width: '100%', height: '100px' }}
                    />
                    <div className="flex items-center space-x-1">
                      <Input
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 bg-gray-700 border-gray-600 text-white font-mono text-xs h-6"
                      />
                      <div 
                        className="w-6 h-6 rounded border border-gray-600"
                        style={{ backgroundColor: selectedColor }}
                      ></div>
                    </div>
                  </div>

                  {/* Theme Colors Section */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-gray-300">Theme Colors</h3>
                    <div className="grid grid-cols-3 gap-1">
                      {THEME_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className="w-6 h-6 rounded border border-gray-600 hover:border-white transition-colors"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gradient Editor */}
                <div className="space-y-2 pt-2 border-t border-gray-700">
                  <h3 className="text-xs font-medium text-gray-300">Gradient Editor</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Gradient Start Color */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Start</label>
                      <HexColorPicker
                        color={gradientColor1}
                        onChange={setGradientColor1}
                        style={{ width: '100%', height: '80px' }}
                      />
                      <Input
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        className="mt-1 bg-gray-700 border-gray-600 text-white font-mono text-xs h-6"
                      />
                    </div>

                    {/* Gradient End Color */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">End</label>
                      <HexColorPicker
                        color={gradientColor2}
                        onChange={setGradientColor2}
                        style={{ width: '100%', height: '80px' }}
                      />
                      <Input
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        className="mt-1 bg-gray-700 border-gray-600 text-white font-mono text-xs h-6"
                      />
                    </div>
                  </div>

                  {/* Direction & Presets */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Direction</label>
                      <select
                        value={gradientDirection}
                        onChange={(e) => setGradientDirection(e.target.value as typeof gradientDirection)}
                        className="w-full bg-gray-700 border-gray-600 text-white text-xs rounded px-2 py-1 h-6"
                      >
                        <option value="to right">→</option>
                        <option value="to left">←</option>
                        <option value="to bottom">↓</option>
                        <option value="to top">↑</option>
                        <option value="45deg">↗</option>
                        <option value="135deg">↘</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Presets</label>
                      <div className="grid grid-cols-2 gap-1">
                        {GRADIENT_PRESETS.slice(0, 4).map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => handleGradientPreset(preset.value)}
                            className="h-4 rounded border border-gray-600 hover:border-white transition-colors text-xs"
                            style={{ background: preset.value }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-2 pt-2">
                    <Button
                      onClick={handleColorApply}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                      size="sm"
                    >
                      {isSaving ? (
                        <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <Paintbrush className="w-3 h-3 mr-1" />
                      )}
                      Apply
                    </Button>
                    <Button
                      onClick={handleClearGradient}
                      variant="destructive"
                      size="sm"
                      className="px-2 py-1 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Image Editor */}
            {activeTab === 'image' && (
              <div className="space-y-3">
                <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                  {elementConfig.type === 'category-icon' ? 'Icon/Emoji' : 'Image'}
                </label>
                <Button
                  onClick={() => setShowImageEditor(true)}
                  className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-xs h-8"
                >
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {elementConfig.type === 'category-icon' ? 'Change Icon' : 'Change Image'}
                </Button>
              </div>
            )}
          </div>

          {/* Element Info */}
          <div className="mt-4 pt-3 border-t border-gray-700/50">
            <p className="text-xs text-gray-400 leading-relaxed">
              {elementConfig.description}
            </p>
            {editableId && (
              <p className="text-xs text-gray-500 mt-1 font-mono">
                ID: {editableId}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Image Editor Modal */}
      {showImageEditor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  <ImageIcon className="h-6 w-6 text-neonCyan" />
                  {elementConfig?.type === 'category-icon' ? 'Update Icon/Emoji' : 'Update Image'}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowImageEditor(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <SimpleImageEditor
              onImageChange={handleImageChange}
              onClose={() => setShowImageEditor(false)}
              currentImageUrl=""
              elementType={elementConfig?.type === 'category-icon' ? 'icon' : 'image'}
            />
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="fixed top-4 right-4 z-40 flex flex-col gap-2">
        {/* Preview Toggle */}
        <Button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`${
            isPreviewMode 
              ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30' 
              : 'bg-neonCyan/20 hover:bg-neonCyan/30 text-neonCyan border-neonCyan/30'
          } border backdrop-blur-sm`}
          size="sm"
        >
          {isPreviewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {isPreviewMode ? 'Exit Preview' : 'Preview Mode'}
        </Button>

        {/* Status Indicator */}
        {hasUnsavedChanges && (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 justify-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unsaved Changes
          </Badge>
        )}

        {saveError && (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 justify-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )}
      </div>

      {/* Debug Panel (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-40 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-xs text-green-400 font-mono max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <Menu className="h-4 w-4" />
            <span className="font-semibold">Menu Page Editor Debug</span>
          </div>
          <div className="space-y-1 text-gray-300">
            <div>📍 {debugInfo}</div>
            <div>🎯 Selected: {editableId || 'None'}</div>
            <div>✏️ Editing: {editingText ? `"${editingText.slice(0, 30)}..."` : 'None'}</div>
            <div>🎨 Preview: {isPreviewMode ? 'ON' : 'OFF'}</div>
            <div>💾 Changes: {Object.keys(pendingChanges).length}</div>
          </div>
        </div>
      )}

      {/* Editor Instructions */}
      {!selectedElement && !isPreviewMode && (
        <div className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-neonCyan/10 to-neonPink/10 backdrop-blur-sm border border-gray-600/50 rounded-xl p-4 max-w-sm">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Menu className="h-4 w-4 text-neonCyan" />
            Menu Page Editor
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Click on any menu title, category name, description, or icon to edit. Use the floating toolbar to modify text, colors, and images.
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isToolbarVisible ? 'pl-80' : ''}`}>
        {children}
      </div>
    </div>
  );
}
