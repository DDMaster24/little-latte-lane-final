/**
 * PWA Push Notification Service
 * Handles push notification permissions and sending for order updates
 */

export interface PushNotificationData {
  orderId: string;
  status: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Request push notification permission from user
 */
export async function requestPushNotificationPermission(): Promise<boolean> {
  try {
    if (!isPushNotificationSupported()) {
      console.log('Push notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    console.log('Push notification permission:', permission);
    
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request push notification permission:', error);
    return false;
  }
}

/**
 * Get current push notification permission status
 */
export function getPushNotificationPermission(): NotificationPermission {
  if (!isPushNotificationSupported()) {
    return 'denied';
  }
  
  return Notification.permission;
}

/**
 * Subscribe user to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    if (!isPushNotificationSupported()) {
      throw new Error('Push notifications not supported');
    }

    const registration = await navigator.serviceWorker.ready;
    
    // TODO: Replace with your actual VAPID public key
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    
    if (!vapidPublicKey) {
      console.warn('VAPID public key not configured');
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('Push subscription created:', subscription);
    
    // TODO: Send subscription to your server to store in database
    await savePushSubscription(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      // TODO: Remove subscription from your server
      await removePushSubscription(subscription);
      
      console.log('Unsubscribed from push notifications');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

/**
 * Show local notification (fallback for development)
 */
export function showLocalNotification(data: PushNotificationData): void {
  if (!isPushNotificationSupported()) {
    console.log('Local notification (console):', data);
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(data.title, {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/icon-192x192.png',
      tag: data.orderId, // Prevent duplicate notifications
      data: {
        orderId: data.orderId,
        url: data.url || '/account#orders'
      }
    });
  }
}

/**
 * Send push notification for order status update
 */
export function sendOrderStatusPushNotification(
  orderId: string, 
  status: string, 
  estimatedTime?: string
): void {
  const statusMessages = {
    received: `✅ Order #${orderId} received! We're getting started.`,
    making: `🍕 Your order #${orderId} is being prepared${estimatedTime ? ` - ready in ${estimatedTime}` : ''}!`,
    ready: `🎉 Order #${orderId} is ready for collection!`,
    completed: `✅ Order #${orderId} completed! Thank you for choosing Little Latte Lane!`,
    cancelled: `❌ Order #${orderId} has been cancelled. Contact us if needed.`
  };

  const message = statusMessages[status as keyof typeof statusMessages] || 
                  `📱 Order #${orderId} status updated to ${status}`;

  const notificationData: PushNotificationData = {
    orderId,
    status,
    title: 'Little Latte Lane',
    body: message,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    url: '/account#orders'
  };

  // For development, show local notification
  // In production, this would be sent from the server
  showLocalNotification(notificationData);
  
  console.log('📱 Push notification triggered:', notificationData);
}

/**
 * Helper function to convert VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Save push subscription to server (placeholder)
 */
async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  try {
    // TODO: Implement API call to save subscription
    console.log('TODO: Save push subscription to server:', subscription);
    
    // Example API call:
    // await fetch('/api/push/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(subscription)
    // });
  } catch (error) {
    console.error('Failed to save push subscription:', error);
  }
}

/**
 * Remove push subscription from server (placeholder)
 */
async function removePushSubscription(subscription: PushSubscription): Promise<void> {
  try {
    // TODO: Implement API call to remove subscription
    console.log('TODO: Remove push subscription from server:', subscription);
    
    // Example API call:
    // await fetch('/api/push/unsubscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ endpoint: subscription.endpoint })
    // });
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
  }
}

/**
 * Initialize push notifications for the application
 */
export async function initializePushNotifications(): Promise<void> {
  try {
    if (!isPushNotificationSupported()) {
      console.log('Push notifications not supported on this device');
      return;
    }

    // Check current permission status
    const permission = getPushNotificationPermission();
    console.log('Current push notification permission:', permission);

    // If already granted, ensure subscription is active
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        console.log('Permission granted but no subscription found, creating...');
        await subscribeToPushNotifications();
      } else {
        console.log('Push notifications already active');
      }
    }
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
  }
}
