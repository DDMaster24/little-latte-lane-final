'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePageEditor } from '@/hooks/usePageEditor';
import { PageEditorQueries } from '@/lib/queries/PageEditorQueries';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  MousePointer,
  Type,
  Palette,
  Move,
  AlignCenter
} from 'lucide-react';

// Import the homepage component
import HomePage from '@/app/page';

interface HomepageEditorInterfaceProps {
  placeholder?: never;
}

export default function HomepageEditorInterface({}: HomepageEditorInterfaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isAdmin, isLoading } = usePageEditor('homepage');
  
  // Tool states - Photoshop style
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'color' | 'font' | 'size'>('select');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#00ffff');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Initialize PageEditorQueries
  const pageQueries = new PageEditorQueries();

  const handleBack = () => {
    router.push('/admin/page-editor');
  };

  const handleSave = async () => {
    try {
      // Save logic here
      setHasChanges(false);
      toast({
        title: "Changes Saved",
        description: "Your page edits have been saved successfully.",
        duration: 3000,
      });
    } catch (_error) {
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Load existing styles when element is selected
  const loadElementStyles = async (elementId: string) => {
    try {
      const existingStyles = await pageQueries.getElementStyles('homepage', elementId);
      if (existingStyles && existingStyles.setting_value.color) {
        setCurrentColor(existingStyles.setting_value.color as string);
      }
    } catch (error) {
      console.error('Error loading element styles:', error);
    }
  };

  const handleElementClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const editableElement = target.closest('[data-editable]');
    
    if (editableElement) {
      const elementId = editableElement.getAttribute('data-editable');
      if (elementId) {
        setSelectedElement(elementId);
        setHasChanges(true);
        
        // Load existing styles for this element
        loadElementStyles(elementId);
        
        // Add selected class for persistent border
        document.querySelectorAll('[data-editable].selected').forEach(el => {
          el.classList.remove('selected');
        });
        editableElement.classList.add('selected');
        
        toast({
          title: "Element Selected",
          description: `Selected: ${elementId}`,
          duration: 2000,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-white">Loading page editor...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <Card className="p-8 bg-red-900/20 border-red-500">
          <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-gray-300">You need admin privileges to access the page editor.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg flex">
      {/* Left Toolbar */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
        {/* Toolbar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Badge variant="outline" className="text-neonCyan border-neonCyan">
              Homepage
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-neonCyan" />
            <h2 className="text-lg font-semibold text-white">Page Editor</h2>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={!hasChanges}
              className="border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-darkBg"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Photoshop-Style Tool Palette */}
        <div className="flex-1 p-4">
          <div className="bg-gray-800 rounded-lg p-3 space-y-2">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Tools</h3>
            
            {/* Tool Buttons - Photoshop Style */}
            <div className="grid grid-cols-2 gap-2">
              {/* Select Tool */}
              <button
                onClick={() => setActiveTool('select')}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  activeTool === 'select'
                    ? 'bg-neonCyan/20 border-neonCyan text-neonCyan'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
                title="Select Tool"
              >
                <MousePointer className="h-5 w-5 mx-auto" />
              </button>

              {/* Text Tool */}
              <button
                onClick={() => setActiveTool('text')}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  activeTool === 'text'
                    ? 'bg-neonCyan/20 border-neonCyan text-neonCyan'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
                title="Text Tool"
              >
                <Type className="h-5 w-5 mx-auto" />
              </button>

              {/* Color Tool */}
              <button
                onClick={() => setActiveTool('color')}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  activeTool === 'color'
                    ? 'bg-neonCyan/20 border-neonCyan text-neonCyan'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
                title="Color Tool"
              >
                <Palette className="h-5 w-5 mx-auto" />
              </button>

              {/* Move Tool */}
              <button
                onClick={() => setActiveTool('size')}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  activeTool === 'size'
                    ? 'bg-neonCyan/20 border-neonCyan text-neonCyan'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
                title="Size Tool"
              >
                <AlignCenter className="h-5 w-5 mx-auto" />
              </button>
            </div>
            
            {/* Tool Name Display */}
            <div className="mt-4 text-center">
              <span className="text-xs text-gray-400 capitalize">{activeTool} Tool</span>
            </div>
          </div>

          {/* Selected Element Info */}
          {selectedElement && (
            <div className="mt-4 bg-gray-800 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Element</h4>
              <div className="text-xs text-neonCyan font-mono bg-gray-900 p-2 rounded">
                {selectedElement}
              </div>
            </div>
          )}

          {/* Tool Properties Panel */}
          {activeTool === 'color' && selectedElement && (
            <div className="mt-4 bg-gray-800 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Color Properties</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="w-full h-8 rounded border border-gray-600 bg-gray-700"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full bg-neonCyan text-darkBg hover:bg-neonCyan/80"
                  onClick={async () => {
                    try {
                      // Save color to database
                      const success = await pageQueries.saveElementStyles(
                        'homepage', 
                        selectedElement, 
                        { color: currentColor }
                      );
                      
                      if (success) {
                        setHasChanges(true);
                        
                        // Apply the color immediately to the DOM element
                        const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
                        if (element) {
                          element.style.color = currentColor;
                        }
                        
                        toast({
                          title: "Color Applied",
                          description: `Element color updated to ${currentColor}`,
                        });
                      } else {
                        toast({
                          title: "Error",
                          description: "Failed to save color changes",
                          variant: "destructive"
                        });
                      }
                    } catch (error) {
                      console.error('Error applying color:', error);
                      toast({
                        title: "Error",
                        description: "Failed to apply color",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Apply Color
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Editing Mode Active
            </span>
            {hasChanges && (
              <span className="text-neonPink">Unsaved Changes</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Homepage Preview</h1>
              <p className="text-sm text-gray-400">Click any element to edit it</p>
            </div>
            {selectedElement && (
              <Badge variant="outline" className="text-neonCyan border-neonCyan">
                Selected: {selectedElement}
              </Badge>
            )}
          </div>
        </div>

        {/* Homepage Preview */}
        <div 
          className="bg-darkBg editing-mode"
          onClick={handleElementClick}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Global CSS Styles for Edit Mode */}
          <style dangerouslySetInnerHTML={{
            __html: `
              .editing-mode [data-editable] {
                position: relative;
                transition: all 0.3s ease;
                border-radius: 8px;
              }
              
              .editing-mode [data-editable]:hover {
                box-shadow: 0 0 0 2px #00ffff, 0 4px 20px rgba(0, 255, 255, 0.3) !important;
                transform: translateY(-2px) !important;
                cursor: pointer !important;
              }
              
              .editing-mode [data-editable].selected {
                box-shadow: 0 0 0 2px #ff00ff, 0 4px 20px rgba(255, 0, 255, 0.3) !important;
                transform: translateY(-2px) !important;
              }
              
              @keyframes fadeIn {
                from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
              }
            `
          }} />
          
          {/* Render the actual homepage */}
          <HomePage />
        </div>
      </div>
    </div>
  );
}
