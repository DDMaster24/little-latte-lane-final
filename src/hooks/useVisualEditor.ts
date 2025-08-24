'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { saveVisualEdit } from '@/lib/actions/visualEditorActions';

declare global {
  interface Window {
    applyTextEdit?: () => void;
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
          
          // Show editing toolbar
          const existingToolbar = document.getElementById('visual-editor-toolbar');
          if (existingToolbar) {
            existingToolbar.remove();
          }

          const toolbar = document.createElement('div');
          toolbar.id = 'visual-editor-toolbar';
          toolbar.className = 'visual-editor-toolbar';

          toolbar.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #00ffff; font-size: 12px;">
              Editing: ${elementId}
            </div>
            <label style="display: block; margin-bottom: 5px; font-size: 11px;">Text Content:</label>
            <textarea id="editor-text-input" class="visual-editor-control" rows="3">${element.textContent || ''}</textarea>
            <div style="margin-top: 8px;">
              <button id="apply-btn" onclick="window.applyTextEdit()" class="visual-editor-button">Apply</button>
              <button id="save-btn" onclick="window.saveChanges()" class="visual-editor-button">Save to DB</button>
            </div>
            <button onclick="window.cancelEdit()" class="visual-editor-button" style="width: 100%; background: #666 !important; margin-top: 5px;">Cancel</button>
          `;

          document.body.appendChild(toolbar);

          window.applyTextEdit = () => {
            const input = document.getElementById('editor-text-input') as HTMLTextAreaElement;
            if (element && input) {
              element.textContent = input.value;
            }
          };

          window.saveChanges = async () => {
            const input = document.getElementById('editor-text-input') as HTMLTextAreaElement;
            const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
            const applyBtn = document.getElementById('apply-btn') as HTMLButtonElement;
            
            if (!input || !element) {
              console.error('❌ Client: Missing input or element for save');
              return;
            }
            
            console.log('🚀 Client: Starting save process...', {
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
              // Apply the change locally first
              element.textContent = input.value;
              console.log('✅ Client: Applied change locally');
              
              // Save to database
              console.log('📡 Client: Calling server action...');
              const result = await saveVisualEdit(
                elementId,
                input.value,
                getCurrentPageScope(),
                'text'
              );
              
              console.log('📨 Client: Server response:', result);
              
              if (result.success) {
                console.log('✅ Client: Save successful!');
                saveBtn.textContent = '✅ Saved!';
                saveBtn.style.background = '#00ff00 !important';
                setTimeout(() => {
                  const toolbarEl = document.getElementById('visual-editor-toolbar');
                  if (toolbarEl) toolbarEl.remove();
                  setSelectedElement(null);
                  setCurrentElementId('');
                }, 1500);
              } else {
                console.error('❌ Client: Save failed:', result);
                saveBtn.textContent = '❌ Failed';
                saveBtn.style.background = '#ff0000 !important';
                alert(`Failed to save: ${result.message}\nError: ${result.error}`);
                saveBtn.disabled = false;
                applyBtn.disabled = false;
              }
            } catch (error) {
              console.error('❌ Client: Exception during save:', error);
              console.error('❌ Client: Error type:', typeof error);
              console.error('❌ Client: Error details:', {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : 'No stack trace'
              });
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
  }, [searchParams]); // Remove initializeVisualEditor from dependencies to prevent infinite loop

  return {
    isEditorMode,
    selectedElement,
    currentElementId,
    isSaving
  };
}
