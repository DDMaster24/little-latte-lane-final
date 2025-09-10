import { create } from 'zustand';
import { EditableComponent, getComponentById } from './ComponentRegistry';

interface EditorSelectionState {
  selectedComponentId: string | null;
  selectedComponent: EditableComponent | null;
  isEditMode: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
  saveMessage: string | null;
  
  // Actions
  selectComponent: (componentId: string) => void;
  clearSelection: () => void;
  setEditMode: (enabled: boolean) => void;
  setSaving: (saving: boolean) => void;
  setSaveStatus: (status: 'idle' | 'saving' | 'success' | 'error', message?: string) => void;
  markSaveSuccess: () => void;
  markSaveError: (error: string) => void;
}

export const useEditorSelection = create<EditorSelectionState>((set, get) => ({
  selectedComponentId: null,
  selectedComponent: null,
  isEditMode: true,
  isSaving: false,
  lastSaved: null,
  saveStatus: 'idle',
  saveMessage: null,

  selectComponent: (componentId: string) => {
    const component = getComponentById(componentId);
    console.log(`🎯 Selected component: ${componentId}`, component);
    
    set({
      selectedComponentId: componentId,
      selectedComponent: component || null
    });
  },

  clearSelection: () => {
    console.log('🔄 Cleared component selection');
    set({
      selectedComponentId: null,
      selectedComponent: null
    });
  },

  setEditMode: (enabled: boolean) => {
    console.log(`🔧 Edit mode: ${enabled ? 'ON' : 'OFF'}`);
    set({ isEditMode: enabled });
    
    if (!enabled) {
      // Clear selection when turning off edit mode
      get().clearSelection();
    }
  },

  setSaving: (saving: boolean) => {
    set({ 
      isSaving: saving,
      saveStatus: saving ? 'saving' : 'idle'
    });
  },

  setSaveStatus: (status: 'idle' | 'saving' | 'success' | 'error', message?: string) => {
    set({
      saveStatus: status,
      saveMessage: message || null,
      isSaving: status === 'saving'
    });
  },

  markSaveSuccess: () => {
    set({
      saveStatus: 'success',
      saveMessage: 'Changes saved successfully!',
      lastSaved: new Date(),
      isSaving: false
    });

    // Clear success message after 3 seconds
    setTimeout(() => {
      const currentStatus = get().saveStatus;
      if (currentStatus === 'success') {
        set({ saveStatus: 'idle', saveMessage: null });
      }
    }, 3000);
  },

  markSaveError: (error: string) => {
    set({
      saveStatus: 'error',
      saveMessage: `Save failed: ${error}`,
      isSaving: false
    });

    // Clear error message after 5 seconds
    setTimeout(() => {
      const currentStatus = get().saveStatus;
      if (currentStatus === 'error') {
        set({ saveStatus: 'idle', saveMessage: null });
      }
    }, 5000);
  }
}));
