'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { saveVisualEdit } from '@/lib/actions/visualEditorActions';

declare global {
  interface Window {
    applyTextEdit?: () => void;
    applyStyles?: () => void;
    saveChanges?: () => void;
    cancelEdit?: () => void;
  }
}

export function useVisualEditor() {
  const searchParams = useSearchParams();
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [currentElementId, setCurrentElementId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const cleanupEditor = () => {
    ['visual-editor-styles', 'visual-editor-toolbar', 'visual-editor-indicator'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.remove();
    });

    document.querySelectorAll('.visual-editor-highlight').forEach(el => {
      el.classList.remove('visual-editor-highlight', 'visual-editor-selected', 'visual-editor-processed');
    });

    delete window.applyTextEdit;
    delete window.saveChanges;
    delete window.cancelEdit;
  };

  const generateElementId = (element: HTMLElement): string => {
    // Try to get a meaningful ID based on content and position
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.slice(0, 20).replace(/\s+/g, '_').toLowerCase() || 'element';
    const index = Array.from(document.querySelectorAll(tagName)).indexOf(element);
    
    return `${tagName}_${textContent}_${index}`;
  };

  const getCurrentPageScope = (): string => {
    const pathname = window.location.pathname;
    if (pathname === '/') return 'homepage';
    return pathname.replace('/', '') || 'homepage';
  };

  const initializeVisualEditor = useCallback(() => {
    // Add editor styles
    const styleId = 'visual-editor-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .visual-editor-highlight {
          outline: 2px dashed #00ffff !important;
          outline-offset: 2px !important;
          cursor: pointer !important;
        }
        
        .visual-editor-highlight:hover {
          outline: 2px solid #00ffff !important;
          background-color: rgba(0, 255, 255, 0.1) !important;
        }
        
        .visual-editor-selected {
          outline: 3px solid #ff0080 !important;
          outline-offset: 2px !important;
          background-color: rgba(255, 0, 128, 0.1) !important;
        }
        
        .visual-editor-toolbar {
          position: fixed !important;
          top: 20px !important;
          right: 20px !important;
          background: rgba(0, 0, 0, 0.9) !important;
          color: white !important;
          padding: 10px !important;
          border-radius: 8px !important;
          border: 1px solid #00ffff !important;
          z-index: 10000 !important;
          font-family: system-ui, -apple-system, sans-serif !important;
          font-size: 14px !important;
          min-width: 250px !important;
          max-width: 300px !important;
        }
        
        .visual-editor-control {
          margin: 5px 0 !important;
          display: block !important;
          width: 100% !important;
          padding: 5px !important;
          border: 1px solid #333 !important;
          border-radius: 4px !important;
          background: #222 !important;
          color: white !important;
          box-sizing: border-box !important;
        }

        .visual-editor-button {
          background: #00ffff !important;
          color: black !important;
          border: none !important;
          padding: 8px 12px !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          margin: 2px !important;
          font-weight: bold !important;
          font-size: 12px !important;
        }

        .visual-editor-button:hover {
          background: #ff0080 !important;
        }

        .visual-editor-button:disabled {
          background: #666 !important;
          cursor: not-allowed !important;
        }

        .visual-editor-saving {
          background: #ffa500 !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Make elements editable
    const editableSelectors = ['h1, h2, h3, h4, h5, h6', 'p', '[data-editable]'];
    
    editableSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach((el) => {
        const element = el as HTMLElement;
        
        if (element.classList.contains('visual-editor-processed') || 
            element.closest('header') ||
            element.closest('footer') ||
            element.closest('.visual-editor-toolbar')) {
          return;
        }

        element.classList.add('visual-editor-highlight', 'visual-editor-processed');
        const elementId = generateElementId(element);
        element.setAttribute('data-visual-id', elementId);

        element.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          document.querySelectorAll('.visual-editor-selected').forEach(selectedEl => {
            selectedEl.classList.remove('visual-editor-selected');
          });

          element.classList.add('visual-editor-selected');
          setSelectedElement(element);
          setCurrentElementId(elementId);
          
          // Show enhanced editing toolbar
          const existingToolbar = document.getElementById('visual-editor-toolbar');
          if (existingToolbar) {
            existingToolbar.remove();
          }

          const toolbar = document.createElement('div');
          toolbar.id = 'visual-editor-toolbar';
          toolbar.className = 'visual-editor-toolbar';

          toolbar.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #00ffff; font-size: 12px; text-align: center;">
              🎨 Visual Editor Pro - ${elementId}
            </div>
            
            <!-- Content Tab -->
            <div class="editor-section">
              <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #00ffff;">📝 Content:</label>
              <textarea id="editor-text-input" class="visual-editor-control" rows="2" style="width: 100%; margin-bottom: 8px;">${element.textContent || ''}</textarea>
            </div>
            
            <!-- Colors Tab -->
            <div class="editor-section">
              <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #00ffff;">🎨 Colors:</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <div>
                  <label style="font-size: 10px; color: #ccc;">Text Color:</label>
                  <input type="color" id="text-color-input" value="${getComputedStyle(element).color === 'rgb(255, 255, 255)' ? '#ffffff' : '#00ffff'}" style="width: 100%; height: 24px;">
                </div>
                <div>
                  <label style="font-size: 10px; color: #ccc;">Background:</label>
                  <input type="color" id="bg-color-input" value="#000000" style="width: 100%; height: 24px;">
                </div>
              </div>
            </div>
            
            <!-- Typography Tab -->
            <div class="editor-section">
              <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #00ffff;">🔤 Typography:</label>
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px; margin-bottom: 8px;">
                <select id="font-family-input" style="padding: 4px; background: #333; color: white; border: 1px solid #555; border-radius: 4px;">
                  <option value="">Default Font</option>
                  <option value="Inter, sans-serif">Inter (Modern)</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Poppins, sans-serif">Poppins</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                  <option value="Georgia, serif">Georgia (Serif)</option>
                </select>
                <select id="font-weight-input" style="padding: 4px; background: #333; color: white; border: 1px solid #555; border-radius: 4px;">
                  <option value="400">Normal</option>
                  <option value="500">Medium</option>
                  <option value="600">Semi Bold</option>
                  <option value="700">Bold</option>
                </select>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <div>
                  <label style="font-size: 10px; color: #ccc;">Size:</label>
                  <input type="range" id="font-size-input" min="10" max="48" value="16" style="width: 100%;">
                  <span id="font-size-display" style="font-size: 10px; color: #ccc;">16px</span>
                </div>
                <div>
                  <label style="font-size: 10px; color: #ccc;">Line Height:</label>
                  <input type="range" id="line-height-input" min="1" max="3" step="0.1" value="1.5" style="width: 100%;">
                  <span id="line-height-display" style="font-size: 10px; color: #ccc;">1.5</span>
                </div>
              </div>
            </div>
            
            <!-- Effects Tab -->
            <div class="editor-section">
              <label style="display: block; margin-bottom: 5px; font-size: 11px; color: #00ffff;">✨ Effects:</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <div>
                  <label style="font-size: 10px; color: #ccc;">Border Radius:</label>
                  <input type="range" id="border-radius-input" min="0" max="20" value="0" style="width: 100%;">
                  <span id="border-radius-display" style="font-size: 10px; color: #ccc;">0px</span>
                </div>
                <div>
                  <label style="font-size: 10px; color: #ccc;">Opacity:</label>
                  <input type="range" id="opacity-input" min="0.1" max="1" step="0.1" value="1" style="width: 100%;">
                  <span id="opacity-display" style="font-size: 10px; color: #ccc;">100%</span>
                </div>
              </div>
            </div>
            
            <div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button id="apply-btn" onclick="window.applyStyles()" class="visual-editor-button" style="background: #0066ff !important;">Apply Preview</button>
              <button id="save-btn" onclick="window.saveChanges()" class="visual-editor-button" style="background: linear-gradient(45deg, #00ffff, #ff00ff) !important; color: black !important; font-weight: bold;">Save All</button>
            </div>
            <button onclick="window.cancelEdit()" class="visual-editor-button" style="width: 100%; background: #666 !important; margin-top: 8px;">Cancel</button>
          `;

          document.body.appendChild(toolbar);

          // Add event listeners for real-time updates
          const fontSizeInput = document.getElementById('font-size-input') as HTMLInputElement;
          const fontSizeDisplay = document.getElementById('font-size-display') as HTMLSpanElement;
          const lineHeightInput = document.getElementById('line-height-input') as HTMLInputElement;
          const lineHeightDisplay = document.getElementById('line-height-display') as HTMLSpanElement;
          const borderRadiusInput = document.getElementById('border-radius-input') as HTMLInputElement;
          const borderRadiusDisplay = document.getElementById('border-radius-display') as HTMLSpanElement;
          const opacityInput = document.getElementById('opacity-input') as HTMLInputElement;
          const opacityDisplay = document.getElementById('opacity-display') as HTMLSpanElement;

          fontSizeInput?.addEventListener('input', () => {
            fontSizeDisplay.textContent = fontSizeInput.value + 'px';
          });

          lineHeightInput?.addEventListener('input', () => {
            lineHeightDisplay.textContent = lineHeightInput.value;
          });

          borderRadiusInput?.addEventListener('input', () => {
            borderRadiusDisplay.textContent = borderRadiusInput.value + 'px';
          });

          opacityInput?.addEventListener('input', () => {
            opacityDisplay.textContent = Math.round(parseFloat(opacityInput.value) * 100) + '%';
          });

          // Function to collect all style properties
          const collectStyles = () => {
            const textColorInput = document.getElementById('text-color-input') as HTMLInputElement;
            const bgColorInput = document.getElementById('bg-color-input') as HTMLInputElement;
            const fontFamilyInput = document.getElementById('font-family-input') as HTMLSelectElement;
            const fontWeightInput = document.getElementById('font-weight-input') as HTMLSelectElement;

            return {
              color: textColorInput?.value || '#ffffff',
              backgroundColor: bgColorInput?.value || 'transparent',
              fontFamily: fontFamilyInput?.value || '',
              fontWeight: fontWeightInput?.value || '400',
              fontSize: fontSizeInput?.value + 'px' || '16px',
              lineHeight: lineHeightInput?.value || '1.5',
              borderRadius: borderRadiusInput?.value + 'px' || '0px',
              opacity: opacityInput?.value || '1'
            };
          };

          // Enhanced apply function
          window.applyStyles = () => {
            const input = document.getElementById('editor-text-input') as HTMLTextAreaElement;
            if (!element || !input) return;

            // Apply text content
            element.textContent = input.value;

            // Apply all styles
            const styles = collectStyles();
            Object.entries(styles).forEach(([property, value]) => {
              if (value && value !== '' && value !== 'transparent') {
                element.style.setProperty(property, value);
              }
            });

            console.log('✅ Applied preview styles:', styles);
          };

          window.saveChanges = async () => {
            const input = document.getElementById('editor-text-input') as HTMLTextAreaElement;
            const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
            const applyBtn = document.getElementById('apply-btn') as HTMLButtonElement;
            
            if (!input || !element) {
              console.error('❌ Client: Missing input or element for save');
              return;
            }
            
            console.log('🚀 Client: Starting enhanced save process...', {
              elementId,
              newContent: input.value.substring(0, 50) + '...',
              pageScope: getCurrentPageScope()
            });
            
            setIsSaving(true);
            saveBtn.disabled = true;
            applyBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            saveBtn.classList.add('visual-editor-saving');
            
            try {
              // Collect all styles
              const styleProperties = collectStyles();
              
              // Apply the changes locally first
              element.textContent = input.value;
              Object.entries(styleProperties).forEach(([property, value]) => {
                if (value && value !== '' && value !== 'transparent') {
                  element.style.setProperty(property, value);
                }
              });
              console.log('✅ Client: Applied changes locally');
              
              // Save to database with style properties
              console.log('📡 Client: Calling enhanced server action...');
              const result = await saveVisualEdit(
                elementId,
                input.value,
                getCurrentPageScope(),
                'text',
                styleProperties
              );
              
              console.log('📨 Client: Server response:', result);
              
              if (result.success) {
                console.log('✅ Client: Enhanced save successful!');
                saveBtn.innerHTML = '✅ Saved All!';
                saveBtn.style.background = 'linear-gradient(45deg, #00ff00, #00cc00) !important';
                setTimeout(() => {
                  const toolbarEl = document.getElementById('visual-editor-toolbar');
                  if (toolbarEl) toolbarEl.remove();
                  setSelectedElement(null);
                  setCurrentElementId('');
                }, 2000);
              } else {
                console.error('❌ Client: Enhanced save failed:', result);
                saveBtn.textContent = '❌ Failed';
                saveBtn.style.background = '#ff0000 !important';
                alert(`Failed to save: ${result.message}\nError: ${result.error}`);
                saveBtn.disabled = false;
                applyBtn.disabled = false;
              }
            } catch (error) {
              console.error('❌ Client: Exception during enhanced save:', error);
              saveBtn.textContent = '❌ Error';
              saveBtn.style.background = '#ff0000 !important';
              alert(`An error occurred while saving: ${error instanceof Error ? error.message : String(error)}`);
              saveBtn.disabled = false;
              applyBtn.disabled = false;
            } finally {
              setIsSaving(false);
              saveBtn.classList.remove('visual-editor-saving');
            }
          };

          window.cancelEdit = () => {
            setSelectedElement(null);
            setCurrentElementId('');
            document.querySelectorAll('.visual-editor-selected').forEach(el => {
              el.classList.remove('visual-editor-selected');
            });
            const toolbarEl = document.getElementById('visual-editor-toolbar');
            if (toolbarEl) toolbarEl.remove();
          };
        });
      });
    });

    // Add editor UI indicator
    const indicator = document.createElement('div');
    indicator.id = 'visual-editor-indicator';
    indicator.style.cssText = `
      position: fixed !important;
      top: 10px !important;
      left: 10px !important;
      background: rgba(0, 255, 255, 0.9) !important;
      color: black !important;
      padding: 8px 12px !important;
      border-radius: 6px !important;
      font-weight: bold !important;
      z-index: 9999 !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      font-size: 12px !important;
    `;
    indicator.textContent = '✏️ VISUAL EDITOR ACTIVE - Click text to edit';
    document.body.appendChild(indicator);
  }, []);

  useEffect(() => {
    const editorMode = searchParams.get('editor') === 'true';
    const adminMode = searchParams.get('admin') === 'true';
    const shouldEnableEditor = editorMode && adminMode;
    
    setIsEditorMode(shouldEnableEditor);

    if (shouldEnableEditor) {
      setTimeout(() => {
        initializeVisualEditor();
      }, 1000);
    }

    return () => {
      cleanupEditor();
    };
  }, [searchParams, initializeVisualEditor]);

  return {
    isEditorMode,
    selectedElement,
    currentElementId,
    isSaving
  };
}
