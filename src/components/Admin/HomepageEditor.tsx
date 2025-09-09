'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePageEditor } from '@/hooks/usePageEditor';
import { useAuth } from '@/components/AuthProvider';
import { HexColorPicker } from 'react-colorful';
import { EditorModeProvider } from '@/contexts/EditorModeContext';
import {
  Type,
  Palette,
  Image as ImageIcon,
  Save,
  RefreshCw,
  ArrowLeft,
  Paintbrush,
  X,
  AlertTriangle,
  Eye
} from 'lucide-react';

// HOMEPAGE EDITABLE ELEMENTS - Preconfigured for reliable detection
const HOMEPAGE_EDITABLE_ELEMENTS = [
  // Hero/Main Section
  'main-heading',
  'hero-subheading',
  'hero-title',
  'hero-subtitle',
  'cta-heading',
  'cta-description',
  'badge-now-open',
  'service-options',
  
  // Categories Section
  'categories-title',
  'category-1-card',
  'category-1-icon', 
  'category-1-title',
  'category-1-description',
  'category-2-card',
  'category-2-icon',
  'category-2-title', 
  'category-2-description',
  'category-3-card',
  'category-3-icon',
  'category-3-title',
  'category-3-description',
  'category-4-card',
  'category-4-icon',
  'category-4-title',
  'category-4-description',
  'categories-button',
  
  // Events & Specials Section
  'events-section-title',
  'events-section-subtitle',
  'event-title',
  'event-description', 
  'events-no-content',
  'events-admin-hint',
  
  // Bookings Section
  'bookings-title',
  'bookings-description',
  'booking-button',
  'bookings-feature-1',
  'bookings-feature-2',
  'bookings-feature-3',
  'bookings-coming-soon'
];

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
  
  // Color picker state - Only visible when manually activated
  const [colorMode, setColorMode] = useState<'text' | 'background'>('text');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [showColorPanel, setShowColorPanel] = useState(false);
  
  // Enhanced gradient support with improved workflow
  const [gradientMode, setGradientMode] = useState(false); // NEW: Controls if gradient editing is active
  const [gradientColor1, setGradientColor1] = useState('#00FFFF');
  const [gradientColor2, setGradientColor2] = useState('#FF00FF');
  const [gradientDirection, setGradientDirection] = useState<'to right' | 'to left' | 'to bottom' | 'to top' | '45deg' | '135deg'>('to right');
  
  // REMOVED: Live preview state - no auto-apply needed
  
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
    
    console.log('🖱️ Homepage click detected on:', target.tagName, target.className);
    console.log('🖱️ Target data-editable:', target.getAttribute('data-editable'));
    console.log('🖱️ Target textContent:', target.textContent?.slice(0, 50));
    
    // Block navigation but allow editor functionality
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
      console.log('❌ No editable element - clearing selection');
      setSelectedElement(null);
      setSelectedElementConfig(null);
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
      
      const config = getHomepageElementConfig(editableElement);
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

      // FIXED: Update text value when switching elements
      const currentText = editableElement.textContent || '';
      setTextValue(currentText);
      setEditingText(false); // Exit text editing mode when switching
      setShowColorPanel(false); // Hide color panel when switching elements
      
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
  }, [toast]);

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
    
    // Toggle color panel visibility manually
    if (tool === 'color') {
      setShowColorPanel(!showColorPanel);
    } else {
      setShowColorPanel(false);
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
    if (!selectedElement || !textValue.trim()) {
      toast({
        title: "❌ Text Error",
        description: "Please enter text content",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
      if (element) {
        const originalText = element.textContent || '';
        
        // FIXED: Apply changes to DOM immediately for preview
        element.textContent = textValue;
        
        // Add to pending changes for database saving
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
          title: "✅ Text Applied",
          description: "Text preview applied. Click 'Save Changes' to make permanent",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error applying text change:', error);
      toast({
        title: "❌ Text Apply Failed",
        description: "Could not apply text change",
        variant: "destructive"
      });
    }
    setIsSaving(false);
  };

  // Color application function - FIXED: No auto-apply, only on Apply button
  const handleColorApply = () => {
    if (!selectedElement) {
      toast({
        title: "❌ No Element Selected",
        description: "Please select an element first",
        variant: "destructive"
      });
      return;
    }
    
    const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
    if (!element) {
      toast({
        title: "❌ Element Not Found",
        description: "Selected element not found in DOM",
        variant: "destructive"
      });
      return;
    }

    let newValue: string;
    let originalValue: string;
    
    // Determine what property to change and get original value
    if (colorMode === 'background' && gradientMode && (gradientColor1 !== gradientColor2)) {
      // Gradient background
      newValue = `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2})`;
      originalValue = element.style.background || element.style.backgroundColor || 
                     getComputedStyle(element).backgroundColor || '';
      
      // Apply gradient to DOM
      element.style.background = newValue;
      element.style.backgroundColor = ''; // Clear solid background
    } else if (colorMode === 'background') {
      // Solid background color
      originalValue = element.style.backgroundColor || 
                     getComputedStyle(element).backgroundColor || '';
      
      // Apply background color to DOM
      element.style.backgroundColor = selectedColor;
      element.style.background = ''; // Clear gradient
      newValue = selectedColor;
    } else {
      // Text color
      originalValue = element.style.color || 
                     getComputedStyle(element).color || '';
      
      // Apply text color to DOM
      element.style.color = selectedColor;
      newValue = selectedColor;
    }

    // Add to pending changes for database saving
    const changeKey = `${selectedElement}-${colorMode}`;
    const newPendingChanges = new Map(pendingChanges);
    newPendingChanges.set(changeKey, {
      type: 'color',
      value: newValue,
      originalValue: originalValue,
      elementId: selectedElement
    });
    setPendingChanges(newPendingChanges);

    const colorType = gradientMode && colorMode === 'background' ? 'Gradient' : 
                     (colorMode === 'text' ? 'Text Color' : 'Background Color');

    toast({
      title: `🎨 ${colorType} Applied`,
      description: "Color preview applied. Click 'Save Changes' to make permanent",
      duration: 3000,
    });
  };

  // Clear gradient
  const _handleClearGradient = () => {
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

  // REMOVED: Live preview functions - no auto-apply needed
  // Preview will only happen when clicking Preview button

  const handleLiveColorChange = (newColor: string) => {
    setSelectedColor(newColor);
    // REMOVED: No automatic live preview - only update state
    // Live preview will only happen on hover or manual preview
  };

  // REMOVED: handleLiveGradientChange - no auto-apply needed

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
    // Apply all pending changes to the DOM for preview
    pendingChanges.forEach((change) => {
      const element = document.querySelector(`[data-editable="${change.elementId}"]`) as HTMLElement;
      if (element) {
        if (change.type === 'text') {
          element.textContent = change.value;
        } else if (change.type === 'color') {
          // Extract the color mode from the key (elementId contains -text or -background)
          const isBackground = change.elementId.includes('-background') || colorMode === 'background';
          
          if (change.value.includes('linear-gradient')) {
            element.style.background = change.value;
          } else if (isBackground) {
            element.style.backgroundColor = change.value;
          } else {
            element.style.color = change.value;
          }
        }
      }
    });
    
    toast({
      title: "👁️ Preview Applied",
      description: `Showing preview of ${pendingChanges.size} changes. Use 'Save Changes' to make permanent or 'Discard' to revert.`,
      duration: 4000,
    });
  };

  const handleDiscardChanges = () => {
    if (pendingChanges.size === 0) {
      toast({
        title: "🔄 No Changes to Discard",
        description: "No pending changes found",
        duration: 2000,
      });
      return;
    }

    // ENHANCED: Properly revert all pending changes with improved logic
    let revertedCount = 0;
    
    pendingChanges.forEach((change) => {
      const element = document.querySelector(`[data-editable="${change.elementId}"]`) as HTMLElement;
      if (element) {
        switch (change.type) {
          case 'text':
            element.textContent = change.originalValue;
            revertedCount++;
            break;
            
          case 'color':
            // ENHANCED: Better color reversion logic
            try {
              // Determine what type of color change this was
              const isBackgroundChange = change.elementId.includes('-background') || 
                                        change.value.includes('linear-gradient') ||
                                        change.value.includes('rgb') ||
                                        change.value.includes('#') && change.originalValue.includes('rgb');
              
              if (change.value.includes('linear-gradient')) {
                // Gradient reversion
                element.style.background = change.originalValue;
                element.style.backgroundColor = '';
              } else if (isBackgroundChange) {
                // Background color reversion
                element.style.backgroundColor = change.originalValue;
                element.style.background = '';
              } else {
                // Text color reversion
                element.style.color = change.originalValue;
              }
              revertedCount++;
            } catch (error) {
              console.error('Error reverting color change:', error);
            }
            break;
            
          case 'image':
            if (element.tagName === 'IMG') {
              (element as HTMLImageElement).src = change.originalValue;
            } else {
              element.style.backgroundImage = change.originalValue;
            }
            revertedCount++;
            break;
            
          default:
            console.warn('Unknown change type:', change.type);
        }
      } else {
        console.warn('Element not found for discard:', change.elementId);
      }
    });
    
    // Clear all pending changes
    setPendingChanges(new Map());
    
    // Reset editor state
    setEditingText(false);
    setShowColorPanel(false);
    setGradientMode(false);
    setSelectedColor('#ffffff');
    setGradientColor1('#00FFFF');
    setGradientColor2('#FF00FF');
    
    toast({
      title: "🗑️ Changes Discarded",
      description: `Successfully reverted ${revertedCount} changes to original state`,
      duration: 3000,
    });
  };

  // ENHANCED Navigation Blocking - Comprehensive prevention
  useEffect(() => {
    const blockNavigation = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // ALWAYS ALLOW: Editor toolbar and actions
      if (target.closest('[data-editor-action]') || 
          target.closest('[data-editor-toolbar]') ||
          target.closest('[data-editor-form]')) {
        return;
      }

      // ENHANCED: Block navigation attempts more comprehensively
      if (e.type === 'click') {
        const linkElement = target.closest('a');
        const buttonElement = target.closest('button');
        const formElement = target.closest('form');
        
        // Block link navigation (except editor links)
        if (linkElement && !target.closest('[data-editor-action]')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          toast({
            title: "🚫 Navigation Blocked",
            description: "Exit homepage editor to navigate",
            variant: "destructive",
            duration: 1500
          });
          return false;
        }
        
        // Block button clicks (except editor buttons and editable elements)
        if (buttonElement && 
            !target.closest('[data-editor-action]') && 
            !target.closest('[data-editable]')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          toast({
            title: "🚫 Button Blocked", 
            description: "Exit editor to use buttons",
            variant: "destructive",
            duration: 1500
          });
          return false;
        }
        
        // Block form submissions
        if (formElement && !target.closest('[data-editor-form]')) {
          e.preventDefault();
          e.stopPropagation();
          toast({
            title: "🚫 Form Submission Blocked", 
            description: "Exit editor to submit forms",
            variant: "destructive",
            duration: 1500
          });
          return false;
        }
      }
      
      // Block form submissions
      if (e.type === 'submit' && !target.closest('[data-editor-form]')) {
        e.preventDefault();
        e.stopPropagation();
        toast({
          title: "🚫 Form Submission Blocked", 
          description: "Exit editor to submit forms",
          variant: "destructive",
          duration: 1500
        });
        return false;
      }
    };

    // ENHANCED: Block keyboard navigation shortcuts
    const blockKeyboardNav = (e: KeyboardEvent) => {
      // Allow F12 (DevTools), F5/Ctrl+R (Refresh), Ctrl+S (Save)
      if (e.key === 'F12' || 
          e.key === 'F5' || 
          (e.ctrlKey && e.key === 'r') ||
          (e.ctrlKey && e.key === 's')) {
        return;
      }
      
      // Block other navigation shortcuts
      if ((e.ctrlKey && (e.key === 'l' || e.key === 't' || e.key === 'w')) ||
          (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) ||
          e.key === 'Escape') {
        e.preventDefault();
        toast({
          title: "🚫 Keyboard Navigation Blocked",
          description: "Exit editor to use keyboard shortcuts",
          variant: "destructive",
          duration: 1000
        });
      }
    };

    // Attach event listeners with high priority (capture phase)
    document.addEventListener('click', blockNavigation, { capture: true, passive: false });
    document.addEventListener('submit', blockNavigation, { capture: true, passive: false });
    document.addEventListener('keydown', blockKeyboardNav, { capture: true, passive: false });

    // Also block beforeunload for extra safety
    const blockUnload = (e: BeforeUnloadEvent) => {
      if (pendingChanges.size > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', blockUnload);

    return () => {
      document.removeEventListener('click', blockNavigation, true);
      document.removeEventListener('submit', blockNavigation, true);
      document.removeEventListener('keydown', blockKeyboardNav, true);
      window.removeEventListener('beforeunload', blockUnload);
    };
  }, [toast, pendingChanges]);

  // ENHANCED element detection with MutationObserver and improved retry mechanism
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10; // Increased from 5 to 10
    const initialDelay = 500; // Shorter initial delay
    const retryDelay = 1500; // Longer retry delay for component rendering
    let mutationObserver: MutationObserver | null = null;
    let isSetupComplete = false;
    
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      const editableElement = target.closest('[data-editable]') as HTMLElement;
      
      if (editableElement && editableElement.getAttribute('data-editable')) {
        // Only show orange hover if element is NOT currently selected
        if (!editableElement.classList.contains('editor-selected')) {
          editableElement.style.outline = '2px solid #ff8c00'; // ORANGE neon border for hover
          editableElement.style.outlineOffset = '2px';
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
          editableElement.style.outlineOffset = '';
        }
        editableElement.classList.remove('editor-hovering');
      }
    };

    const attachListenersToElement = (element: HTMLElement, elementId: string) => {
      // Avoid duplicate listeners
      if (element.dataset.homepageEditorAttached === 'true') {
        return;
      }
      
      element.dataset.homepageEditorAttached = 'true';
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
      element.addEventListener('click', handleElementClick as EventListener);
      
      console.log(`✅ Attached listeners to: ${elementId}`);
    };

    const setupEventListeners = () => {
      console.log(`🔍 Setting up homepage element listeners (attempt ${retryCount + 1}/${maxRetries})...`);
      
      // ENHANCED: Search for elements with better timing for component rendering
      const foundElements = document.querySelectorAll('[data-editable]');
      console.log('🎯 Found homepage editable elements:', foundElements.length);
      
      // Build comprehensive element map
      const elementMap = new Map<string, HTMLElement>();
      
      // Add all dynamically found elements
      foundElements.forEach(el => {
        const id = el.getAttribute('data-editable');
        if (id) {
          elementMap.set(id, el as HTMLElement);
        }
      });
      
      // ENHANCED: Try to find missing elements from preconfigured list with better selectors
      HOMEPAGE_EDITABLE_ELEMENTS.forEach(elementId => {
        if (!elementMap.has(elementId)) {
          // Try multiple selector strategies
          let element = document.querySelector(`[data-editable="${elementId}"]`) as HTMLElement;
          
          // If not found, try with partial matching for dynamic elements
          if (!element && elementId.includes('category-')) {
            const elements = document.querySelectorAll(`[data-editable*="${elementId}"]`);
            if (elements.length > 0) {
              element = elements[0] as HTMLElement;
            }
          }
          
          if (element) {
            elementMap.set(elementId, element);
            console.log(`🔧 Found missing element: ${elementId}`);
          }
        }
      });
      
      const editableElements = Array.from(elementMap.values());
      const foundElementIds = Array.from(elementMap.keys());
      
      console.log('🎯 Total homepage elements to attach:', editableElements.length);
      console.log('🎯 Found element IDs:', foundElementIds);
      
      // CHECK: Do we have critical sections? (Categories, Bookings, Events)
      const hasCategoriesElements = foundElementIds.some(id => id.includes('category-'));
      const hasBookingsElements = foundElementIds.some(id => id.includes('bookings-'));
      const hasEventsElements = foundElementIds.some(id => id.includes('events-'));
      
      console.log('📊 Section Detection:', {
        categories: hasCategoriesElements,
        bookings: hasBookingsElements,
        events: hasEventsElements,
        totalElements: editableElements.length
      });
      
      // ENHANCED: More intelligent retry logic
      const minimumExpectedElements = 15; // Expecting at least 15 elements on homepage
      const hasCriticalSections = hasCategoriesElements && hasBookingsElements;
      
      if ((editableElements.length < minimumExpectedElements || !hasCriticalSections) && retryCount < maxRetries) {
        retryCount++;
        console.log(`⏳ Insufficient elements found (${editableElements.length}/${minimumExpectedElements}), retrying in ${retryDelay}ms...`);
        console.log(`🔍 Missing critical sections - Categories: ${hasCategoriesElements}, Bookings: ${hasBookingsElements}`);
        setTimeout(setupEventListeners, retryDelay);
        return null;
      }
      
      // SUCCESS: Attach listeners to all found elements
      editableElements.forEach((element, index) => {
        const elementId = element.getAttribute('data-editable') || `element-${index}`;
        attachListenersToElement(element, elementId);
      });

      // ENHANCED: Set up MutationObserver to catch dynamically added elements
      if (!isSetupComplete) {
        mutationObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                
                // Check if this element or its children have data-editable attributes
                const editableElements = [
                  ...(element.hasAttribute('data-editable') ? [element] : []),
                  ...Array.from(element.querySelectorAll('[data-editable]'))
                ] as HTMLElement[];
                
                editableElements.forEach((editableEl) => {
                  const elementId = editableEl.getAttribute('data-editable');
                  if (elementId && editableEl.dataset.homepageEditorAttached !== 'true') {
                    console.log(`🆕 New editable element detected: ${elementId}`);
                    attachListenersToElement(editableEl, elementId);
                  }
                });
              }
            });
          });
        });
        
        // Start observing
        mutationObserver.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        console.log('👁️ MutationObserver started for dynamic elements');
        isSetupComplete = true;
      }

      console.log(`✅ Homepage editor setup complete! Attached listeners to ${editableElements.length} elements`);

      return () => {
        editableElements.forEach(element => {
          element.removeEventListener('mouseenter', handleMouseEnter);
          element.removeEventListener('mouseleave', handleMouseLeave);
          element.removeEventListener('click', handleElementClick as EventListener);
          element.removeAttribute('data-homepage-editor-attached');
        });
        
        if (mutationObserver) {
          mutationObserver.disconnect();
          mutationObserver = null;
        }
      };
    };

    // Start with initial delay to let components render
    const timeoutId = setTimeout(setupEventListeners, initialDelay);

    return () => {
      clearTimeout(timeoutId);
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
  }, [handleElementClick]);

  return (
    <>
      {/* FULL SCREEN OVERLAY - Complete isolation from main site */}
      <div className="fixed inset-0 z-[99999] bg-darkBg text-white overflow-hidden">
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

          {/* Color Editing Panel - Enhanced visibility and live preview */}
          {showColorPanel && selectedTool === 'color' && selectedElement && (
            <div className="fixed top-32 left-4 z-[100001] bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-4 max-w-6xl max-h-[calc(100vh-140px)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg text-gray-800 font-semibold">Color Tools</div>
                <Button
                  data-editor-action="true"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowColorPanel(false);
                    setSelectedTool('text');
                  }}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {/* Color Mode Toggle - Enhanced styling */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Mode:</span>
                  <Button
                    data-editor-action="true"
                    onClick={() => setColorMode('text')}
                    variant={colorMode === 'text' ? 'default' : 'outline'}
                    size="sm"
                    className={
                      colorMode === 'text'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 border-2 border-blue-600'
                        : 'border-2 border-gray-400 text-gray-700 text-sm px-4 py-2 hover:bg-gray-100'
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
                        ? 'bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 border-2 border-purple-600'
                        : 'border-2 border-gray-400 text-gray-700 text-sm px-4 py-2 hover:bg-gray-100'
                    }
                  >
                    Background
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {/* Color Picker Section - Enhanced with live preview */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Color Picker</h3>
                    <HexColorPicker
                      color={selectedColor}
                      onChange={handleLiveColorChange}
                      style={{ width: '100%', height: '120px' }}
                    />
                    <div className="flex items-center space-x-1">
                      <Input
                        value={selectedColor}
                        onChange={(e) => handleLiveColorChange(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 bg-gray-100 border-gray-400 text-gray-800 font-mono text-xs h-8 px-2"
                      />
                      <div 
                        className="w-8 h-8 rounded border-2 border-gray-400"
                        style={{ backgroundColor: selectedColor }}
                      ></div>
                    </div>
                  </div>

                  {/* Theme Colors Section - Enhanced styling */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Theme Colors</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {THEME_COLORS.map((color) => (
                        <button
                          key={color}
                          data-editor-action="true"
                          onClick={() => handleLiveColorChange(color)}
                          className="w-8 h-8 rounded border-2 border-gray-400 hover:border-gray-600 transition-colors shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Gradient Section - Improved workflow */}
                  {!gradientMode ? (
                    <div className="space-y-2 col-span-2">
                      <h3 className="text-sm font-medium text-gray-700">Gradient</h3>
                      <Button
                        data-editor-action="true"
                        onClick={() => setGradientMode(true)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded"
                      >
                        Add Gradient
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">Click to enable gradient editing mode</p>
                    </div>
                  ) : (
                    <>
                      {/* Gradient Start Color */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700">Gradient Start</h3>
                        <HexColorPicker
                          color={gradientColor1}
                          onChange={(color) => {
                            setGradientColor1(color);
                            // REMOVED: No auto-apply - only update state
                          }}
                          style={{ width: '100%', height: '120px' }}
                        />
                        <Input
                          value={gradientColor1}
                          onChange={(e) => {
                            setGradientColor1(e.target.value);
                            // REMOVED: No auto-apply - only update state
                          }}
                          className="bg-gray-100 border-gray-400 text-gray-800 font-mono text-xs h-8 px-2"
                        />
                      </div>

                      {/* Gradient End Color */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700">Gradient End</h3>
                        <HexColorPicker
                          color={gradientColor2}
                          onChange={(color) => {
                            setGradientColor2(color);
                            // REMOVED: No auto-apply - only update state
                          }}
                          style={{ width: '100%', height: '120px' }}
                        />
                        <Input
                          value={gradientColor2}
                          onChange={(e) => {
                            setGradientColor2(e.target.value);
                            // REMOVED: No auto-apply - only update state
                          }}
                          className="bg-gray-100 border-gray-400 text-gray-800 font-mono text-xs h-8 px-2"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Gradient Controls - Only show when gradient mode is active */}
                {gradientMode && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-300">
                    {/* Direction */}
                    <div>
                      <label className="text-sm text-gray-700 mb-2 block font-medium">Direction</label>
                      <select
                        value={gradientDirection}
                        onChange={(e) => {
                          setGradientDirection(e.target.value as typeof gradientDirection);
                          // REMOVED: No auto-apply - only update state
                        }}
                        className="w-full bg-gray-100 border-gray-400 text-gray-800 text-sm rounded px-3 py-2 h-10"
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
                      <label className="text-sm text-gray-700 mb-2 block font-medium">Presets</label>
                      <div className="grid grid-cols-2 gap-2">
                        {GRADIENT_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            data-editor-action="true"
                            onClick={() => {
                              handleGradientPreset(preset.value);
                              // REMOVED: No auto-apply - only update state
                            }}
                            className="h-8 rounded border-2 border-gray-400 hover:border-gray-600 transition-colors text-xs text-white overflow-hidden shadow-sm"
                            style={{ background: preset.value }}
                            title={preset.name}
                          >
                            {preset.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons - Improved workflow */}
                <div className="flex justify-center space-x-3 pt-4 border-t border-gray-300">
                  {gradientMode ? (
                    <>
                      <Button
                        data-editor-action="true"
                        onClick={handleColorApply}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 text-sm font-medium"
                        size="sm"
                      >
                        {isSaving ? (
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Paintbrush className="w-4 h-4 mr-2" />
                        )}
                        Apply Gradient
                      </Button>
                      <Button
                        data-editor-action="true"
                        onClick={() => {
                          setGradientMode(false);
                          // No need to clear live preview since we don't auto-apply
                        }}
                        variant="outline"
                        size="sm"
                        className="px-4 py-2 text-sm border-gray-400 text-gray-700 hover:bg-gray-100"
                      >
                        Cancel Gradient
                      </Button>
                    </>
                  ) : (
                    <Button
                      data-editor-action="true"
                      onClick={handleColorApply}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-medium"
                      size="sm"
                    >
                      {isSaving ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Paintbrush className="w-4 h-4 mr-2" />
                      )}
                      Apply Color
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Homepage Content Container - Isolated within overlay */}
        <div className="pt-40 min-h-screen bg-darkBg overflow-y-auto h-full">
          <EditorModeProvider isEditorMode={true}>
            {children}
          </EditorModeProvider>
        </div>
      </div>
    </>
  );
}
