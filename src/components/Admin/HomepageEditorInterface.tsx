'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePageEditor } from '@/hooks/usePageEditor';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Palette
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
  
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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

  const handleElementClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const editableElement = target.closest('[data-editable]');
    
    if (editableElement) {
      const elementId = editableElement.getAttribute('data-editable');
      if (elementId) {
        setSelectedElement(elementId);
        setHasChanges(true);
        
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

        {/* Editing Tools - Always Visible */}
        <div className="flex-1 p-4 space-y-4">
          <div className="border border-gray-700 rounded-lg p-3">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color & Style Tools
            </h3>
            <div className="space-y-2">
              <Button size="sm" variant="outline" className="w-full justify-start text-xs">
                Change Text Color
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs">
                Change Background
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs">
                Adjust Font Size
              </Button>
            </div>
          </div>
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
              
              .editing-mode [data-editable]:hover::after {
                content: 'Click to edit';
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #00ffff, #ff00ff);
                color: #000;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
                white-space: nowrap;
                z-index: 1000;
                animation: fadeIn 0.2s ease-in;
              }
              
              .editing-mode [data-editable].selected {
                box-shadow: 0 0 0 2px #ff00ff, 0 4px 20px rgba(255, 0, 255, 0.3) !important;
                transform: translateY(-2px) !important;
              }
              
              .editing-mode [data-editable].selected::after {
                content: 'Selected';
                background: linear-gradient(135deg, #ff00ff, #00ffff);
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
