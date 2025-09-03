'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePageEditor } from '@/hooks/usePageEditor';
import { useAuth } from '@/components/AuthProvider';
import { HexColorPicker } from 'react-colorful';
import {
  Type,
  Palette,
  Image as ImageIcon,
  Save,
  RefreshCw,
  ArrowLeft,
  Settings,
  Paintbrush,
  X,
  AlertTriangle,
  Eye
} from 'lucide-react';

// Website theme colors from tailwind.config.js
const THEME_COLORS = [
  '#FFFFFF', // Pure white
  '#1A1A1A', // darkBg
  '#00FFFF', // neonCyan
  '#FF00FF', // neonPink
  '#00FF00', // neon-green
  '#0080FF', // neon-blue
  '#8000FF', // neon-purple
  '#FF8000', // neon-orange
  '#FFFF00', // neon-yellow
  '#FF4500', // neon-sunset
  '#000000', // Pure black
  '#888888', // Gray
];

// Gradient presets for the website theme
const GRADIENT_PRESETS = [
  { name: 'Neon Gradient', value: 'linear-gradient(to right, #00FFFF, #FF00FF)' },
  { name: 'Cyber Blue', value: 'linear-gradient(45deg, #00FFFF, #0080FF)' },
  { name: 'Pink Sunset', value: 'linear-gradient(135deg, #FF00FF, #FF4500)' },
  { name: 'Electric Green', value: 'linear-gradient(to bottom, #00FF00, #00FFFF)' },
  { name: 'Purple Dream', value: 'linear-gradient(90deg, #8000FF, #FF00FF)' },
  { name: 'Orange Glow', value: 'linear-gradient(180deg, #FF8000, #FFFF00)' },
];

// Homepage-specific editor tool types
type HomepageEditorTool = 'text' | 'color' | 'image';
type HomepageElementType = 'hero-title' | 'hero-subtitle' | 'section-heading' | 'section-text' | 'cta-button' | 'badge' | 'image';

interface HomepageElementConfig {
  type: HomepageElementType;
  allowedTools: HomepageEditorTool[];
  description: string;
}

interface PendingChange {
  type: 'text' | 'color' | 'image' | 'style';
  value: string;
  originalValue: string;
  elementId: string;
}

interface HomepageEditorProps {
  children: React.ReactNode;
}

export default function HomepageEditor({ children }: HomepageEditorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { savePageSetting } = usePageEditor('homepage', user?.id);

  // Editor state - Start with 'text' as default
  const [selectedTool, setSelectedTool] = useState<HomepageEditorTool>('text');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElementConfig, setSelectedElementConfig] = useState<HomepageElementConfig | null>(null);
  const [editingText, setEditingText] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  // Color picker state - Always visible when color tool is active
  const [colorMode, setColorMode] = useState<'text' | 'background'>('text');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  
  // Enhanced gradient support
  const [gradientColor1, setGradientColor1] = useState('#00FFFF');
  const [gradientColor2, setGradientColor2] = useState('#FF00FF');
  const [gradientDirection, setGradientDirection] = useState<'to right' | 'to left' | 'to bottom' | 'to top' | '45deg' | '135deg'>('to right');
  
  // Preview/Save state - NO AUTO-SAVE
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());

  // Homepage-specific element configuration
  const getHomepageElementConfig = (element: HTMLElement): HomepageElementConfig => {
    const elementId = element.getAttribute('data-editable') || '';
    const classList = Array.from(element.classList);
    const tagName = element.tagName.toLowerCase();
    
    // Main homepage hero elements
    if (elementId.includes('main-heading') || elementId.includes('hero-title')) {
      return {
        type: 'hero-title',
        allowedTools: ['text', 'color'],
        description: 'Hero Title - Main homepage heading'
      };
    }
    
    if (elementId.includes('hero-subheading') || elementId.includes('hero-subtitle')) {
      return {
        type: 'hero-subtitle',
        allowedTools: ['text', 'color'],
        description: 'Hero Subtitle - Secondary hero text'
      };
    }
    
    // CTA (Call to Action) elements
    if (elementId.includes('cta-heading') || elementId.includes('cta-title')) {
      return {
        type: 'section-heading',
        allowedTools: ['text', 'color'],
        description: 'CTA Heading - Call to action title'
      };
    }
    
    if (elementId.includes('cta-description')) {
      return {
        type: 'section-text',
        allowedTools: ['text', 'color'],
        description: 'CTA Description - Call to action text'
      };
    }
    
    // Badge elements
    if (elementId.includes('badge') || elementId.includes('now-open') || elementId.includes('service-options')) {
      return {
        type: 'badge',
        allowedTools: ['text', 'color'],
        description: 'Badge - Status or feature badge'
      };
    }
    
    // Categories section elements
    if (elementId.includes('categories-title')) {
      return {
        type: 'section-heading',
        allowedTools: ['text', 'color'],
        description: 'Categories Title - Section heading'
      };
    }
    
    if (elementId.includes('category-') && elementId.includes('-title')) {
      return {
        type: 'section-heading',
        allowedTools: ['text', 'color'],
        description: 'Category Title - Individual category name'
      };
    }
    
    if (elementId.includes('category-') && elementId.includes('-description')) {
      return {
        type: 'section-text',
        allowedTools: ['text', 'color'],
        description: 'Category Description - Category details'
      };
    }
    
    if (elementId.includes('category-') && elementId.includes('-icon')) {
      return {
        type: 'section-text',
        allowedTools: ['text'],
        description: 'Category Icon - Emoji or symbol'
      };
    }
    
    if (elementId.includes('category-') && elementId.includes('-card')) {
      return {
        type: 'cta-button',
        allowedTools: ['color'],
        description: 'Category Card - Background and styling'
      };
    }
    
    if (elementId.includes('categories-button')) {
      return {
        type: 'cta-button',
        allowedTools: ['text', 'color'],
        description: 'Categories Button - View menu button'
      };
    }
    
    // Events section elements
    if (elementId.includes('events-section-title')) {
      return {
        type: 'section-heading',
        allowedTools: ['text', 'color'],
        description: 'Events Title - Section heading'
      };
    }
    
    if (elementId.includes('events-section-subtitle')) {
      return {
        type: 'section-text',
        allowedTools: ['text', 'color'],
        description: 'Events Subtitle - Section description'
      };
    }
    
    if (elementId.includes('event-title')) {
      return {
        type: 'section-heading',
        allowedTools: ['text', 'color'],
        description: 'Event Title - Individual event name'
      };
    }
    
    if (elementId.includes('event-description')) {
      return {
        type: 'section-text',
        allowedTools: ['text', 'color'],
        description: 'Event Description - Event details'
      };
    }
    
    if (elementId.includes('events-no-content') || elementId.includes('events-admin-hint')) {
      return {
        type: 'section-text',
        allowedTools: ['text', 'color'],
        description: 'Events Message - No content message'
      };
    }
    
    // Bookings section elements
    if (elementId.includes('bookings-title')) {
      return {
        type: 'section-heading',
        allowedTools: ['text', 'color'],
        description: 'Bookings Title - Section heading'
      };
    }
    
    if (elementId.includes('bookings-description')) {
      return {
        type: 'section-text',
        allowedTools: ['text', 'color'],
        description: 'Bookings Description - Section details'
      };
    }
    
    if (elementId.includes('bookings-button')) {
      return {
        type: 'cta-button',
        allowedTools: ['text', 'color'],
        description: 'Bookings Button - Book now button'
      };
    }
    
    // Feature text elements (Quality, Location, Parking)
    if (elementId.includes('feature-text') || 
        elementId.includes('quality-feature') || 
        elementId.includes('location-feature') || 
        elementId.includes('parking-feature')) {
      return {
        type: 'section-text',
        allowedTools: ['text', 'color'],
        description: 'Feature Text - Highlight feature'
      };
    }
    
    // Background sections
    if (elementId.includes('background') || elementId.includes('section-background')) {
      return {
        type: 'section-text',
        allowedTools: ['color'],
        description: 'Section Background - Background styling'
      };
    }
    
    // Container elements
    if (elementId.includes('container') || elementId.includes('-container')) {
      return {
        type: 'cta-button',
        allowedTools: ['color'],
        description: 'Container Element - Layout container'
      };
    }
    
    // Images
    if (tagName === 'img' || elementId.includes('image') || elementId.includes('logo')) {
      return {
        type: 'image',
        allowedTools: ['image'],
        description: 'Image - Homepage image content'
      };
    }
    
    // Button elements
    if (tagName === 'button' || elementId.includes('button') || 
        classList.some(c => c.includes('button'))) {
      return {
        type: 'cta-button',
        allowedTools: ['text', 'color'],
        description: 'Button Element - Interactive button'
      };
    }
    
    // General headings
    if (tagName.match(/^h[1-6]$/) || elementId.includes('heading') || elementId.includes('title')) {
      return {
        type: 'section-heading',
        allowedTools: ['text', 'color'],
        description: 'Heading Element - Text heading'
      };
    }
    
    // Default text elements
    return {
      type: 'section-text',
      allowedTools: ['text', 'color'],
      description: 'Text Content - Homepage text'
    };
  };

  // Handle element selection with homepage-specific logic
  const handleElementClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // CRITICAL: Block ALL navigation attempts - no exceptions
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Ignore clicks on editor toolbar
    if (target.closest('[data-editor-toolbar]') || target.closest('[data-editor-action]')) {
      return;
    }
    
    // Find the closest editable element
    const editableElement = target.closest('[data-editable]') as HTMLElement;
    
    if (!editableElement) {
      // Clicked outside editable area - clear selection
      setSelectedElement(null);
      setSelectedElementConfig(null);
      return;
    }
    
    const elementId = editableElement.getAttribute('data-editable');
    
    if (elementId) {
      // Clear previous selection
      document.querySelectorAll('[data-editable]').forEach(el => {
        (el as HTMLElement).style.outline = 'none';
        el.classList.remove('editor-selected');
      });
      
      // Select new element
      editableElement.style.outline = '3px solid #ff0000'; // RED neon border for selection
      editableElement.classList.add('editor-selected');
      
      const config = getHomepageElementConfig(editableElement);
      
      setSelectedElement(elementId);
      setSelectedElementConfig(config);
      
      // FIXED: Update text value when switching elements
      const currentText = editableElement.textContent || '';
      setTextValue(currentText);
      setEditingText(false); // Exit text editing mode when switching
      
      // Auto-select appropriate tool
      if (config.allowedTools.includes('text')) {
        setSelectedTool('text');
      } else if (config.allowedTools.includes('image')) {
        setSelectedTool('image');
      } else {
        setSelectedTool('color');
      }
      
      console.log(`🎯 Selected homepage element: ${elementId} (${config.type})`);
    }
  }, []);

  // Handle tool selection with validation
  const handleToolSelect = (tool: HomepageEditorTool) => {
    if (!selectedElement) {
      toast({
        title: "🎯 Select Element First",
        description: "Please select a homepage element before choosing a tool",
        variant: "destructive"
      });
      return;
    }

    const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
    if (element && selectedElementConfig) {
      if (!selectedElementConfig.allowedTools.includes(tool)) {
        toast({
          title: "🚫 Tool Not Allowed",
          description: `${tool} tool is not available for ${selectedElementConfig.type} elements`,
          variant: "destructive"
        });
        return;
      }
    }

    setSelectedTool(tool);
    
    // Reset color mode when switching away from color tool  
    if (tool !== 'color') {
      setColorMode('text');
    }
  };

  // Text editing functions
  const handleTextEdit = () => {
    if (selectedElement) {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`);
      if (element) {
        const currentText = element.textContent || '';
        setTextValue(currentText);
        setEditingText(true);
      }
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

  // Color application function
  const handleColorApply = () => {
    if (!selectedElement) return;
    
    const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
    if (!element) return;

    const property = colorMode === 'text' ? 'color' : 'backgroundColor';
    const oldValue = element.style[property] || '';
    
    let newValue: string;
    
    // Check if we're applying a gradient (only for background)
    if (colorMode === 'background' && (gradientColor1 !== gradientColor2)) {
      newValue = `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2})`;
      element.style.background = newValue;
    } else {
      newValue = selectedColor;
      element.style[property] = newValue;
    }

    // Add to pending changes
    const newPendingChanges = new Map(pendingChanges);
    newPendingChanges.set(`${selectedElement}-${colorMode}`, {
      type: 'color',
      value: newValue,
      originalValue: oldValue,
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
    
    // Add to pending changes
    const newPendingChanges = new Map(pendingChanges);
    newPendingChanges.set(`${selectedElement}-background`, {
      type: 'color',
      value: gradient,
      originalValue: element.style.background || '',
      elementId: selectedElement
    });
    setPendingChanges(newPendingChanges);
    
    toast({
      title: "🌈 Gradient Applied",
      description: "Preset gradient applied successfully",
      duration: 1500
    });
  };

  // Save/Preview/Discard functions
  const handleSaveChanges = async () => {
    if (pendingChanges.size === 0) return;
    
    setIsSaving(true);
    try {
      const savePromises = Array.from(pendingChanges.values()).map(async (change) => {
        // Create proper setting data for the database
        return savePageSetting({
          setting_key: change.elementId,
          setting_value: change.value,
          page_scope: 'homepage',
          category: change.type
        });
      });
      
      await Promise.all(savePromises);
      setPendingChanges(new Map());
      setLastSaveTime(new Date());
      
      toast({
        title: "✅ Changes Saved",
        description: `Successfully saved ${savePromises.length} changes to homepage`,
        duration: 5000,
      });
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

  const handlePreviewChanges = () => {
    toast({
      title: "👁️ Preview Mode",
      description: "You are currently seeing the preview of your changes",
      duration: 3000,
    });
  };

  const handleDiscardChanges = () => {
    // Revert all pending changes
    pendingChanges.forEach((change) => {
      const element = document.querySelector(`[data-editable="${change.elementId}"]`) as HTMLElement;
      if (element) {
        if (change.type === 'text') {
          element.textContent = change.originalValue;
        } else if (change.type === 'color') {
          if (change.elementId.includes('text') || colorMode === 'text') {
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
    });
  };

  // ULTIMATE Navigation Blocking - Block EVERYTHING that could cause navigation
  useEffect(() => {
    const blockAllNavigation = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // ALLOW: Editor toolbar and actions
      if (target.closest('[data-editor-action]') || 
          target.closest('[data-editor-toolbar]') ||
          target.closest('[data-editor-form]')) {
        return;
      }

      // ALLOW: Clicks on editable elements for selection (but still block navigation)
      const editableElement = target.closest('[data-editable]');
      if (editableElement && e.type === 'click') {
        // Let the click through for element selection, but prevent any navigation
        const linkElement = target.closest('a');
        const buttonElement = target.closest('button');
        
        if (linkElement || buttonElement) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          toast({
            title: "🚫 Navigation Blocked",
            description: "Click detected - element will be selected for editing instead",
            variant: "destructive",
            duration: 2000
          });
        }
        
        // Allow the click to continue for element selection
        return;
      }

      // BLOCK EVERYTHING ELSE - no exceptions
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // Show toast for blocked navigation attempts
      if (target.tagName === 'A' || target.closest('a')) {
        toast({
          title: "🚫 Navigation Blocked",
          description: "Exit homepage editor to navigate. Click elements to edit them instead.",
          variant: "destructive",
          duration: 2000
        });
      }
      
      return false;
    };

    // COMPREHENSIVE event blocking - capture ALL possible navigation events
    const eventTypes = [
      'click',
      'mousedown', 
      'mouseup',
      'touchstart',
      'touchend',
      'keydown',
      'keyup',
      'submit',
      'change'
    ];

    // Block at document level with capture phase to catch everything
    eventTypes.forEach(eventType => {
      document.addEventListener(eventType, blockAllNavigation, {
        capture: true,
        passive: false
      });
    });

    // Additional specific blocking for navigation
    const blockKeyboardNavigation = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Allow only in editor areas
      if (target.closest('[data-editor-action]') || 
          target.closest('[data-editor-toolbar]') ||
          target.closest('[data-editor-form]')) {
        return;
      }

      // ALLOW essential browser shortcuts
      if (
        e.key === 'F12' || // DevTools
        e.key === 'F5' || // Refresh
        (e.ctrlKey && e.key === 'r') || // Ctrl+R refresh
        (e.ctrlKey && e.shiftKey && e.key === 'R') || // Ctrl+Shift+R hard refresh
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I DevTools
        (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl+Shift+J DevTools Console
        (e.ctrlKey && e.key === 'u') || // Ctrl+U view source
        (e.ctrlKey && e.key === 's') || // Ctrl+S save (for dev)
        (e.altKey && e.key === 'Tab') || // Alt+Tab window switching
        e.key === 'Escape' // Escape key
      ) {
        return; // Allow these shortcuts
      }

      // Block navigation keys for page elements
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    document.addEventListener('keydown', blockKeyboardNavigation, { capture: true, passive: false });

    // Block form submissions completely
    const blockFormSubmission = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-editor-form]')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        toast({
          title: "🚫 Form Submission Blocked",
          description: "Exit editor to submit forms",
          variant: "destructive"
        });
      }
    };

    document.addEventListener('submit', blockFormSubmission, { capture: true, passive: false });

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
      // Cleanup all event listeners
      eventTypes.forEach(eventType => {
        document.removeEventListener(eventType, blockAllNavigation, true);
      });
      
      document.removeEventListener('keydown', blockKeyboardNavigation, true);
      document.removeEventListener('submit', blockFormSubmission, true);
      
      // Restore window methods
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [toast]);

  // Add element hover effects and click handlers
  useEffect(() => {
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      const editableElement = target.closest('[data-editable]') as HTMLElement;
      
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
                  console.log('🚪 Exiting Homepage Editor - Complete state reset');
                  
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
                Exit Homepage Editor
              </Button>
              <div className="text-lg font-semibold text-neonCyan">
                Homepage Editor
              </div>
              <div className="text-sm text-gray-400">
                Edit homepage content and layout
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
                    onClick={handlePreviewChanges}
                    className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                    disabled={isSaving}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  
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
              <span className="text-sm text-gray-400 font-medium">Homepage Tools:</span>
              
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
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSaving ? 'Saving...' : 'Apply'}
                    </Button>
                    <Button
                      data-editor-action="true"
                      onClick={() => setEditingText(false)}
                      variant="outline"
                      className="border-gray-600 text-gray-300"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Color Editing Panel - Auto-visible when color tool is active */}
          {/* Enhanced Color Editor with Gradient Support - HeaderEditor Style Floating Panel */}
          {selectedTool === 'color' && selectedElement && (
            <div className="fixed top-32 left-4 z-[100001] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 max-w-4xl">
              <div className="flex items-center justify-between mb-4">
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
              
              <div className="space-y-4">
                {/* Color Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-300">Color Mode:</span>
                    <Button
                      data-editor-action="true"
                      onClick={() => setColorMode('text')}
                      variant={colorMode === 'text' ? 'default' : 'outline'}
                      size="sm"
                      className={
                        colorMode === 'text'
                          ? 'border-2 border-neonCyan shadow-[0_0_8px_2px_#00FFFF55] text-white'
                          : 'border border-gray-500 text-gray-300'
                      }
                    >
                      Text Color
                    </Button>
                    <Button
                      data-editor-action="true"
                      onClick={() => setColorMode('background')}
                      variant={colorMode === 'background' ? 'default' : 'outline'}
                      size="sm"
                      className={
                        colorMode === 'background'
                          ? 'border-2 border-neonPink shadow-[0_0_8px_2px_#FF00FF55] text-white'
                          : 'border border-gray-500 text-gray-300'
                      }
                    >
                      Background
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Color Picker Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">Color Picker</h3>
                    <HexColorPicker
                      color={selectedColor}
                      onChange={setSelectedColor}
                      style={{ width: '100%', height: '200px' }}
                    />
                    <div className="flex items-center space-x-2 mt-3">
                      <span className="text-xs text-gray-400">Hex:</span>
                      <Input
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 bg-gray-700 border-gray-600 text-white font-mono text-sm"
                      />
                      <div 
                        className="w-12 h-8 rounded border border-gray-600"
                        style={{ backgroundColor: selectedColor }}
                      ></div>
                    </div>
                  </div>

                  {/* Theme Colors Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">Website Theme Colors</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {THEME_COLORS.map((color) => (
                        <button
                          key={color}
                          data-editor-action="true"
                          onClick={() => setSelectedColor(color)}
                          className="w-12 h-12 rounded border-2 border-gray-600 hover:border-white transition-colors"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Gradient Editor - Always Visible */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">Gradient Editor</h3>
                    {/* Gradient Color 1 */}
                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">Start Color</label>
                      <HexColorPicker
                        color={gradientColor1}
                        onChange={setGradientColor1}
                        style={{ width: '100%', height: '120px' }}
                      />
                      <Input
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        className="mt-2 bg-gray-700 border-gray-600 text-white font-mono text-sm"
                      />
                    </div>
                    {/* Gradient Color 2 */}
                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">End Color</label>
                      <HexColorPicker
                        color={gradientColor2}
                        onChange={setGradientColor2}
                        style={{ width: '100%', height: '120px' }}
                      />
                      <Input
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        className="mt-2 bg-gray-700 border-gray-600 text-white font-mono text-sm"
                      />
                    </div>
                    {/* Gradient Direction */}
                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">Direction</label>
                      <select
                        value={gradientDirection}
                        onChange={(e) => setGradientDirection(e.target.value as typeof gradientDirection)}
                        className="w-full bg-gray-700 border-gray-600 text-white text-sm rounded px-3 py-2"
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
                    <div className="space-y-2">
                      {GRADIENT_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          data-editor-action="true"
                          onClick={() => handleGradientPreset(preset.value)}
                          className="w-full h-8 rounded border border-gray-600 hover:border-white transition-colors text-left px-3 text-xs text-white"
                          style={{ background: preset.value }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                    {/* Gradient Apply/Clear Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        data-editor-action="true"
                        onClick={handleColorApply}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white px-8"
                      >
                        {isSaving ? (
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Paintbrush className="w-4 h-4 mr-2" />
                        )}
                        Apply Gradient to {colorMode === 'text' ? 'Text' : 'Background'}
                      </Button>
                      <Button
                        data-editor-action="true"
                        onClick={handleClearGradient}
                        variant="destructive"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                        Clear Gradient
                      </Button>
                    </div>
                  </div>
                </div>

                {/* No separate apply button needed, handled above */}
              </div>
            </div>
          )}
        </div>

        {/* Homepage Content Container - Isolated within overlay */}
        <div className="pt-40 min-h-screen bg-darkBg">
          {children}
        </div>
      </div>
    </>
  );
}
