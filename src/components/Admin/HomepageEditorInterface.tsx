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
  Image as ImageIcon 
} from 'lucide-react';
import HomePage from '@/app/page';

type EditorTool = 'select' | 'text' | 'color' | 'background';

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

  // Tool selection handlers
  const handleToolSelect = (tool: EditorTool) => {
    setSelectedTool(tool);
    
    if (tool === 'text' && selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`);
      if (element) {
        setTextValue(element.textContent || '');
        setEditingText(true);
      }
    } else {
      setEditingText(false);
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
        // Update DOM immediately
        element.textContent = textValue;
        
        // Save to database
        try {
          await updateElementContent(selectedElement, textValue);
          setEditingText(false);
          toast({
            title: "Text Updated & Saved",
            description: "Element text has been updated and saved to database",
          });
        } catch (error) {
          console.error('Error saving text:', error);
          toast({
            title: "Text Updated (Save Failed)",
            description: "Text updated locally but failed to save to database",
            variant: "destructive"
          });
        }
      }
    }
  };

  // Apply color changes and save to database
  const handleColorChange = async (color: string) => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
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
          toast({
            title: "Color Applied & Saved",
            description: `Color changed to ${color} and saved`,
          });
        } catch (error) {
          console.error('Error saving color:', error);
          toast({
            title: "Color Applied (Save Failed)",
            description: "Color changed locally but failed to save",
            variant: "destructive"
          });
        }
      }
    }
  };

  // Apply background changes and save to database
  const handleBackgroundChange = async (background: string) => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
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
          toast({
            title: "Background Applied & Saved",
            description: `Background changed to ${background} and saved`,
          });
        } catch (error) {
          console.error('Error saving background:', error);
          toast({
            title: "Background Applied (Save Failed)",
            description: "Background changed locally but failed to save",
            variant: "destructive"
          });
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

    toast({
      title: "Changes Saved",
      description: "All changes have been automatically saved to the database",
    });
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
              className="bg-neonCyan text-black hover:bg-neonCyan/80"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Tool-Specific Control Panels - Also sticky */}
        {editingText && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-gray-700 border-b border-gray-600 px-4 py-3 flex items-center space-x-4">
            <div className="text-sm text-gray-300">Editing Text:</div>
            <Input
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              className="max-w-md bg-gray-600 border-gray-500 text-white"
              placeholder="Enter new text..."
            />
            <Button 
              size="sm" 
              onClick={handleTextUpdate}
              className="bg-neonCyan text-black hover:bg-neonCyan/80"
            >
              Apply
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
        )}

        {selectedTool === 'color' && selectedElement && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-gray-700 border-b border-gray-600 px-4 py-3 flex items-center space-x-4">
            <div className="text-sm text-gray-300">Color Tools:</div>
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
          </div>
        )}

        {selectedTool === 'background' && selectedElement && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-gray-700 border-b border-gray-600 px-4 py-3 flex items-center space-x-4">
            <div className="text-sm text-gray-300">Background Tools:</div>
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
          </div>
        )}

        {/* Status Bar - Also sticky, positioned below toolbar and panels */}
        {selectedElement && (
          <div className="fixed left-0 right-0 z-30 bg-blue-900/30 border-b border-blue-500/30 px-4 py-2 text-sm text-neonCyan" 
               style={{ top: editingText || (selectedTool === 'color' && selectedElement) || (selectedTool === 'background' && selectedElement) ? '7rem' : '4rem' }}>
            Selected: <strong className="text-white">{selectedElement}</strong>
            {selectedTool !== 'select' && (
              <span className="ml-4 text-neonPink">
                Tool: <strong>{selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)}</strong>
              </span>
            )}
          </div>
        )}

        {/* Homepage Content - Add top padding to account for sticky toolbar */}
        <div className="flex-1 overflow-auto" style={{ paddingTop: selectedElement ? '8rem' : '4rem' }}>
          <HomePage />
        </div>
      </div>
    </EditorLayout>
  );
}
