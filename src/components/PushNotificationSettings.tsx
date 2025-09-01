'use client';

import React, { useState, useEffect } from 'react';
import { 
  isPushNotificationSupported, 
  getPushNotificationPermission,
  requestPushNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications 
} from '@/lib/pushNotifications';

export default function PushNotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported(isPushNotificationSupported());
    
    if (isPushNotificationSupported()) {
      setPermission(getPushNotificationPermission());
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPushNotificationPermission();
      if (granted) {
        const subscription = await subscribeToPushNotifications();
        setIsSubscribed(!!subscription);
        setPermission('granted');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    try {
      const success = await unsubscribeFromPushNotifications();
      if (success) {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6 backdrop-blur-md">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          📱 Push Notifications
        </h3>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="text-yellow-400 font-medium">Not Supported</h4>
              <p className="text-sm text-gray-300">
                Push notifications are not supported on this device or browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6 backdrop-blur-md">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        📱 Push Notifications
      </h3>
      
      <p className="text-gray-300 text-sm mb-4">
        Get notified when your order status changes, even when the app is closed.
      </p>

      {permission === 'denied' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚫</span>
            <div>
              <h4 className="text-red-400 font-medium">Notifications Blocked</h4>
              <p className="text-sm text-gray-300">
                You have blocked notifications. Please enable them in your browser settings to receive order updates.
              </p>
            </div>
          </div>
        </div>
      )}

      {permission === 'granted' && isSubscribed && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h4 className="text-green-400 font-medium">Notifications Enabled</h4>
              <p className="text-sm text-gray-300">
                You&apos;ll receive push notifications for order status updates.
              </p>
            </div>
          </div>
        </div>
      )}

      {permission === 'default' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="text-blue-400 font-medium">Enable Notifications</h4>
              <p className="text-sm text-gray-300">
                Stay updated on your order progress with instant notifications.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!isSubscribed && permission !== 'denied' && (
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-neon-gradient text-black hover:opacity-90'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Enabling...
              </span>
            ) : (
              'Enable Notifications'
            )}
          </button>
        )}

        {isSubscribed && (
          <button
            onClick={handleDisableNotifications}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Disabling...
              </span>
            ) : (
              'Disable Notifications'
            )}
          </button>
        )}
      </div>

      {permission === 'denied' && (
        <div className="mt-4 text-xs text-gray-400">
          <p>To enable notifications:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Click the lock icon in your browser&apos;s address bar</li>
            <li>Change notifications from &quot;Block&quot; to &quot;Allow&quot;</li>
            <li>Refresh this page and try again</li>
          </ul>
        </div>
      )}
    </div>
  );
}
