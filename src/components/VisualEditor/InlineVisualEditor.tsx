'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { DesignTools } from './DesignTools';

interface InlineVisualEditorProps {
  children: React.ReactNode;
}

interface ElementInfo {
  element: HTMLElement;
  id: string;
  type: string;
  content: string;
  styles: CSSStyleDeclaration;
  selector: string;
  isEditable: boolean;
}

export function InlineVisualEditor({ children }: InlineVisualEditorProps) {
  const searchParams = useSearchParams();
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [editableElements, setEditableElements] = useState<ElementInfo[]>([]);
  const [changeHistory, setChangeHistory] = useState<Array<{element: HTMLElement, property: string, value: string}>>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle element updates
  const handleElementUpdate = useCallback((element: HTMLElement, property: string, value: string) => {
    // Add to change history for potential save functionality
    setChangeHistory(prev => [...prev, { element, property, value }]);
    
    console.log(`🎨 Style applied: ${property} = ${value}`);
  }, []);

  // Show navigation blocked message
  const showNavigationBlockedMessage = useCallback(() => {
    // Remove existing message if any
    const existingMessage = document.getElementById('navigation-blocked-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create message overlay
    const messageDiv = document.createElement('div');
    messageDiv.id = 'navigation-blocked-message';
    messageDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      background: linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95));
      border: 2px solid #ef4444;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      text-align: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.3s ease-out;
    `;

    messageDiv.innerHTML = `
      <style>
        @keyframes slideIn {
          from { opacity: 0; transform: translate(-50%, -60%) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      </style>
      <div style="color: #ef4444; font-size: 24px; margin-bottom: 12px;">🔒</div>
      <h3 style="color: white; font-size: 18px; font-weight: 600; margin-bottom: 8px;">
        Navigation Locked
      </h3>
      <p style="color: #d1d5db; font-size: 14px; line-height: 1.5; margin-bottom: 16px;">
        Page navigation is disabled during editing for safety. Use the "Back" button in the editor to return to the Visual Editor dashboard.
      </p>
      <button id="close-message" style="
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      ">
        Got it
      </button>
    `;

    document.body.appendChild(messageDiv);

    // Add close functionality
    const closeButton = messageDiv.querySelector('#close-message');
    closeButton?.addEventListener('click', () => {
      messageDiv.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }, []);

  // Generate unique selector for element
  const generateElementSelector = useCallback((element: HTMLElement): string => {
    // Check for ID
    if (element.id) {
      return `#${element.id}`;
    }
    
    // Check for unique class combinations
    if (element.className) {
      const classes = element.className.split(' ').filter(cls => cls.trim());
      if (classes.length > 0) {
        const classSelector = `.${classes.join('.')}`;
        if (document.querySelectorAll(classSelector).length === 1) {
          return classSelector;
        }
      }
    }
    
    // Generate path-based selector
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      }
      
      if (current.className) {
        const classes = current.className.split(' ').filter(cls => cls.trim());
        if (classes.length > 0) {
          selector += `.${classes[0]}`; // Use first class
        }
      }
      
      // Add nth-child if needed for uniqueness
      const siblings = Array.from(current.parentElement?.children || [])
        .filter(sibling => sibling.tagName === current.tagName);
      
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
      
      path.unshift(selector);
      current = current.parentElement as HTMLElement;
      
      // Limit path length
      if (path.length >= 5) break;
    }
    
    return path.join(' > ');
  }, []);

  // Generate element info
  const generateElementInfo = useCallback((element: HTMLElement): ElementInfo => {
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim() || '';
    const selector = generateElementSelector(element);
    
    // Determine element type and editability
    const isTextElement = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button'].includes(tagName);
    const hasEditableAttribute = element.hasAttribute('data-editable');
    const isContentEditable = element.contentEditable === 'true';
    const hasTextContent = textContent.length > 0;
    
    const isEditable = isTextElement || hasEditableAttribute || isContentEditable || hasTextContent;
    
    let elementType = 'unknown';
    if (tagName.startsWith('h')) elementType = 'heading';
    else if (tagName === 'p') elementType = 'paragraph';
    else if (tagName === 'a') elementType = 'link';
    else if (tagName === 'button') elementType = 'button';
    else if (tagName === 'img') elementType = 'image';
    else if (tagName === 'div') elementType = 'container';
    else if (tagName === 'span') elementType = 'text';
    else if (['ul', 'ol', 'li'].includes(tagName)) elementType = 'list';
    else elementType = tagName;
    
    return {
      element,
      id: selector,
      type: elementType,
      content: textContent,
      styles: window.getComputedStyle(element),
      selector,
      isEditable
    };
  }, [generateElementSelector]);

  // Add visual indicators to elements
  const addElementIndicators = useCallback((elements: ElementInfo[]) => {
    // Remove existing indicators
    document.querySelectorAll('.visual-editor-indicator').forEach(el => el.remove());
    
    elements.forEach((elementInfo, index) => {
      const { element } = elementInfo;
      
      // Add hover effect
      element.addEventListener('mouseenter', () => {
        if (selectedElement?.element !== element) {
          setHoveredElement(element);
          element.classList.add('visual-editor-hovered');
        }
      });
      
      element.addEventListener('mouseleave', () => {
        setHoveredElement(null);
        element.classList.remove('visual-editor-hovered');
      });
      
      // Add click handler
      element.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Clear previous selection
        document.querySelectorAll('.visual-editor-selected').forEach(el => {
          el.classList.remove('visual-editor-selected');
        });
        
        // Select this element
        element.classList.add('visual-editor-selected');
        setSelectedElement(elementInfo);
        
        console.log('🎯 Selected element:', elementInfo);
      });
      
      // Add element numbering for debugging
      element.setAttribute('data-visual-editor-index', index.toString());
      element.setAttribute('data-visual-editor-type', elementInfo.type);
    });
  }, [selectedElement]);

  // Scan page for editable elements
  const scanForEditableElements = useCallback(() => {
    if (!isEditorMode) {
      console.log('❌ Scan aborted: Not in editor mode');
      return [];
    }
    
    console.log('🔍 Scanning page for editable elements...');
    
    // More comprehensive selectors for potentially editable elements
    const editableSelectors = [
      'h1, h2, h3, h4, h5, h6',
      'p',
      'span:not(:empty)',
      'a',
      'button',
      'div:not(:empty)',
      'section',
      'article',
      'header',
      'nav',
      'main',
      'footer',
      'aside',
      'div[data-editable]',
      '[contenteditable]',
      'img',
      'li',
      'label',
      'legend',
      'figcaption',
      '.editable',
      '[class*="text"]',
      '[class*="title"]',
      '[class*="heading"]',
      '[class*="content"]'
    ];
    
    const elements: ElementInfo[] = [];
    const processedElements = new Set<HTMLElement>();
    const skippedReasons: Record<string, number> = {};
    
    // Function to log skip reasons for debugging
    const logSkip = (reason: string) => {
      skippedReasons[reason] = (skippedReasons[reason] || 0) + 1;
    };
    
    editableSelectors.forEach(selector => {
      try {
        const foundElements = document.querySelectorAll(selector);
        console.log(`🔍 Selector "${selector}" found ${foundElements.length} elements`);
        
        foundElements.forEach(el => {
          const element = el as HTMLElement;
          
          // Skip if already processed
          if (processedElements.has(element)) {
            logSkip('already processed');
            return;
          }
          
          // Skip editor UI elements (more specific check)
          if (element.closest('[data-visual-editor]') || 
              element.closest('.visual-editor-sidebar') ||
              element.closest('.visual-editor-indicator') ||
              element.id?.includes('visual-editor') ||
              element.className?.includes('visual-editor')) {
            logSkip('editor UI element');
            return;
          }
          
          // Skip hidden elements
          const styles = window.getComputedStyle(element);
          if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
            logSkip('hidden element');
            return;
          }
          
          // Get bounding box
          const rect = element.getBoundingClientRect();
          
          // Skip elements that are too small (but be less restrictive)
          if (rect.width < 5 || rect.height < 5) {
            logSkip('too small');
            return;
          }
          
          // Skip elements outside viewport (far off screen)
          if (rect.bottom < -1000 || rect.top > window.innerHeight + 1000) {
            logSkip('far off screen');
            return;
          }
          
          try {
            const elementInfo = generateElementInfo(element);
            
            // More permissive content check
            const hasContent = elementInfo.content.trim().length > 0;
            const isInteractiveElement = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
            const hasVisibleText = element.textContent?.trim().length || 0 > 0;
            const isImageElement = element.tagName === 'IMG';
            const hasBackgroundImage = styles.backgroundImage && styles.backgroundImage !== 'none';
            
            if (hasContent || isInteractiveElement || hasVisibleText || isImageElement || hasBackgroundImage || elementInfo.isEditable) {
              elements.push(elementInfo);
              processedElements.add(element);
              console.log(`✅ Added element: ${element.tagName}.${element.className} - "${elementInfo.content.substring(0, 50)}"`);
            } else {
              logSkip('no meaningful content');
            }
          } catch (error) {
            console.warn(`⚠️ Error processing element:`, error);
            logSkip('error processing');
          }
        });
      } catch (error) {
        console.warn(`⚠️ Error with selector "${selector}":`, error);
      }
    });
    
    console.log('📊 Scan results:');
    console.log(`✅ Found ${elements.length} editable elements`);
    console.log('📋 Skip reasons:', skippedReasons);
    
    setEditableElements(elements);
    
    // Also add indicators immediately
    if (elements.length > 0) {
      addElementIndicators(elements);
    }
    
    return elements;
  }, [isEditorMode, generateElementInfo, addElementIndicators]);

  // Initialize editor styles
  const initializeEditorStyles = useCallback(() => {
    const styleId = 'visual-editor-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .visual-editor-hovered {
        outline: 3px solid #00ffff !important;
        outline-offset: 3px !important;
        cursor: pointer !important;
        background-color: rgba(0, 255, 255, 0.08) !important;
        position: relative !important;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.3) !important;
        transition: all 0.2s ease-out !important;
      }
      
      .visual-editor-hovered::after {
        content: "✨ Click to edit " attr(data-visual-editor-type);
        position: absolute !important;
        top: -35px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        background: linear-gradient(135deg, #000000, #1a1a1a) !important;
        color: #00ffff !important;
        padding: 6px 12px !important;
        border-radius: 8px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        white-space: nowrap !important;
        z-index: 10000 !important;
        pointer-events: none !important;
        border: 1px solid #00ffff !important;
        animation: fadeInTooltip 0.3s ease-out !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
      }
      
      @keyframes fadeInTooltip {
        from { opacity: 0; transform: translateX(-50%) translateY(-5px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      
      .visual-editor-selected {
        outline: 4px solid #ff0080 !important;
        outline-offset: 3px !important;
        background-color: rgba(255, 0, 128, 0.12) !important;
        position: relative !important;
        box-shadow: 0 0 25px rgba(255, 0, 128, 0.4) !important;
        transition: all 0.2s ease-out !important;
      }
      
      .visual-editor-selected::before {
        content: "🎯 Editing: " attr(data-visual-editor-type);
        position: absolute !important;
        top: -30px !important;
        left: 0 !important;
        background: linear-gradient(135deg, #ff0080, #e91e63) !important;
        color: white !important;
        padding: 4px 8px !important;
        border-radius: 6px !important;
        font-size: 11px !important;
        font-weight: bold !important;
        text-transform: uppercase !important;
        z-index: 10000 !important;
        pointer-events: none !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
      }
      
      .visual-editor-sidebar {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Disable page navigation during editing
  const disablePageNavigation = useCallback(() => {
    console.log('🔒 Disabling page navigation for editing safety');
    
    // Disable all anchor links
    document.querySelectorAll('a').forEach(link => {
      const linkElement = link as HTMLAnchorElement;
      if (!linkElement.closest('[data-visual-editor]')) {
        const originalHref = linkElement.getAttribute('href');
        if (originalHref) {
          linkElement.setAttribute('data-original-href', originalHref);
          linkElement.removeAttribute('href');
          linkElement.style.cursor = 'not-allowed';
          linkElement.style.opacity = '0.6';
          
          // Add click handler to show message
          const handleClick = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            showNavigationBlockedMessage();
          };
          linkElement.addEventListener('click', handleClick);
          linkElement.setAttribute('data-click-disabled', 'true');
        }
      }
    });

    // Disable form submissions
    document.querySelectorAll('form').forEach(form => {
      if (!form.closest('[data-visual-editor]')) {
        const handleSubmit = (e: Event) => {
          e.preventDefault();
          showNavigationBlockedMessage();
        };
        form.addEventListener('submit', handleSubmit);
        form.setAttribute('data-submit-disabled', 'true');
      }
    });

    // Disable button clicks that might navigate
    document.querySelectorAll('button').forEach(button => {
      const buttonElement = button as HTMLButtonElement;
      if (!buttonElement.closest('[data-visual-editor]') && 
          !buttonElement.hasAttribute('data-visual-editor-tool')) {
        const handleClick = (e: Event) => {
          // Allow if it's clearly an editing action
          if (buttonElement.textContent?.toLowerCase().includes('edit') ||
              buttonElement.textContent?.toLowerCase().includes('save') ||
              buttonElement.textContent?.toLowerCase().includes('update')) {
            return; // Allow these actions
          }
          
          e.preventDefault();
          e.stopPropagation();
          showNavigationBlockedMessage();
        };
        buttonElement.addEventListener('click', handleClick);
        buttonElement.setAttribute('data-click-intercepted', 'true');
        buttonElement.style.opacity = '0.7';
      }
    });
  }, [showNavigationBlockedMessage]);

  // Re-enable page navigation
  const enablePageNavigation = useCallback(() => {
    console.log('🔓 Re-enabling page navigation');
    
    // Restore anchor links
    document.querySelectorAll('a[data-original-href]').forEach(link => {
      const linkElement = link as HTMLAnchorElement;
      const originalHref = linkElement.getAttribute('data-original-href');
      if (originalHref) {
        linkElement.setAttribute('href', originalHref);
        linkElement.removeAttribute('data-original-href');
        linkElement.style.cursor = '';
        linkElement.style.opacity = '';
        
        // Remove click handler
        if (linkElement.hasAttribute('data-click-disabled')) {
          linkElement.removeAttribute('data-click-disabled');
          // Note: We can't easily remove the specific event listener, 
          // but page reload will clean this up
        }
      }
    });

    // Re-enable forms
    document.querySelectorAll('form[data-submit-disabled]').forEach(form => {
      form.removeAttribute('data-submit-disabled');
    });

    // Re-enable buttons
    document.querySelectorAll('button[data-click-intercepted]').forEach(button => {
      const buttonElement = button as HTMLButtonElement;
      buttonElement.removeAttribute('data-click-intercepted');
      buttonElement.style.opacity = '';
    });
  }, []);

  // Initialize editor mode
  useEffect(() => {
    const editorMode = searchParams.get('editor') === 'true';
    const adminMode = searchParams.get('admin') === 'true';
    setIsEditorMode(editorMode && adminMode);
    
    if (editorMode && adminMode) {
      // Disable all navigation when in editor mode
      disablePageNavigation();
      
      setTimeout(() => {
        initializeEditorStyles();
        const elements = scanForEditableElements();
        if (elements) {
          addElementIndicators(elements);
        }
      }, 1000); // Give page time to load
    }
    
    return () => {
      // Cleanup
      document.querySelectorAll('.visual-editor-hovered, .visual-editor-selected').forEach(el => {
        el.classList.remove('visual-editor-hovered', 'visual-editor-selected');
      });
      const style = document.getElementById('visual-editor-styles');
      if (style) style.remove();
      
      // Re-enable navigation
      if (editorMode && adminMode) {
        enablePageNavigation();
      }
    };
  }, [searchParams, initializeEditorStyles, scanForEditableElements, addElementIndicators, disablePageNavigation, enablePageNavigation]);

  // Handle sidebar resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (!isEditorMode) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900" data-visual-editor="true">
      {/* Left Sidebar - Design Tools */}
      <div
        ref={sidebarRef}
        className="visual-editor-sidebar fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-700 shadow-2xl"
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Sidebar Header */}
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-neonCyan to-neonPink rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-black">LL</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">Visual Editor</h1>
              <p className="text-gray-400 text-xs">Professional Design Studio</p>
            </div>
          </div>
          <button
            onClick={() => {
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('editor');
              newUrl.searchParams.delete('admin');
              window.location.href = newUrl.toString();
            }}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="h-full overflow-y-auto pb-16">
          {/* Element Inspector */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-medium text-sm mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-neonCyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
              </svg>
              Element Inspector
            </h3>
            {selectedElement ? (
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Selected Element:</div>
                <div className="text-sm text-white font-mono bg-gray-700 px-2 py-1 rounded mb-2">
                  {selectedElement.type}
                </div>
                <div className="text-xs text-gray-400 mb-2">Selector:</div>
                <div className="text-xs text-white font-mono bg-gray-700 px-2 py-1 rounded mb-2 break-all">
                  {selectedElement.selector}
                </div>
                <div className="text-xs text-gray-400 mb-1">Content:</div>
                <div className="text-xs text-gray-300 break-words max-h-20 overflow-y-auto">
                  {selectedElement.content || '<no text content>'}
                </div>
                <button
                  onClick={() => {
                    selectedElement.element.classList.remove('visual-editor-selected');
                    setSelectedElement(null);
                  }}
                  className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear selection
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-white text-lg font-semibold mb-2">Ready to Design</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    Hover over any page element to see it highlighted, then click to start editing with professional design tools.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mb-4">
                    <div className="w-3 h-3 bg-neonCyan rounded-full animate-pulse"></div>
                    <span>Hover Detection Active</span>
                  </div>
                  <button
                    onClick={() => {
                      const elements = scanForEditableElements();
                      if (elements && elements.length > 0) {
                        addElementIndicators(elements);
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-neonCyan to-neonPink text-black font-semibold rounded-lg hover:from-cyan-400 hover:to-pink-400 transition-all transform hover:scale-105"
                  >
                    🔄 Refresh Page Scan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Element List */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-medium text-sm mb-3 flex items-center justify-between">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-neonPink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Page Elements
              </span>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                {editableElements.length}
              </span>
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {editableElements.map((elementInfo, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // Clear previous selection
                    document.querySelectorAll('.visual-editor-selected').forEach(el => {
                      el.classList.remove('visual-editor-selected');
                    });
                    
                    // Select this element
                    elementInfo.element.classList.add('visual-editor-selected');
                    setSelectedElement(elementInfo);
                    
                    // Scroll element into view
                    elementInfo.element.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'center',
                      inline: 'nearest'
                    });
                  }}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    selectedElement?.selector === elementInfo.selector
                      ? 'bg-neonPink/20 border-neonPink/50 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded">
                      {elementInfo.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="text-xs mt-1 truncate">
                    {elementInfo.content || elementInfo.selector}
                  </div>
                </button>
              ))}
              
              {editableElements.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-xs">No elements found</p>
                  <button
                    onClick={() => {
                      const elements = scanForEditableElements();
                      if (elements) {
                        addElementIndicators(elements);
                      }
                    }}
                    className="mt-2 text-xs text-neonCyan hover:text-cyan-400"
                  >
                    Scan Page
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Design Tools */}
          <div className="flex-1">
            <DesignTools 
              selectedElement={selectedElement}
              onElementUpdate={handleElementUpdate}
            />
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                disabled={!selectedElement}
                onClick={() => {
                  console.log('🔍 Preview mode - showing changes:', changeHistory);
                }}
              >
                Preview
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-neonCyan to-neonPink hover:from-cyan-400 hover:to-pink-400 text-black rounded-lg text-sm font-bold transition-all"
                disabled={changeHistory.length === 0}
                onClick={() => {
                  console.log('💾 Saving changes:', changeHistory);
                  // TODO: Integrate with save functionality
                }}
              >
                Save ({changeHistory.length})
              </button>
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="absolute top-0 right-0 w-1 h-full bg-gray-700 hover:bg-neonCyan cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        />
      </div>

      {/* Main Content Area */}
      <div
        ref={contentRef}
        className="h-full overflow-auto bg-gradient-to-br from-gray-900 to-black"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {/* Content Area Header */}
        <div className="h-16 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between px-6 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">
                Live Preview Mode - {editableElements.length} elements
              </span>
            </div>
            {hoveredElement && (
              <div className="text-gray-400 text-sm">
                Hover: {hoveredElement.tagName.toLowerCase()}
              </div>
            )}
            {changeHistory.length > 0 && (
              <div className="text-neonCyan text-sm">
                {changeHistory.length} unsaved changes
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                const elements = scanForEditableElements();
                if (elements) {
                  addElementIndicators(elements);
                }
              }}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
            >
              Rescan
            </button>
            <button 
              onClick={() => {
                setChangeHistory([]);
                console.log('🔄 Changes cleared');
              }}
              disabled={changeHistory.length === 0}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-xs transition-colors"
            >
              Reset
            </button>
            <button className="px-3 py-1 bg-neonCyan hover:bg-cyan-400 text-black rounded text-xs font-medium transition-colors">
              Publish
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="relative">
          {children}
          
          {/* Element count overlay */}
          {editableElements.length > 0 && (
            <div className="fixed bottom-6 right-6 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600 rounded-xl px-4 py-3 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neonCyan rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-semibold">
                    {editableElements.length} Elements
                  </span>
                </div>
                <div className="w-px h-6 bg-gray-600"></div>
                <div className="text-gray-300 text-sm">
                  {selectedElement ? (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-neonPink rounded-full mr-2"></span>
                      Editing {selectedElement.type}
                    </span>
                  ) : (
                    'Hover to select'
                  )}
                </div>
                {changeHistory.length > 0 && (
                  <>
                    <div className="w-px h-6 bg-gray-600"></div>
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                      <span className="text-neonCyan text-sm font-medium">
                        {changeHistory.length} changes
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
