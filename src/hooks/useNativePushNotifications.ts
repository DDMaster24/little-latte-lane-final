/**
 * Native App Push Notification Handler
 * NOTE: Capacitor removed - using pure native Android WebView
 * This hook is currently disabled. Native push will be implemented via FCM directly.
 */

'use client';

import { useEffect } from 'react';

export function useNativePushNotifications() {
  useEffect(() => {
    // Disabled - Capacitor removed from project
    // TODO: Implement native FCM push notifications for Android
    console.log('📱 Native push notifications: Not yet implemented (Capacitor removed)');
  }, []);
}

/**
 * Platform detection helper
 */
export function isNativeApp(): boolean {
  // Check if running in Android WebView
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent;
  return userAgent.includes('LittleLatteLaneApp');
}

/**
 * Get current platform
 */
export function getNativePlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web';
  
  const userAgent = window.navigator.userAgent;
  if (userAgent.includes('LittleLatteLaneApp')) {
    // Detect Android (our current native platform)
    return 'android';
  }
  
  return 'web';
}

