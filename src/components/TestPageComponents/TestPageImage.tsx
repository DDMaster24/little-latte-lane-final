'use client';

import { useState, useContext, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { EditorContext, SelectionContext } from '../../contexts/EditorContext';

// Test Image Component for testing image editing functionality
export const TestPageImage = () => {
  const [imageUrl, setImageUrl] = useState('/images/logo.svg');
  const [imageSize, setImageSize] = useState({ width: 200, height: 200 });
  const [isLoaded, setIsLoaded] = useState(false);
  
  const isInEditor = useContext(EditorContext);
  const { selectedComponent, setSelectedComponent } = useContext(SelectionContext);
  
  const isSelected = selectedComponent === 'TestPageImage';
  const componentId = 'TestPageImage';
  const componentType = 'image';

  const loadComponentData = async () => {
    try {
      const response = await fetch('/api/component-data');
      const data = await response.json();
      
      // Load image-specific data
      setImageUrl(data.imageUrl || '/images/logo.svg');
      setImageSize(data.imageSize || { width: 200, height: 200 });
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading image component data:', error);
      setImageUrl('/images/logo.svg');
      setImageSize({ width: 200, height: 200 });
      setIsLoaded(true);
    }
  };

  const handleComponentClick = () => {
    console.log('🖼️ Image component clicked! isInEditor:', isInEditor, 'isSelected:', isSelected);
    
    if (isInEditor) {
      console.log('🎯 Selecting image component:', componentId);
      setSelectedComponent(componentId);
    }
  };

  // Load initial values from API
  useEffect(() => {
    loadComponentData();
    
    // Refresh data every 2 seconds for real-time sync
    const interval = setInterval(loadComponentData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Function to save image data to database
  const saveImageData = useCallback(async (newImageUrl?: string, newImageSize?: { width: number; height: number }) => {
    try {
      const dataToSave = {
        imageUrl: newImageUrl || imageUrl,
        imageSize: newImageSize || imageSize
      };

      const response = await fetch('/api/component-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave)
      });

      if (!response.ok) {
        throw new Error('Failed to save image data');
      }

      console.log('✅ Image data saved successfully');
    } catch (error) {
      console.error('❌ Failed to save image data:', error);
    }
  }, [imageUrl, imageSize]);

  // Listen for external changes from tool panel
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE_COMPONENT_STYLE') {
        let newImageUrl = imageUrl;
        let newImageSize = imageSize;
        
        if (event.data.imageUrl !== undefined) {
          newImageUrl = event.data.imageUrl;
          setImageUrl(newImageUrl);
        }
        if (event.data.imageSize !== undefined) {
          newImageSize = event.data.imageSize;
          setImageSize(newImageSize);
        }
        
        // Auto-save changes to database
        saveImageData(newImageUrl, newImageSize);
      }
      if (event.data.type === 'RESET_COMPONENT') {
        // Reset to original values
        loadComponentData();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [saveImageData, imageUrl, imageSize]);

  // Helper function to get container styles
  const getContainerStyles = () => {
    const baseStyles: React.CSSProperties = {
      cursor: isInEditor ? 'pointer' : 'default',
      padding: isInEditor ? '8px' : '0',
      borderRadius: isInEditor ? '4px' : '0',
      transition: 'all 0.2s ease-in-out',
      border: 'none',
      display: 'inline-block'
    };

    // Editor-specific styles
    if (isInEditor) {
      if (isSelected) {
        // Selected state - RED border
        baseStyles.border = '2px solid #ff0000';
        baseStyles.boxShadow = '0 0 10px rgba(255, 0, 0, 0.3)';
        baseStyles.backgroundColor = 'rgba(255, 0, 0, 0.05)';
      } else {
        // Default editor state - will show orange on hover via CSS
        baseStyles.border = '2px solid transparent';
      }
    }

    return baseStyles;
  };

  if (!isLoaded) {
    return (
      <div className="w-48 h-48 bg-gray-700 animate-pulse rounded flex items-center justify-center">
        <span className="text-gray-400">Loading image...</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      {isInEditor && (
        <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">
            {isSelected 
              ? '🖼️ Image selected - Use tools to edit'
              : '👆 Click to select image'
            }
          </span>
        </div>
      )}
      
      <div 
        onClick={handleComponentClick}
        data-component-id={componentId}
        data-component-type={componentType}
        style={getContainerStyles()}
        className={`${
          isInEditor 
            ? `editable-component ${isSelected ? 'selected' : ''}` 
            : ''
        }`}
      >
        <Image
          src={imageUrl}
          alt="Test Image"
          width={imageSize.width}
          height={imageSize.height}
          className="rounded shadow-lg"
          style={{
            width: `${imageSize.width}px`,
            height: `${imageSize.height}px`,
          }}
        />
      </div>
    </div>
  );
};
