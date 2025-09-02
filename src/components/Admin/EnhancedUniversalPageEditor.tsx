'use client';

import { useState, useEffect } from 'react';
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

// Enhanced tool definitions - REMOVED 'select' tool as requested
type EditorTool = 'text' | 'color' | 'image';
type ElementType = 'text' | 'heading' | 'image' | 'badge' | 'button' | 'icon' | 'container';

interface ElementConfig {
  type: ElementType;
  allowedTools: EditorTool[];
  description: string;
}

interface PendingChange {
  type: 'text' | 'color' | 'image' | 'style';
  value: string;
  originalValue: string;
  elementId: string;
}

interface EnhancedUniversalPageEditorProps {
  pageScope: string;
  pageName: string;
  children: React.ReactNode;
}

export default function EnhancedUniversalPageEditor({ 
  pageScope, 
  pageName, 
  children
}: EnhancedUniversalPageEditorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { savePageSetting } = usePageEditor(pageScope, user?.id);

  // Editor state - Start with 'text' as default since we removed 'select'
  const [selectedTool, setSelectedTool] = useState<EditorTool>('text');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElementConfig, setSelectedElementConfig] = useState<ElementConfig | null>(null);
  const [editingText, setEditingText] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  // Color picker state
  const [colorMode, setColorMode] = useState<'text' | 'background'>('text');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  
  // Preview/Save state - NO AUTO-SAVE
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());

  // Element type detection and configuration
  const getElementConfig = (element: HTMLElement): ElementConfig => {
    const tagName = element.tagName.toLowerCase();
    const elementId = element.getAttribute('data-editable') || '';
    const classList = Array.from(element.classList);
    
    // Determine element type based on semantic analysis
    if (tagName === 'img' || elementId.includes('image') || elementId.includes('logo')) {
      return {
        type: 'image',
        allowedTools: ['image'],
        description: 'Image Element - Use image tools only'
      };
    }
    
    if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || 
        elementId.includes('heading') || elementId.includes('title')) {
      return {
        type: 'heading',
        allowedTools: ['text', 'color'],
        description: 'Heading Element - Text and color tools available'
      };
    }
    
    if (elementId.includes('badge') || classList.some(c => c.includes('badge'))) {
      return {
        type: 'badge',
        allowedTools: ['text', 'color'],
        description: 'Badge Element - Text and color tools available'
      };
    }
    
    if (tagName === 'button' || elementId.includes('button') || 
        classList.some(c => c.includes('button'))) {
      return {
        type: 'button',
        allowedTools: ['text', 'color'],
        description: 'Button Element - Text and color tools available'
      };
    }
    
    if (tagName === 'p' || tagName === 'span' || tagName === 'div') {
      return {
        type: 'text',
        allowedTools: ['text', 'color'],
        description: 'Text Element - Text and color tools available'
      };
    }
    
    // Default fallback
    return {
      type: 'container',
      allowedTools: ['color'],
      description: 'Container Element - Limited tools available'
    };
  };

  // Block navigation during editing
  useEffect(() => {
    const blockNavigation = (e: Event) => {
      // Allow editor actions
      const target = e.target as HTMLElement;
      if (target.closest('[data-editor-action]') || target.closest('[data-editor-toolbar]')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      toast({
        title: "🚫 Navigation Blocked",
        description: "Exit page editor to navigate",
        variant: "destructive"
      });
      return false;
    };

    // Block all navigation links and buttons
    const links = document.querySelectorAll('a:not([data-editor-action])');
    const buttons = document.querySelectorAll('button:not([data-editor-action])');
    
    links.forEach(link => {
      link.addEventListener('click', blockNavigation, { capture: true });
    });
    
    buttons.forEach(button => {
      if (!button.closest('[data-editor-toolbar]')) {
        button.addEventListener('click', blockNavigation, { capture: true });
      }
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', blockNavigation, { capture: true });
      });
      buttons.forEach(button => {
        button.removeEventListener('click', blockNavigation, { capture: true });
      });
    };
  }, [toast]);

  // Enhanced element selection with orange hover and red selection
  useEffect(() => {
    const initializeEditor = () => {
      // Remove any existing editor styles
      document.querySelectorAll('[data-editable]').forEach(el => {
        const element = el as HTMLElement;
        element.style.outline = 'none';
        element.classList.remove('editor-selected', 'editor-hovering');
      });

      // Add click listeners and visual effects to all editable elements
      const editableElements = document.querySelectorAll('[data-editable]');
      
      editableElements.forEach(element => {
        const htmlElement = element as HTMLElement;
        
        // Prevent navigation during editing
        htmlElement.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Clear previous selections
          document.querySelectorAll('[data-editable]').forEach(el => {
            (el as HTMLElement).style.outline = 'none';
            el.classList.remove('editor-selected');
          });
          
          // Set red selection border
          htmlElement.style.outline = '3px solid #FF0066';
          htmlElement.style.outlineOffset = '2px';
          htmlElement.classList.add('editor-selected');
          
          const elementId = htmlElement.getAttribute('data-editable');
          if (elementId) {
            setSelectedElement(elementId);
            
            // Get element configuration and allowed tools
            const config = getElementConfig(htmlElement);
            setSelectedElementConfig(config);
            
            // Auto-select appropriate tool based on element type
            if (config.allowedTools.includes('text') && config.type !== 'image') {
              setSelectedTool('text');
            } else if (config.allowedTools.includes('image')) {
              setSelectedTool('image');
            } else {
              setSelectedTool('text');
            }
            
            toast({
              title: `🎯 ${config.description}`,
              description: `Selected: ${elementId}`,
              duration: 3000,
            });
          }
        });

        // Orange hover effect
        htmlElement.addEventListener('mouseenter', () => {
          if (!htmlElement.classList.contains('editor-selected')) {
            htmlElement.style.outline = '2px solid #FF8C00';
            htmlElement.style.outlineOffset = '1px';
            htmlElement.classList.add('editor-hovering');
          }
        });
        
        htmlElement.addEventListener('mouseleave', () => {
          if (!htmlElement.classList.contains('editor-selected')) {
            htmlElement.style.outline = 'none';
            htmlElement.classList.remove('editor-hovering');
          }
        });

        // Make cursor indicate editability
        htmlElement.style.cursor = 'crosshair';
      });
    };

    // Initialize after DOM is ready
    if (typeof window !== 'undefined') {
      setTimeout(initializeEditor, 100);
    }

    return () => {
      // Cleanup
      document.querySelectorAll('[data-editable]').forEach(element => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.outline = 'none';
        htmlElement.style.cursor = 'auto';
        htmlElement.classList.remove('editor-selected', 'editor-hovering');
      });
    };
  }, [toast]);

  // Handle tool selection with element type validation
  const handleToolSelect = (tool: EditorTool) => {
    if (!selectedElement) {
      toast({
        title: "🎯 Select Element First",
        description: "Please select an element before choosing a tool",
        variant: "destructive"
      });
      return;
    }

    const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
    if (element && selectedElementConfig) {
      if (!selectedElementConfig.allowedTools.includes(tool)) {
        toast({
          title: "🚫 Tool Not Allowed",
          description: `${tool} tool is not available for ${selectedElementConfig.type} elements`,
          variant: "destructive"
        });
        return;
      }
    }

    setSelectedTool(tool);
    
    // Reset color mode when switching away from color tool  
    if (tool !== 'color') {
      setColorMode('text'); // Reset to default
    }
    
    // Auto-set first valid color mode when switching to color tool
    if (tool === 'color' && selectedElementConfig) {
      setColorMode('text'); // Start with text color
    }
  };

  // Text editing functions
  const handleTextEdit = () => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`);
      if (element) {
        setTextValue(element.textContent || '');
        setEditingText(true);
      }
    }
  };

  const handleTextSave = () => {
    if (selectedElement && textValue !== null) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`);
      if (element) {
        const originalValue = element.textContent || '';
        
        // Update DOM immediately for preview
        element.textContent = textValue;
        
        // Add to pending changes
        setPendingChanges(prev => new Map(prev.set(selectedElement, {
          type: 'text',
          value: textValue,
          originalValue: originalValue,
          elementId: selectedElement
        })));
        
        setEditingText(false);
        
        toast({
          title: "📝 Text Preview Applied",
          description: "Click 'Save Changes' to make it permanent",
          duration: 3000,
        });
      }
    }
  };

  // Handle color application
  const handleColorApply = () => {
    if (selectedElement && selectedColor) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        const originalValue = colorMode === 'text' ? 
          element.style.color || getComputedStyle(element).color :
          element.style.backgroundColor || getComputedStyle(element).backgroundColor;

        // Apply color immediately for preview
        if (colorMode === 'text') {
          element.style.color = selectedColor;
        } else {
          element.style.backgroundColor = selectedColor;
        }

        // Add to pending changes
        const newPendingChanges = new Map(pendingChanges);
        newPendingChanges.set(selectedElement, {
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
    }
  };

  // Preview changes (apply but don't save to database)
  const handlePreviewChanges = () => {
    toast({
      title: "👁️ Preview Mode Active",
      description: "Changes applied for preview. Use 'Save Changes' to make permanent.",
      duration: 4000,
    });
  };

  // Save changes to database
  const handleSaveChanges = async () => {
    if (pendingChanges.size === 0) {
      toast({
        title: "💾 No Changes to Save",
        description: "Make some changes before saving",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    let savedCount = 0;

    try {
      // Save all pending changes to database
      for (const [, change] of pendingChanges) {
        // Use the element ID as the setting key for page editor
        await savePageSetting({
          setting_key: `${change.elementId}_${change.type}`,
          setting_value: change.value,
          category: 'page_editor',
          page_scope: pageScope,
          created_by: user?.id || ''
        });
        savedCount++;
      }

      // Clear pending changes after successful save
      setPendingChanges(new Map());
      setLastSaveTime(new Date());

      toast({
        title: "✅ Changes Saved",
        description: `Successfully saved ${savedCount} changes to database`,
        duration: 4000,
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "❌ Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes and revert to original state
  const handleDiscardChanges = () => {
    // Restore original values
    pendingChanges.forEach((change) => {
      const element = document.querySelector(`[data-editable="${change.elementId}"]`) as HTMLElement;
      
      if (element) {
        switch (change.type) {
          case 'text':
            element.textContent = change.originalValue;
            break;
          case 'color':
            element.style.color = change.originalValue;
            break;
          case 'image':
            if (element.tagName === 'IMG') {
              (element as HTMLImageElement).src = change.originalValue;
            } else {
              element.style.backgroundImage = change.originalValue;
            }
            break;
        }
      }
    });
    
    // Clear pending changes
    setPendingChanges(new Map());
    
    toast({
      title: "🔄 Changes Discarded",
      description: "All preview changes have been reverted",
      duration: 3000,
    });
  };

  return (
    <>
      {/* FULL SCREEN OVERLAY - Complete isolation from main site */}
      <div className="fixed inset-0 z-[99999] bg-darkBg text-white overflow-auto">
        {/* FIXED TOOLBAR - Stays on top while scrolling */}
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
                // COMPLETE EDITOR STATE RESET AND CLEANUP
                console.log('🚪 Exiting Page Editor - Complete state reset');
                
                // 1. Reset all editor state
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
                
                // 2. Clean up all editable elements - remove editor styling
                document.querySelectorAll('[data-editable]').forEach(el => {
                  const element = el as HTMLElement;
                  element.style.outline = 'none';
                  element.style.cursor = 'auto';
                  element.style.pointerEvents = 'auto';
                  element.classList.remove('editor-selected', 'editor-hovering');
                  // Remove any editor-specific attributes
                  element.removeAttribute('data-editor-selected');
                  element.removeAttribute('data-editor-hover');
                });
                
                // 3. Remove all event listeners and cleanup
                const allElements = document.querySelectorAll('*');
                allElements.forEach(el => {
                  const element = el as HTMLElement;
                  // Reset any modified styles
                  if (element.hasAttribute('data-original-style')) {
                    element.style.cssText = element.getAttribute('data-original-style') || '';
                    element.removeAttribute('data-original-style');
                  }
                });
                
                // 4. Force DOM cleanup and navigation reset
                setTimeout(() => {
                  // Navigate back to admin - this completely reloads the admin environment
                  window.location.href = '/admin';
                }, 100);
              }}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Editor
            </Button>
            <div className="text-lg font-semibold text-neonCyan">
              {pageName} Editor
            </div>
            <div className="text-sm text-gray-400">
              Page: {pageScope}
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
            {/* Preview/Save buttons - NO AUTO-SAVE */}
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

        {/* Tool Selection Bar - Removed redundant Select tool */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400 font-medium">Tools:</span>
            
            {selectedElementConfig?.allowedTools.includes('text') && (
              <Button
                data-editor-action="true"
                variant={selectedTool === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToolSelect('text')}
                className={selectedTool === 'text' ? 'bg-neonPink text-black' : 'border-gray-500 text-gray-300'}
              >
                <Type className="w-4 h-4 mr-2" />
                Text
              </Button>
            )}
            
            {selectedElementConfig?.allowedTools.includes('color') && (
              <Button
                data-editor-action="true"
                variant={selectedTool === 'color' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToolSelect('color')}
                className={selectedTool === 'color' ? 'bg-yellow-500 text-black' : 'border-gray-500 text-gray-300'}
              >
                <Palette className="w-4 h-4 mr-2" />
                Color
              </Button>
            )}
            
            {selectedElementConfig?.allowedTools.includes('image') && (
              <Button
                data-editor-action="true"
                variant={selectedTool === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToolSelect('image')}
                className={selectedTool === 'image' ? 'bg-purple-500 text-white' : 'border-gray-500 text-gray-300'}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image
              </Button>
            )}
          </div>

          {/* Current Selection Info */}
          {selectedElement && (
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-neonCyan rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Selected:</span>
              <strong className="text-neonCyan text-sm">{selectedElement}</strong>
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
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSaving ? 'Saving...' : 'Apply'}
                  </Button>
                  <Button
                    data-editor-action="true"
                    onClick={() => setEditingText(false)}
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Color Editing Panel */}
        {selectedTool === 'color' && selectedElement && (
          <div className="px-4 py-3 bg-gray-800 border-t border-gray-600">
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-sm text-gray-300 font-medium">Color Tools:</div>
              <Button
                data-editor-action="true"
                variant={colorMode === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setColorMode('text')}
                className={colorMode === 'text' ? 'bg-blue-500 text-white' : 'border-gray-500 text-gray-300'}
              >
                Text Color
              </Button>
              <Button
                data-editor-action="true"
                variant={colorMode === 'background' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setColorMode('background')}
                className={colorMode === 'background' ? 'bg-purple-500 text-white' : 'border-gray-500 text-gray-300'}
              >
                Background Color
              </Button>
            </div>
            
            {/* Color picker is now always shown when color tool is active and a mode is selected */}
            {(colorMode === 'text' || colorMode === 'background') && (
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <HexColorPicker
                    color={selectedColor}
                    onChange={setSelectedColor}
                    style={{ width: '200px', height: '150px' }}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-300 w-16">Hex:</label>
                    <Input
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1 bg-gray-700 border-gray-600 text-white font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-12 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: selectedColor }}
                    ></div>
                    <span className="text-sm text-gray-400">Preview</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      data-editor-action="true"
                      onClick={handleColorApply}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Apply {colorMode === 'text' ? 'Text' : 'Background'} Color
                    </Button>
                  </div>
                  <div className="grid grid-cols-8 gap-1 mt-3">
                    {/* Quick color presets */}
                    {[
                      '#ffffff', '#000000', '#ff0000', '#00ff00', 
                      '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
                      '#ff8c00', '#ff0066', '#00ff99', '#9966ff',
                      '#ff6600', '#66ff00', '#0066ff', '#ff0099'
                    ].map((color) => (
                      <button
                        key={color}
                        data-editor-action="true"
                        onClick={() => setSelectedColor(color)}
                        className="w-6 h-6 rounded border border-gray-600 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Page Content Container - Isolated within overlay */}
        <div className="pt-32 min-h-screen bg-darkBg">
          {children}
        </div>
      </div>
    </>
  );
}
