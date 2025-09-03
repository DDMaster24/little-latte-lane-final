'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { HexColorPicker } from 'react-colorful';
import SimpleImageEditor from './SimpleImageEditor';
import { 
  ArrowLeft, 
  Type, 
  Palette, 
  Image as ImageIcon,
  Save,
  X,
  AlertTriangle,
  Upload,
  RefreshCw,
  Paintbrush
} from 'lucide-react';

// Theme colors from tailwind.config.js
const THEME_COLORS = [
  '#00FFFF', // neonCyan
  '#FF00FF', // neonPink  
  '#1A1A1A', // darkBg
  '#7DD3FC', // neonCyan-200
  '#F8BBD9', // neonPink-200
  '#0D9488', // teal-600
  '#7C3AED', // violet-600
  '#DC2626', // red-600
  '#EA580C', // orange-600
  '#CA8A04', // yellow-600
  '#16A34A', // green-600
  '#2563EB'  // blue-600
];

const GRADIENT_PRESETS = [
  { name: 'Neon Cyan', value: 'linear-gradient(45deg, #00FFFF, #7DD3FC)' },
  { name: 'Neon Pink', value: 'linear-gradient(45deg, #FF00FF, #F8BBD9)' },
  { name: 'Cyber Blue', value: 'linear-gradient(135deg, #0D9488, #2563EB)' },
  { name: 'Retro Purple', value: 'linear-gradient(45deg, #7C3AED, #FF00FF)' },
  { name: 'Sunset Orange', value: 'linear-gradient(135deg, #EA580C, #CA8A04)' },
  { name: 'Matrix Green', value: 'linear-gradient(45deg, #16A34A, #00FFFF)' }
];

// Header-specific editor tool types
type HeaderEditorTool = 'text' | 'color' | 'image';
type HeaderElementType = 'nav-link' | 'auth-button' | 'logo' | 'mobile-nav' | 'header-text';

interface HeaderElementConfig {
  type: HeaderElementType;
  allowedTools: HeaderEditorTool[];
  description: string;
}

interface PendingChange {
  type: 'text' | 'color' | 'image';
  value: string;
  originalValue: string;
  elementId: string;
}

interface HeaderEditorProps {
  children: React.ReactNode;
}

export default function HeaderEditor({ children }: HeaderEditorProps) {
  const { toast } = useToast();
  // Authentication handled in parent component
  // No longer using usePageEditor hook directly - using simplified save functions

  // Editor state - Start with 'text' as default
  const [selectedTool, setSelectedTool] = useState<HeaderEditorTool>('text');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElementConfig, setSelectedElementConfig] = useState<HeaderElementConfig | null>(null);
  const [editingText, setEditingText] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  // Enhanced color picker state
  const [colorMode, setColorMode] = useState<'text' | 'background'>('text');
  const [selectedColor, setSelectedColor] = useState('#00FFFF');
  const [gradientColor1, setGradientColor1] = useState('#00FFFF');
  const [gradientColor2, setGradientColor2] = useState('#FF00FF');
  const [gradientDirection, setGradientDirection] = useState<'to right' | 'to left' | 'to bottom' | 'to top' | '45deg' | '135deg'>('to right');
  
  // Image editor state
  const [showSimpleImageEditor, setShowSimpleImageEditor] = useState(false);
  
  // Preview/Save state - NO AUTO-SAVE
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());

  // Header-specific element configuration
  const getHeaderElementConfig = (element: HTMLElement): HeaderElementConfig => {
    const elementId = element.getAttribute('data-editable') || '';
    const tagName = element.tagName.toLowerCase();
    const classList = Array.from(element.classList);

    // Header Background
    if (elementId === 'header-background' || tagName === 'header') {
      return {
        type: 'header-text',
        allowedTools: ['color'],
        description: 'Header Background - Main header background color'
      };
    }

    // Logo
    if (elementId.includes('header-logo') || elementId.includes('logo')) {
      return {
        type: 'logo',
        allowedTools: ['image'],
        description: 'Header Logo - Company logo image'
      };
    }
    
    // Navigation links (desktop)
    if (elementId.includes('nav-link-')) {
      return {
        type: 'nav-link',
        allowedTools: ['text', 'color'],
        description: 'Navigation Link - Header menu item'
      };
    }
    
    // Mobile navigation links
    if (elementId.includes('mobile-nav-')) {
      return {
        type: 'mobile-nav',
        allowedTools: ['text', 'color'],
        description: 'Mobile Navigation - Mobile menu item'
      };
    }
    
    // Auth buttons
    if (elementId.includes('auth-') || elementId.includes('login') || elementId.includes('logout')) {
      return {
        type: 'auth-button',
        allowedTools: ['text', 'color'],
        description: 'Auth Button - Login/logout button'
      };
    }
    
    // Button elements
    if (tagName === 'button' || elementId.includes('button') || 
        classList.some(c => c.includes('button'))) {
      return {
        type: 'auth-button',
        allowedTools: ['text', 'color'],
        description: 'Header Button - Interactive button'
      };
    }
    
    // Images
    if (tagName === 'img' || elementId.includes('image')) {
      return {
        type: 'logo',
        allowedTools: ['image'],
        description: 'Header Image - Header image content'
      };
    }
    
    // Links
    if (tagName === 'a' || elementId.includes('link')) {
      return {
        type: 'nav-link',
        allowedTools: ['text', 'color'],
        description: 'Header Link - Navigation link'
      };
    }
    
    // Default text elements
    return {
      type: 'header-text',
      allowedTools: ['text', 'color'],
      description: 'Header Text - Header text content'
    };
  };

  // Handle element selection with header-specific logic
  const handleElementClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    console.log('🖱️ Click detected on:', target.tagName, target.className);
    
    // CRITICAL: Block ALL navigation attempts - no exceptions
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Ignore clicks on editor toolbar
    if (target.closest('[data-editor-toolbar]') || target.closest('[data-editor-action]')) {
      console.log('🚫 Toolbar click ignored');
      return;
    }
    
    // Find the closest editable element
    const editableElement = target.closest('[data-editable]') as HTMLElement;
    console.log('🎯 Found editable element:', editableElement?.getAttribute('data-editable'));
    
    if (!editableElement) {
      // Clicked outside editable area - clear selection but show toast
      console.log('❌ No editable element - clearing selection');
      setSelectedElement(null);
      setSelectedElementConfig(null);
      
      // Show toast for blocked navigation on non-editable elements
      if (target.tagName === 'A' || target.closest('a') || 
          (target.tagName === 'BUTTON' && !target.closest('[data-editor-action]'))) {
        toast({
          title: "🚫 Navigation Blocked",
          description: "Exit header editor to navigate. Click elements to edit them instead.",
          variant: "destructive",
          duration: 2000
        });
      }
      return;
    }
    
    const elementId = editableElement.getAttribute('data-editable');
    console.log('🆔 Element ID:', elementId);
    
    if (elementId) {
      // Clear previous selection
      document.querySelectorAll('[data-editable]').forEach(el => {
        (el as HTMLElement).style.outline = 'none';
        el.classList.remove('editor-selected');
      });
      
      // Select new element
      editableElement.style.outline = '3px solid #ff0000'; // RED neon border for selection
      editableElement.classList.add('editor-selected');
      
      const config = getHeaderElementConfig(editableElement);
      console.log('⚙️ Element config:', config);
      
      setSelectedElement(elementId);
      setSelectedElementConfig(config);
      
      // Show success toast
      toast({
        title: "🎯 Element Selected",
        description: `Selected ${config?.description || 'element'} for editing`,
        variant: "default",
        duration: 1500
      });
      
      // Don't auto-select tools - let user choose manually for consistent behavior
    }
  }, [toast]);

  // Handle tool selection with validation
  const handleToolSelect = (tool: HeaderEditorTool) => {
    if (!selectedElement) {
      toast({
        title: "🎯 Select Element First",
        description: "Please select a header element before choosing a tool",
        variant: "destructive"
      });
      return;
    }

    const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
    if (element && selectedElementConfig) {
      if (!selectedElementConfig.allowedTools.includes(tool)) {
        toast({
          title: "🚫 Tool Not Allowed",
          description: `${tool} tool is not available for this header element type`,
          variant: "destructive"
        });
        return;
      }
    }

    setSelectedTool(tool);
    
    // Reset editing states when switching tools
    setEditingText(false);
    setTextValue('');
  };

  // Text editing functions
  const handleTextEdit = () => {
    if (!selectedElement) return;
    
    const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
    if (element) {
      const currentText = element.textContent || '';
      setTextValue(currentText);
      setEditingText(true);
    }
  };

  const handleTextSave = async () => {
    if (!selectedElement || !textValue.trim()) return;
    
    setIsSaving(true);
    try {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        const originalText = element.textContent || '';
        
        // Apply preview
        element.textContent = textValue;
        
        // Add to pending changes
        const newPendingChanges = new Map(pendingChanges);
        newPendingChanges.set(selectedElement, {
          type: 'text',
          value: textValue,
          originalValue: originalText,
          elementId: selectedElement
        });
        setPendingChanges(newPendingChanges);
        
        setEditingText(false);
        
        toast({
          title: "✏️ Text Preview Applied",
          description: "Click 'Save Changes' to make it permanent",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error applying text preview:', error);
      toast({
        title: "❌ Preview Failed",
        description: "Could not apply text preview",
        variant: "destructive"
      });
    }
    setIsSaving(false);
  };

  // Enhanced color application function
  const handleColorApply = () => {
    if (!selectedElement) return;
    
    const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
    if (!element) return;

    const _property = colorMode === 'text' ? 'color' : 'backgroundColor';
    const originalValue = colorMode === 'text' 
      ? element.style.color || ''
      : element.style.backgroundColor || '';
    
    let newValue: string;
    
    // Check if we're applying a gradient (only for background)
    if (colorMode === 'background' && (gradientColor1 !== gradientColor2)) {
      newValue = `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2})`;
      element.style.background = newValue;
    } else {
      newValue = selectedColor;
      if (colorMode === 'text') {
        element.style.color = newValue;
      } else {
        element.style.backgroundColor = newValue;
      }
    }

    // Add to pending changes
    const newPendingChanges = new Map(pendingChanges);
    newPendingChanges.set(`${selectedElement}-${colorMode}`, {
      type: 'color',
      value: newValue,
      originalValue,
      elementId: selectedElement
    });
    setPendingChanges(newPendingChanges);

    toast({
      title: `🎨 ${colorMode === 'background' && (gradientColor1 !== gradientColor2) ? 'Gradient' : (colorMode === 'text' ? 'Text' : 'Background')} Color Preview Applied`,
      description: "Click 'Save Changes' to make it permanent",
      duration: 3000,
    });
  };

  // Clear gradient
  const handleClearGradient = () => {
    if (!selectedElement) return;
    
    const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
    if (!element) return;
    
    element.style.background = '';
    element.style.backgroundImage = '';
    
    toast({
      title: "🧹 Gradient Cleared",
      description: "Background gradient removed",
      duration: 1500
    });
  };

  // Apply gradient preset
  const handleGradientPreset = (gradient: string) => {
    if (!selectedElement) return;
    
    const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
    if (!element) return;
    
    element.style.background = gradient;
    
    // Parse gradient to update color picker values
    const colorMatch = gradient.match(/#[a-fA-F0-9]{6}/g);
    if (colorMatch && colorMatch.length >= 2) {
      setGradientColor1(colorMatch[0]);
      setGradientColor2(colorMatch[1]);
    }
    
    toast({
      title: "🎨 Gradient Preset Applied",
      description: "Gradient preview applied",
      duration: 1500
    });
  };

  // Image change handler with immediate preview
  const handleImageChange = (imageUrl: string) => {
    if (!selectedElement) return;
    
    const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
    if (!element) return;
    
    // Store original value for undo functionality
    const originalValue = element.tagName === 'IMG' 
      ? (element as HTMLImageElement).src
      : element.style.backgroundImage;
    
    // Create cache-busting URL for immediate preview
    const cacheBustingUrl = `${imageUrl}?t=${Date.now()}`;
    
    // Apply the change immediately for preview
    if (element.tagName === 'IMG') {
      const imgElement = element as HTMLImageElement;
      imgElement.src = cacheBustingUrl;
      // Force reload by setting source again
      imgElement.onload = () => {
        console.log('🖼️ Image preview loaded successfully');
      };
    } else {
      element.style.backgroundImage = `url('${cacheBustingUrl}')`;
    }
    
    // Add to pending changes
    const newPendingChanges = new Map(pendingChanges);
    newPendingChanges.set(`${selectedElement}_image`, {
      elementId: selectedElement,
      type: 'image',
      value: imageUrl,
      originalValue
    });
    setPendingChanges(newPendingChanges);
    
    toast({
      title: "🖼️ Image Preview Applied",
      description: "Click 'Save Changes' to make it permanent",
      duration: 3000,
    });
  };

  // Save/Preview/Discard functions
  const handleSaveChanges = async () => {
    if (pendingChanges.size === 0) return;
    
    setIsSaving(true);
    try {
      const savePromises = Array.from(pendingChanges.values()).map(async (change) => {
        // Use appropriate save function based on change type
        if (change.type === 'image') {
          const { saveImageSetting } = await import('@/app/admin/actions');
          // Use the correct key format for header logo that matches useHeaderLogo hook
          const settingKey = change.elementId.includes('header-logo') ? 'header-logo_image' : change.elementId;
          return saveImageSetting({
            setting_key: settingKey,
            setting_value: change.value,
            category: 'page_editor'
          });
        } else {
          // For text and color changes, use general theme setting save
          const { saveThemeSetting } = await import('@/app/admin/actions');
          return saveThemeSetting({
            setting_key: change.elementId,
            setting_value: change.value,
            category: 'page_editor'
          });
        }
      });
      
      const results = await Promise.all(savePromises);
      
      // Check if any saves failed
      const failedSaves = results.filter(result => !result.success);
      if (failedSaves.length > 0) {
        throw new Error(`${failedSaves.length} saves failed: ${failedSaves.map(f => f.message).join(', ')}`);
      }
      
      setPendingChanges(new Map());
      setLastSaveTime(new Date());
      
      // Check if any image changes were saved (especially logo)
      const hasImageChanges = Array.from(pendingChanges.values()).some(change => 
        change.type === 'image' && change.elementId.includes('header-logo')
      );
      
      toast({
        title: "✅ Changes Saved",
        description: `Successfully saved ${savePromises.length} changes to header${hasImageChanges ? ' - Logo updated!' : ''}`,
        duration: 5000,
      });
      
      // If logo was changed, trigger a page refresh to update the header
      if (hasImageChanges) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "❌ Save Failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive"
      });
    }
    setIsSaving(false);
  };

  const handleDiscardChanges = () => {
    // Restore original values
    pendingChanges.forEach((change) => {
      const element = document.querySelector(`[data-editable="${change.elementId}"]`) as HTMLElement;
      if (element) {
        if (change.type === 'text') {
          element.textContent = change.originalValue;
        } else if (change.type === 'color') {
          if (change.elementId.endsWith('-text')) {
            element.style.color = change.originalValue;
          } else {
            element.style.backgroundColor = change.originalValue;
          }
        }
      }
    });
    
    setPendingChanges(new Map());
    toast({
      title: "🗑️ Changes Discarded",
      description: "All pending changes have been reverted",
      duration: 3000,
    });
  };

  // SMART Navigation Blocking - Only block what we need to block
  useEffect(() => {
    // Handle keyboard events specifically 
    const handleKeyboard = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // ALLOW: Editor areas completely
      if (target.closest('[data-editor-action]') || 
          target.closest('[data-editor-toolbar]') ||
          target.closest('[data-editor-form]') ||
          target.closest('.editor-panel') ||
          target.closest('.editor-sidebar')) {
        return; // Allow all keyboard in editor areas
      }

      // ALLOW: Essential browser shortcuts - NO BLOCKING AT ALL
      if (
        e.key === 'F12' || // DevTools
        e.key === 'F5' || // Refresh
        (e.ctrlKey && e.key.toLowerCase() === 'r') || // Ctrl+R refresh
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') || // Ctrl+Shift+R hard refresh
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') || // Ctrl+Shift+I DevTools
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j') || // Ctrl+Shift+J DevTools Console
        (e.ctrlKey && e.key.toLowerCase() === 'u') || // Ctrl+U view source
        (e.ctrlKey && e.key.toLowerCase() === 's') || // Ctrl+S save
        (e.altKey && e.key === 'Tab') || // Alt+Tab window switching
        e.key === 'Escape' // Escape key
      ) {
        return; // Allow these shortcuts completely
      }

      // BLOCK: Only navigation keys on page elements (not in editor)
      if (e.key === 'Enter' || e.key === ' ') {
        const linkElement = target.closest('a');
        const buttonElement = target.closest('button:not([data-editor-action])');
        
        if (linkElement || buttonElement) {
          e.preventDefault();
          e.stopPropagation();
          
          toast({
            title: "🚫 Keyboard Navigation Blocked",
            description: "Use mouse to select elements for editing",
            variant: "destructive",
            duration: 1500
          });
        }
      }
    };

    // Handle form submissions
    const handleSubmit = (e: SubmitEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-editor-form]')) {
        e.preventDefault();
        e.stopPropagation();
        
        toast({
          title: "🚫 Form Submission Blocked",
          description: "Exit editor to submit forms",
          variant: "destructive"
        });
      }
    };

    // Add targeted event listeners - NO DOCUMENT-LEVEL CLICK BLOCKING
    document.addEventListener('keydown', handleKeyboard, { capture: true, passive: false });
    document.addEventListener('submit', handleSubmit, { capture: true, passive: false });

    // Override window navigation methods
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function() {
      toast({
        title: "🚫 Navigation Blocked",
        description: "History navigation blocked in editor mode",
        variant: "destructive"
      });
      return;
    };
    
    window.history.replaceState = function() {
      toast({
        title: "🚫 Navigation Blocked", 
        description: "History navigation blocked in editor mode",
        variant: "destructive"
      });
      return;
    };

    return () => {
      // Cleanup event listeners  
      document.removeEventListener('keydown', handleKeyboard, true);
      document.removeEventListener('submit', handleSubmit, true);
      
      // Restore window methods
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [toast]);

  // Add element hover effects and click handlers
  useEffect(() => {
    // Add a small delay to ensure elements are rendered
    const timeoutId = setTimeout(() => {
      const handleMouseEnter = (e: Event) => {
        const target = e.target as HTMLElement;
        const editableElement = target.closest('[data-editable]') as HTMLElement;
        
        console.log('🖱️ Mouse enter:', editableElement?.getAttribute('data-editable'));
        
        if (editableElement && editableElement.getAttribute('data-editable')) {
          // Only show orange hover if element is NOT currently selected
          if (!editableElement.classList.contains('editor-selected')) {
            editableElement.style.outline = '2px solid #ff8c00'; // ORANGE neon border for hover
            editableElement.classList.add('editor-hovering');
          }
        }
      };

      const handleMouseLeave = (e: Event) => {
        const target = e.target as HTMLElement;
        const editableElement = target.closest('[data-editable]') as HTMLElement;
        
        if (editableElement && editableElement.classList.contains('editor-hovering')) {
          // Only remove hover outline if element is NOT selected
          if (!editableElement.classList.contains('editor-selected')) {
            editableElement.style.outline = 'none';
          }
          editableElement.classList.remove('editor-hovering');
        }
      };

      const editableElements = document.querySelectorAll('[data-editable]');
      console.log('🎯 Found editable elements:', editableElements.length, Array.from(editableElements).map(el => el.getAttribute('data-editable')));
      
      editableElements.forEach(element => {
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('click', handleElementClick as EventListener);
      });

      return () => {
        editableElements.forEach(element => {
          element.removeEventListener('mouseenter', handleMouseEnter);
          element.removeEventListener('mouseleave', handleMouseLeave);
          element.removeEventListener('click', handleElementClick as EventListener);
        });
      };
    }, 1000); // 1 second delay to ensure elements are rendered

    return () => {
      clearTimeout(timeoutId);
    };
  }, [handleElementClick]);

  return (
    <>
      {/* FULL SCREEN OVERLAY - Complete isolation from main site */}
      <div className="fixed inset-0 z-[99999] bg-darkBg text-white overflow-auto">
        {/* FIXED TOOLBAR */}
        <div 
          className="fixed top-0 left-0 right-0 z-[100000] bg-gray-900 border-b border-gray-700 shadow-lg"
          data-editor-toolbar="true"
        >
          {/* Main Navigation Bar */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button
                data-editor-action="true"
                variant="ghost"
                size="sm"
                onClick={() => {
                  // COMPLETE EDITOR STATE RESET
                  console.log('🚪 Exiting Header Editor - Complete state reset');
                  
                  // Reset all editor state
                  setSelectedTool('text');
                  setSelectedElement(null);
                  setSelectedElementConfig(null);
                  setEditingText(false);
                  setTextValue('');
                  setColorMode('text');
                  setSelectedColor('#ffffff');
                  setPendingChanges(new Map());
                  setIsSaving(false);
                  setLastSaveTime(null);
                  
                  // Clean up all editable elements
                  document.querySelectorAll('[data-editable]').forEach(el => {
                    const element = el as HTMLElement;
                    element.style.outline = 'none';
                    element.style.cursor = 'auto';
                    element.style.pointerEvents = 'auto';
                    element.classList.remove('editor-selected', 'editor-hovering');
                    element.removeAttribute('data-editor-selected');
                    element.removeAttribute('data-editor-hover');
                  });
                  
                  // Force navigation back to admin
                  setTimeout(() => {
                    window.location.href = '/admin';
                  }, 100);
                }}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Header Editor
              </Button>
              <div className="text-lg font-semibold text-neonCyan">
                Header Editor
              </div>
              <div className="text-sm text-gray-400">
                Edit header navigation and layout
              </div>
              {selectedElement && selectedElementConfig && (
                <div className="px-3 py-1 bg-neonPink/20 rounded-lg border border-neonPink/30">
                  <span className="text-neonPink text-sm font-medium">
                    {selectedElementConfig.description}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Preview/Save buttons */}
              {pendingChanges.size > 0 && (
                <>
                  <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400 text-xs font-medium">
                      {pendingChanges.size} pending changes
                    </span>
                  </div>
                  

                  
                  <Button
                    data-editor-action="true"
                    variant="outline"
                    size="sm"
                    onClick={handleSaveChanges}
                    className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
                  <Button
                    data-editor-action="true"
                    variant="outline"
                    size="sm"
                    onClick={handleDiscardChanges}
                    className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Discard
                  </Button>
                </>
              )}
              
              {lastSaveTime && pendingChanges.size === 0 && (
                <div className="flex items-center space-x-2 text-green-400">
                  <span className="text-xs">
                    ✅ Saved: {lastSaveTime.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tool Selection Bar - ALWAYS VISIBLE */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400 font-medium">Header Tools:</span>
              
              {/* ALWAYS show basic tools, enable/disable based on selection */}
              <Button
                data-editor-action="true"
                variant={selectedTool === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToolSelect('text')}
                disabled={!selectedElement || !selectedElementConfig?.allowedTools.includes('text')}
                className={selectedTool === 'text' ? 'bg-neonPink text-black' : 'border-gray-500 text-gray-300'}
              >
                <Type className="w-4 h-4 mr-2" />
                Text {!selectedElement && '(Select Element)'}
              </Button>
              
              <Button
                data-editor-action="true"
                variant={selectedTool === 'color' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToolSelect('color')}
                disabled={!selectedElement || !selectedElementConfig?.allowedTools.includes('color')}
                className={selectedTool === 'color' ? 'bg-yellow-500 text-black' : 'border-gray-500 text-gray-300'}
              >
                <Palette className="w-4 h-4 mr-2" />
                Color {!selectedElement && '(Select Element)'}
              </Button>
              
              <Button
                data-editor-action="true"
                variant={selectedTool === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToolSelect('image')}
                disabled={!selectedElement || !selectedElementConfig?.allowedTools.includes('image')}
                className={selectedTool === 'image' ? 'bg-purple-500 text-white' : 'border-gray-500 text-gray-300'}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image {!selectedElement && '(Select Element)'}
              </Button>
            </div>

            {/* Current Selection Info */}
            {selectedElement && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-neonCyan rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Selected:</span>
                <strong className="text-neonCyan text-sm">{selectedElement}</strong>
                {selectedElementConfig && (
                  <span className="text-xs text-gray-400">({selectedElementConfig.type})</span>
                )}
              </div>
            )}
          </div>

          {/* Text Editing Panel */}
          {selectedTool === 'text' && selectedElement && (
            <div className="px-4 py-3 bg-gray-800 border-t border-gray-600">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-300 font-medium">Text Tools:</div>
                {!editingText ? (
                  <Button
                    data-editor-action="true"
                    onClick={handleTextEdit}
                    className="bg-neonCyan text-black hover:bg-neonCyan/80"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Edit Text Content
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder="Enter new text..."
                      className="flex-1 bg-gray-700 border-gray-600 text-white"
                      autoFocus
                    />
                    <Button
                      data-editor-action="true"
                      onClick={handleTextSave}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isSaving}
                    >
                      Apply Text
                    </Button>
                    <Button
                      data-editor-action="true"
                      onClick={() => setEditingText(false)}
                      variant="outline"
                      className="border-gray-500"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Color Editor with Gradient Support - Compact Floating Panel */}
          {selectedTool === 'color' && selectedElement && (
            <div className="fixed top-32 left-4 z-[100001] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-3 max-w-6xl max-h-[calc(100vh-140px)] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-300 font-medium">Color Tools</div>
                <Button
                  data-editor-action="true"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTool('text')}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {/* Color Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-300">Mode:</span>
                  <Button
                    data-editor-action="true"
                    onClick={() => setColorMode('text')}
                    variant={colorMode === 'text' ? 'default' : 'outline'}
                    size="sm"
                    className={
                      colorMode === 'text'
                        ? 'border-2 border-neonCyan shadow-[0_0_8px_2px_#00FFFF55] text-white text-xs px-3 py-1'
                        : 'border border-gray-500 text-gray-300 text-xs px-3 py-1'
                    }
                  >
                    Text
                  </Button>
                  <Button
                    data-editor-action="true"
                    onClick={() => setColorMode('background')}
                    variant={colorMode === 'background' ? 'default' : 'outline'}
                    size="sm"
                    className={
                      colorMode === 'background'
                        ? 'border-2 border-neonPink shadow-[0_0_8px_2px_#FF00FF55] text-white text-xs px-3 py-1'
                        : 'border border-gray-500 text-gray-300 text-xs px-3 py-1'
                    }
                  >
                    Background
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {/* Color Picker Section - Compact */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-gray-300">Color Picker</h3>
                    <HexColorPicker
                      color={selectedColor}
                      onChange={setSelectedColor}
                      style={{ width: '100%', height: '120px' }}
                    />
                    <div className="flex items-center space-x-1">
                      <Input
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 bg-gray-700 border-gray-600 text-white font-mono text-xs h-6"
                      />
                      <div 
                        className="w-6 h-6 rounded border border-gray-600"
                        style={{ backgroundColor: selectedColor }}
                      ></div>
                    </div>
                  </div>

                  {/* Theme Colors Section - Compact */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-gray-300">Theme Colors</h3>
                    <div className="grid grid-cols-3 gap-1">
                      {THEME_COLORS.map((color) => (
                        <button
                          key={color}
                          data-editor-action="true"
                          onClick={() => setSelectedColor(color)}
                          className="w-7 h-7 rounded border border-gray-600 hover:border-white transition-colors"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Gradient Start Color */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-gray-300">Gradient Start</h3>
                    <HexColorPicker
                      color={gradientColor1}
                      onChange={setGradientColor1}
                      style={{ width: '100%', height: '120px' }}
                    />
                    <Input
                      value={gradientColor1}
                      onChange={(e) => setGradientColor1(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white font-mono text-xs h-6"
                    />
                  </div>

                  {/* Gradient End Color */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-gray-300">Gradient End</h3>
                    <HexColorPicker
                      color={gradientColor2}
                      onChange={setGradientColor2}
                      style={{ width: '100%', height: '120px' }}
                    />
                    <Input
                      value={gradientColor2}
                      onChange={(e) => setGradientColor2(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white font-mono text-xs h-6"
                    />
                  </div>
                </div>

                {/* Gradient Controls */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
                  {/* Direction */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Direction</label>
                    <select
                      value={gradientDirection}
                      onChange={(e) => setGradientDirection(e.target.value as typeof gradientDirection)}
                      className="w-full bg-gray-700 border-gray-600 text-white text-xs rounded px-2 py-1 h-6"
                    >
                      <option value="to right">Left to Right</option>
                      <option value="to left">Right to Left</option>
                      <option value="to bottom">Top to Bottom</option>
                      <option value="to top">Bottom to Top</option>
                      <option value="45deg">Diagonal ↗</option>
                      <option value="135deg">Diagonal ↘</option>
                    </select>
                  </div>

                  {/* Gradient Presets */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Presets</label>
                    <div className="grid grid-cols-2 gap-1">
                      {GRADIENT_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          data-editor-action="true"
                          onClick={() => handleGradientPreset(preset.value)}
                          className="h-5 rounded border border-gray-600 hover:border-white transition-colors text-xs text-white overflow-hidden"
                          style={{ background: preset.value }}
                          title={preset.name}
                        >
                          {preset.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex justify-center space-x-2 pt-2 border-t border-gray-700">
                  <Button
                    data-editor-action="true"
                    onClick={handleColorApply}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                    size="sm"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <Paintbrush className="w-3 h-3 mr-1" />
                    )}
                    Apply Color
                  </Button>
                  <Button
                    data-editor-action="true"
                    onClick={handleColorApply}
                    disabled={isSaving}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs"
                    size="sm"
                  >
                    Apply Gradient
                  </Button>
                  <Button
                    data-editor-action="true"
                    onClick={handleClearGradient}
                    variant="destructive"
                    size="sm"
                    className="px-2 py-1 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Image Editing Panel */}
          {selectedTool === 'image' && selectedElement && (
            <div className="px-4 py-3 bg-gray-800 border-t border-gray-600">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-300 font-medium">Image Tools:</div>
                <Button
                  data-editor-action="true"
                  onClick={() => setShowSimpleImageEditor(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Edit Image
                </Button>
                <span className="text-xs text-gray-400">
                  Upload, replace, or edit header images
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT AREA with padding to avoid toolbar overlap */}
        <div className="pt-52">
          {children}
        </div>
      </div>

      {/* Enhanced Image Editor Modal */}
      {showSimpleImageEditor && (
        <div className="fixed inset-0 bg-black/50 z-[100002] flex items-center justify-center p-4">
          <SimpleImageEditor
            currentImageUrl={(() => {
              if (selectedElement) {
                const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
                if (element) {
                  if (element.tagName === 'IMG') {
                    return (element as HTMLImageElement).src;
                  } else {
                    // Extract URL from background-image
                    const bgImage = element.style.backgroundImage;
                    const match = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/);
                    return match ? match[1] : '';
                  }
                }
              }
              return '';
            })()}
            elementId={selectedElement || undefined}
            elementType={selectedElement?.includes('logo') ? 'icon' : 'image'}
            onImageChange={(imageUrl: string) => {
              handleImageChange(imageUrl);
              setShowSimpleImageEditor(false);
            }}
            onClose={() => setShowSimpleImageEditor(false)}
          />
        </div>
      )}
    </>
  );
}
