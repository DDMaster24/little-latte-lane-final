'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  X, 
  Type, 
  Palette, 
  Image as ImageIcon, 
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Paintbrush,
  Tag,
  FileText,
  Settings,
  UserCheck
} from 'lucide-react';
import { ChromePicker } from 'react-color';
import { usePageEditor } from '@/hooks/usePageEditor';
import EnhancedImageEditor from './EnhancedImageEditor';

interface AccountPageEditorProps {
  children: React.ReactNode;
}

// Account-specific element types
type AccountElementType = 
  | 'page-title'
  | 'welcome-message'
  | 'profile-info'
  | 'form-labels'
  | 'status-badges'
  | 'section-titles'
  | 'descriptions'
  | 'account-icons'
  | 'unknown';

interface ElementConfig {
  type: AccountElementType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: 'titles' | 'content' | 'profile' | 'visual' | 'status';
}

// Get account element configuration based on data-editable attribute
function getAccountElementConfig(editableId: string): ElementConfig {
  // Page titles and main headings
  if (editableId.includes('page-title') || editableId.includes('account-title')) {
    return {
      type: 'page-title',
      label: 'Page Title',
      icon: User,
      description: 'Main account page heading',
      category: 'titles'
    };
  }
  
  if (editableId.includes('welcome-message')) {
    return {
      type: 'welcome-message',
      label: 'Welcome Message',
      icon: UserCheck,
      description: 'Personal welcome message for users',
      category: 'content'
    };
  }

  // Profile and form content
  if (editableId.includes('profile') || editableId.includes('field')) {
    return {
      type: 'profile-info',
      label: 'Profile Information',
      icon: User,
      description: 'User profile field labels and content',
      category: 'profile'
    };
  }

  // Section titles and headers
  if (editableId.includes('section') || editableId.includes('header')) {
    return {
      type: 'section-titles',
      label: 'Section Title',
      icon: Tag,
      description: 'Account section headings and titles',
      category: 'titles'
    };
  }

  // Form labels and descriptions
  if (editableId.includes('label') || editableId.includes('description')) {
    return {
      type: 'form-labels',
      label: 'Form Label',
      icon: FileText,
      description: 'Form field labels and descriptions',
      category: 'content'
    };
  }

  // Status badges and indicators
  if (editableId.includes('status') || editableId.includes('badge')) {
    return {
      type: 'status-badges',
      label: 'Status Badge',
      icon: Tag,
      description: 'Account status and role indicators',
      category: 'status'
    };
  }

  // Icons and visual elements
  if (editableId.includes('icon') || editableId.includes('emoji')) {
    return {
      type: 'account-icons',
      label: 'Account Icons',
      icon: Settings,
      description: 'Account page icons and visual elements',
      category: 'visual'
    };
  }

  return {
    type: 'unknown',
    label: 'Account Element',
    icon: Settings,
    description: 'Editable account page element',
    category: 'content'
  };
}

export default function AccountPageEditor({ children }: AccountPageEditorProps) {
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [editingText, setEditingText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [editableId, setEditableId] = useState('');
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#00ffff');
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'color' | 'image'>('text');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const _colorPickerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { savePageSetting, isLoading } = usePageEditor('account');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Save text changes using the page editor hook
  const saveTextChange = async (elementId: string, content: string) => {
    try {
      setSaveError(null);
      await savePageSetting({
        setting_key: elementId,
        setting_value: content,
        category: 'page_editor',
        page_scope: 'account',
        created_by: 'admin' // TODO: Get actual admin user ID
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save text';
      setSaveError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Save style changes using the page editor hook
  const saveStyleChange = async (elementId: string, property: string, value: string) => {
    try {
      setSaveError(null);
      await savePageSetting({
        setting_key: `${elementId}_${property}`,
        setting_value: value,
        category: 'page_editor',
        page_scope: 'account',
        created_by: 'admin' // TODO: Get actual admin user ID
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save style';
      setSaveError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Smart navigation blocking - allow essential browser shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow essential browser shortcuts
      const allowedKeys = [
        'F12',           // DevTools
        'F5',            // Refresh
        'Escape',        // Cancel/escape
      ];
      
      const allowedCombos = [
        { ctrl: true, key: 'r' },      // Ctrl+R (Reload)
        { ctrl: true, shift: true, key: 'R' }, // Ctrl+Shift+R (Hard reload)
        { ctrl: true, shift: true, key: 'I' }, // Ctrl+Shift+I (DevTools)
        { ctrl: true, shift: true, key: 'J' }, // Ctrl+Shift+J (Console)
        { ctrl: true, key: 'u' },      // Ctrl+U (View source)
        { ctrl: true, key: 's' },      // Ctrl+S (Save)
        { alt: true, key: 'Tab' },     // Alt+Tab (Switch apps)
      ];
      
      const isAllowedKey = allowedKeys.includes(e.key);
      const isAllowedCombo = allowedCombos.some(combo => 
        (combo.ctrl ? e.ctrlKey : true) &&
        (combo.shift ? e.shiftKey : true) &&
        (combo.alt ? e.altKey : true) &&
        e.key.toLowerCase() === combo.key.toLowerCase()
      );
      
      // Block navigation if not allowed
      if (!isAllowedKey && !isAllowedCombo) {
        // Block common navigation keys
        if (['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11'].includes(e.key) ||
            (e.altKey && ['ArrowLeft', 'ArrowRight'].includes(e.key)) ||
            (e.ctrlKey && ['w', 't', 'n'].includes(e.key.toLowerCase()))) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Enhanced element detection for account page
  const attachEventListeners = useCallback(() => {
    const elements = document.querySelectorAll('[data-editable]');
    
    setDebugInfo(`Found ${elements.length} editable elements`);
    
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const editableId = htmlElement.getAttribute('data-editable') || '';
      
      console.log(`[AccountPageEditor] Element ${index + 1}:`, {
        editableId,
        tagName: htmlElement.tagName,
        textContent: htmlElement.textContent?.slice(0, 50),
        classList: Array.from(htmlElement.classList)
      });

      // Enhanced hover effect for account elements
      const handleMouseEnter = () => {
        if (isPreviewMode) return;
        
        htmlElement.style.outline = '2px solid #ff6b35';
        htmlElement.style.outlineOffset = '2px';
        htmlElement.style.backgroundColor = 'rgba(255, 107, 53, 0.1)';
        htmlElement.style.cursor = 'pointer';
        htmlElement.style.transition = 'all 0.2s ease';
      };

      const handleMouseLeave = () => {
        if (selectedElement !== htmlElement) {
          htmlElement.style.outline = '';
          htmlElement.style.outlineOffset = '';
          htmlElement.style.backgroundColor = '';
          htmlElement.style.cursor = '';
        }
      };

      const handleClick = (e: Event) => {
        if (isPreviewMode) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        console.log(`[AccountPageEditor] Clicked element:`, {
          editableId,
          element: htmlElement,
          textContent: htmlElement.textContent
        });

        // Clear previous selection
        if (selectedElement && selectedElement !== htmlElement) {
          selectedElement.style.outline = '';
          selectedElement.style.backgroundColor = '';
        }

        // Select new element
        setSelectedElement(htmlElement);
        setEditableId(editableId);
        setEditingText(htmlElement.textContent || '');
        setOriginalText(htmlElement.textContent || '');
        setIsToolbarVisible(true);
        setActiveTab('text');

        // Visual feedback for selected element
        htmlElement.style.outline = '3px solid #ff0080';
        htmlElement.style.backgroundColor = 'rgba(255, 0, 128, 0.15)';
        htmlElement.style.transition = 'all 0.3s ease';

        // Get current color for color picker
        const computedStyle = window.getComputedStyle(htmlElement);
        setCurrentColor(computedStyle.color || '#00ffff');
      };

      htmlElement.addEventListener('mouseenter', handleMouseEnter);
      htmlElement.addEventListener('mouseleave', handleMouseLeave);
      htmlElement.addEventListener('click', handleClick);
    });
  }, [isPreviewMode, selectedElement]);

  // Initialize event listeners
  useEffect(() => {
    // Delay to ensure DOM is ready
    const timer = setTimeout(attachEventListeners, 1000);
    return () => clearTimeout(timer);
  }, [attachEventListeners]);

  // Handle saving text changes
  const handleSaveText = async () => {
    if (!selectedElement || !editableId || editingText === originalText) return;

    try {
      // Update DOM immediately for instant feedback
      selectedElement.textContent = editingText;
      
      // Save to database
      const result = await saveTextChange(editableId, editingText);
      
      if (result.success) {
        setOriginalText(editingText);
        setPendingChanges(prev => ({ ...prev, [editableId]: editingText }));
        setHasUnsavedChanges(true);
        
        // Auto-save timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        
        console.log(`[AccountPageEditor] Saved text change for ${editableId}`);
      } else {
        console.error('[AccountPageEditor] Failed to save text change:', result.error);
        // Revert DOM change on failure
        selectedElement.textContent = originalText;
      }
    } catch (error) {
      console.error('[AccountPageEditor] Error saving text:', error);
      selectedElement.textContent = originalText;
    }
  };

  // Handle saving color changes
  const handleColorChange = async (color: { hex: string }) => {
    if (!selectedElement || !editableId) return;

    const hexColor = color.hex;
    setCurrentColor(hexColor);

    try {
      // Apply color immediately
      selectedElement.style.color = hexColor;
      
      // Save to database
      const result = await saveStyleChange(editableId, 'color', hexColor);
      
      if (result.success) {
        setPendingChanges(prev => ({ ...prev, [`${editableId}_color`]: hexColor }));
        setHasUnsavedChanges(true);
        console.log(`[AccountPageEditor] Saved color change for ${editableId}: ${hexColor}`);
      } else {
        console.error('[AccountPageEditor] Failed to save color change:', result.error);
      }
    } catch (error) {
      console.error('[AccountPageEditor] Error saving color:', error);
    }
  };

  // Handle image changes
  const handleImageChange = async (imageUrl: string) => {
    if (!selectedElement || !editableId) return;

    try {
      // Check if element contains an image or emoji
      const isEmojiElement = selectedElement.textContent && /[\u{1F300}-\u{1F9FF}]/u.test(selectedElement.textContent);
      
      if (isEmojiElement) {
        // For emoji elements, treat the imageUrl as new emoji/text content
        selectedElement.textContent = imageUrl;
        
        const result = await saveTextChange(editableId, imageUrl);
        if (result.success) {
          console.log(`[AccountPageEditor] Updated emoji/icon for ${editableId}: ${imageUrl}`);
        }
      } else {
        // For actual images, update src or background
        const imgElement = selectedElement.querySelector('img');
        if (imgElement) {
          imgElement.src = imageUrl;
        } else {
          selectedElement.style.backgroundImage = `url(${imageUrl})`;
        }
        
        const result = await saveStyleChange(editableId, 'backgroundImage', `url(${imageUrl})`);
        if (result.success) {
          console.log(`[AccountPageEditor] Updated image for ${editableId}: ${imageUrl}`);
        }
      }
      
      setShowImageEditor(false);
      setPendingChanges(prev => ({ ...prev, [`${editableId}_image`]: imageUrl }));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('[AccountPageEditor] Error updating image:', error);
    }
  };

  // Reset selection
  const handleCancel = () => {
    if (selectedElement) {
      selectedElement.style.outline = '';
      selectedElement.style.backgroundColor = '';
      selectedElement.textContent = originalText;
    }
    setSelectedElement(null);
    setIsToolbarVisible(false);
    setEditingText('');
    setOriginalText('');
    setEditableId('');
    setShowColorPicker(false);
    setShowImageEditor(false);
  };

  // Get element configuration
  const elementConfig = editableId ? getAccountElementConfig(editableId) : null;
  const ElementIcon = elementConfig?.icon || User;

  // Category color coding
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'titles': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'content': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'profile': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'visual': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'status': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="relative min-h-screen bg-darkBg">
      {/* Enhanced Floating Toolbar */}
      {isToolbarVisible && selectedElement && elementConfig && (
        <div className="fixed top-20 left-4 z-50 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl p-4 w-80 animate-in slide-in-from-left-2 duration-300">
          {/* Toolbar Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neonCyan/10 rounded-lg">
                <ElementIcon className="h-5 w-5 text-neonCyan" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{elementConfig.label}</h3>
                <Badge className={`text-xs ${getCategoryColor(elementConfig.category)}`}>
                  {elementConfig.category}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tool Tabs */}
          <div className="flex bg-gray-800/50 rounded-lg p-1 mb-4">
            {[
              { id: 'text', label: 'Text', icon: Type },
              { id: 'color', label: 'Color', icon: Palette },
              { id: 'image', label: 'Image', icon: ImageIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'text' | 'color' | 'image')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tool Content */}
          <div className="space-y-4">
            {/* Text Editing */}
            {activeTab === 'text' && (
              <div className="space-y-3">
                <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                  Edit Content
                </label>
                {elementConfig.type === 'welcome-message' || editingText.length > 50 ? (
                  <Textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white text-sm resize-none"
                    rows={3}
                    placeholder="Enter content..."
                  />
                ) : (
                  <Input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white text-sm"
                    placeholder="Enter text..."
                  />
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveText}
                    disabled={editingText === originalText || isLoading}
                    className="flex-1 bg-neonCyan hover:bg-neonCyan/80 text-darkBg text-xs font-medium h-8"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={() => setEditingText(originalText)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700/50 text-xs h-8"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {/* Color Picker */}
            {activeTab === 'color' && (
              <div className="space-y-3">
                <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                  Element Color
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-full h-10 rounded-lg border-2 border-gray-600 hover:border-neonCyan/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-white"
                    style={{ backgroundColor: currentColor }}
                  >
                    <Paintbrush className="h-4 w-4" />
                    {currentColor}
                  </button>
                  
                  {showColorPicker && (
                    <div className="border border-gray-600 rounded-lg overflow-hidden">
                      <ChromePicker
                        color={currentColor}
                        onChange={handleColorChange}
                        disableAlpha={false}
                        className="!bg-gray-800 !shadow-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Image Editor */}
            {activeTab === 'image' && (
              <div className="space-y-3">
                <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                  {elementConfig.type === 'account-icons' ? 'Icon/Emoji' : 'Image'}
                </label>
                <Button
                  onClick={() => setShowImageEditor(true)}
                  className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-xs h-8"
                >
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {elementConfig.type === 'account-icons' ? 'Change Icon' : 'Change Image'}
                </Button>
              </div>
            )}
          </div>

          {/* Element Info */}
          <div className="mt-4 pt-3 border-t border-gray-700/50">
            <p className="text-xs text-gray-400 leading-relaxed">
              {elementConfig.description}
            </p>
            {editableId && (
              <p className="text-xs text-gray-500 mt-1 font-mono">
                ID: {editableId}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Image Editor Modal */}
      {showImageEditor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  <ImageIcon className="h-6 w-6 text-neonCyan" />
                  {elementConfig?.type === 'account-icons' ? 'Update Icon/Emoji' : 'Update Image'}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowImageEditor(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <EnhancedImageEditor
              onImageChange={handleImageChange}
              onClose={() => setShowImageEditor(false)}
              currentImageUrl=""
              elementType={elementConfig?.type === 'account-icons' ? 'icon' : 'image'}
            />
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="fixed top-4 right-4 z-40 flex flex-col gap-2">
        {/* Preview Toggle */}
        <Button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`${
            isPreviewMode 
              ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30' 
              : 'bg-neonCyan/20 hover:bg-neonCyan/30 text-neonCyan border-neonCyan/30'
          } border backdrop-blur-sm`}
          size="sm"
        >
          {isPreviewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {isPreviewMode ? 'Exit Preview' : 'Preview Mode'}
        </Button>

        {/* Status Indicator */}
        {hasUnsavedChanges && (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 justify-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unsaved Changes
          </Badge>
        )}

        {saveError && (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 justify-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )}
      </div>

      {/* Debug Panel (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-40 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-xs text-green-400 font-mono max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4" />
            <span className="font-semibold">Account Page Editor Debug</span>
          </div>
          <div className="space-y-1 text-gray-300">
            <div>📍 {debugInfo}</div>
            <div>🎯 Selected: {editableId || 'None'}</div>
            <div>✏️ Editing: {editingText ? `"${editingText.slice(0, 30)}..."` : 'None'}</div>
            <div>🎨 Preview: {isPreviewMode ? 'ON' : 'OFF'}</div>
            <div>💾 Changes: {Object.keys(pendingChanges).length}</div>
          </div>
        </div>
      )}

      {/* Editor Instructions */}
      {!selectedElement && !isPreviewMode && (
        <div className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-neonCyan/10 to-neonPink/10 backdrop-blur-sm border border-gray-600/50 rounded-xl p-4 max-w-sm">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-neonCyan" />
            Account Page Editor
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Click on page titles, welcome messages, profile sections, or status badges to edit. Customize the account experience with text, colors, and icons.
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isToolbarVisible ? 'pl-80' : ''}`}>
        {children}
      </div>
    </div>
  );
}
