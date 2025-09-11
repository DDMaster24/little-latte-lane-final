'use client';

import { useState, useContext, useEffect, useCallback } from 'react';
import { EditorContext, SelectionContext } from '../../contexts/EditorContext';

// This is the ACTUAL component used on the test page
export const TestPageHeading = () => {
  const [heading, setHeading] = useState('Loading...');
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [fontSize, setFontSize] = useState(48);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [tempText, setTempText] = useState('');
  
  const isInEditor = useContext(EditorContext);
  const { selectedComponent, setSelectedComponent } = useContext(SelectionContext);
  
  // Debug: Log context values
  useEffect(() => {
    console.log('🔍 TestPageHeading context values:', { 
      isInEditor, 
      selectedComponent, 
      setSelectedComponent: typeof setSelectedComponent 
    });
  }, [isInEditor, selectedComponent, setSelectedComponent]);
  
  const isSelected = selectedComponent === 'TestPageHeading';
  const componentId = 'TestPageHeading';
  const componentType = 'text';

  const loadComponentData = async () => {
    try {
      const response = await fetch('/api/component-data');
      const data = await response.json();
      
      setHeading(data.text);
      setTextColor(data.color);
      setBackgroundColor(data.backgroundColor || 'transparent');
      setFontSize(data.fontSize);
      setTempText(data.text);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading component data:', error);
      setHeading('Test Heading - Click Edit to Change Me');
      setTempText('Test Heading - Click Edit to Change Me');
      setIsLoaded(true);
    }
  };

  const handleAutoApplyText = useCallback(async () => {
    if (tempText !== heading) {
      try {
        // Auto-apply text changes (not permanent save)
        setHeading(tempText);
        
        // Update API temporarily
        const response = await fetch('/api/component-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: tempText,
            color: textColor,
            backgroundColor: backgroundColor,
            fontSize: fontSize
          }),
        });

        if (response.ok) {
          // Text applied successfully - no alert needed for auto-apply
        }
      } catch (error) {
        console.error('Auto-apply error:', error);
      }
    }
    setIsEditingText(false);
  }, [tempText, heading, textColor, backgroundColor, fontSize]);

  const handleComponentClick = () => {
    console.log('🎯 Component clicked! isInEditor:', isInEditor, 'isSelected:', isSelected);
    
    if (isInEditor) {
      if (isSelected) {
        // If already selected, start text editing
        console.log('📝 Starting text editing mode');
        setIsEditingText(true);
        setTempText(heading);
        // Focus the heading element and make it editable
        setTimeout(() => {
          const element = document.getElementById('test-heading');
          if (element) {
            element.focus();
            // Position cursor at end instead of selecting all text
            const range = document.createRange();
            range.selectNodeContents(element);
            range.collapse(false); // false = collapse to end
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }, 10);
      } else {
        // If we're editing another component, auto-save current text first
        if (isEditingText) {
          handleAutoApplyText();
        }
        // Select the component
        console.log('🎯 Selecting component:', componentId);
        setSelectedComponent(componentId);
      }
    }
  };

  // Load initial values from API
  useEffect(() => {
    loadComponentData();
  }, []);

  // Listen for external color/fontSize changes from tool panel
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE_COMPONENT_STYLE') {
        if (event.data.color !== undefined) {
          setTextColor(event.data.color);
        }
        if (event.data.backgroundColor !== undefined) {
          setBackgroundColor(event.data.backgroundColor);
        }
        if (event.data.fontSize !== undefined) {
          setFontSize(event.data.fontSize);
        }
      }
      if (event.data.type === 'RESET_COMPONENT') {
        // Reset to original values from API
        loadComponentData();
      }
      if (event.data.type === 'AUTO_APPLY_TEXT') {
        // Auto-apply any pending text changes when clicking outside
        if (isEditingText) {
          handleAutoApplyText();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isEditingText, tempText, heading, textColor, backgroundColor, fontSize, handleAutoApplyText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setTempText((e.target as HTMLElement).innerText);
      handleAutoApplyText();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditingText(false);
      setTempText(heading);
      // Reset the text content
      const element = document.getElementById('test-heading');
      if (element) {
        element.innerText = heading;
      }
    }
  };

  const handleTextChange = (e: React.FormEvent<HTMLHeadingElement>) => {
    setTempText((e.target as HTMLElement).innerText);
  };

  const handleBlur = () => {
    // Auto-apply when clicking away or losing focus
    setTimeout(() => {
      if (isEditingText) {
        handleAutoApplyText();
      }
    }, 100);
  };

  // Helper function to get text styles (handles gradients)
  const getTextStyles = () => {
    const baseStyles: React.CSSProperties = {
      fontSize: `${fontSize}px`,
    };

    if (textColor.startsWith('linear-gradient')) {
      return {
        ...baseStyles,
        background: textColor,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      };
    } else {
      return {
        ...baseStyles,
        color: textColor,
      };
    }
  };

  // Helper function to get container styles
  const getContainerStyles = (isEditing: boolean) => {
    const baseStyles: React.CSSProperties = {
      cursor: isInEditor ? 'pointer' : 'default',
      padding: isInEditor ? '8px' : '0',
      borderRadius: isInEditor ? '4px' : '0',
      transition: 'all 0.2s ease-in-out',
      border: 'none'
    };

    if (isEditing) {
      return {
        ...baseStyles,
        border: '2px solid #3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        outline: 'none',
      };
    }

    // Set background color/gradient if specified
    if (backgroundColor && backgroundColor !== 'transparent') {
      if (backgroundColor.startsWith('linear-gradient')) {
        baseStyles.background = backgroundColor;
      } else {
        baseStyles.backgroundColor = backgroundColor;
      }
    }

    // Editor-specific styles
    if (isInEditor) {
      if (isSelected) {
        // Selected state - RED border
        baseStyles.border = '2px solid #ff0000';
        baseStyles.boxShadow = '0 0 10px rgba(255, 0, 0, 0.3)';
        if (backgroundColor === 'transparent') {
          baseStyles.backgroundColor = 'rgba(255, 0, 0, 0.05)';
        }
      } else {
        // Default editor state - no border, will show orange on hover via CSS
        baseStyles.border = '2px solid transparent';
      }
    }

    return baseStyles;
  };

  if (!isLoaded) {
    return (
      <h1 className="font-bold text-center mb-4 text-gray-400 animate-pulse">
        Loading...
      </h1>
    );
  }

  return (
    <div className="relative group">
      {isInEditor && (
        <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">
            {isSelected 
              ? isEditingText 
                ? '✏️ Editing text' 
                : '✅ Selected - Click to edit text'
              : '👆 Click to select'
            }
          </span>
        </div>
      )}
      
      {isEditingText ? (
        <h1
          id="test-heading"
          contentEditable
          suppressContentEditableWarning
          onInput={handleTextChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          data-component-id={componentId}
          data-component-type={componentType}
          style={{
            ...getTextStyles(),
            ...getContainerStyles(true)
          }}
          className="font-bold text-center mb-4"
        >
          {heading}
        </h1>
      ) : (
        <h1 
          id="test-heading"
          onClick={handleComponentClick}
          data-component-id={componentId}
          data-component-type={componentType}
          style={{
            ...getTextStyles(),
            ...getContainerStyles(false)
          }}
          className={`font-bold text-center mb-4 ${
            isInEditor 
              ? `editable-component ${isSelected ? 'selected' : ''}` 
              : ''
          }`}
        >
          {heading}
        </h1>
      )}
    </div>
  );
};
