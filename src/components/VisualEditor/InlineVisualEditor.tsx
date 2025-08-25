'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { visualEditorDb } from '@/lib/visual-editor-db';
import { toast } from 'sonner';

// CSS for visual editor hover effects and Photoshop-style interface
const visualEditorStyles = `
  .visual-editor-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    z-index: 1000;
  }

  .visual-editor-content {
    position: relative;
    z-index: 1001;
    background: transparent;
  }

  .visual-editor-hover {
    outline: 5px solid #00ffff !important;
    outline-offset: 3px !important;
    position: relative !important;
    cursor: pointer !important;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.8) !important;
    transition: all 0.2s ease !important;
  }

  .visual-editor-hover::before {
    content: 'Click to edit';
    position: absolute;
    top: -35px;
    left: 0;
    background: linear-gradient(45deg, #00ffff, #0099cc);
    color: #000;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
    z-index: 9999;
    pointer-events: none;
    box-shadow: 0 4px 15px rgba(0, 255, 255, 0.5);
    border: 1px solid #00ffff;
  }

  .visual-editor-selected {
    outline: 5px solid #ff00ff !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 25px rgba(255, 0, 255, 0.9) !important;
    background: rgba(255, 0, 255, 0.1) !important;
  }

  .visual-editor-editing {
    outline: 5px solid #ffff00 !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 30px rgba(255, 255, 0, 0.9) !important;
    background: rgba(255, 255, 0, 0.1) !important;
  }

  /* Text element targeting */
  h1, h2, h3, h4, h5, h6, p, span, div, a, li, td, th, label, button:not(.visual-editor-tool):not(.visual-editor-close) {
    transition: all 0.2s ease !important;
  }

  /* Active editing styles */
  [contenteditable="true"] {
    outline: 5px solid #ffff00 !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 30px rgba(255, 255, 0, 0.9) !important;
    background: rgba(255, 255, 0, 0.1) !important;
    cursor: text !important;
  }
`;

interface ElementChange {
  id?: string;
  element: HTMLElement;
  property: string;
  oldValue: string;
  newValue: string;
  timestamp: number;
  changeType: 'style' | 'content' | 'attribute';
  saved?: boolean;
}

interface InlineVisualEditorProps {
  children: React.ReactNode;
  isEnabled: boolean;
  onClose: () => void;
}

type ToolType = 'cursor' | 'text' | 'color' | 'typography' | 'spacing';

interface ListenerStore {
  mouseenter: (e: Event) => void;
  mouseleave: (e: Event) => void;
  click: (e: Event) => void;
}

interface EditorState {
  isDraftMode: boolean;
  hasUnsavedChanges: boolean;
  isAutoSaveEnabled: boolean;
  lastSaved?: Date;
}

const InlineVisualEditor: React.FC<InlineVisualEditorProps> = ({
  children,
  isEnabled,
  onClose
}) => {
  const { user, profile } = useAuth();
  const [activeTool, setActiveTool] = useState<ToolType>('cursor');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [changeHistory, setChangeHistory] = useState<ElementChange[]>([]);
  const [editorState, setEditorState] = useState<EditorState>({
    isDraftMode: true,
    hasUnsavedChanges: false,
    isAutoSaveEnabled: true,
    lastSaved: undefined
  });
  const [undoStack, setUndoStack] = useState<ElementChange[]>([]);
  const [redoStack, setRedoStack] = useState<ElementChange[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  // Add styles to document
  useEffect(() => {
    if (!isEnabled) return;

    const styleId = 'visual-editor-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = visualEditorStyles;

    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [isEnabled]);

  const selectElement = useCallback((element: HTMLElement) => {
    // Clear previous selection
    if (selectedElement) {
      selectedElement.classList.remove('visual-editor-selected', 'visual-editor-editing');
      if (isTextEditing) {
        setIsTextEditing(false);
        selectedElement.contentEditable = 'false';
        selectedElement.blur();
        window.getSelection()?.removeAllRanges();
      }
    }

    // Set new selection
    setSelectedElement(element);
    element.classList.add('visual-editor-selected');
    element.classList.remove('visual-editor-hover');
  }, [selectedElement, isTextEditing]);

  const startTextEditing = useCallback(() => {
    if (!selectedElement) return;

    setIsTextEditing(true);
    selectedElement.classList.add('visual-editor-editing');
    selectedElement.classList.remove('visual-editor-selected');
    selectedElement.contentEditable = 'true';
    selectedElement.focus();

    // Select all text
    const range = document.createRange();
    range.selectNodeContents(selectedElement);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [selectedElement]);

  const stopTextEditing = useCallback(() => {
    if (!selectedElement || !isTextEditing) return;

    setIsTextEditing(false);
    selectedElement.contentEditable = 'false';
    selectedElement.classList.remove('visual-editor-editing');
    selectedElement.classList.add('visual-editor-selected');
    selectedElement.blur();

    // Clear selection
    window.getSelection()?.removeAllRanges();
  }, [selectedElement, isTextEditing]);

  const removeElementIndicators = useCallback(() => {
    if (!editorRef.current) return;

    console.log('🧹 Cleaning up visual editor listeners...');
    
    const elements = editorRef.current.querySelectorAll('*');
    elements.forEach((element) => {
      const htmlElement = element as HTMLElement & { _visualEditorListeners?: ListenerStore };
      const listeners = htmlElement._visualEditorListeners;
      
      if (listeners) {
        htmlElement.removeEventListener('mouseenter', listeners.mouseenter, { capture: true });
        htmlElement.removeEventListener('mouseleave', listeners.mouseleave, { capture: true });
        htmlElement.removeEventListener('click', listeners.click, { capture: true });
        delete htmlElement._visualEditorListeners;
      }
      
      // Clean all visual editor classes
      htmlElement.classList.remove('visual-editor-hover', 'visual-editor-selected', 'visual-editor-editing');
      
      // Remove contenteditable if set
      if (htmlElement.hasAttribute('contenteditable')) {
        htmlElement.removeAttribute('contenteditable');
      }
    });
    
    console.log('✅ Cleanup completed');
  }, []);

  // BULLETPROOF Element Scanner - Simplified and guaranteed to work
  const addElementIndicators = useCallback(() => {
    if (!isEnabled || !editorRef.current) {
      console.log('❌ Visual Editor: Not enabled or no editor ref');
      return;
    }

    console.log('🔍 Visual Editor: Starting bulletproof scan...');
    
    // Clear any existing listeners first
    removeElementIndicators();
    
    // Get ALL text-containing elements - but be more selective for better targeting
    const allElements = editorRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span:not(.visual-editor-tool), div:not(.visual-editor-toolbar):not(.visual-editor-overlay), a, button:not(.visual-editor-tool):not(.visual-editor-close)');
    console.log(`🔍 Found ${allElements.length} potential elements`);
    
    let validCount = 0;
    
    Array.from(allElements).forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      // Skip if it's part of our visual editor UI
      if (htmlElement.closest('.visual-editor-toolbar') || 
          htmlElement.closest('.visual-editor-sidebar') ||
          htmlElement.closest('[data-visual-editor="true"]') ||
          htmlElement.classList.contains('visual-editor-tool') ||
          htmlElement.classList.contains('visual-editor-close') ||
          htmlElement.hasAttribute('data-visual-editor-ignore')) {
        console.log(`⏭️ Skipping UI element: ${htmlElement.tagName}`);
        return;
      }
      
      // Must have direct text content (not just from children)
      const text = htmlElement.textContent?.trim();
      const directText = htmlElement.childNodes[0]?.nodeType === Node.TEXT_NODE ? 
                        htmlElement.childNodes[0].textContent?.trim() : '';
      
      if (!text || text.length === 0) {
        console.log(`⏭️ Skipping empty element: ${htmlElement.tagName}`);
        return;
      }
      
      // Prefer elements with direct text content
      if (!directText && text.length < 5) {
        console.log(`⏭️ Skipping element with minimal text: ${htmlElement.tagName}`);
        return;
      }
      
      // Must be visible
      if (htmlElement.offsetWidth === 0 || htmlElement.offsetHeight === 0) {
        console.log(`⏭️ Skipping hidden element: ${htmlElement.tagName}`);
        return;
      }
      
      console.log(`✅ Adding listeners to: ${htmlElement.tagName} - "${text.substring(0, 30)}..."`);
      
      const handleMouseEnter = (e: Event) => {
        e.preventDefault();
        e.stopPropagation(); // Stop event bubbling
        
        // Remove hover from any other elements
        const currentHovered = document.querySelectorAll('.visual-editor-hover');
        currentHovered.forEach(el => el.classList.remove('visual-editor-hover'));
        
        if (!isTextEditing && htmlElement !== selectedElement) {
          htmlElement.classList.add('visual-editor-hover');
          console.log(`👆 Hovering: ${htmlElement.tagName} - "${text.substring(0, 20)}..."`);
        }
      };

      const handleMouseLeave = (e: Event) => {
        e.preventDefault();
        e.stopPropagation(); // Stop event bubbling
        htmlElement.classList.remove('visual-editor-hover');
      };

      const handleClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation(); // Stop event bubbling to prevent multiple selections
        
        console.log(`🖱️ CLICKED: ${htmlElement.tagName} - "${text.substring(0, 30)}..."`);
        
        // Clear all hover states
        const allHovered = document.querySelectorAll('.visual-editor-hover');
        allHovered.forEach(el => el.classList.remove('visual-editor-hover'));
        
        // Clear previous selection
        const allSelected = document.querySelectorAll('.visual-editor-selected, .visual-editor-editing');
        allSelected.forEach(el => {
          el.classList.remove('visual-editor-selected', 'visual-editor-editing');
          if (el.hasAttribute('contenteditable')) {
            el.removeAttribute('contenteditable');
          }
        });
        
        // Stop any existing text editing
        if (isTextEditing) {
          setIsTextEditing(false);
        }
        
        // Select this element
        setSelectedElement(htmlElement);
        htmlElement.classList.add('visual-editor-selected');
        
        console.log(`✅ Element selected: ${htmlElement.tagName}`);
      };

      // Add event listeners with capture to prevent bubbling issues
      htmlElement.addEventListener('mouseenter', handleMouseEnter, { capture: true, passive: false });
      htmlElement.addEventListener('mouseleave', handleMouseLeave, { capture: true, passive: false });
      htmlElement.addEventListener('click', handleClick, { capture: true, passive: false });
      
      // Store for cleanup
      (htmlElement as HTMLElement & { _visualEditorListeners?: ListenerStore })._visualEditorListeners = {
        mouseenter: handleMouseEnter,
        mouseleave: handleMouseLeave,
        click: handleClick
      };
      
      validCount++;
    });

    console.log(`🎯 SUCCESS: Added listeners to ${validCount} elements`);
    
    // Show success message
    if (validCount > 0) {
      console.log(`🎉 Visual Editor Ready! ${validCount} elements can be edited`);
      
      // Show temporary success indicator
      const notification = document.createElement('div');
      notification.innerHTML = `🎯 ${validCount} elements ready for editing!<br><small>Hover over text to highlight • Click to select</small>`;
      notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #00ffff, #0099cc);
        color: black;
        padding: 15px 20px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0, 255, 255, 0.7);
        border: 2px solid #00ffff;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        text-align: center;
      `;
      
      // Add animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 5000);
    } else {
      console.log('❌ No valid elements found');
      
      // Show no elements message
      const notification = document.createElement('div');
      notification.innerHTML = `⚠️ No editable elements found<br><small>Make sure you're on a content page</small>`;
      notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #ff6b6b, #ee5a52);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.7);
        border: 2px solid #ff6b6b;
        max-width: 300px;
        text-align: center;
      `;
      
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 4000);
    }
  }, [isEnabled, isTextEditing, selectedElement, removeElementIndicators]);

  useEffect(() => {
    if (isEnabled) {
      // More robust initialization with multiple attempts
      const initializeEditor = () => {
        console.log('🚀 Visual Editor: Initializing...');
        
        // Give the DOM time to settle
        setTimeout(() => {
          addElementIndicators();
        }, 100);
        
        // Backup scan after page load
        setTimeout(() => {
          console.log('🔄 Visual Editor: Backup scan...');
          addElementIndicators();
        }, 1000);
        
        // Final scan to catch any dynamically loaded content
        setTimeout(() => {
          console.log('🔍 Visual Editor: Final scan...');
          addElementIndicators();
        }, 2000);
      };

      initializeEditor();

      return () => {
        removeElementIndicators();
      };
    } else {
      removeElementIndicators();
    }
  }, [isEnabled, addElementIndicators, removeElementIndicators]);

  const applyStyle = useCallback(async (property: string, value: string, changeType: 'style' | 'content' | 'attribute' = 'style') => {
    if (!selectedElement || !profile) return;

    const oldValue = selectedElement.style.getPropertyValue(property) || 
                     window.getComputedStyle(selectedElement).getPropertyValue(property);

    selectedElement.style.setProperty(property, value);

    // Create change record
    const change: ElementChange = {
      element: selectedElement,
      property,
      oldValue,
      newValue: value,
      timestamp: Date.now(),
      changeType,
      saved: false
    };

    // Update change history and undo stack
    setChangeHistory(prev => [...prev, change]);
    setUndoStack(prev => [...prev, change]);
    setRedoStack([]); // Clear redo stack when new change is made

    // Auto-save if enabled
    if (editorState.isAutoSaveEnabled) {
      try {
        const savedChange = await visualEditorDb.saveChange(
          selectedElement,
          property,
          value,
          oldValue,
          changeType,
          window.location.pathname,
          profile.id,
          editorState.isDraftMode
        );

        if (savedChange) {
          change.saved = true;
          change.id = savedChange.id;
          toast.success('Change saved automatically');
          setEditorState(prev => ({ ...prev, lastSaved: new Date() }));
        } else {
          toast.error('Failed to save change');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast.error('Auto-save failed');
      }
    } else {
      setEditorState(prev => ({ ...prev, hasUnsavedChanges: true }));
    }
  }, [selectedElement, profile, editorState]);

  // Undo functionality
  const undoLastChange = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastChange = undoStack[undoStack.length - 1];
    
    // Revert the change on the element
    if (lastChange.changeType === 'style') {
      lastChange.element.style.setProperty(lastChange.property, lastChange.oldValue);
    } else if (lastChange.changeType === 'content') {
      if (lastChange.property === 'textContent') {
        lastChange.element.textContent = lastChange.oldValue;
      }
    }

    // Move to redo stack
    setRedoStack(prev => [...prev, lastChange]);
    setUndoStack(prev => prev.slice(0, -1));
    
    toast.success('Change undone');
  }, [undoStack]);

  // Redo functionality
  const redoLastChange = useCallback(() => {
    if (redoStack.length === 0) return;

    const lastUndo = redoStack[redoStack.length - 1];
    
    // Reapply the change
    if (lastUndo.changeType === 'style') {
      lastUndo.element.style.setProperty(lastUndo.property, lastUndo.newValue);
    } else if (lastUndo.changeType === 'content') {
      if (lastUndo.property === 'textContent') {
        lastUndo.element.textContent = lastUndo.newValue;
      }
    }

    // Move back to undo stack
    setUndoStack(prev => [...prev, lastUndo]);
    setRedoStack(prev => prev.slice(0, -1));
    
    toast.success('Change redone');
  }, [redoStack]);

  // Save all changes manually
  const saveAllChanges = useCallback(async () => {
    if (!profile) return;

    const unsavedChanges = changeHistory.filter(change => !change.saved);
    if (unsavedChanges.length === 0) {
      toast.info('No unsaved changes');
      return;
    }

    let savedCount = 0;
    for (const change of unsavedChanges) {
      try {
        const savedChange = await visualEditorDb.saveChange(
          change.element,
          change.property,
          change.newValue,
          change.oldValue,
          change.changeType,
          window.location.pathname,
          profile.id,
          editorState.isDraftMode
        );

        if (savedChange) {
          change.saved = true;
          change.id = savedChange.id;
          savedCount++;
        }
      } catch (error) {
        console.error('Failed to save change:', error);
      }
    }

    if (savedCount > 0) {
      toast.success(`Saved ${savedCount} changes`);
      setEditorState(prev => ({ 
        ...prev, 
        hasUnsavedChanges: false,
        lastSaved: new Date()
      }));
    } else {
      toast.error('Failed to save changes');
    }
  }, [changeHistory, profile, editorState.isDraftMode]);

  // Load and apply changes from database
  const loadPageChanges = useCallback(async () => {
    if (!profile) return;

    try {
      const changes = await visualEditorDb.loadPageChanges(
        window.location.pathname,
        !editorState.isDraftMode // Load published only if not in draft mode
      );

      const appliedCount = await visualEditorDb.applyChangesToPage(changes);
      
      if (appliedCount > 0) {
        toast.success(`Applied ${appliedCount} saved changes`);
      }
    } catch (error) {
      console.error('Failed to load changes:', error);
      toast.error('Failed to load changes');
    }
  }, [profile, editorState.isDraftMode]);

  // Publish draft changes
  const publishChanges = useCallback(async () => {
    if (!profile || !editorState.isDraftMode) return;

    try {
      const success = await visualEditorDb.publishChanges(
        window.location.pathname,
        profile.id
      );

      if (success) {
        toast.success('Changes published successfully!');
        setEditorState(prev => ({ 
          ...prev, 
          isDraftMode: false,
          hasUnsavedChanges: false
        }));
      } else {
        toast.error('Failed to publish changes');
      }
    } catch (error) {
      console.error('Failed to publish changes:', error);
      toast.error('Failed to publish changes');
    }
  }, [profile, editorState.isDraftMode]);

  // Revert to published version
  const revertToPublished = useCallback(async () => {
    if (!profile) return;

    try {
      const success = await visualEditorDb.revertToPublished(
        window.location.pathname,
        profile.id
      );

      if (success) {
        toast.success('Reverted to published version');
        setChangeHistory([]);
        setUndoStack([]);
        setRedoStack([]);
        setEditorState(prev => ({ 
          ...prev, 
          hasUnsavedChanges: false
        }));
        
        // Reload the page to show published changes
        window.location.reload();
      } else {
        toast.error('Failed to revert changes');
      }
    } catch (error) {
      console.error('Failed to revert changes:', error);
      toast.error('Failed to revert changes');
    }
  }, [profile]);

  // Load changes when editor is enabled
  useEffect(() => {
    if (isEnabled && profile) {
      loadPageChanges();
    }
  }, [isEnabled, profile, loadPageChanges]);

  const getToolName = (tool: ToolType): string => {
    switch (tool) {
      case 'cursor': return 'Select';
      case 'text': return 'Text Editor';
      case 'color': return 'Color Editor';
      case 'typography': return 'Typography';
      case 'spacing': return 'Spacing';
      default: return 'Tool';
    }
  };

  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900" data-visual-editor="true">
      {/* Photoshop-style Tool Palette */}
      <div className="visual-editor-sidebar fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-700 shadow-2xl" style={{ width: '80px' }}>
        {/* Header with Logo */}
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-center">
          <div className="w-10 h-10 bg-gradient-to-r from-neonCyan to-neonPink rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-black">LL</span>
          </div>
        </div>

        {/* Tool Buttons */}
        <div className="p-3 space-y-3">
          {/* Cursor Tool */}
          <button
            onClick={() => setActiveTool('cursor')}
            className={`w-full h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
              activeTool === 'cursor' 
                ? 'bg-neonCyan border-neonCyan text-black shadow-lg shadow-neonCyan/50' 
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
            }`}
            title="Select Tool (Click elements to select)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
            </svg>
          </button>

          {/* Text Tool */}
          <button
            onClick={() => setActiveTool('text')}
            className={`w-full h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
              activeTool === 'text' 
                ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/50' 
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
            }`}
            title="Text Editor (Click text to edit directly)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Color Tool */}
          <button
            onClick={() => setActiveTool('color')}
            className={`w-full h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
              activeTool === 'color' 
                ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/50' 
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
            }`}
            title="Color Editor (Change text and background colors)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11a2 2 0 112.828 2.828l-6.364 6.364A2 2 0 018 21H6l2-2 6.364-6.364z" />
            </svg>
          </button>

          {/* Typography Tool */}
          <button
            onClick={() => setActiveTool('typography')}
            className={`w-full h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
              activeTool === 'typography' 
                ? 'bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/50' 
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
            }`}
            title="Typography (Font size, weight, family)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 20l4-16m4 16l4-16M6 9h12" />
            </svg>
          </button>

          {/* Spacing Tool */}
          <button
            onClick={() => setActiveTool('spacing')}
            className={`w-full h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
              activeTool === 'spacing' 
                ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/50' 
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
            }`}
            title="Spacing (Padding, margins, layout)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        {/* Tool Info */}
        {activeTool !== 'cursor' && (
          <div className="absolute bottom-20 left-3 right-3 bg-gray-800 rounded-lg p-2 border border-gray-600">
            <div className="text-xs text-gray-300 text-center font-medium">
              {getToolName(activeTool)}
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              {selectedElement ? 'Element selected' : 'Click element to select'}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="absolute bottom-3 left-3 right-3">
          <button
            onClick={() => {
              removeElementIndicators();
              setSelectedElement(null);
              setIsTextEditing(false);
              onClose();
            }}
            className="w-full h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close Editor
          </button>
        </div>
      </div>

      {/* Floating Tool Options Panel */}
      {activeTool !== 'cursor' && selectedElement && (
        <div className="fixed left-20 top-20 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-2xl z-50" style={{ width: '250px' }}>
          <h3 className="text-white font-medium text-sm mb-3 flex items-center">
            {activeTool === 'text' && <>📝 Text Editor</>}
            {activeTool === 'color' && <>🎨 Color Editor</>}
            {activeTool === 'typography' && <>🔤 Typography</>}
            {activeTool === 'spacing' && <>📦 Spacing</>}
          </h3>

          {activeTool === 'color' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 mb-2">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    onChange={(e) => applyStyle('color', e.target.value)}
                    className="w-12 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="#000000"
                    onChange={(e) => applyStyle('color', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    onChange={(e) => applyStyle('background-color', e.target.value)}
                    className="w-12 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="transparent"
                    onChange={(e) => applyStyle('background-color', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTool === 'typography' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 mb-2">Font Size</label>
                <input
                  type="range"
                  min="8"
                  max="72"
                  onChange={(e) => applyStyle('font-size', `${e.target.value}px`)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-2">Font Weight</label>
                <select
                  onChange={(e) => applyStyle('font-weight', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                >
                  <option value="400">Normal</option>
                  <option value="600">Semi Bold</option>
                  <option value="700">Bold</option>
                </select>
              </div>
            </div>
          )}

          {activeTool === 'spacing' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 mb-2">Padding</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  onChange={(e) => applyStyle('padding', `${e.target.value}px`)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-2">Margin</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  onChange={(e) => applyStyle('margin', `${e.target.value}px`)}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {activeTool === 'text' && (
            <div className="space-y-3">
              {isTextEditing ? (
                <button
                  onClick={stopTextEditing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded px-3 py-2 text-sm font-medium transition-colors"
                >
                  ✓ Save Text Changes
                </button>
              ) : (
                <button
                  onClick={startTextEditing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2 text-sm font-medium transition-colors"
                >
                  ✏️ Edit Text Content
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="h-full overflow-auto bg-gradient-to-br from-gray-900 to-black" style={{ marginLeft: '80px' }}>
        {/* Top Status Bar */}
        <div className="h-16 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between px-6 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">
                Visual Editor Active
              </span>
            </div>
            {selectedElement && (
              <div className="text-gray-400 text-sm">
                Selected: <span className="text-white font-medium">
                  {selectedElement.tagName.toLowerCase()}
                  {selectedElement.className && `.${selectedElement.className.split(' ')[0]}`}
                </span>
              </div>
            )}
            {activeTool !== 'cursor' && (
              <div className="text-neonCyan text-sm">
                Tool: <span className="font-medium">{getToolName(activeTool)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-400">
              Hover elements to highlight
            </div>
            
            {/* Undo/Redo Controls */}
            <button
              onClick={undoLastChange}
              disabled={undoStack.length === 0}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded text-xs transition-colors"
              title="Undo last change"
            >
              ↶ Undo
            </button>
            <button
              onClick={redoLastChange}
              disabled={redoStack.length === 0}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded text-xs transition-colors"
              title="Redo last change"
            >
              ↷ Redo
            </button>

            {/* Save Controls */}
            <div className="w-px h-4 bg-gray-600"></div>
            
            <button
              onClick={() => {
                console.log('🔄 Manual element scan triggered');
                addElementIndicators();
                toast.success('Scanning page for editable elements...');
              }}
              className="px-4 py-2 bg-neonCyan hover:bg-cyan-400 text-black rounded text-sm font-medium transition-colors shadow-lg"
              title="Scan page for editable elements"
            >
              � Scan Elements
            </button>
            
            <button
              onClick={() => setEditorState(prev => ({ ...prev, isAutoSaveEnabled: !prev.isAutoSaveEnabled }))}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                editorState.isAutoSaveEnabled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title="Toggle auto-save"
            >
              {editorState.isAutoSaveEnabled ? '💾 Auto-Save: ON' : '💾 Auto-Save: OFF'}
            </button>

            <button
              onClick={saveAllChanges}
              disabled={changeHistory.filter(c => !c.saved).length === 0}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-xs transition-colors"
            >
              💾 Save All ({changeHistory.filter(c => !c.saved).length})
            </button>

            {/* Publishing Controls */}
            <div className="w-px h-4 bg-gray-600"></div>
            
            <div className="flex items-center space-x-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                editorState.isDraftMode 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-green-600 text-white'
              }`}>
                {editorState.isDraftMode ? '📝 DRAFT' : '✅ LIVE'}
              </span>
            </div>

            {editorState.isDraftMode && (
              <button
                onClick={publishChanges}
                className="px-3 py-1 bg-neonCyan hover:bg-cyan-400 text-black rounded text-xs font-medium transition-colors"
              >
                🚀 Publish Changes
              </button>
            )}

            <button
              onClick={revertToPublished}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
              title="Revert all changes to last published version"
            >
              ↩️ Revert to Published
            </button>

            {/* Status Info */}
            {editorState.lastSaved && (
              <div className="text-xs text-gray-400">
                Last saved: {editorState.lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Page Content with Visual Editor */}
        <div className="relative">
          <div ref={editorRef} className="visual-editor-content">
            {children}
          </div>
          
          {/* Bottom Status */}
          <div className="fixed bottom-6 right-6 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600 rounded-xl px-4 py-3 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-neonCyan rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-semibold">
                  {getToolName(activeTool)}
                </span>
              </div>
              
              {selectedElement && (
                <>
                  <div className="w-px h-6 bg-gray-600"></div>
                  <div className="text-gray-300 text-sm">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-neonPink rounded-full mr-2"></span>
                      {selectedElement.tagName.toLowerCase()}
                    </span>
                  </div>
                </>
              )}
              
              {changeHistory.length > 0 && (
                <>
                  <div className="w-px h-6 bg-gray-600"></div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    <span className="text-neonCyan text-sm font-medium">
                      {changeHistory.length} change{changeHistory.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </>
              )}

              {/* Save Status */}
              <div className="w-px h-6 bg-gray-600"></div>
              <div className="flex items-center space-x-1">
                {editorState.hasUnsavedChanges ? (
                  <>
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                    <span className="text-red-400 text-sm">Unsaved</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="text-green-400 text-sm">Saved</span>
                  </>
                )}
              </div>

              {/* Draft/Live Status */}
              <div className="w-px h-6 bg-gray-600"></div>
              <div className="text-sm">
                {editorState.isDraftMode ? (
                  <span className="text-yellow-400">📝 Draft Mode</span>
                ) : (
                  <span className="text-green-400">✅ Live Mode</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineVisualEditor;

