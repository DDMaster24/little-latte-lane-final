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
    // NOTE: Deep link handling is now done ENTIRELY in native Android code (MainActivity.java)
    // JavaScript listener registration has been removed to prevent conflicts when WebView loses focus
    // Native handler persists at OS level and survives all app state changes
    
    // Simply open the browser - native Android will handle the deep link redirect
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
    console.log('ℹ️ Deep link handling delegated to native MainActivity');
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
 * NOTE: Browser finish listeners removed - native Android MainActivity handles all deep link events
 * JavaScript listeners were causing conflicts when WebView lost focus during payment authentication
 */
