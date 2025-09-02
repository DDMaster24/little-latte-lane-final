'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePageEditor } from '@/hooks/usePageEditor';
import { useAuth } from '@/components/AuthProvider';
import { HexColorPicker } from 'react-colorful';
import { 
  ArrowLeft, 
  Eye, 
  Type, 
  Palette, 
  Image as ImageIcon,
  Save,
  X,
  AlertTriangle
} from 'lucide-react';

// Header-specific editor tool types
type HeaderEditorTool = 'text' | 'color' | 'image';
type HeaderElementType = 'nav-link' | 'auth-button' | 'logo' | 'mobile-nav' | 'header-text';

interface HeaderElementConfig {
  type: HeaderElementType;
  allowedTools: HeaderEditorTool[];
  description: string;
}

interface PendingChange {
  type: 'text' | 'color' | 'image';
  value: string;
  originalValue: string;
  elementId: string;
}

interface HeaderEditorProps {
  children: React.ReactNode;
}

export default function HeaderEditor({ children }: HeaderEditorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { savePageSetting } = usePageEditor('header', user?.id);

  // Editor state - Start with 'text' as default
  const [selectedTool, setSelectedTool] = useState<HeaderEditorTool>('text');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElementConfig, setSelectedElementConfig] = useState<HeaderElementConfig | null>(null);
  const [editingText, setEditingText] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  // Color picker state - Always visible when color tool is active
  const [colorMode, setColorMode] = useState<'text' | 'background'>('text');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  
  // Preview/Save state - NO AUTO-SAVE
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());

  // Header-specific element configuration
  const getHeaderElementConfig = (element: HTMLElement): HeaderElementConfig => {
    const elementId = element.getAttribute('data-editable') || '';
    const tagName = element.tagName.toLowerCase();
    const classList = Array.from(element.classList);

    // Logo
    if (elementId.includes('header-logo') || elementId.includes('logo')) {
      return {
        type: 'logo',
        allowedTools: ['image'],
        description: 'Header Logo - Company logo image'
      };
    }
    
    // Navigation links (desktop)
    if (elementId.includes('nav-link-')) {
      return {
        type: 'nav-link',
        allowedTools: ['text', 'color'],
        description: 'Navigation Link - Header menu item'
      };
    }
    
    // Mobile navigation links
    if (elementId.includes('mobile-nav-')) {
      return {
        type: 'mobile-nav',
        allowedTools: ['text', 'color'],
        description: 'Mobile Navigation - Mobile menu item'
      };
    }
    
    // Auth buttons
    if (elementId.includes('auth-') || elementId.includes('login') || elementId.includes('logout')) {
      return {
        type: 'auth-button',
        allowedTools: ['text', 'color'],
        description: 'Auth Button - Login/logout button'
      };
    }
    
    // Button elements
    if (tagName === 'button' || elementId.includes('button') || 
        classList.some(c => c.includes('button'))) {
      return {
        type: 'auth-button',
        allowedTools: ['text', 'color'],
        description: 'Header Button - Interactive button'
      };
    }
    
    // Images
    if (tagName === 'img' || elementId.includes('image')) {
      return {
        type: 'logo',
        allowedTools: ['image'],
        description: 'Header Image - Header image content'
      };
    }
    
    // Links
    if (tagName === 'a' || elementId.includes('link')) {
      return {
        type: 'nav-link',
        allowedTools: ['text', 'color'],
        description: 'Header Link - Navigation link'
      };
    }
    
    // Default text elements
    return {
      type: 'header-text',
      allowedTools: ['text', 'color'],
      description: 'Header Text - Header text content'
    };
  };

  // Handle element selection with header-specific logic
  const handleElementClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    console.log('🖱️ Click detected on:', target.tagName, target.className);
    
    // CRITICAL: Block ALL navigation attempts - no exceptions
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Ignore clicks on editor toolbar
    if (target.closest('[data-editor-toolbar]') || target.closest('[data-editor-action]')) {
      console.log('🚫 Toolbar click ignored');
      return;
    }
    
    // Find the closest editable element
    const editableElement = target.closest('[data-editable]') as HTMLElement;
    console.log('🎯 Found editable element:', editableElement?.getAttribute('data-editable'));
    
    if (!editableElement) {
      // Clicked outside editable area - clear selection but show toast
      console.log('❌ No editable element - clearing selection');
      setSelectedElement(null);
      setSelectedElementConfig(null);
      
      // Show toast for blocked navigation on non-editable elements
      if (target.tagName === 'A' || target.closest('a') || 
          (target.tagName === 'BUTTON' && !target.closest('[data-editor-action]'))) {
        toast({
          title: "🚫 Navigation Blocked",
          description: "Exit header editor to navigate. Click elements to edit them instead.",
          variant: "destructive",
          duration: 2000
        });
      }
      return;
    }
    
    const elementId = editableElement.getAttribute('data-editable');
    console.log('🆔 Element ID:', elementId);
    
    if (elementId) {
      // Clear previous selection
      document.querySelectorAll('[data-editable]').forEach(el => {
        (el as HTMLElement).style.outline = 'none';
        el.classList.remove('editor-selected');
      });
      
      // Select new element
      editableElement.style.outline = '3px solid #ff0000'; // RED neon border for selection
      editableElement.classList.add('editor-selected');
      
      const config = getHeaderElementConfig(editableElement);
      console.log('⚙️ Element config:', config);
      
      setSelectedElement(elementId);
      setSelectedElementConfig(config);
      
      // Show success toast
      toast({
        title: "🎯 Element Selected",
        description: `Selected ${config?.description || 'element'} for editing`,
        variant: "default",
        duration: 1500
      });
      
      // Auto-select appropriate tool
      if (config.allowedTools.includes('text')) {
        setSelectedTool('text');
      } else if (config.allowedTools.includes('color')) {
        setSelectedTool('color');
      } else if (config.allowedTools.includes('image')) {
        setSelectedTool('image');
      }
    }
  }, [toast]);

  // Handle tool selection with validation
  const handleToolSelect = (tool: HeaderEditorTool) => {
    if (!selectedElement) {
      toast({
        title: "🎯 Select Element First",
        description: "Please select a header element before choosing a tool",
        variant: "destructive"
      });
      return;
    }

    const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
    if (element && selectedElementConfig) {
      if (!selectedElementConfig.allowedTools.includes(tool)) {
        toast({
          title: "🚫 Tool Not Allowed",
          description: `${tool} tool is not available for this header element type`,
          variant: "destructive"
        });
        return;
      }
    }

    setSelectedTool(tool);
    
    // Reset editing states when switching tools
    setEditingText(false);
    setTextValue('');
  };

  // Text editing functions
  const handleTextEdit = () => {
    if (!selectedElement) return;
    
    const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
    if (element) {
      const currentText = element.textContent || '';
      setTextValue(currentText);
      setEditingText(true);
    }
  };

  const handleTextSave = async () => {
    if (!selectedElement || !textValue.trim()) return;
    
    setIsSaving(true);
    try {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        const originalText = element.textContent || '';
        
        // Apply preview
        element.textContent = textValue;
        
        // Add to pending changes
        const newPendingChanges = new Map(pendingChanges);
        newPendingChanges.set(selectedElement, {
          type: 'text',
          value: textValue,
          originalValue: originalText,
          elementId: selectedElement
        });
        setPendingChanges(newPendingChanges);
        
        setEditingText(false);
        
        toast({
          title: "✏️ Text Preview Applied",
          description: "Click 'Save Changes' to make it permanent",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error applying text preview:', error);
      toast({
        title: "❌ Preview Failed",
        description: "Could not apply text preview",
        variant: "destructive"
      });
    }
    setIsSaving(false);
  };

  // Color application function
  const handleColorApply = () => {
    if (!selectedElement || !selectedColor) return;
    
    const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
    if (element) {
      const originalValue = colorMode === 'text' 
        ? element.style.color || ''
        : element.style.backgroundColor || '';
      
      // Apply preview
      if (colorMode === 'text') {
        element.style.color = selectedColor;
      } else {
        element.style.backgroundColor = selectedColor;
      }
      
      // Add to pending changes
      const newPendingChanges = new Map(pendingChanges);
      newPendingChanges.set(`${selectedElement}-${colorMode}`, {
        type: 'color',
        value: selectedColor,
        originalValue,
        elementId: selectedElement
      });
      setPendingChanges(newPendingChanges);
      
      toast({
        title: `🎨 ${colorMode === 'text' ? 'Text' : 'Background'} Color Preview Applied`,
        description: "Click 'Save Changes' to make it permanent",
        duration: 3000,
      });
    }
  };

  // Save/Preview/Discard functions
  const handleSaveChanges = async () => {
    if (pendingChanges.size === 0) return;
    
    setIsSaving(true);
    try {
      const savePromises = Array.from(pendingChanges.values()).map(async (change) => {
        // Create proper setting data for the database
        return savePageSetting({
          setting_key: change.elementId,
          setting_value: change.value,
          page_scope: 'header',
          category: change.type
        });
      });
      
      await Promise.all(savePromises);
      setPendingChanges(new Map());
      setLastSaveTime(new Date());
      
      toast({
        title: "✅ Changes Saved",
        description: `Successfully saved ${savePromises.length} changes to header`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "❌ Save Failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive"
      });
    }
    setIsSaving(false);
  };

  const handlePreviewChanges = () => {
    toast({
      title: "👁️ Preview Mode",
      description: "All changes are already previewed live",
      duration: 2000,
    });
  };

  const handleDiscardChanges = () => {
    // Restore original values
    pendingChanges.forEach((change) => {
      const element = document.querySelector(`[data-editable="${change.elementId}"]`) as HTMLElement;
      if (element) {
        if (change.type === 'text') {
          element.textContent = change.originalValue;
        } else if (change.type === 'color') {
          if (change.elementId.endsWith('-text')) {
            element.style.color = change.originalValue;
          } else {
            element.style.backgroundColor = change.originalValue;
          }
        }
      }
    });
    
    setPendingChanges(new Map());
    toast({
      title: "🗑️ Changes Discarded",
      description: "All pending changes have been reverted",
      duration: 3000,
    });
  };

  // SMART Navigation Blocking - Only block what we need to block
  useEffect(() => {
    // Handle keyboard events specifically 
    const handleKeyboard = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // ALLOW: Editor areas completely
      if (target.closest('[data-editor-action]') || 
          target.closest('[data-editor-toolbar]') ||
          target.closest('[data-editor-form]') ||
          target.closest('.editor-panel') ||
          target.closest('.editor-sidebar')) {
        return; // Allow all keyboard in editor areas
      }

      // ALLOW: Essential browser shortcuts - NO BLOCKING AT ALL
      if (
        e.key === 'F12' || // DevTools
        e.key === 'F5' || // Refresh
        (e.ctrlKey && e.key.toLowerCase() === 'r') || // Ctrl+R refresh
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') || // Ctrl+Shift+R hard refresh
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') || // Ctrl+Shift+I DevTools
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j') || // Ctrl+Shift+J DevTools Console
        (e.ctrlKey && e.key.toLowerCase() === 'u') || // Ctrl+U view source
        (e.ctrlKey && e.key.toLowerCase() === 's') || // Ctrl+S save
        (e.altKey && e.key === 'Tab') || // Alt+Tab window switching
        e.key === 'Escape' // Escape key
      ) {
        return; // Allow these shortcuts completely
      }

      // BLOCK: Only navigation keys on page elements (not in editor)
      if (e.key === 'Enter' || e.key === ' ') {
        const linkElement = target.closest('a');
        const buttonElement = target.closest('button:not([data-editor-action])');
        
        if (linkElement || buttonElement) {
          e.preventDefault();
          e.stopPropagation();
          
          toast({
            title: "🚫 Keyboard Navigation Blocked",
            description: "Use mouse to select elements for editing",
            variant: "destructive",
            duration: 1500
          });
        }
      }
    };

    // Handle form submissions
    const handleSubmit = (e: SubmitEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-editor-form]')) {
        e.preventDefault();
        e.stopPropagation();
        
        toast({
          title: "🚫 Form Submission Blocked",
          description: "Exit editor to submit forms",
          variant: "destructive"
        });
      }
    };

    // Add targeted event listeners - NO DOCUMENT-LEVEL CLICK BLOCKING
    document.addEventListener('keydown', handleKeyboard, { capture: true, passive: false });
    document.addEventListener('submit', handleSubmit, { capture: true, passive: false });

    // Override window navigation methods
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function() {
      toast({
        title: "🚫 Navigation Blocked",
        description: "History navigation blocked in editor mode",
        variant: "destructive"
      });
      return;
    };
    
    window.history.replaceState = function() {
      toast({
        title: "🚫 Navigation Blocked", 
        description: "History navigation blocked in editor mode",
        variant: "destructive"
      });
      return;
    };

    return () => {
      // Cleanup event listeners  
      document.removeEventListener('keydown', handleKeyboard, true);
      document.removeEventListener('submit', handleSubmit, true);
      
      // Restore window methods
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [toast]);

  // Add element hover effects and click handlers
  useEffect(() => {
    // Add a small delay to ensure elements are rendered
    const timeoutId = setTimeout(() => {
      const handleMouseEnter = (e: Event) => {
        const target = e.target as HTMLElement;
        const editableElement = target.closest('[data-editable]') as HTMLElement;
        
        console.log('🖱️ Mouse enter:', editableElement?.getAttribute('data-editable'));
        
        if (editableElement && editableElement.getAttribute('data-editable')) {
          // Only show orange hover if element is NOT currently selected
          if (!editableElement.classList.contains('editor-selected')) {
            editableElement.style.outline = '2px solid #ff8c00'; // ORANGE neon border for hover
            editableElement.classList.add('editor-hovering');
          }
        }
      };

      const handleMouseLeave = (e: Event) => {
        const target = e.target as HTMLElement;
        const editableElement = target.closest('[data-editable]') as HTMLElement;
        
        if (editableElement && editableElement.classList.contains('editor-hovering')) {
          // Only remove hover outline if element is NOT selected
          if (!editableElement.classList.contains('editor-selected')) {
            editableElement.style.outline = 'none';
          }
          editableElement.classList.remove('editor-hovering');
        }
      };

      const editableElements = document.querySelectorAll('[data-editable]');
      console.log('🎯 Found editable elements:', editableElements.length, Array.from(editableElements).map(el => el.getAttribute('data-editable')));
      
      editableElements.forEach(element => {
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('click', handleElementClick as EventListener);
      });

      return () => {
        editableElements.forEach(element => {
          element.removeEventListener('mouseenter', handleMouseEnter);
          element.removeEventListener('mouseleave', handleMouseLeave);
          element.removeEventListener('click', handleElementClick as EventListener);
        });
      };
    }, 1000); // 1 second delay to ensure elements are rendered

    return () => {
      clearTimeout(timeoutId);
    };
  }, [handleElementClick]);

  return (
    <>
      {/* FULL SCREEN OVERLAY - Complete isolation from main site */}
      <div className="fixed inset-0 z-[99999] bg-darkBg text-white overflow-auto">
        {/* FIXED TOOLBAR */}
        <div 
          className="fixed top-0 left-0 right-0 z-[100000] bg-gray-900 border-b border-gray-700 shadow-lg"
          data-editor-toolbar="true"
        >
          {/* Main Navigation Bar */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button
                data-editor-action="true"
                variant="ghost"
                size="sm"
                onClick={() => {
                  // COMPLETE EDITOR STATE RESET
                  console.log('🚪 Exiting Header Editor - Complete state reset');
                  
                  // Reset all editor state
                  setSelectedTool('text');
                  setSelectedElement(null);
                  setSelectedElementConfig(null);
                  setEditingText(false);
                  setTextValue('');
                  setColorMode('text');
                  setSelectedColor('#ffffff');
                  setPendingChanges(new Map());
                  setIsSaving(false);
                  setLastSaveTime(null);
                  
                  // Clean up all editable elements
                  document.querySelectorAll('[data-editable]').forEach(el => {
                    const element = el as HTMLElement;
                    element.style.outline = 'none';
                    element.style.cursor = 'auto';
                    element.style.pointerEvents = 'auto';
                    element.classList.remove('editor-selected', 'editor-hovering');
                    element.removeAttribute('data-editor-selected');
                    element.removeAttribute('data-editor-hover');
                  });
                  
                  // Force navigation back to admin
                  setTimeout(() => {
                    window.location.href = '/admin';
                  }, 100);
                }}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Header Editor
              </Button>
              <div className="text-lg font-semibold text-neonCyan">
                Header Editor
              </div>
              <div className="text-sm text-gray-400">
                Edit header navigation and layout
              </div>
              {selectedElement && selectedElementConfig && (
                <div className="px-3 py-1 bg-neonPink/20 rounded-lg border border-neonPink/30">
                  <span className="text-neonPink text-sm font-medium">
                    {selectedElementConfig.description}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Preview/Save buttons */}
              {pendingChanges.size > 0 && (
                <>
                  <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400 text-xs font-medium">
                      {pendingChanges.size} pending changes
                    </span>
                  </div>
                  
                  <Button
                    data-editor-action="true"
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewChanges}
                    className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                    disabled={isSaving}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  
                  <Button
                    data-editor-action="true"
                    variant="outline"
                    size="sm"
                    onClick={handleSaveChanges}
                    className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
                  <Button
                    data-editor-action="true"
                    variant="outline"
                    size="sm"
                    onClick={handleDiscardChanges}
                    className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Discard
                  </Button>
                </>
              )}
              
              {lastSaveTime && pendingChanges.size === 0 && (
                <div className="flex items-center space-x-2 text-green-400">
                  <span className="text-xs">
                    ✅ Saved: {lastSaveTime.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tool Selection Bar - ALWAYS VISIBLE */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400 font-medium">Header Tools:</span>
              
              {/* ALWAYS show basic tools, enable/disable based on selection */}
              <Button
                data-editor-action="true"
                variant={selectedTool === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToolSelect('text')}
                disabled={!selectedElement || !selectedElementConfig?.allowedTools.includes('text')}
                className={selectedTool === 'text' ? 'bg-neonPink text-black' : 'border-gray-500 text-gray-300'}
              >
                <Type className="w-4 h-4 mr-2" />
                Text {!selectedElement && '(Select Element)'}
              </Button>
              
              <Button
                data-editor-action="true"
                variant={selectedTool === 'color' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToolSelect('color')}
                disabled={!selectedElement || !selectedElementConfig?.allowedTools.includes('color')}
                className={selectedTool === 'color' ? 'bg-yellow-500 text-black' : 'border-gray-500 text-gray-300'}
              >
                <Palette className="w-4 h-4 mr-2" />
                Color {!selectedElement && '(Select Element)'}
              </Button>
              
              <Button
                data-editor-action="true"
                variant={selectedTool === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToolSelect('image')}
                disabled={!selectedElement || !selectedElementConfig?.allowedTools.includes('image')}
                className={selectedTool === 'image' ? 'bg-purple-500 text-white' : 'border-gray-500 text-gray-300'}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image {!selectedElement && '(Select Element)'}
              </Button>
            </div>

            {/* Current Selection Info */}
            {selectedElement && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neonCyan rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Selected:</span>
                <strong className="text-neonCyan text-sm">{selectedElement}</strong>
                {selectedElementConfig && (
                  <span className="text-xs text-gray-400">({selectedElementConfig.type})</span>
                )}
              </div>
            )}
          </div>

          {/* Text Editing Panel */}
          {selectedTool === 'text' && selectedElement && (
            <div className="px-4 py-3 bg-gray-800 border-t border-gray-600">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-300 font-medium">Text Tools:</div>
                {!editingText ? (
                  <Button
                    data-editor-action="true"
                    onClick={handleTextEdit}
                    className="bg-neonCyan text-black hover:bg-neonCyan/80"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Edit Text Content
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder="Enter new text..."
                      className="flex-1 bg-gray-700 border-gray-600 text-white"
                      autoFocus
                    />
                    <Button
                      data-editor-action="true"
                      onClick={handleTextSave}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isSaving}
                    >
                      Apply Text
                    </Button>
                    <Button
                      data-editor-action="true"
                      onClick={() => setEditingText(false)}
                      variant="outline"
                      className="border-gray-500"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Color Editing Panel - FLOATING PANEL to avoid overlapping content */}
          {selectedTool === 'color' && selectedElement && (
            <div className="fixed top-32 left-4 z-[100001] bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-4 max-w-md">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-300 font-medium">Color Tools</div>
                <Button
                  data-editor-action="true"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTool('text')}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-col space-y-4">
                {/* Color Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <Button
                    data-editor-action="true"
                    variant={colorMode === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setColorMode('text')}
                    className={colorMode === 'text' ? 'bg-blue-600 text-white' : 'border-gray-500 text-gray-300'}
                  >
                    Text Color
                  </Button>
                  <Button
                    data-editor-action="true"
                    variant={colorMode === 'background' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setColorMode('background')}
                    className={colorMode === 'background' ? 'bg-purple-600 text-white' : 'border-gray-500 text-gray-300'}
                  >
                    Background Color
                  </Button>
                </div>

                {/* Professional Color Picker */}
                <div className="flex flex-col items-center space-y-3">
                  <HexColorPicker 
                    color={selectedColor} 
                    onChange={setSelectedColor}
                    style={{ width: '200px', height: '120px' }}
                  />
                  
                  {/* Hex Input */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">Hex:</span>
                    <Input
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      placeholder="#ffffff"
                      className="w-24 bg-gray-700 border-gray-600 text-white text-xs"
                    />
                    <div 
                      className="w-6 h-6 rounded border border-gray-500"
                      style={{ backgroundColor: selectedColor }}
                    />
                  </div>
                  
                  {/* Color Presets */}
                  <div className="grid grid-cols-8 gap-1">
                    {[
                      '#ffffff', '#000000', '#ff0000', '#00ff00', 
                      '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
                      '#888888', '#ff8800', '#8800ff', '#0088ff',
                      '#88ff00', '#ff0088', '#00ff88', '#ff8888'
                    ].map((color) => (
                      <button
                        key={color}
                        data-editor-action="true"
                        className="w-6 h-6 rounded border border-gray-500 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>

                  {/* Apply Button */}
                  <Button
                    data-editor-action="true"
                    onClick={handleColorApply}
                    className="bg-yellow-600 hover:bg-yellow-700 text-black w-full"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Apply {colorMode === 'text' ? 'Text' : 'Background'} Color
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Image Editing Panel */}
          {selectedTool === 'image' && selectedElement && (
            <div className="px-4 py-3 bg-gray-800 border-t border-gray-600">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-300 font-medium">Image Tools:</div>
                <Button
                  data-editor-action="true"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Upload New Image
                </Button>
                <span className="text-xs text-gray-400">
                  Image uploading will be implemented in the next phase
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT AREA with padding to avoid toolbar overlap */}
        <div className="pt-32">
          {children}
        </div>
      </div>
    </>
  );
}
