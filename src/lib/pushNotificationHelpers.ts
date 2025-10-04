/**
 * Push Notification Helper Functions
 * Handles browser push notification subscription and management
 */

export interface PushSubscriptionResponse {
  success: boolean;
  message: string;
  subscription?: PushSubscriptionJSON;
}

/**
 * Check if push notifications are supported in the current browser
 */
export function checkPushSupport(): {
  supported: boolean;
  reason?: string;
} {
  // Check for service worker support
  if (!('serviceWorker' in navigator)) {
    return {
      supported: false,
      reason: 'Service workers not supported in this browser'
    };
  }

  // Check for push notification support
  if (!('PushManager' in window)) {
    return {
      supported: false,
      reason: 'Push notifications not supported in this browser'
    };
  }

  // Check for notification API support
  if (!('Notification' in window)) {
    return {
      supported: false,
      reason: 'Notification API not supported in this browser'
    };
  }

  return { supported: true };
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 * Returns the permission status after user interaction
 */
export async function requestNotificationPermission(): Promise<{
  permission: NotificationPermission;
  message: string;
}> {
  // Check support first
  const support = checkPushSupport();
  if (!support.supported) {
    return {
      permission: 'denied',
      message: support.reason || 'Push notifications not supported'
    };
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    
    console.log('📬 Notification permission:', permission);
    
    if (permission === 'granted') {
      return {
        permission,
        message: 'Notification permission granted! You will now receive updates.'
      };
    } else if (permission === 'denied') {
      return {
        permission,
        message: 'Notification permission denied. You can enable it in browser settings.'
      };
    } else {
      return {
        permission,
        message: 'Notification permission request dismissed.'
      };
    }
  } catch (error) {
    console.error('❌ Failed to request notification permission:', error);
    return {
      permission: 'denied',
      message: 'Failed to request notification permission'
    };
  }
}

/**
 * Subscribe to push notifications
 * Handles service worker registration and push subscription
 */
export async function subscribeToPush(): Promise<PushSubscriptionResponse> {
  try {
    // Check support
    const support = checkPushSupport();
    if (!support.supported) {
      return {
        success: false,
        message: support.reason || 'Push notifications not supported'
      };
    }

    // Check permission
    const permission = getNotificationPermission();
    if (permission !== 'granted') {
      // Request permission first
      const permissionResult = await requestNotificationPermission();
      if (permissionResult.permission !== 'granted') {
        return {
          success: false,
          message: permissionResult.message
        };
      }
    }

    console.log('🔧 Getting service worker registration...');
    
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    console.log('📝 Service worker ready, subscribing to push...');

    // Get VAPID public key from environment
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      throw new Error('VAPID public key not configured');
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
    });

    console.log('✅ Push subscription created:', subscription);

    // Send subscription to server
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscription: subscription.toJSON()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save subscription: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('💾 Subscription saved to server:', data);

    return {
      success: true,
      message: 'Successfully subscribed to push notifications!',
      subscription: subscription.toJSON()
    };
  } catch (error) {
    console.error('❌ Failed to subscribe to push notifications:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to subscribe to push notifications'
    };
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<PushSubscriptionResponse> {
  try {
    console.log('🔧 Getting service worker registration...');
    
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // Get existing subscription
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      return {
        success: true,
        message: 'No active subscription found'
      };
    }

    console.log('📝 Unsubscribing from push notifications...');

    // Unsubscribe from push notifications
    const unsubscribed = await subscription.unsubscribe();
    
    if (!unsubscribed) {
      throw new Error('Failed to unsubscribe from push notifications');
    }

    console.log('✅ Push subscription removed');

    // Notify server
    const response = await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to remove subscription from server: ${response.statusText}`);
    }

    console.log('💾 Subscription removed from server');

    return {
      success: true,
      message: 'Successfully unsubscribed from push notifications'
    };
  } catch (error) {
    console.error('❌ Failed to unsubscribe from push notifications:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to unsubscribe from push notifications'
    };
  }
}

/**
 * Check if user is currently subscribed to push notifications
 */
export async function checkPushSubscription(): Promise<{
  subscribed: boolean;
  subscription?: PushSubscriptionJSON;
}> {
  try {
    // Check support
    const support = checkPushSupport();
    if (!support.supported) {
      return { subscribed: false };
    }

    // Check permission
    const permission = getNotificationPermission();
    if (permission !== 'granted') {
      return { subscribed: false };
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // Get existing subscription
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      return { subscribed: false };
    }

    console.log('✅ Active push subscription found');
    
    return {
      subscribed: true,
      subscription: subscription.toJSON()
    };
  } catch (error) {
    console.error('❌ Failed to check push subscription:', error);
    return { subscribed: false };
  }
}

/**
 * Send a test notification to verify push notifications are working
 */
export async function sendTestNotification(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Check subscription first
    const subscriptionStatus = await checkPushSubscription();
    if (!subscriptionStatus.subscribed) {
      return {
        success: false,
        message: 'Not subscribed to push notifications. Please enable notifications first.'
      };
    }

    console.log('📤 Sending test notification...');

    // Send test notification via API
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: '🎉 Test Notification',
        body: 'If you can see this, push notifications are working perfectly!',
        notification_type: 'promotional',
        category: 'test',
        action_url: '/account',
        data: {
          test: true,
          timestamp: Date.now()
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send test notification');
    }

    const data = await response.json();
    console.log('✅ Test notification sent:', data);

    return {
      success: true,
      message: 'Test notification sent! Check your notifications.'
    };
  } catch (error) {
    console.error('❌ Failed to send test notification:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send test notification'
    };
  }
}

/**
 * Helper function to convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Get user's notification preferences from server
 */
export async function getNotificationPreferences(): Promise<{
  success: boolean;
  preferences?: {
    push_enabled: boolean;
    email_enabled: boolean;
    sms_enabled: boolean;
    order_updates_enabled: boolean;
    promotional_enabled: boolean;
    event_announcements_enabled: boolean;
  };
  message?: string;
}> {
  try {
    const response = await fetch('/api/notifications/preferences');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch preferences: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      preferences: data.preferences
    };
  } catch (error) {
    console.error('❌ Failed to fetch notification preferences:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch preferences'
    };
  }
}

/**
 * Update user's notification preferences on server
 */
export async function updateNotificationPreferences(preferences: {
  push_enabled?: boolean;
  email_enabled?: boolean;
  sms_enabled?: boolean;
  order_updates_enabled?: boolean;
  promotional_enabled?: boolean;
  event_announcements_enabled?: boolean;
}): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch('/api/notifications/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferences)
    });

    if (!response.ok) {
      throw new Error(`Failed to update preferences: ${response.statusText}`);
    }

    await response.json();
    
    return {
      success: true,
      message: 'Notification preferences updated successfully'
    };
  } catch (error) {
    console.error('❌ Failed to update notification preferences:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update preferences'
    };
  }
}
