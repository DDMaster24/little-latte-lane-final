'use client';

import { useContext, useEffect } from 'react';
import { EditorContext, SelectionContext } from '../../contexts/EditorContext';

export const TestBackgroundPanel = () => {
  const isInEditor = useContext(EditorContext);
  const { selectedComponent, setSelectedComponent } = useContext(SelectionContext);
  
  const isSelected = selectedComponent === 'TestBackgroundPanel';
  const componentId = 'TestBackgroundPanel';
  const componentType = 'background';

  // Debug: Log context values
  useEffect(() => {
    console.log('🔍 TestBackgroundPanel context values:', { 
      isInEditor, 
      selectedComponent, 
      setSelectedComponent: typeof setSelectedComponent 
    });
  }, [isInEditor, selectedComponent, setSelectedComponent]);

  const handleComponentClick = (e: React.MouseEvent) => {
    if (isInEditor) {
      e.stopPropagation();
      console.log('🎯 Background Panel clicked! isInEditor:', isInEditor, 'isSelected:', isSelected);
      
      if (!isSelected) {
        console.log('🎯 Selecting background panel:', componentId);
        setSelectedComponent(componentId);
      }
    }
  };

  return (
    <div
      onClick={handleComponentClick}
      className={`
        relative w-full min-h-[200px] bg-black
        ${isInEditor ? 'cursor-pointer' : ''}
        ${isSelected ? 'ring-2 ring-red-500 ring-offset-2' : ''}
        ${isInEditor && !isSelected ? 'hover:ring-2 hover:ring-orange-400 hover:ring-offset-1' : ''}
        transition-all duration-200
      `}
      data-component-id={componentId}
      data-component-type={componentType}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: -1, // Behind other content
      }}
    >
      {isInEditor && (
        <div className="absolute top-2 left-2 text-xs text-gray-400 pointer-events-none">
          Background Panel (Click to Edit)
        </div>
      )}
    </div>
  );
};
