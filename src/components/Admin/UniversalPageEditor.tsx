'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePageEditor } from '@/hooks/usePageEditor';
import { useAuth } from '@/components/AuthProvider';
import EditorLayout from '@/components/Admin/EditorLayout';

interface PendingChange {
  type: 'text' | 'font-size' | 'color' | 'background' | 'image';
  value: string;
  originalValue?: string;
  elementId?: string;
  property?: string;
}
import { 
  ArrowLeft, 
  Eye, 
  MousePointer, 
  Type, 
  Palette, 
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Pipette,
  Upload,
  X
} from 'lucide-react';
import AdvancedColorPicker from './AdvancedColorPicker';
import GradientPicker from './GradientPicker';
import EnhancedImageEditor from './EnhancedImageEditor';

// Tool definitions for universal editor
type EditorTool = 'select' | 'text' | 'color' | 'image';
type ColorSubTool = 'text-color' | 'background-color' | 'gradient' | 'text-gradient';
type TextSubTool = 'content' | 'font-size';

interface UniversalPageEditorProps {
  pageScope: string;
  pageName: string;
  children: React.ReactNode; // The actual page content to edit
  enabledTools?: EditorTool[];
  customToolConfig?: {
    [key in EditorTool]?: {
      enabled: boolean;
      subTools?: string[];
    };
  };
}

export default function UniversalPageEditor({ 
  pageScope, 
  pageName, 
  children, 
  enabledTools = ['select', 'text', 'color', 'image']
}: UniversalPageEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { savePageSetting, updateElementContent } = usePageEditor(pageScope, user?.id);

  // Editor state
  const [selectedTool, setSelectedTool] = useState<EditorTool>('select');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedColorSubTool, setSelectedColorSubTool] = useState<ColorSubTool>('text-color');
  const [selectedTextSubTool, setSelectedTextSubTool] = useState<TextSubTool>('content');
  const [editingText, setEditingText] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  // Preview/Save state - NEW
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  
  // Modal states
  const [showAdvancedColorPicker, setShowAdvancedColorPicker] = useState(false);
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [showEnhancedImageEditor, setShowEnhancedImageEditor] = useState(false);

  // Initialize editor on mount
  useEffect(() => {
    const initializeEditor = () => {
      // Add click listeners to all editable elements
      const editableElements = document.querySelectorAll('[data-editable]');
      
      editableElements.forEach(element => {
        element.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const elementId = (e.target as HTMLElement).getAttribute('data-editable');
          if (elementId) {
            setSelectedElement(elementId);
            setSelectedTool('select');
          }
        });

        // Add visual indicators
        (element as HTMLElement).style.cursor = 'pointer';
        (element as HTMLElement).style.outline = '2px dashed transparent';
        (element as HTMLElement).style.transition = 'outline 0.2s ease';
        
        element.addEventListener('mouseenter', () => {
          (element as HTMLElement).style.outline = '2px dashed #06FFA5';
        });
        
        element.addEventListener('mouseleave', () => {
          if (!selectedElement || selectedElement !== element.getAttribute('data-editable')) {
            (element as HTMLElement).style.outline = '2px dashed transparent';
          }
        });
      });
    };

    // Initialize after DOM is ready
    if (typeof window !== 'undefined') {
      setTimeout(initializeEditor, 100);
    }

    return () => {
      // Cleanup event listeners
      const editableElements = document.querySelectorAll('[data-editable]');
      editableElements.forEach(element => {
        element.removeEventListener('click', () => {});
        element.removeEventListener('mouseenter', () => {});
        element.removeEventListener('mouseleave', () => {});
      });
    };
  }, [selectedElement]);

  // Handle tool selection
  const handleToolSelect = (tool: EditorTool) => {
    setSelectedTool(tool);
    
    // Reset modal states when switching tools
    setShowAdvancedColorPicker(false);
    setShowGradientPicker(false);
    setShowEnhancedImageEditor(false);
    
    // Auto-select first sub-tool for multi-option tools
    if (tool === 'color') {
      setSelectedColorSubTool('text-color');
    } else if (tool === 'text') {
      setSelectedTextSubTool('content');
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

  const handleTextSave = async () => {
    if (selectedElement && textValue !== null) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`);
      if (element) {
        // Update DOM immediately for preview
        element.textContent = textValue;
        
        // Add to pending changes
        setPendingChanges(prev => new Map(prev.set(selectedElement, {
          type: 'text',
          value: textValue,
          originalValue: element.getAttribute('data-original-text') || element.textContent || undefined
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

  // Font size change handler
  const handleFontSizeChange = async (size: string) => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        // Store original value if not already stored
        if (!element.getAttribute('data-original-font-size')) {
          element.setAttribute('data-original-font-size', element.style.fontSize || '16');
        }
        
        // Update DOM immediately for preview
        element.style.fontSize = `${size}px`;
        
        // Add to pending changes
        setPendingChanges(prev => new Map(prev.set(`${selectedElement}_font_size`, {
          type: 'font-size',
          value: size,
          elementId: selectedElement,
          originalValue: element.getAttribute('data-original-font-size') || undefined
        })));
        
        toast({
          title: "📏 Font Size Preview Applied",
          description: "Click 'Save Changes' to make it permanent",
          duration: 2000,
        });
      }
    }
  };

  // Color change handlers
  const handleColorChange = async (color: string) => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        // Store original value if not already stored
        if (!element.getAttribute('data-original-color')) {
          element.setAttribute('data-original-color', element.style.color || 'inherit');
        }
        
        // Update DOM immediately for preview
        element.style.color = color;
        
        // Add to pending changes
        setPendingChanges(prev => new Map(prev.set(`${selectedElement}_color`, {
          type: 'color',
          value: color,
          elementId: selectedElement,
          property: 'color',
          originalValue: element.getAttribute('data-original-color') || undefined
        })));
        
        toast({
          title: "🎨 Color Preview Applied",
          description: "Click 'Save Changes' to make it permanent",
          duration: 2000,
        });
      }
    }
  };

  const handleBackgroundChange = async (background: string) => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        setIsSaving(true);
        
        // Update DOM immediately
        if (background === 'transparent') {
          element.style.backgroundColor = 'transparent';
        } else if (background.includes('gradient')) {
          element.style.background = background;
          element.style.backgroundImage = background;
        } else {
          element.style.backgroundColor = background;
        }
        
        // Save to database
        try {
          await savePageSetting({
            setting_key: `${selectedElement}_background`,
            setting_value: background,
            category: 'page_editor',
            page_scope: pageScope,
            created_by: user?.id || ''
          });
          setLastSaveTime(new Date());
          
          toast({
            title: "✅ Background Saved Successfully!",
            description: `Background applied and saved to database`,
            duration: 2000,
          });
        } catch (error) {
          console.error('Error saving background:', error);
          toast({
            title: "❌ Background Save Failed",
            description: "Background changed locally but failed to save",
            variant: "destructive"
          });
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleGradientChange = async (gradient: string) => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        setIsSaving(true);
        
        // Update DOM immediately
        if (gradient === 'transparent') {
          element.style.background = 'transparent';
          element.style.backgroundImage = 'none';
        } else {
          element.style.background = gradient;
          element.style.backgroundImage = gradient;
        }
        
        // Save to database
        try {
          await savePageSetting({
            setting_key: `${selectedElement}_background`,
            setting_value: gradient,
            category: 'page_editor',
            page_scope: pageScope,
            created_by: user?.id || ''
          });
          setLastSaveTime(new Date());
          
          toast({
            title: "✅ Gradient Saved Successfully!",
            description: `Gradient applied and saved to database`,
            duration: 2000,
          });
        } catch (error) {
          console.error('Error saving gradient:', error);
          toast({
            title: "❌ Gradient Save Failed",
            description: "Gradient changed locally but failed to save",
            variant: "destructive"
          });
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleTextGradientChange = async (gradient: string) => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        setIsSaving(true);
        
        // Update DOM immediately with text gradient effect
        if (gradient === 'transparent' || gradient === 'none') {
          // Reset to normal text
          element.style.background = 'unset';
          element.style.webkitBackgroundClip = 'unset';
          element.style.backgroundClip = 'unset';
          element.style.webkitTextFillColor = 'unset';
          element.style.color = '';
        } else {
          // Apply gradient to text
          element.style.background = gradient;
          element.style.webkitBackgroundClip = 'text';
          element.style.backgroundClip = 'text';
          element.style.webkitTextFillColor = 'transparent';
          element.style.color = 'transparent';
        }
        
        // Save to database
        try {
          await savePageSetting({
            setting_key: `${selectedElement}_text_gradient`,
            setting_value: gradient,
            category: 'page_editor',
            page_scope: pageScope,
            created_by: user?.id || ''
          });
          setLastSaveTime(new Date());
          
          toast({
            title: "✅ Text Gradient Saved Successfully!",
            description: `Text gradient applied and saved to database`,
            duration: 2000,
          });
        } catch (error) {
          console.error('Error saving text gradient:', error);
          toast({
            title: "❌ Text Gradient Save Failed",
            description: "Text gradient changed locally but failed to save",
            variant: "destructive"
          });
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  // Image change handler
  const handleImageChange = async (imageUrl: string) => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        // Store original value if not already stored
        let originalValue = '';
        if (element.tagName === 'IMG') {
          originalValue = element.getAttribute('data-original-src') || (element as HTMLImageElement).src || '';
          if (!element.getAttribute('data-original-src')) {
            element.setAttribute('data-original-src', (element as HTMLImageElement).src);
          }
          // Update DOM immediately for preview
          (element as HTMLImageElement).src = imageUrl;
        } else {
          originalValue = element.getAttribute('data-original-bg-image') || element.style.backgroundImage || '';
          if (!element.getAttribute('data-original-bg-image')) {
            element.setAttribute('data-original-bg-image', element.style.backgroundImage || 'none');
          }
          // Update DOM immediately for preview
          element.style.backgroundImage = `url(${imageUrl})`;
          element.style.backgroundSize = 'cover';
          element.style.backgroundPosition = 'center';
        }
        
        // Add to pending changes
        setPendingChanges(prev => new Map(prev.set(`${selectedElement}_image`, {
          type: 'image',
          value: imageUrl,
          elementId: selectedElement,
          originalValue: originalValue || undefined
        })));
        
        toast({
          title: "🖼️ Image Preview Applied",
          description: "Click 'Save Changes' to make it permanent",
          duration: 2000,
        });
      }
    }
  };

  // Preview and Save functions
  const handlePreviewChanges = () => {
    if (pendingChanges.size === 0) {
      toast({
        title: "No Changes to Preview",
        description: "Make some changes first, then preview them",
        duration: 2000,
      });
      return;
    }
    
    toast({
      title: "🔍 Preview Mode Active",
      description: `${pendingChanges.size} changes are being previewed`,
      duration: 3000,
    });
  };

  const handleSaveChanges = async () => {
    if (pendingChanges.size === 0) {
      toast({
        title: "No Changes to Save",
        description: "Make some changes first, then save them",
        duration: 2000,
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Save all pending changes to database
      const savePromises = Array.from(pendingChanges.entries()).map(async ([key, change]) => {
        switch (change.type) {
          case 'text':
            return updateElementContent(change.elementId || key, change.value);
          
          case 'font-size':
          case 'color':
          case 'background':
          case 'image':
            return savePageSetting({
              setting_key: key,
              setting_value: change.value,
              category: 'page_editor',
              page_scope: pageScope,
              created_by: user?.id || ''
            });
          
          default:
            console.warn('Unknown change type:', change.type);
        }
      });

      await Promise.all(savePromises);
      
      // Clear pending changes
      setPendingChanges(new Map());
      setLastSaveTime(new Date());
      
      toast({
        title: "✅ All Changes Saved!",
        description: `Successfully saved ${savePromises.length} changes to the database`,
        duration: 4000,
      });
      
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "❌ Save Failed",
        description: "Some changes failed to save to the database",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    // Restore original values
    pendingChanges.forEach((change, key) => {
      const elementId = change.elementId || key.split('_')[0];
      const element = document.querySelector(`[data-editable="${elementId}"]`) as HTMLElement;
      
      if (element && change.originalValue) {
        switch (change.type) {
          case 'text':
            element.textContent = change.originalValue;
            break;
          case 'color':
            element.style.color = change.originalValue;
            break;
          case 'font-size':
            element.style.fontSize = change.originalValue;
            break;
          case 'background':
            element.style.background = change.originalValue;
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
    <EditorLayout>
      <div className="flex flex-col h-screen bg-gray-900 text-white">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            <div className="text-lg font-semibold text-neonCyan">
              {pageName} Editor
            </div>
            <div className="text-sm text-gray-400">
              Scope: {pageScope}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Preview/Save buttons - NEW */}
            {pendingChanges.size > 0 && (
              <>
                <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
                  <span className="text-yellow-400 text-xs font-medium">
                    {pendingChanges.size} pending changes
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewChanges}
                  className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                  disabled={isSaving}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Changes
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveChanges}
                  className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                  disabled={isSaving}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                
                <Button
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
            
            {isSaving && (
              <div className="flex items-center space-x-2 text-yellow-400">
                <Clock className="w-4 h-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/', '_blank')}
              className="border-gray-600 text-gray-300 hover:text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Site
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4 bg-gray-800 border-b border-gray-600" style={{ top: '4rem' }}>
          <div className="flex items-center space-x-2">
            {enabledTools.map((tool) => {
              const toolConfig = {
                select: { icon: MousePointer, label: 'Select', color: 'bg-blue-600' },
                text: { icon: Type, label: 'Text', color: 'bg-green-600' },
                color: { icon: Palette, label: 'Color', color: 'bg-purple-600' },
                image: { icon: ImageIcon, label: 'Image', color: 'bg-orange-600' }
              }[tool];

              const Icon = toolConfig.icon;
              
              return (
                <Button
                  key={tool}
                  size="sm"
                  variant={selectedTool === tool ? 'default' : 'outline'}
                  onClick={() => handleToolSelect(tool)}
                  className={
                    selectedTool === tool 
                      ? `${toolConfig.color} text-white hover:opacity-80` 
                      : 'border-gray-500 text-gray-300 hover:text-white hover:border-gray-400'
                  }
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {toolConfig.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Tool Panels */}
        {/* Text Tool Panel */}
        {selectedTool === 'text' && selectedElement && (
          <div className="fixed left-0 right-0 z-40 bg-gray-800 border-b border-gray-600 px-4 py-4 shadow-lg" style={{ top: '8rem' }}>
            <div className="space-y-4">
              {/* Sub-tool Selection */}
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-300 font-medium">Text Tools:</div>
                <Button
                  size="sm"
                  variant={selectedTextSubTool === 'content' ? 'default' : 'outline'}
                  onClick={() => setSelectedTextSubTool('content')}
                  className={selectedTextSubTool === 'content' ? 'bg-neonPink text-black' : 'border-gray-500 text-gray-300'}
                >
                  📝 Content
                </Button>
                <Button
                  size="sm"
                  variant={selectedTextSubTool === 'font-size' ? 'default' : 'outline'}
                  onClick={() => setSelectedTextSubTool('font-size')}
                  className={selectedTextSubTool === 'font-size' ? 'bg-neonPink text-black' : 'border-gray-500 text-gray-300'}
                >
                  📏 Font Size
                </Button>
              </div>

              {/* Content Editing */}
              {selectedTextSubTool === 'content' && (
                <div className="flex items-center space-x-4">
                  {!editingText ? (
                    <Button
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
                        onClick={handleTextSave}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={() => setEditingText(false)}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Font Size Controls */}
              {selectedTextSubTool === 'font-size' && (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-300 font-medium">Font Size:</div>
                  <div className="flex space-x-2">
                    {['12', '14', '16', '18', '20', '24', '28', '32', '36', '48'].map((size) => (
                      <Button
                        key={size}
                        size="sm"
                        variant="outline"
                        onClick={() => handleFontSizeChange(size)}
                        className="border-gray-500 text-gray-300 hover:bg-neonPink hover:text-black"
                      >
                        {size}px
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Color Tool Panel */}
        {selectedTool === 'color' && selectedElement && (
          <div className="fixed left-0 right-0 z-40 bg-gray-800 border-b border-gray-600 px-4 py-4 shadow-lg" style={{ top: '8rem' }}>
            <div className="space-y-4">
              {/* Sub-tool Selection */}
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-300 font-medium">Color Tools:</div>
                <Button
                  size="sm"
                  variant={selectedColorSubTool === 'text-color' ? 'default' : 'outline'}
                  onClick={() => setSelectedColorSubTool('text-color')}
                  className={selectedColorSubTool === 'text-color' ? 'bg-neonPink text-black' : 'border-gray-500 text-gray-300'}
                >
                  📝 Text Color
                </Button>
                <Button
                  size="sm"
                  variant={selectedColorSubTool === 'text-gradient' ? 'default' : 'outline'}
                  onClick={() => setSelectedColorSubTool('text-gradient')}
                  className={selectedColorSubTool === 'text-gradient' ? 'bg-neonPink text-black' : 'border-gray-500 text-gray-300'}
                >
                  ✨ Text Gradient
                </Button>
                <Button
                  size="sm"
                  variant={selectedColorSubTool === 'background-color' ? 'default' : 'outline'}
                  onClick={() => setSelectedColorSubTool('background-color')}
                  className={selectedColorSubTool === 'background-color' ? 'bg-neonPink text-black' : 'border-gray-500 text-gray-300'}
                >
                  🎨 Background
                </Button>
                <Button
                  size="sm"
                  variant={selectedColorSubTool === 'gradient' ? 'default' : 'outline'}
                  onClick={() => setSelectedColorSubTool('gradient')}
                  className={selectedColorSubTool === 'gradient' ? 'bg-neonPink text-black' : 'border-gray-500 text-gray-300'}
                >
                  🌈 Gradient
                </Button>
              </div>

              {/* Text Color Controls */}
              {selectedColorSubTool === 'text-color' && (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-300 font-medium">Text Colors:</div>
                  <div className="flex space-x-2">
                    {['#FFFFFF', '#000000', '#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#3BCEAC', '#3B82F6', '#8B5CF6', '#EC4899'].map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className="w-8 h-8 rounded border-2 border-gray-500 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowAdvancedColorPicker(true)}
                    className="bg-neonCyan text-black hover:bg-neonCyan/80"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Advanced
                  </Button>
                </div>
              )}

              {/* Text Gradient Controls */}
              {selectedColorSubTool === 'text-gradient' && (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-300 font-medium">Text Gradient Presets:</div>
                  <div className="flex space-x-2">
                    {[
                      'linear-gradient(45deg, #FF6B35, #F7931E)',
                      'linear-gradient(45deg, #06FFA5, #3BCEAC)',
                      'linear-gradient(45deg, #8B5CF6, #EC4899)',
                      'linear-gradient(45deg, #3B82F6, #06B6D4)',
                      'linear-gradient(90deg, #FFD23F, #FF6B35)',
                      'linear-gradient(135deg, #667eea, #764ba2)',
                      'linear-gradient(90deg, #f093fb, #f5576c)'
                    ].map((gradient, index) => (
                      <button
                        key={index}
                        onClick={() => handleTextGradientChange(gradient)}
                        className="w-12 h-8 rounded border-2 border-gray-500 hover:scale-110 transition-transform"
                        style={{ background: gradient }}
                        title="Apply this gradient to text"
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleTextGradientChange('none')}
                    className="bg-gray-600 text-white hover:bg-gray-500"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowGradientPicker(true)}
                    className="bg-neonPink text-black hover:bg-neonPink/80"
                  >
                    <Pipette className="w-4 h-4 mr-2" />
                    Custom
                  </Button>
                </div>
              )}

              {/* Background Color Controls */}
              {selectedColorSubTool === 'background-color' && (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-300 font-medium">Background Colors:</div>
                  <div className="flex space-x-2">
                    {['transparent', '#1F2937', '#374151', '#4B5563', '#FF6B35', '#F7931E', '#06FFA5', '#3B82F6', '#8B5CF6'].map((bg) => (
                      <button
                        key={bg}
                        onClick={() => handleBackgroundChange(bg)}
                        className="w-8 h-8 rounded border-2 border-gray-500 hover:scale-110 transition-transform"
                        style={{ backgroundColor: bg === 'transparent' ? 'transparent' : bg }}
                      >
                        {bg === 'transparent' && <div className="w-full h-full bg-gradient-to-br from-red-500 to-blue-500 opacity-20 rounded" />}
                      </button>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowAdvancedColorPicker(true)}
                    className="bg-neonCyan text-black hover:bg-neonCyan/80"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Advanced
                  </Button>
                </div>
              )}

              {/* Gradient Controls */}
              {selectedColorSubTool === 'gradient' && (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-300 font-medium">Gradient Presets:</div>
                  <div className="flex space-x-2">
                    {[
                      'linear-gradient(to right, #FF6B35, #F7931E)',
                      'linear-gradient(to right, #06FFA5, #3BCEAC)',
                      'linear-gradient(to right, #8B5CF6, #EC4899)',
                      'linear-gradient(45deg, #3B82F6, #06B6D4)',
                      'radial-gradient(circle, #FF6B35, #1F2937)'
                    ].map((gradient, index) => (
                      <button
                        key={index}
                        onClick={() => handleGradientChange(gradient)}
                        className="w-12 h-8 rounded border-2 border-gray-500 hover:scale-110 transition-transform"
                        style={{ background: gradient }}
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowGradientPicker(true)}
                    className="bg-neonPink text-black hover:bg-neonPink/80"
                  >
                    <Pipette className="w-4 h-4 mr-2" />
                    Custom
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image Tool Panel */}
        {selectedTool === 'image' && selectedElement && (
          <div className="fixed left-0 right-0 z-40 bg-gray-800 border-b border-gray-600 px-4 py-4 shadow-lg" style={{ top: '8rem' }}>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300 font-medium">Image Tools:</div>
              <Button
                onClick={() => setShowEnhancedImageEditor(true)}
                className="bg-neonCyan text-black hover:bg-neonCyan/80"
              >
                <Upload className="w-4 h-4 mr-2" />
                Edit Image
              </Button>
            </div>
          </div>
        )}

        {/* Status Bar */}
        {selectedElement && (
          <div 
            className="fixed left-0 right-0 bg-gray-800 border-t border-gray-600 px-4 py-3 z-30" 
            style={{ 
                 top: selectedTool === 'text' && selectedElement || 
                      selectedTool === 'color' && selectedElement ||
                      selectedTool === 'image' && selectedElement
                      ? '12rem' : '8rem' 
               }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neonCyan rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Selected:</span>
                <strong className="text-neonCyan text-base">{selectedElement}</strong>
              </div>
              <div className="flex items-center space-x-4">
                {selectedTool !== 'select' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Active Tool:</span>
                    <span className="px-2 py-1 bg-neonPink text-black text-xs font-bold rounded">
                      {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)}
                    </span>
                  </div>
                )}
                {lastSaveTime && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">
                      Last saved: {lastSaveTime.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Page Content - Add proper top padding to account for sticky elements */}
        <div className="flex-1 overflow-auto" style={{ 
          paddingTop: selectedElement ? 
            (selectedTool === 'text' || selectedTool === 'color' || selectedTool === 'image' ? '16rem' : '12rem') 
            : '8rem' 
        }}>
          {children}
        </div>

        {/* Advanced Tool Modals */}
        {showAdvancedColorPicker && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <AdvancedColorPicker
              color="#FF6B35"
              onChange={(color) => {
                if (selectedTool === 'color') {
                  if (selectedColorSubTool === 'text-color') {
                    handleColorChange(color);
                  } else if (selectedColorSubTool === 'background-color') {
                    handleBackgroundChange(color);
                  }
                }
                setShowAdvancedColorPicker(false);
              }}
              onClose={() => setShowAdvancedColorPicker(false)}
            />
          </div>
        )}

        {showGradientPicker && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <GradientPicker
              value=""
              onChange={(gradient) => {
                if (selectedColorSubTool === 'text-gradient') {
                  handleTextGradientChange(gradient);
                } else if (selectedColorSubTool === 'gradient') {
                  handleGradientChange(gradient);
                }
                setShowGradientPicker(false);
              }}
              onClose={() => setShowGradientPicker(false)}
            />
          </div>
        )}

        {showEnhancedImageEditor && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <EnhancedImageEditor
              currentImageUrl={(() => {
                if (selectedElement) {
                  const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
                  if (element) {
                    if (element.tagName === 'IMG') {
                      return (element as HTMLImageElement).src;
                    } else {
                      // Extract URL from background-image
                      const bgImage = element.style.backgroundImage;
                      const match = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/);
                      return match ? match[1] : '';
                    }
                  }
                }
                return '';
              })()}
              elementId={selectedElement || undefined}
              elementType={selectedElement?.includes('icon') ? 'icon' : selectedElement?.includes('background') ? 'background' : 'image'}
              onImageChange={(imageUrl: string) => {
                handleImageChange(imageUrl);
                setShowEnhancedImageEditor(false);
              }}
              onClose={() => setShowEnhancedImageEditor(false)}
            />
          </div>
        )}
      </div>
    </EditorLayout>
  );
}
