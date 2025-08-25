// Visual Editor Database Operations - TEMPORARY localStorage version
// Will be upgraded to Supabase once types are regenerated

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
  // Generate a unique CSS selector for an element
  private getElementSelector(element: HTMLElement): string {
    const parents = [];
    let currentElement: Element | null = element;
    
    while (currentElement && currentElement !== document.body) {
      let selector = currentElement.tagName.toLowerCase();
      
      if (currentElement.id) {
        selector += `#${currentElement.id}`;
        parents.unshift(selector);
        break;
      }
      
      if (currentElement.className) {
        const classes = Array.from(currentElement.classList)
          .filter(cls => !cls.startsWith('visual-editor-'))
          .slice(0, 3)
          .join('.');
        if (classes) {
          selector += `.${classes}`;
        }
      }
      
      parents.unshift(selector);
      currentElement = currentElement.parentElement;
    }
    
    const selector = parents.join(' > ');
    return selector || element.tagName.toLowerCase();
  }

  // Save a single change (localStorage for now)
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

      // Use localStorage (temporary until Supabase types are updated)
      const storageKey = `visual_editor_changes_${pagePath}`;
      const existingChanges = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const changeWithId = { ...change, id: crypto.randomUUID() };
      existingChanges.push(changeWithId);
      localStorage.setItem(storageKey, JSON.stringify(existingChanges));
      
      console.log('✅ Change saved to localStorage:', changeWithId);
      return changeWithId;
    } catch (error) {
      console.error('Error in saveChange:', error);
      return null;
    }
  }

  // Load changes for a page
  async loadPageChanges(_pageId: string, publishedOnly: boolean = false): Promise<VisualChange[]> {
    try {
      const pagePath = window.location.pathname;
      const storageKey = `visual_editor_changes_${pagePath}`;
      const storedChanges = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      let filteredChanges = storedChanges;
      if (publishedOnly) {
        filteredChanges = storedChanges.filter((change: VisualChange) => change.is_published);
      }
      
      console.log('✅ Changes loaded from localStorage:', filteredChanges.length);
      return filteredChanges as VisualChange[];
    } catch (error) {
      console.error('Error loading changes:', error);
      return [];
    }
  }

  // Apply changes to the current page
  async applyChangesToPage(changes: VisualChange[]): Promise<number> {
    let appliedCount = 0;
    
    for (const change of changes) {
      try {
        const element = document.querySelector(change.element_selector) as HTMLElement;
        if (element) {
          if (change.change_type === 'style') {
            element.style.setProperty(change.property_name, change.property_value);
          } else if (change.change_type === 'content') {
            element.textContent = change.property_value;
          } else if (change.change_type === 'attribute') {
            element.setAttribute(change.property_name, change.property_value);
          }
          appliedCount++;
        }
      } catch (error) {
        console.warn('Failed to apply change:', change, error);
      }
    }
    
    console.log(`✅ Applied ${appliedCount}/${changes.length} visual changes`);
    return appliedCount;
  }

  // Publish changes (localStorage)
  async publishChanges(_pageId: string, _adminUserId: string): Promise<boolean> {
    try {
      const pagePath = window.location.pathname;
      const storageKey = `visual_editor_changes_${pagePath}`;
      const changes = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const updatedChanges = changes.map((change: VisualChange) => ({
        ...change,
        is_published: true,
        is_draft: false
      }));
      
      localStorage.setItem(storageKey, JSON.stringify(updatedChanges));
      console.log('✅ Changes published to localStorage');
      return true;
    } catch (error) {
      console.error('Error publishing changes:', error);
      return false;
    }
  }

  // Revert to published state (localStorage)
  async revertToPublished(_pageId: string, _adminUserId: string): Promise<boolean> {
    try {
      const pagePath = window.location.pathname;
      const storageKey = `visual_editor_changes_${pagePath}`;
      const changes = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const publishedChanges = changes.filter((change: VisualChange) => change.is_published);
      localStorage.setItem(storageKey, JSON.stringify(publishedChanges));
      console.log('✅ Reverted to published state in localStorage');
      return true;
    } catch (error) {
      console.error('Error reverting changes:', error);
      return false;
    }
  }

  // Clear all changes for a page
  async clearPageChanges(_pageId: string): Promise<boolean> {
    try {
      const pagePath = window.location.pathname;
      const storageKey = `visual_editor_changes_${pagePath}`;
      localStorage.removeItem(storageKey);
      console.log('✅ All changes cleared for page');
      return true;
    } catch (error) {
      console.error('Error clearing changes:', error);
      return false;
    }
  }

  // Get all draft changes count
  async getDraftChangesCount(_pageId: string): Promise<number> {
    try {
      const pagePath = window.location.pathname;
      const storageKey = `visual_editor_changes_${pagePath}`;
      const changes = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return changes.filter((change: VisualChange) => change.is_draft).length;
    } catch (error) {
      console.error('Error getting draft count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const visualEditorDb = new VisualEditorDatabase();
export default visualEditorDb;
