import { useEffect } from 'react'

/**
 * React Bricks Editor Scroll Behavior Fix
 * 
 * Prevents unwanted automatic scrolling when editing text components.
 * React Bricks tends to scroll to the bottom of the page during text editing,
 * which disrupts the user experience.
 */

export const useScrollBehaviorFix = () => {
  useEffect(() => {
    // Store original scroll behavior
    const originalScrollTo = window.scrollTo;
    const originalScrollBy = window.scrollBy;
    const originalElementScrollIntoView = Element.prototype.scrollIntoView;

    // Track if we're currently editing
    let isEditing = false;

    // Override window.scrollTo with type-safe approach
    const newScrollTo = function(this: Window, ...args: Parameters<typeof originalScrollTo>) {
      if (isEditing) {
        // console.log('Blocked scrollTo during editing');
        return;
      }
      return originalScrollTo.apply(this, args);
    };
    window.scrollTo = newScrollTo as typeof originalScrollTo;

    // Override window.scrollBy with type-safe approach
    const newScrollBy = function(this: Window, ...args: Parameters<typeof originalScrollBy>) {
      if (isEditing) {
        // console.log('Blocked scrollBy during editing');
        return;
      }
      return originalScrollBy.apply(this, args);
    };
    window.scrollBy = newScrollBy as typeof originalScrollBy;

    // Override Element.scrollIntoView
    Element.prototype.scrollIntoView = function(options?: boolean | ScrollIntoViewOptions) {
      if (isEditing) {
        // console.log('Blocked scrollIntoView during editing');
        return;
      }
      return originalElementScrollIntoView.call(this, options);
    };

    // Detect when React Bricks editing starts
    const handleEditStart = () => {
      isEditing = true;
      // console.log('Edit mode started, scroll locked');
    };

    // Detect when React Bricks editing ends
    const handleEditEnd = () => {
      isEditing = false;
      // console.log('Edit mode ended');
    };

    // Listen for React Bricks specific events and DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check for React Bricks editing indicators
          const editingElements = document.querySelectorAll('[data-rb-text-editing="true"], [contenteditable="true"]');
          
          if (editingElements.length > 0 && !isEditing) {
            handleEditStart();
          } else if (editingElements.length === 0 && isEditing) {
            handleEditEnd();
          }
        }

        if (mutation.type === 'attributes' && mutation.attributeName === 'contenteditable') {
          const target = mutation.target as Element;
          if (target.getAttribute('contenteditable') === 'true') {
            handleEditStart();
          } else {
            handleEditEnd();
          }
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['contenteditable', 'data-rb-text-editing']
    });

    // Also listen for focus events on contenteditable elements
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as Element;
      if (target.getAttribute('contenteditable') === 'true' || target.closest('[contenteditable="true"]')) {
        handleEditStart();
      }
    };

    const handleFocusOut = (_e: FocusEvent) => {
      // Small delay to check if focus moved to another editable element
      setTimeout(() => {
        const activeElement = document.activeElement;
        if (!activeElement || 
            (activeElement.getAttribute('contenteditable') !== 'true' && 
             !activeElement.closest('[contenteditable="true"]'))) {
          handleEditEnd();
        }
      }, 100);
    };

    // Add event listeners
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    // Cleanup function
    return () => {
      // Restore original functions
      window.scrollTo = originalScrollTo;
      window.scrollBy = originalScrollBy;
      Element.prototype.scrollIntoView = originalElementScrollIntoView;
      
      // Remove event listeners
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      
      // Stop observing
      observer.disconnect();
    };
  }, []);
};

/**
 * Component wrapper that applies the scroll behavior fix
 */
export const ScrollBehaviorFixProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useScrollBehaviorFix();
  return <>{children}</>;
};

export default ScrollBehaviorFixProvider;