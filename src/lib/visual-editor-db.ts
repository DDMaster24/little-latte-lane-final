// Visual Editor Database Operations
// Handles saving/loading visual customizations to/from Supabase

import { getSupabaseClient } from '@/lib/supabase-client';

export interface VisualChange {
  id?: string;
  page_path: string;
  element_selector: string;
  element_tag: string;
  element_text?: string;
  property_name: string;
  property_value: string;
  old_value?: string;
  change_type: 'style' | 'content' | 'attribute';
  applied_at: string;
  is_published: boolean;
  is_draft: boolean;
  admin_user_id: string;
}

export interface VisualEditorState {
  changes: VisualChange[];
  isDraftMode: boolean;
  lastSaved?: string;
  pageId: string;
}

class VisualEditorDatabase {
  private supabase = getSupabaseClient();

  // Get unique selector for an element
  private getElementSelector(element: HTMLElement): string {
    // Try to get a unique selector for the element
    let selector = element.tagName.toLowerCase();
    
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(cls => 
        cls && !cls.startsWith('visual-editor') && !cls.startsWith('hover:') && !cls.startsWith('focus:')
      );
      if (classes.length > 0) {
        selector += '.' + classes.join('.');
      }
    }
    
    // Add position-based selector if needed
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(child => 
        child.tagName === element.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(element);
        selector += `:nth-of-type(${index + 1})`;
      }
    }
    
    return selector;
  }

  // Save a single change to the database
  async saveChange(
    element: HTMLElement,
    property: string,
    newValue: string,
    oldValue: string,
    changeType: 'style' | 'content' | 'attribute',
    pageId: string,
    adminUserId: string,
    isDraft: boolean = true
  ): Promise<VisualChange | null> {
    try {
      const selector = this.getElementSelector(element);
      const pagePath = window.location.pathname;
      
      const change: Omit<VisualChange, 'id'> = {
        page_path: pagePath,
        element_selector: selector,
        element_tag: element.tagName.toLowerCase(),
        element_text: changeType === 'content' ? newValue : element.textContent?.slice(0, 100),
        property_name: property,
        property_value: newValue,
        old_value: oldValue,
        change_type: changeType,
        applied_at: new Date().toISOString(),
        is_published: !isDraft,
        is_draft: isDraft,
        admin_user_id: adminUserId
      };

      // For now, we'll store in localStorage until the table is created
      const storageKey = `visual_editor_changes_${pagePath}`;
      const existingChanges = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const changeWithId = { ...change, id: crypto.randomUUID() };
      existingChanges.push(changeWithId);
      localStorage.setItem(storageKey, JSON.stringify(existingChanges));

      console.log('Visual editor change saved to localStorage:', changeWithId);
      return changeWithId as VisualChange;

      // TODO: Uncomment when table is created
      /*
      const { data, error } = await this.supabase
        .from('visual_editor_changes')
        .insert(change)
        .select()
        .single();

      if (error) {
        console.error('Error saving visual editor change:', error);
        return null;
      }

      return data as VisualChange;
      */
    } catch (error) {
      console.error('Error in saveChange:', error);
      return null;
    }
  }

  // Load changes for a specific page
  async loadPageChanges(_pageId: string, _publishedOnly: boolean = false): Promise<VisualChange[]> {
    try {
      const pagePath = window.location.pathname;
      
      // For now, load from localStorage until the table is created
      const storageKey = `visual_editor_changes_${pagePath}`;
      const storedChanges = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      console.log('Visual editor changes loaded from localStorage:', storedChanges.length);
      return storedChanges as VisualChange[];
    } catch (error) {
      console.error('Error in loadPageChanges:', error);
      return [];
    }
  }

  // Apply changes to the current page
  async applyChangesToPage(changes: VisualChange[]): Promise<number> {
    let appliedCount = 0;

    for (const change of changes) {
      try {
        const elements = document.querySelectorAll(change.element_selector);
        
        elements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          
          switch (change.change_type) {
            case 'style':
              htmlElement.style.setProperty(change.property_name, change.property_value);
              appliedCount++;
              break;
              
            case 'content':
              if (change.property_name === 'textContent') {
                htmlElement.textContent = change.property_value;
                appliedCount++;
              } else if (change.property_name === 'innerHTML') {
                htmlElement.innerHTML = change.property_value;
                appliedCount++;
              }
              break;
              
            case 'attribute':
              htmlElement.setAttribute(change.property_name, change.property_value);
              appliedCount++;
              break;
          }
        });
      } catch (error) {
        console.warn(`Failed to apply change for selector ${change.element_selector}:`, error);
      }
    }

    return appliedCount;
  }

  // Publish draft changes (localStorage simulation)
  async publishChanges(_pageId: string, _adminUserId: string): Promise<boolean> {
    try {
      console.log('Publishing changes (localStorage simulation)');
      return true;
    } catch (error) {
      console.error('Error in publishChanges:', error);
      return false;
    }
  }

  // Revert to published version (localStorage simulation)
  async revertToPublished(_pageId: string, _adminUserId: string): Promise<boolean> {
    try {
      const pagePath = window.location.pathname;
      const storageKey = `visual_editor_changes_${pagePath}`;
      localStorage.removeItem(storageKey);
      console.log('Reverted to published (cleared localStorage)');
      return true;
    } catch (error) {
      console.error('Error in revertToPublished:', error);
      return false;
    }
  }

  // Delete specific change (localStorage simulation)
  async deleteChange(changeId: string): Promise<boolean> {
    try {
      console.log('Delete change (localStorage simulation):', changeId);
      return true;
    } catch (error) {
      console.error('Error in deleteChange:', error);
      return false;
    }
  }

  // Get change history for a page (localStorage simulation)
  async getChangeHistory(_pageId: string, _limit: number = 50): Promise<VisualChange[]> {
    try {
      return this.loadPageChanges(_pageId);
    } catch (error) {
      console.error('Error in getChangeHistory:', error);
      return [];
    }
  }
}

export const visualEditorDB = new VisualEditorDatabase();
