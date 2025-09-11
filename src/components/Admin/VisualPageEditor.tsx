'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Type, Image, Palette, Move, Save, Eye, 
  Settings, Upload, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline
} from 'lucide-react';

interface EditableElement {
  id: string;
  type: 'text' | 'image' | 'background' | 'section';
  element: HTMLElement;
  content: string;
  styles: Record<string, string>;
}

interface ToolbarState {
  visible: boolean;
  position: { x: number; y: number };
  element: EditableElement | null;
}

export default function VisualPageEditor({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
  const [toolbar, setToolbar] = useState<ToolbarState>({
    visible: false,
    position: { x: 0, y: 0 },
    element: null
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Element selection system
  const handleElementClick = useCallback((event: MouseEvent) => {
    if (!isEditMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.target as HTMLElement;
    const editableElement = findEditableElement(target);
    
    if (editableElement) {
      const element = analyzeElement(editableElement);
      setSelectedElement(element);
      showToolbar(element, event);
    }
  }, [isEditMode]);

  // Find closest editable element
  const findEditableElement = (target: HTMLElement): HTMLElement | null => {
    // Look for data-editable attribute or common editable elements
    const element = target.closest('[data-editable], h1, h2, h3, h4, h5, h6, p, span, div[class*="text"], img, section, header, footer');
    return element as HTMLElement;
  };

  // Analyze element type and properties
  const analyzeElement = (element: HTMLElement): EditableElement => {
    const tagName = element.tagName.toLowerCase();
    const computedStyle = window.getComputedStyle(element);
    
    let type: EditableElement['type'] = 'text';
    if (tagName === 'img') type = 'image';
    else if (['section', 'header', 'footer', 'div'].includes(tagName) && 
             (element.classList.contains('bg-') || computedStyle.backgroundImage !== 'none')) {
      type = 'background';
    } else if (['section', 'header', 'footer'].includes(tagName)) {
      type = 'section';
    }

    return {
      id: element.id || `element-${Date.now()}`,
      type,
      element,
      content: type === 'image' ? (element as HTMLImageElement).src : element.textContent || '',
      styles: {
        fontSize: computedStyle.fontSize,
        fontFamily: computedStyle.fontFamily,
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
        textAlign: computedStyle.textAlign,
      }
    };
  };

  // Show context-aware toolbar
  const showToolbar = (element: EditableElement, event: MouseEvent) => {
    const rect = element.element.getBoundingClientRect();
    setToolbar({
      visible: true,
      position: {
        x: Math.min(event.clientX, window.innerWidth - 300),
        y: Math.max(rect.top - 60, 10)
      },
      element
    });
  };

  // Context-aware tools based on element type
  const getToolsForElement = (element: EditableElement) => {
    const baseTools = [
      { id: 'save', icon: Save, label: 'Save Changes' }
    ];

    switch (element.type) {
      case 'text':
        return [
          { id: 'bold', icon: Bold, label: 'Bold' },
          { id: 'italic', icon: Italic, label: 'Italic' },
          { id: 'underline', icon: Underline, label: 'Underline' },
          { id: 'color', icon: Palette, label: 'Text Color' },
          { id: 'align-left', icon: AlignLeft, label: 'Align Left' },
          { id: 'align-center', icon: AlignCenter, label: 'Align Center' },
          { id: 'align-right', icon: AlignRight, label: 'Align Right' },
          { id: 'font-size', icon: Type, label: 'Font Size' },
          ...baseTools
        ];
      
      case 'image':
        return [
          { id: 'upload', icon: Upload, label: 'Change Image' },
          { id: 'resize', icon: Move, label: 'Resize' },
          { id: 'alt', icon: Type, label: 'Alt Text' },
          ...baseTools
        ];
      
      case 'background':
        return [
          { id: 'bg-color', icon: Palette, label: 'Background Color' },
          { id: 'bg-image', icon: Image, label: 'Background Image' },
          { id: 'gradient', icon: Palette, label: 'Gradient' },
          ...baseTools
        ];
      
      case 'section':
        return [
          { id: 'layout', icon: Settings, label: 'Layout' },
          { id: 'spacing', icon: Move, label: 'Spacing' },
          { id: 'bg-section', icon: Palette, label: 'Background' },
          ...baseTools
        ];
      
      default:
        return baseTools;
    }
  };

  // Tool action handlers
  const handleToolAction = async (toolId: string, element: EditableElement) => {
    switch (toolId) {
      case 'bold':
        toggleStyle(element.element, 'fontWeight', 'bold', 'normal');
        break;
      case 'italic':
        toggleStyle(element.element, 'fontStyle', 'italic', 'normal');
        break;
      case 'color':
        await openColorPicker(element);
        break;
      case 'save':
        await saveElementChanges(element);
        break;
      // Add more tool handlers...
    }
    setHasChanges(true);
  };

  // Style manipulation utilities
  const toggleStyle = (element: HTMLElement, property: string, value1: string, value2: string) => {
    const currentValue = element.style[property as any] || window.getComputedStyle(element)[property as any];
    element.style[property as any] = currentValue === value1 ? value2 : value1;
  };

  const openColorPicker = async (element: EditableElement) => {
    // Implement color picker modal or input
    const color = prompt('Enter color (hex, rgb, or color name):');
    if (color) {
      element.element.style.color = color;
    }
  };

  // Save changes to database
  const saveElementChanges = async (element: EditableElement) => {
    try {
      const response = await fetch('/api/admin/save-element', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elementId: element.id,
          type: element.type,
          content: element.content,
          styles: element.styles,
          page: window.location.pathname
        })
      });

      if (response.ok) {
        setHasChanges(false);
        // Show success toast
      }
    } catch (error) {
      console.error('Failed to save element changes:', error);
      // Show error toast
    }
  };

  // Add click listeners when edit mode is active
  useEffect(() => {
    if (isEditMode) {
      document.addEventListener('click', handleElementClick);
      return () => document.removeEventListener('click', handleElementClick);
    }
  }, [isEditMode, handleElementClick]);

  // Visual indicators for edit mode
  const editModeStyles = isEditMode ? `
    [data-editable]:hover,
    h1:hover, h2:hover, h3:hover, h4:hover, h5:hover, h6:hover,
    p:hover, span:hover, img:hover, section:hover {
      outline: 2px dashed #00ff88 !important;
      outline-offset: 2px !important;
      cursor: pointer !important;
    }
    [data-editable].selected,
    .selected {
      outline: 2px solid #ff0066 !important;
      outline-offset: 2px !important;
    }
  ` : '';

  return (
    <div className="relative">
      {/* Edit Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isEditMode 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isEditMode ? 'Exit Edit Mode' : 'Edit Page'}
        </button>
      </div>

      {/* Edit Mode Indicator */}
      {isEditMode && (
        <div className="fixed top-16 right-4 z-50 bg-yellow-500 text-black px-3 py-1 rounded text-sm font-medium">
          🎨 Edit Mode Active - Click any element to edit
        </div>
      )}

      {/* Context-Aware Toolbar */}
      {toolbar.visible && toolbar.element && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-2xl border p-2 flex gap-2"
          style={{ 
            left: toolbar.position.x, 
            top: toolbar.position.y 
          }}
        >
          {getToolsForElement(toolbar.element).map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolAction(tool.id, toolbar.element!)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title={tool.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      )}

      {/* Changes Indicator */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 z-50 bg-orange-500 text-white px-4 py-2 rounded-lg">
          Unsaved changes
        </div>
      )}

      {/* Inject edit mode styles */}
      {editModeStyles && (
        <style dangerouslySetInnerHTML={{ __html: editModeStyles }} />
      )}

      {/* Page Content */}
      <div className={isEditMode ? 'edit-mode-active' : ''}>
        {children}
      </div>
    </div>
  );
}
