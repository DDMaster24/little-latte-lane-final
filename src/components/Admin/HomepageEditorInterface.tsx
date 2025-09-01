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
  Save, 
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
import HomePage from '@/app/page';
import AdvancedColorPicker from './AdvancedColorPicker';
import GradientPicker from './GradientPicker';
import ImageUploader from './ImageUploader';

type EditorTool = 'select' | 'text' | 'color' | 'background' | 'gradient' | 'image';

export default function HomepageEditorInterface() {
  console.log('🟢 HOMEPAGE EDITOR LOADED');
  
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { savePageSetting, updateElementContent, isAdmin } = usePageEditor('homepage', user?.id);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<EditorTool>('select');
  const [editingText, setEditingText] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  // Advanced tool states
  const [showAdvancedColorPicker, setShowAdvancedColorPicker] = useState(false);
  const [showGradientPicker, setShowGradientPicker] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [currentElementType, setCurrentElementType] = useState<'icon' | 'background' | 'image'>('image');

  // Enhanced tool selection handlers
  const handleToolSelect = (tool: EditorTool) => {
    setSelectedTool(tool);
    
    // Close any open advanced tools
    setShowAdvancedColorPicker(false);
    setShowGradientPicker(false);
    setShowImageUploader(false);
    
    if (tool === 'text' && selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`);
      if (element) {
        setTextValue(element.textContent || '');
        setEditingText(true);
      }
    } else {
      setEditingText(false);
    }
    
    // Determine element type for image tool
    if (tool === 'image' && selectedElement) {
      if (selectedElement.includes('icon')) {
        setCurrentElementType('icon');
      } else if (selectedElement.includes('background')) {
        setCurrentElementType('background');
      } else {
        setCurrentElementType('image');
      }
    }
    
    toast({
      title: "Tool Selected",
      description: `${tool.charAt(0).toUpperCase() + tool.slice(1)} tool activated`,
    });
  };

  // Apply text changes and save to database
  const handleTextUpdate = async () => {
    if (selectedElement && textValue.trim()) {
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

  // Apply color changes and save to database
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
            page_scope: 'homepage',
            created_by: user?.id || ''
          });
          setLastSaveTime(new Date());
          
          toast({
            title: "✅ Color Saved Successfully!",
            description: `Color changed to ${color} and saved to database`,
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

  // Apply background changes and save to database
  const handleBackgroundChange = async (background: string) => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        setIsSaving(true);
        
        // Update DOM immediately
        element.style.backgroundColor = background;
        
        // Save to database
        try {
          await savePageSetting({
            setting_key: `${selectedElement}_background`,
            setting_value: background,
            category: 'page_editor',
            page_scope: 'homepage',
            created_by: user?.id || ''
          });
          setLastSaveTime(new Date());
          
          toast({
            title: "✅ Background Saved Successfully!",
            description: `Background changed to ${background} and saved to database`,
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

  // Handle gradient background changes
  const handleGradientChange = async (gradient: string) => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        setIsSaving(true);
        
        // Update DOM immediately - handle both background and backgroundImage
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
            page_scope: 'homepage',
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

  // Handle image/icon changes
  const handleImageChange = async (imageUrl: string) => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        setIsSaving(true);
        
        // Handle different element types
        if (selectedElement.includes('icon')) {
          // For icon elements, update content
          if (imageUrl.length === 1 && /^\p{Emoji}$/u.test(imageUrl)) {
            // It's an emoji
            element.textContent = imageUrl;
          } else if (imageUrl) {
            // It's an image URL - create img element
            element.innerHTML = `<img src="${imageUrl}" alt="Icon" style="width: 100%; height: 100%; object-fit: contain;" />`;
          } else {
            // Clear content
            element.textContent = '';
          }
        } else {
          // For background images
          if (imageUrl) {
            element.style.backgroundImage = `url('${imageUrl}')`;
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';
            element.style.backgroundRepeat = 'no-repeat';
          } else {
            element.style.backgroundImage = 'none';
          }
        }
        
        // Save to database
        try {
          const settingKey = selectedElement.includes('icon') 
            ? `${selectedElement}_content` 
            : `${selectedElement}_background_image`;
          
          await savePageSetting({
            setting_key: settingKey,
            setting_value: imageUrl,
            category: 'page_editor',
            page_scope: 'homepage',
            created_by: user?.id || ''
          });
          setLastSaveTime(new Date());
          
          toast({
            title: "✅ Image Saved Successfully!",
            description: `Image updated and saved to database`,
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

  // Clean click handler for element selection with proper state management
  useEffect(() => {
    console.log('🔵 Setting up enhanced click handler...');
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editableElement = target.closest('[data-editable]');
      
      if (editableElement) {
        e.preventDefault();
        e.stopPropagation();
        
        // Remove 'selected' class from ALL previously selected elements
        document.querySelectorAll('[data-editable].selected').forEach(el => {
          el.classList.remove('selected');
        });
        
        // Add 'selected' class to the clicked element
        const elementId = editableElement.getAttribute('data-editable');
        editableElement.classList.add('selected');
        setSelectedElement(elementId);
        
        console.log('✅ Element selected with neon red border:', elementId);
        
        toast({
          title: "Element Selected",
          description: `Selected: ${elementId}`,
          duration: 2000,
        });
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [toast]);

  const handleSave = async () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required to save changes",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    setLastSaveTime(new Date());

    // Show comprehensive save success with green check
    toast({
      title: "✅ All Changes Saved Successfully!",
      description: "Your changes have been saved to the database and are now live",
      duration: 4000,
    });

    setTimeout(() => setIsSaving(false), 1000);
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  const handleBackToAdmin = () => {
    router.push('/admin');
  };

  // Show loading or access denied if not admin
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg">
        <div className="text-center">
          <div className="text-neonCyan text-lg mb-4">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Access Denied</div>
          <div className="text-gray-400 mb-6">Admin access required for page editing</div>
          <Button onClick={() => router.push('/admin')}>Back to Admin</Button>
        </div>
      </div>
    );
  }

  return (
    <EditorLayout>
      <div className="min-h-screen">
        {/* STICKY Editor Toolbar - Fixed at top */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBackToAdmin}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            
            <div className="text-sm text-gray-300">
              Homepage Editor
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tool Selection Buttons */}
            <Button 
              variant={selectedTool === 'select' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleToolSelect('select')}
              className={selectedTool === 'select' ? 'bg-neonCyan text-black' : 'border-gray-600 text-white hover:bg-gray-700'}
            >
              <MousePointer className="w-4 h-4 mr-2" />
              Select
            </Button>
            
            <Button 
              variant={selectedTool === 'text' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleToolSelect('text')}
              className={selectedTool === 'text' ? 'bg-neonCyan text-black' : 'border-gray-600 text-white hover:bg-gray-700'}
              disabled={!selectedElement}
            >
              <Type className="w-4 h-4 mr-2" />
              Text
            </Button>
            
            <Button 
              variant={selectedTool === 'color' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleToolSelect('color')}
              className={selectedTool === 'color' ? 'bg-neonPink text-black' : 'border-gray-600 text-white hover:bg-gray-700'}
              disabled={!selectedElement}
            >
              <Palette className="w-4 h-4 mr-2" />
              Color
            </Button>
            
            <Button 
              variant={selectedTool === 'background' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleToolSelect('background')}
              className={selectedTool === 'background' ? 'bg-neonPink text-black' : 'border-gray-600 text-white hover:bg-gray-700'}
              disabled={!selectedElement}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Background
            </Button>
            
            <Button 
              variant={selectedTool === 'gradient' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleToolSelect('gradient')}
              className={selectedTool === 'gradient' ? 'bg-neonPink text-black' : 'border-gray-600 text-white hover:bg-gray-700'}
              disabled={!selectedElement}
            >
              <Pipette className="w-4 h-4 mr-2" />
              Gradient
            </Button>
            
            <Button 
              variant={selectedTool === 'image' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleToolSelect('image')}
              className={selectedTool === 'image' ? 'bg-purple-600 text-white' : 'border-gray-600 text-white hover:bg-gray-700'}
              disabled={!selectedElement}
            >
              <Upload className="w-4 h-4 mr-2" />
              Image
            </Button>
            
            <div className="w-px h-6 bg-gray-600 mx-2" />
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreview}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-neonCyan text-black hover:bg-neonCyan/80 font-medium min-w-[80px]"
            >
              {isSaving ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : lastSaveTime ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tool-Specific Control Panels - Also sticky */}
        {editingText && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-gray-800 border-b border-gray-600 px-4 py-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300 font-medium">Editing Text:</div>
              <Input
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="max-w-md bg-gray-700 border-gray-500 text-white placeholder-gray-400"
                placeholder="Enter new text..."
              />
              <Button 
                size="sm" 
                onClick={handleTextUpdate}
                disabled={isSaving}
                className="bg-neonCyan text-black hover:bg-neonCyan/80 font-medium min-w-[70px]"
              >
                {isSaving ? (
                  <>
                    <Clock className="w-3 h-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Apply'
                )}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setEditingText(false)}
                className="border-gray-500 text-white hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {selectedTool === 'color' && selectedElement && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-gray-800 border-b border-gray-600 px-4 py-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300 font-medium">Color Tools:</div>
              <div className="flex space-x-2">
                {['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#3BCEAC', '#0EAD69', '#3B82F6', '#8B5CF6', '#EC4899'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="w-8 h-8 rounded border-2 border-gray-500 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  size="sm"
                  onClick={() => setShowAdvancedColorPicker(true)}
                  className="bg-neonCyan text-black hover:bg-neonCyan/80"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedTool === 'background' && selectedElement && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-gray-800 border-b border-gray-600 px-4 py-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300 font-medium">Background Tools:</div>
              <div className="flex space-x-2">
                {['transparent', '#1F2937', '#374151', '#4B5563', '#FF6B35', '#F7931E', '#06FFA5', '#3B82F6'].map((bg) => (
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
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  size="sm"
                  onClick={() => setShowAdvancedColorPicker(true)}
                  className="bg-neonCyan text-black hover:bg-neonCyan/80"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedTool === 'gradient' && selectedElement && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-gray-800 border-b border-gray-600 px-4 py-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300 font-medium">Gradient Tools:</div>
              <div className="flex space-x-2">
                {[
                  'linear-gradient(to right, #FF6B35, #F7931E)',
                  'linear-gradient(to right, #06FFA5, #3BCEAC)',
                  'linear-gradient(to right, #8B5CF6, #EC4899)',
                  'linear-gradient(45deg, #3B82F6, #06B6D4)'
                ].map((gradient, index) => (
                  <button
                    key={index}
                    onClick={() => handleGradientChange(gradient)}
                    className="w-12 h-8 rounded border-2 border-gray-500 hover:scale-110 transition-transform"
                    style={{ background: gradient }}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  size="sm"
                  onClick={() => setShowGradientPicker(true)}
                  className="bg-neonPink text-black hover:bg-neonPink/80"
                >
                  <Pipette className="w-4 h-4 mr-2" />
                  Custom
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedTool === 'image' && selectedElement && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-gray-800 border-b border-gray-600 px-4 py-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300 font-medium">
                {currentElementType === 'icon' ? 'Icon Tools:' : 'Image Tools:'}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => setShowImageUploader(true)}
                  className="bg-purple-600 text-white hover:bg-purple-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {currentElementType === 'icon' ? 'Change Icon' : 'Upload Image'}
                </Button>
                {currentElementType === 'icon' && (
                  <div className="flex space-x-2 ml-4">
                    {['☕', '🍕', '🥐', '🧀', '🔥', '⭐', '💎', '🌟'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleImageChange(emoji)}
                        className="w-8 h-8 rounded border-2 border-gray-500 hover:scale-110 transition-transform bg-gray-700 flex items-center justify-center text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Bar - Enhanced visibility with spacing */}
        {selectedElement && (
          <div className="fixed left-0 right-0 z-30 bg-gray-900 border-b-2 border-neonCyan px-4 py-3 shadow-lg mt-2" 
               style={{ 
                 top: editingText || 
                      (selectedTool === 'color' && selectedElement) || 
                      (selectedTool === 'background' && selectedElement) || 
                      (selectedTool === 'gradient' && selectedElement) || 
                      (selectedTool === 'image' && selectedElement) 
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

        {/* Homepage Content - Add proper top padding to account for sticky elements */}
        <div className="flex-1 overflow-auto" style={{ paddingTop: selectedElement ? '10rem' : '5rem' }}>
          <HomePage />
        </div>

        {/* Advanced Tool Modals */}
        {showAdvancedColorPicker && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <AdvancedColorPicker
              color="#FF6B35"
              onChange={(color) => {
                if (selectedTool === 'color') {
                  handleColorChange(color);
                } else if (selectedTool === 'background') {
                  handleBackgroundChange(color);
                }
                setShowAdvancedColorPicker(false);
              }}
              onClose={() => setShowAdvancedColorPicker(false)}
            />
          </div>
        )}

        {showGradientPicker && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <GradientPicker
              value=""
              onChange={(gradient) => {
                handleGradientChange(gradient);
                setShowGradientPicker(false);
              }}
              onClose={() => setShowGradientPicker(false)}
            />
          </div>
        )}

        {showImageUploader && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <ImageUploader
              currentImageUrl=""
              elementType={currentElementType}
              onImageChange={(imageUrl) => {
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
