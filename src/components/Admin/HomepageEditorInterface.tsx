'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePageEditor } from '@/hooks/usePageEditor';
import { usePageEditorActions } from '@/hooks/usePageEditorActions';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  MousePointer,
  Type,
  Palette,
  AlignCenter
} from 'lucide-react';

// Import the homepage component
import HomePage from '@/app/page';

interface HomepageEditorInterfaceProps {
  placeholder?: never;
}

export default function HomepageEditorInterface({}: HomepageEditorInterfaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isAdmin, isLoading } = usePageEditor('homepage');
  const { saveElementStyles, saveElementText, getElementStyles, getElementText } = usePageEditorActions();
  
  // Tool states - Photoshop style
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'color' | 'font' | 'size'>('select');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#00ffff');
  const [colorMode, setColorMode] = useState<'solid' | 'gradient'>('solid');
  const [colorTarget, setColorTarget] = useState<'text' | 'background'>('text');
  const [gradientColors, setGradientColors] = useState<string[]>(['#00ffff', '#ff00ff']);
  const [gradientDirection, setGradientDirection] = useState<string>('to right');
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [currentText, setCurrentText] = useState<string>('');
  const [pendingChanges, setPendingChanges] = useState<Record<string, { styles?: Record<string, string | number | boolean>; text?: string }>>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  const handleBack = () => {
    router.push('/admin/page-editor');
  };

  const handleSave = async () => {
    try {
      console.log('Starting save operation with pending changes:', pendingChanges);
      
      let savedCount = 0;
      let failedCount = 0;
      const totalChanges = Object.keys(pendingChanges).length;
      const saveDetails: string[] = [];
      
      // If no pending changes, just show success message
      if (totalChanges === 0) {
        toast({
          title: "No Changes",
          description: "No changes to save.",
          duration: 3000,
        });
        return;
      }
      
      // Save all pending changes
      for (const [elementId, changes] of Object.entries(pendingChanges)) {
        try {
          // Save styles if they exist
          if (changes.styles) {
            const styleResult = await saveElementStyles('homepage', elementId, changes.styles);
            if (styleResult.success) {
              savedCount++;
              saveDetails.push(`✓ ${elementId} styles`);
            } else {
              failedCount++;
              saveDetails.push(`✗ ${elementId} styles failed`);
            }
            console.log(`Saved styles for ${elementId}:`, styleResult.success);
          }
          
          // Save text if it exists
          if (changes.text !== undefined) {
            const textResult = await saveElementText('homepage', elementId, changes.text);
            if (textResult.success) {
              savedCount++;
              saveDetails.push(`✓ ${elementId} text`);
            } else {
              failedCount++;
              saveDetails.push(`✗ ${elementId} text failed`);
            }
            console.log(`Saved text for ${elementId}:`, textResult.success);
          }
        } catch (error) {
          console.error(`Error saving changes for ${elementId}:`, error);
          failedCount++;
          saveDetails.push(`✗ ${elementId} error`);
        }
      }
      
      // Clear pending changes and update state
      setPendingChanges({});
      setHasChanges(false);
      
      // Show detailed success/failure message
      const timestamp = new Date().toLocaleTimeString();
      
      if (failedCount === 0) {
        toast({
          title: "✅ All Changes Saved Successfully!",
          description: `${savedCount} changes saved to database at ${timestamp}. Changes are now live on the website.`,
          duration: 5000,
        });
      } else {
        toast({
          title: `⚠️ Partial Save: ${savedCount} Saved, ${failedCount} Failed`,
          description: `Completed at ${timestamp}. Check console for details.`,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Save operation failed:', error);
      const timestamp = new Date().toLocaleTimeString();
      toast({
        title: "❌ Save Failed",
        description: `Operation failed at ${timestamp}. Please try again or check your connection.`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Load existing styles when element is selected
  const loadElementStyles = async (elementId: string) => {
    try {
      // Load saved styles
      const stylesResult = await getElementStyles('homepage', elementId);
      if (stylesResult.success && stylesResult.styles) {
        const styles = stylesResult.styles;
        
        // Check for text gradient (background with backgroundClip: text)
        if (styles.background && styles.backgroundClip === 'text' && styles.color === 'transparent') {
          setColorMode('gradient');
          setColorTarget('text');
          
          // Parse gradient info
          const gradientString = styles.background as string;
          if (gradientString.startsWith('linear-gradient')) {
            setGradientType('linear');
            // Extract direction and colors from linear-gradient
            const match = gradientString.match(/linear-gradient\(([^,]+),\s*(.+)\)/);
            if (match) {
              setGradientDirection(match[1].trim());
              const colorPart = match[2];
              const colors = colorPart.split(',').map(c => c.trim());
              setGradientColors(colors);
            }
          } else if (gradientString.startsWith('radial-gradient')) {
            setGradientType('radial');
            // Extract colors from radial-gradient
            const match = gradientString.match(/radial-gradient\([^,]+,\s*(.+)\)/);
            if (match) {
              const colorPart = match[1];
              const colors = colorPart.split(',').map(c => c.trim());
              setGradientColors(colors);
            }
          }
        }
        // Check for background gradient (background without backgroundClip: text)
        else if (styles.background && (typeof styles.background === 'string' && styles.background.includes('gradient')) || styles.backgroundImage) {
          setColorMode('gradient');
          setColorTarget('background');
          
          const gradientString = (styles.backgroundImage || styles.background) as string;
          if (gradientString.startsWith('linear-gradient')) {
            setGradientType('linear');
            const match = gradientString.match(/linear-gradient\(([^,]+),\s*(.+)\)/);
            if (match) {
              setGradientDirection(match[1].trim());
              const colorPart = match[2];
              const colors = colorPart.split(',').map(c => c.trim());
              setGradientColors(colors);
            }
          } else if (gradientString.startsWith('radial-gradient')) {
            setGradientType('radial');
            const match = gradientString.match(/radial-gradient\([^,]+,\s*(.+)\)/);
            if (match) {
              const colorPart = match[1];
              const colors = colorPart.split(',').map(c => c.trim());
              setGradientColors(colors);
            }
          }
        }
        // Check for solid background color
        else if (styles.backgroundColor || (styles.background && typeof styles.background === 'string' && !styles.background.includes('gradient'))) {
          setColorMode('solid');
          setColorTarget('background');
          setCurrentColor((styles.backgroundColor || styles.background) as string);
        }
        // Check for solid text color
        else if (styles.color && styles.color !== 'transparent') {
          setColorMode('solid');
          setColorTarget('text');
          setCurrentColor(styles.color as string);
        }
      }
      
      // Load saved text content or current DOM content
      const textResult = await getElementText('homepage', elementId);
      if (textResult.success && textResult.text) {
        setCurrentText(textResult.text);
        // Apply saved text to DOM
        const element = document.querySelector(`[data-editable="${elementId}"]`) as HTMLElement;
        if (element) {
          element.textContent = textResult.text;
        }
      } else {
        // Load current text content from DOM
        const element = document.querySelector(`[data-editable="${elementId}"]`) as HTMLElement;
        if (element) {
          setCurrentText(element.textContent || '');
        }
      }
    } catch (error) {
      console.error('Error loading element styles:', error);
    }
  };

  const handleElementClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const editableElement = target.closest('[data-editable]');
    
    if (editableElement) {
      const elementId = editableElement.getAttribute('data-editable');
      if (elementId) {
        setSelectedElement(elementId);
        setHasChanges(true);
        
        // Load existing styles for this element
        loadElementStyles(elementId);
        
        // Add selected class for persistent border
        document.querySelectorAll('[data-editable].selected').forEach(el => {
          el.classList.remove('selected');
        });
        editableElement.classList.add('selected');
        
        toast({
          title: "Element Selected",
          description: `Selected: ${elementId}`,
          duration: 2000,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-white">Loading page editor...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <Card className="p-8 bg-red-900/20 border-red-500">
          <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-gray-300">You need admin privileges to access the page editor.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg flex">
      {/* Left Toolbar */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col">
        {/* Toolbar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Badge variant="outline" className="text-neonCyan border-neonCyan">
              Homepage
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-neonCyan" />
            <h2 className="text-lg font-semibold text-white">Page Editor</h2>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={!hasChanges}
              className="border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-darkBg"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Photoshop-Style Tool Palette */}
        <div className="flex-1 p-4">
          <div className="bg-gray-800 rounded-lg p-3 space-y-2">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Tools</h3>
            
            {/* Tool Buttons - Photoshop Style */}
            <div className="grid grid-cols-2 gap-2">
              {/* Select Tool */}
              <button
                onClick={() => setActiveTool('select')}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  activeTool === 'select'
                    ? 'bg-neonCyan/20 border-neonCyan text-neonCyan'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
                title="Select Tool"
              >
                <MousePointer className="h-5 w-5 mx-auto" />
              </button>

              {/* Text Tool */}
              <button
                onClick={() => setActiveTool('text')}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  activeTool === 'text'
                    ? 'bg-neonCyan/20 border-neonCyan text-neonCyan'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
                title="Text Tool"
              >
                <Type className="h-5 w-5 mx-auto" />
              </button>

              {/* Color Tool */}
              <button
                onClick={() => setActiveTool('color')}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  activeTool === 'color'
                    ? 'bg-neonCyan/20 border-neonCyan text-neonCyan'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
                title="Color Tool"
              >
                <Palette className="h-5 w-5 mx-auto" />
              </button>

              {/* Move Tool */}
              <button
                onClick={() => setActiveTool('size')}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  activeTool === 'size'
                    ? 'bg-neonCyan/20 border-neonCyan text-neonCyan'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
                title="Size Tool"
              >
                <AlignCenter className="h-5 w-5 mx-auto" />
              </button>
            </div>
            
            {/* Tool Name Display */}
            <div className="mt-4 text-center">
              <span className="text-xs text-gray-400 capitalize">{activeTool} Tool</span>
            </div>
          </div>

          {/* Selected Element Info */}
          {selectedElement && (
            <div className="mt-4 bg-gray-800 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Element</h4>
              <div className="text-xs text-neonCyan font-mono bg-gray-900 p-2 rounded">
                {selectedElement}
              </div>
            </div>
          )}

          {/* Tool Properties Panel - Color */}
          {activeTool === 'color' && selectedElement && (
            <div className="mt-4 bg-gray-800 rounded-lg p-3 relative">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Color Properties</h4>
              
              {/* Color Mode Selector */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-2">Color Type</label>
                <div className="flex bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setColorMode('solid')}
                    className={`flex-1 px-3 py-1 text-xs rounded ${
                      colorMode === 'solid' 
                        ? 'bg-neonCyan text-darkBg font-medium' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Solid
                  </button>
                  <button
                    onClick={() => setColorMode('gradient')}
                    className={`flex-1 px-3 py-1 text-xs rounded ${
                      colorMode === 'gradient' 
                        ? 'bg-neonCyan text-darkBg font-medium' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Gradient
                  </button>
                </div>
              </div>

              {/* Color Target Selector */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-2">Apply To</label>
                <div className="flex bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setColorTarget('text')}
                    className={`flex-1 px-3 py-1 text-xs rounded ${
                      colorTarget === 'text' 
                        ? 'bg-neonPink text-darkBg font-medium' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setColorTarget('background')}
                    className={`flex-1 px-3 py-1 text-xs rounded ${
                      colorTarget === 'background' 
                        ? 'bg-neonPink text-darkBg font-medium' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Background
                  </button>
                </div>
              </div>

              {colorMode === 'solid' ? (
                /* Solid Color Controls */
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      {colorTarget === 'text' ? 'Text Color' : 'Background Color'}
                    </label>
                    <div className="relative">
                      <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => setCurrentColor(e.target.value)}
                        className="w-full h-10 rounded border border-gray-600 bg-gray-700 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Gradient Controls */
                <div className="space-y-4">
                  {/* Gradient Type */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Gradient Type</label>
                    <div className="flex bg-gray-700 rounded-lg p-1">
                      <button
                        onClick={() => setGradientType('linear')}
                        className={`flex-1 px-3 py-1 text-xs rounded ${
                          gradientType === 'linear' 
                            ? 'bg-neonPink text-darkBg font-medium' 
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        Linear
                      </button>
                      <button
                        onClick={() => setGradientType('radial')}
                        className={`flex-1 px-3 py-1 text-xs rounded ${
                          gradientType === 'radial' 
                            ? 'bg-neonPink text-darkBg font-medium' 
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        Radial
                      </button>
                    </div>
                  </div>

                  {/* Gradient Direction (only for linear) */}
                  {gradientType === 'linear' && (
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Direction</label>
                      <select
                        value={gradientDirection}
                        onChange={(e) => setGradientDirection(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                      >
                        <option value="to right">Left to Right</option>
                        <option value="to left">Right to Left</option>
                        <option value="to bottom">Top to Bottom</option>
                        <option value="to top">Bottom to Top</option>
                        <option value="to bottom right">Top-Left to Bottom-Right</option>
                        <option value="to bottom left">Top-Right to Bottom-Left</option>
                        <option value="to top right">Bottom-Left to Top-Right</option>
                        <option value="to top left">Bottom-Right to Top-Left</option>
                      </select>
                    </div>
                  )}

                  {/* Gradient Colors */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Gradient Colors</label>
                    <div className="space-y-2">
                      {gradientColors.map((color, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...gradientColors];
                              newColors[index] = e.target.value;
                              setGradientColors(newColors);
                            }}
                            className="w-8 h-8 rounded border border-gray-600 bg-gray-700 cursor-pointer"
                          />
                          <span className="text-xs text-gray-400 font-mono flex-1">
                            Color {index + 1}: {color}
                          </span>
                          {gradientColors.length > 2 && (
                            <button
                              onClick={() => {
                                const newColors = gradientColors.filter((_, i) => i !== index);
                                setGradientColors(newColors);
                              }}
                              className="text-red-400 hover:text-red-300 text-xs px-1"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {gradientColors.length < 5 && (
                        <button
                          onClick={() => setGradientColors([...gradientColors, '#ffffff'])}
                          className="w-full py-1 text-xs text-neonCyan hover:text-neonCyan/80 border border-dashed border-gray-600 rounded"
                        >
                          + Add Color
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Gradient Preview */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Preview</label>
                    <div 
                      className="w-full h-8 rounded border border-gray-600"
                      style={{
                        background: gradientType === 'linear' 
                          ? `linear-gradient(${gradientDirection}, ${gradientColors.join(', ')})`
                          : `radial-gradient(circle, ${gradientColors.join(', ')})`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Apply Button - Fixed positioning */}
              <div className="mt-4 pt-3 border-t border-gray-700">
                <Button
                  size="sm"
                  className="w-full bg-neonCyan text-darkBg hover:bg-neonCyan/80"
                  onClick={async () => {
                    try {
                      if (selectedElement) {
                        const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
                        if (element) {
                          if (colorMode === 'solid') {
                            // Apply solid color to text or background
                            console.log(`Applying solid color to ${colorTarget}:`, currentColor, 'element:', selectedElement);
                            
                            if (colorTarget === 'text') {
                              // Text color mode
                              element.style.color = currentColor;
                              // Clear any text gradient effects
                              element.style.background = '';
                              element.style.backgroundClip = '';
                              element.style.webkitBackgroundClip = '';
                              
                              setPendingChanges(prev => ({
                                ...prev,
                                [selectedElement]: {
                                  ...prev[selectedElement],
                                  styles: { 
                                    ...prev[selectedElement]?.styles,
                                    color: currentColor,
                                    background: '',
                                    backgroundClip: '',
                                    webkitBackgroundClip: ''
                                  }
                                }
                              }));
                            } else {
                              // Background color mode
                              element.style.backgroundColor = currentColor;
                              // Clear any background gradient effects
                              element.style.background = currentColor;
                              element.style.backgroundImage = '';
                              
                              setPendingChanges(prev => ({
                                ...prev,
                                [selectedElement]: {
                                  ...prev[selectedElement],
                                  styles: { 
                                    ...prev[selectedElement]?.styles,
                                    backgroundColor: currentColor,
                                    background: currentColor,
                                    backgroundImage: ''
                                  }
                                }
                              }));
                            }
                          } else {
                            // Apply gradient to text or background
                            const gradientValue = gradientType === 'linear' 
                              ? `linear-gradient(${gradientDirection}, ${gradientColors.join(', ')})`
                              : `radial-gradient(circle, ${gradientColors.join(', ')})`;
                            
                            console.log(`Applying gradient to ${colorTarget}:`, gradientValue, 'element:', selectedElement);
                            
                            if (colorTarget === 'text') {
                              // Text gradient mode
                              element.style.background = gradientValue;
                              element.style.backgroundClip = 'text';
                              element.style.webkitBackgroundClip = 'text';
                              element.style.color = 'transparent';
                              element.style.backgroundColor = '';
                              
                              setPendingChanges(prev => ({
                                ...prev,
                                [selectedElement]: {
                                  ...prev[selectedElement],
                                  styles: { 
                                    ...prev[selectedElement]?.styles,
                                    background: gradientValue,
                                    backgroundClip: 'text',
                                    webkitBackgroundClip: 'text',
                                    color: 'transparent',
                                    backgroundColor: ''
                                  }
                                }
                              }));
                            } else {
                              // Background gradient mode
                              element.style.background = gradientValue;
                              element.style.backgroundImage = gradientValue;
                              element.style.backgroundColor = '';
                              // Clear text gradient effects
                              element.style.backgroundClip = '';
                              element.style.webkitBackgroundClip = '';
                              
                              setPendingChanges(prev => ({
                                ...prev,
                                [selectedElement]: {
                                  ...prev[selectedElement],
                                  styles: { 
                                    ...prev[selectedElement]?.styles,
                                    background: gradientValue,
                                    backgroundImage: gradientValue,
                                    backgroundColor: '',
                                    backgroundClip: '',
                                    webkitBackgroundClip: ''
                                  }
                                }
                              }));
                            }
                          }
                          
                          setHasChanges(true);
                          
                          const targetText = colorTarget === 'text' ? 'text' : 'background';
                          const modeText = colorMode === 'solid' ? 'color' : 'gradient';
                          
                          toast({
                            title: colorMode === 'solid' ? `🎨 ${targetText} Color Applied` : `🌈 ${targetText} Gradient Applied`,
                            description: `${selectedElement} ${targetText} ${modeText} updated. Click 'Save Changes' to make it permanent and live on the website.`,
                            duration: 4000,
                          });
                        }
                      }
                    } catch (error) {
                      console.error('Error applying color/gradient:', error);
                      toast({
                        title: "Error",
                        description: "Failed to apply styling",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Apply {colorMode === 'solid' ? 'Color' : 'Gradient'}
                </Button>
              </div>
            </div>
          )}

          {/* Tool Properties Panel - Text */}
          {activeTool === 'text' && selectedElement && (
            <div className="mt-4 bg-gray-800 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Text Properties</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Text Content</label>
                  <textarea
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    className="w-full h-20 rounded border border-gray-600 bg-gray-700 text-white p-2 text-sm resize-none"
                    placeholder="Enter text content..."
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full bg-neonCyan text-darkBg hover:bg-neonCyan/80"
                  onClick={async () => {
                    console.log('Applying text:', currentText, 'to element:', selectedElement);
                    try {
                      if (selectedElement) {
                        // Apply the text immediately to the DOM element
                        const element = document.querySelector(`[data-editable="${selectedElement}"]`) as HTMLElement;
                        console.log('Found element for text:', element);
                        if (element) {
                          element.textContent = currentText;
                          console.log('Applied text to element');
                          
                          // Track this change for saving later
                          setPendingChanges(prev => ({
                            ...prev,
                            [selectedElement]: {
                              ...prev[selectedElement],
                              text: currentText
                            }
                          }));
                          
                          setHasChanges(true);
                          
                          toast({
                            title: "📝 Text Updated",
                            description: `${selectedElement} content changed. Click 'Save Changes' to make it permanent and live on the website.`,
                            duration: 4000,
                          });
                        } else {
                          toast({
                            title: "Error",
                            description: "Could not find element to update",
                            variant: "destructive"
                          });
                        }
                      }
                    } catch (error) {
                      console.error('Error applying text:', error);
                      toast({
                        title: "Error",
                        description: "Failed to apply text changes",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Apply Text
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Editing Mode Active
            </span>
            {hasChanges && (
              <span className="text-neonPink">Unsaved Changes</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Homepage Preview</h1>
              <p className="text-sm text-gray-400">Click any element to edit it</p>
            </div>
            {selectedElement && (
              <Badge variant="outline" className="text-neonCyan border-neonCyan">
                Selected: {selectedElement}
              </Badge>
            )}
          </div>
        </div>

        {/* Homepage Preview */}
        <div 
          className="bg-darkBg editing-mode"
          onClick={handleElementClick}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Global CSS Styles for Edit Mode */}
          <style dangerouslySetInnerHTML={{
            __html: `
              .editing-mode [data-editable] {
                position: relative;
                transition: all 0.3s ease;
                border-radius: 8px;
              }
              
              .editing-mode [data-editable]:hover {
                box-shadow: 0 0 0 2px #00ffff, 0 4px 20px rgba(0, 255, 255, 0.3) !important;
                transform: translateY(-2px) !important;
                cursor: pointer !important;
              }
              
              .editing-mode [data-editable].selected {
                box-shadow: 0 0 0 2px #ff00ff, 0 4px 20px rgba(255, 0, 255, 0.3) !important;
                transform: translateY(-2px) !important;
              }
              
              @keyframes fadeIn {
                from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
              }
            `
          }} />
          
          {/* Render the actual homepage */}
          <HomePage />
        </div>
      </div>
    </div>
  );
}
