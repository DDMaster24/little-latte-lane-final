/**
 * Capacitor Browser Integration
 * Unified payment URL handler for native apps (Android/iOS)
 * Uses Capacitor Browser plugin for seamless Google Pay/Apple Pay
 */

import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Check if running in native mobile app (Capacitor)
 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get current platform (android, ios, web)
 */
export function getPlatform(): 'android' | 'ios' | 'web' {
  return Capacitor.getPlatform() as 'android' | 'ios' | 'web';
}

/**
 * Open payment URL in browser
 * - Native apps: Opens in-app browser (Chrome Custom Tabs / Safari View Controller)
 * - Web: Uses standard window.location redirect
 * 
 * Automatically listens for app URL opens (deep links) to close browser when payment completes
 */
export async function openPaymentUrl(url: string): Promise<void> {
  if (isNativeApp()) {
    // CRITICAL FIX: Use App URL open listener (deep links) instead of browserPageLoaded
    // browserPageLoaded fires on EVERY page (Google Pay, FNB verification, etc.)
    // appUrlOpen ONLY fires when redirecting back to our app domain
    
    let hasClosedBrowser = false;
    
    // Listen for app URL opens (deep links back to our domain)
    const appUrlListener = await App.addListener('appUrlOpen', async (data) => {
      console.log('🔗 App URL opened:', data.url);
      
      // Check if this is a payment callback
      const hasPaymentStatus = data.url.includes('payment=success') || 
                              data.url.includes('payment=cancelled') || 
                              data.url.includes('payment=failed');
      
      if (hasPaymentStatus && !hasClosedBrowser) {
        console.log('✅ Payment complete - closing browser in 1 second');
        hasClosedBrowser = true;
        
        // Brief delay so user sees success message
        setTimeout(async () => {
          await Browser.close();
          console.log('✅ Browser closed after payment callback');
        }, 1000);
        
        // Clean up listeners
        appUrlListener.remove();
      }
    });

    // Also listen for when user manually closes browser
    const finishListener = await Browser.addListener('browserFinished', () => {
      console.log('🔄 User manually closed payment browser');
      hasClosedBrowser = true;
      appUrlListener.remove();
      finishListener.remove();
    });

    // Safety timeout: Clean up listeners after 10 minutes if payment never completes
    const safetyTimeout = setTimeout(() => {
      console.log('⏰ Payment timeout - cleaning up listeners');
      if (!hasClosedBrowser) {
        appUrlListener.remove();
        finishListener.remove();
      }
    }, 10 * 60 * 1000); // 10 minutes

    // Native app: Use Capacitor Browser plugin
    // This opens Chrome Custom Tabs (Android) or Safari View Controller (iOS)
    await Browser.open({
      url,
      // Brand color from Little Latte Lane theme
      toolbarColor: '#1A1A1A',
      // iOS specific settings
      presentationStyle: 'fullscreen',
      // OPTIONAL: Uncomment to open in external browser app (Chrome/Safari) instead of in-app
      // windowName: '_system',
      // Android specific settings (uses Chrome Custom Tabs automatically)
    });
    
    console.log('✅ Opened payment URL in native browser:', getPlatform());
  } else {
    // Web app: Use standard redirect
    window.location.href = url;
    console.log('✅ Redirected to payment URL in web browser');
  }
}

/**
 * Close the browser (useful after payment completion redirect)
 */
export async function closeBrowser(): Promise<void> {
  if (isNativeApp()) {
    await Browser.close();
    console.log('✅ Closed native browser');
  }
}

/**
 * Listen for browser finish event (when user closes payment page)
 * Only works in native apps
 */
export function addBrowserFinishListener(callback: () => void): void {
  if (isNativeApp()) {
    Browser.addListener('browserFinished', () => {
      console.log('🔄 User closed payment browser');
      callback();
    });
  }
}

/**
 * Remove browser finish listener
 */
export function removeBrowserFinishListener(): void {
  if (isNativeApp()) {
    Browser.removeAllListeners();
  }
}
