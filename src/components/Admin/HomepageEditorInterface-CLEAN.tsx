'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import EditorLayout from '@/components/Admin/EditorLayout';
import { ArrowLeft, Save, Eye, MousePointer } from 'lucide-react';
import HomePage from '@/app/page';

export default function HomepageEditorInterface() {
  console.log('🟢 CLEAN HOMEPAGE EDITOR LOADED');
  
  const router = useRouter();
  const { toast } = useToast();
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Simple click handler for element selection
  useEffect(() => {
    console.log('🔵 Setting up click handler...');
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editableElement = target.closest('[data-editable]');
      
      if (editableElement) {
        e.preventDefault();
        e.stopPropagation();
        
        const elementId = editableElement.getAttribute('data-editable');
        setSelectedElement(elementId);
        console.log('✅ Element selected:', elementId);
        
        toast({
          title: "Element Selected",
          description: `Selected: ${elementId}`,
        });
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [toast]);

  const handleSave = () => {
    toast({
      title: "Changes Saved",
      description: "Your changes have been saved successfully.",
    });
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  const handleBackToAdmin = () => {
    router.push('/admin');
  };

  return (
    <EditorLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Editor Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBackToAdmin}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            
            <div className="text-sm text-gray-600">
              Homepage Editor
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <MousePointer className="w-4 h-4 mr-2" />
              Select
            </Button>
            
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        {selectedElement && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm text-blue-700">
            Selected: <strong>{selectedElement}</strong>
          </div>
        )}

        {/* Homepage Content */}
        <div className="relative">
          <HomePage />
        </div>
      </div>
    </EditorLayout>
  );
}
