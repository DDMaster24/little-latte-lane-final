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
    // Set up listener for when payment redirects back to app via deep link
    const appUrlListener = await App.addListener('appUrlOpen', async (data: { url: string }) => {
      console.log('🔗 App URL opened:', data.url);
      
      // Check if this is ANY redirect from our domain (payment-related or not)
      if (
        data.url.includes('littlelattelane.co.za') && 
        (data.url.includes('payment') || data.url.includes('account') || data.url.includes('cart'))
      ) {
        console.log('✅ Payment redirect detected - closing browser');
        // Close the browser immediately
        await Browser.close();
        // Remove the listener
        appUrlListener.remove();
      }
    });

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
