/**
 * Native App Push Notification Handler
 * Handles FCM (Android) and APNS (iOS) push notifications in Capacitor app
 */

'use client';

import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/components/AuthProvider';
import toast from 'react-hot-toast';

export function useNativePushNotifications() {
  const { session } = useAuth();

  useEffect(() => {
    // Only run on native platforms (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      console.log('📱 Not a native platform, skipping native push setup');
      return;
    }

    if (!session?.user?.id) {
      console.log('👤 No user session, skipping push setup');
      return;
    }

    const initializePush = async () => {
      console.log('🔔 Initializing native push notifications...');

      try {
        // Request permission
        const permStatus = await PushNotifications.requestPermissions();
        
        if (permStatus.receive !== 'granted') {
          console.warn('⚠️ Push notification permission denied');
          return;
        }

        console.log('✅ Push notification permission granted');

        // Register with FCM/APNS
        await PushNotifications.register();

        // Listen for registration success
        await PushNotifications.addListener('registration', async (token) => {
          console.log('📱 Device registered for push:', token.value);
          
          // Determine platform
          const platform = Capacitor.getPlatform();
          const tokenType = platform === 'ios' ? 'apns_token' : 'fcm_token';

          // Save token to database
          try {
            const response = await fetch('/api/notifications/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                [tokenType]: token.value,
                deviceType: platform,
                subscription: null // Native app doesn't use web push subscription
              })
            });

            const result = await response.json();
            
            if (result.success) {
              console.log('✅ Native push token saved to database');
              toast.success('Push notifications enabled!');
            } else {
              console.error('❌ Failed to save push token:', result.error);
            }
          } catch (error) {
            console.error('❌ Error saving push token:', error);
          }
        });

        // Listen for registration errors
        await PushNotifications.addListener('registrationError', (error) => {
          console.error('❌ Push registration error:', error);
        });

        // Listen for incoming push notifications (app in foreground)
        await PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
          console.log('📬 Push notification received (foreground):', notification);
          
          // Show toast notification
          toast.success(
            `${notification.title || 'Notification'}\n${notification.body || ''}`,
            {
              duration: 5000,
              position: 'top-center',
              style: {
                background: '#0D0D0D',
                color: '#00ffff',
                border: '2px solid #00ffff',
              }
            }
          );
        });

        // Listen for notification taps (app in background/closed)
        await PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
          console.log('📬 Push notification tapped:', action);
          
          // Navigate to appropriate page based on notification data
          const data = action.notification.data;
          
          if (data.url) {
            window.location.href = data.url;
          } else if (data.order_id) {
            window.location.href = '/account?tab=active';
          } else {
            window.location.href = '/account';
          }
        });

        console.log('✅ Native push notifications initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize native push:', error);
      }
    };

    initializePush();

    // Cleanup listeners on unmount
    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [session?.user?.id]);
}

/**
 * Platform detection helper
 */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;
  return Capacitor.isNativePlatform();
}

/**
 * Get current platform
 */
export function getNativePlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web';
  if (!Capacitor.isNativePlatform()) return 'web';
  return Capacitor.getPlatform() as 'ios' | 'android';
}
