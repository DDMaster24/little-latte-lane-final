/**
 * Navigation Utilities
 * Ensures website navigation always works properly
 */

/**
 * Force restore navigation if it gets stuck in editor mode
 * This is a safety mechanism to ensure users can always navigate the site
 */
export function forceRestoreNavigation(): void {
  try {
    console.log('🔄 Force restoring navigation...');
    
    // Remove editor body classes
    document.body.classList.remove('editor-active', 'editor-mode');
    
    // Remove any editor-specific styles
    const editorStyles = document.querySelectorAll('style[data-editor-styles]');
    editorStyles.forEach(style => style.remove());
    
    // Force visibility of all navigation elements
    const navElements = document.querySelectorAll('header, footer, nav[role="navigation"], nav');
    navElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.display = '';
      htmlElement.style.visibility = 'visible';
      htmlElement.style.opacity = '1';
    });
    
    // Remove any CSS that might be hiding navigation
    const hiddenElements = document.querySelectorAll('[style*="display: none"]');
    hiddenElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      if (htmlElement.tagName.toLowerCase() === 'header' || 
          htmlElement.tagName.toLowerCase() === 'nav' ||
          htmlElement.tagName.toLowerCase() === 'footer') {
        htmlElement.style.display = '';
      }
    });
    
    console.log('✅ Navigation force-restored successfully!');
  } catch (error) {
    console.error('❌ Error force-restoring navigation:', error);
  }
}

/**
 * Check if navigation is currently hidden and restore if needed
 */
export function checkAndRestoreNavigation(): boolean {
  try {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    
    // Check if navigation is hidden
    const isNavigationHidden = (header && getComputedStyle(header).display === 'none') ||
                              (nav && getComputedStyle(nav).display === 'none') ||
                              document.body.classList.contains('editor-active');
    
    if (isNavigationHidden && !window.location.pathname.includes('/admin/')) {
      console.log('🚨 Navigation is hidden but not in editor mode! Restoring...');
      forceRestoreNavigation();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error checking navigation state:', error);
    return false;
  }
}

/**
 * Initialize navigation safety checks
 * This should be called in the main layout to ensure navigation always works
 */
export function initNavigationSafety(): void {
  // Check navigation state on page load
  if (typeof window !== 'undefined') {
    // Initial check after page load
    setTimeout(() => {
      checkAndRestoreNavigation();
    }, 1000);
    
    // Periodic safety check every 5 seconds
    setInterval(() => {
      checkAndRestoreNavigation();
    }, 5000);
    
    // Check on route changes
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        checkAndRestoreNavigation();
      }, 100);
    });
  }
}
