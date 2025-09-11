'use client';

import { useContext, useEffect } from 'react';
import { EditorContext, SelectionContext } from '../../contexts/EditorContext';

export const TestImagePlaceholder = () => {
  const isInEditor = useContext(EditorContext);
  const { selectedComponent, setSelectedComponent } = useContext(SelectionContext);
  
  const isSelected = selectedComponent === 'TestImagePlaceholder';
  const componentId = 'TestImagePlaceholder';
  const componentType = 'image';

  // Debug: Log context values
  useEffect(() => {
    console.log('🔍 TestImagePlaceholder context values:', { 
      isInEditor, 
      selectedComponent, 
      setSelectedComponent: typeof setSelectedComponent 
    });
  }, [isInEditor, selectedComponent, setSelectedComponent]);

  const handleComponentClick = (e: React.MouseEvent) => {
    if (isInEditor) {
      e.stopPropagation();
      console.log('🎯 Image component clicked! isInEditor:', isInEditor, 'isSelected:', isSelected);
      
      if (!isSelected) {
        console.log('🎯 Selecting image component:', componentId);
        setSelectedComponent(componentId);
      }
    }
  };

  return (
    <div
      onClick={handleComponentClick}
      className={`
        relative w-full max-w-md mx-auto h-64 
        bg-gray-800 border-2 border-dashed border-gray-600
        flex items-center justify-center
        ${isInEditor ? 'cursor-pointer' : ''}
        ${isSelected ? 'ring-2 ring-red-500 ring-offset-2' : ''}
        ${isInEditor && !isSelected ? 'hover:ring-2 hover:ring-orange-400 hover:ring-offset-1' : ''}
        transition-all duration-200
      `}
      data-component-id={componentId}
      data-component-type={componentType}
    >
      <div className="text-center text-gray-400">
        <div className="text-4xl mb-2">📷</div>
        <div className="text-sm">Click to Upload Image</div>
        {isInEditor && (
          <div className="text-xs mt-1 text-gray-500">
            (Image Component - Click to Edit)
          </div>
        )}
      </div>
    </div>
  );
};
