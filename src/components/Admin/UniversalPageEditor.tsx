'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePageEditor } from '@/hooks/usePageEditor';
import { useAuth } from '@/components/AuthProvider';
import EditorLayout from '@/components/Admin/EditorLayout';
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
  Upload
} from 'lucide-react';
import AdvancedColorPicker from './AdvancedColorPicker';
import GradientPicker from './GradientPicker';
import ImageUploader from './ImageUploader';

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
  
  // Modal states
  const [showAdvancedColorPicker, setShowAdvancedColorPicker] = useState(false);
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);

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
    setShowImageUploader(false);
    
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
        setIsSaving(true);
        
        // Update DOM immediately
        element.textContent = textValue;
        
        // Save to database
        try {
          await updateElementContent(selectedElement, textValue);
          setEditingText(false);
          setLastSaveTime(new Date());
          
          toast({
            title: "✅ Text Saved Successfully!",
            description: "Changes have been saved to the database",
            duration: 3000,
          });
        } catch (error) {
          console.error('Error saving text:', error);
          toast({
            title: "❌ Save Failed",
            description: "Text updated locally but failed to save to database",
            variant: "destructive"
          });
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  // Font size change handler
  const handleFontSizeChange = async (size: string) => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        setIsSaving(true);
        
        // Update DOM immediately
        element.style.fontSize = `${size}px`;
        
        // Save to database
        try {
          await savePageSetting({
            setting_key: `${selectedElement}_font_size`,
            setting_value: size,
            category: 'page_editor',
            page_scope: pageScope,
            created_by: user?.id || ''
          });
          setLastSaveTime(new Date());
          
          toast({
            title: "✅ Font Size Saved!",
            description: `Font size updated to ${size}px`,
            duration: 2000,
          });
        } catch (error) {
          console.error('Error saving font size:', error);
          toast({
            title: "❌ Font Size Save Failed",
            description: "Font size changed locally but failed to save",
            variant: "destructive"
          });
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  // Color change handlers
  const handleColorChange = async (color: string) => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        setIsSaving(true);
        
        // Update DOM immediately
        element.style.color = color;
        
        // Save to database
        try {
          await savePageSetting({
            setting_key: `${selectedElement}_color`,
            setting_value: color,
            category: 'page_editor',
            page_scope: pageScope,
            created_by: user?.id || ''
          });
          setLastSaveTime(new Date());
          
          toast({
            title: "✅ Color Saved Successfully!",
            description: `Color applied and saved to database`,
            duration: 2000,
          });
        } catch (error) {
          console.error('Error saving color:', error);
          toast({
            title: "❌ Color Save Failed",
            description: "Color changed locally but failed to save",
            variant: "destructive"
          });
        } finally {
          setIsSaving(false);
        }
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
        setIsSaving(true);
        
        // Update DOM immediately
        if (element.tagName === 'IMG') {
          (element as HTMLImageElement).src = imageUrl;
        } else {
          element.style.backgroundImage = `url(${imageUrl})`;
        }
        
        // Save to database
        try {
          await savePageSetting({
            setting_key: `${selectedElement}_image`,
            setting_value: imageUrl,
            category: 'page_editor',
            page_scope: pageScope,
            created_by: user?.id || ''
          });
          setLastSaveTime(new Date());
          
          toast({
            title: "✅ Image Saved Successfully!",
            description: `Image uploaded and saved to database`,
            duration: 2000,
          });
        } catch (error) {
          console.error('Error saving image:', error);
          toast({
            title: "❌ Image Save Failed",
            description: "Image changed locally but failed to save",
            variant: "destructive"
          });
        } finally {
          setIsSaving(false);
        }
      }
    }
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
              Preview
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-center p-4 bg-gray-800 border-b border-gray-600">
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
          <div className="fixed top-16 left-0 right-0 z-40 bg-gray-800 border-b border-gray-600 px-4 py-4 shadow-lg">
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
          <div className="fixed top-16 left-0 right-0 z-40 bg-gray-800 border-b border-gray-600 px-4 py-4 shadow-lg">
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
          <div className="fixed top-16 left-0 right-0 z-40 bg-gray-800 border-b border-gray-600 px-4 py-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300 font-medium">Image Tools:</div>
              <Button
                onClick={() => setShowImageUploader(true)}
                className="bg-neonCyan text-black hover:bg-neonCyan/80"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>
        )}

        {/* Status Bar */}
        {selectedElement && (
          <div 
            className="fixed left-0 right-0 bg-gray-800 border-t border-gray-600 px-4 py-3 z-30" 
            style={{ 
                 top: editingText || 
                      (selectedTool === 'text' && selectedElement) || 
                      (selectedTool === 'color' && selectedElement) 
                      ? '8rem' : '4rem' 
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
        <div className="flex-1 overflow-auto" style={{ paddingTop: selectedElement ? '10rem' : '5rem' }}>
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

        {showImageUploader && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <ImageUploader
              onImageChange={(imageUrl: string) => {
                handleImageChange(imageUrl);
                setShowImageUploader(false);
              }}
              onClose={() => setShowImageUploader(false)}
            />
          </div>
        )}
      </div>
    </EditorLayout>
  );
}
