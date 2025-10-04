/**
 * Custom Service Worker for Little Latte Lane PWA
 * Specifically optimized for iOS PWA installation and offline support
 */

const CACHE_NAME = 'little-latte-lane-v1';
const OFFLINE_URL = '/offline.html';

// Essential files to cache for offline functionality
const ESSENTIAL_CACHE = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/menu',
  '/ordering',
  '/account',
  '/install'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('📦 Caching essential resources...');
        await cache.addAll(ESSENTIAL_CACHE);
        console.log('✅ Essential resources cached successfully');
        
        // Force service worker to activate immediately
        await self.skipWaiting();
      } catch (error) {
        console.error('❌ Failed to cache essential resources:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(async (cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
        
        // Take control of all clients immediately
        await self.clients.claim();
        console.log('✅ Service Worker activated successfully');
      } catch (error) {
        console.error('❌ Service Worker activation failed:', error);
      }
    })()
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Try to fetch from network first
        const response = await fetch(event.request);
        
        // If successful, cache the response (for static assets)
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const cache = await caches.open(CACHE_NAME);
          
          // Only cache GET requests for static assets
          if (event.request.method === 'GET' && 
              (event.request.url.includes('/static/') || 
               event.request.url.includes('.js') ||
               event.request.url.includes('.css') ||
               event.request.url.includes('.png') ||
               event.request.url.includes('.ico'))) {
            await cache.put(event.request, response.clone());
          }
        }
        
        return response;
      } catch (error) {
        // Network failed - try to serve from cache
        console.log('📡 Network failed, trying cache for:', event.request.url);
        
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          console.log('💾 Serving from cache:', event.request.url);
          return cachedResponse;
        }
        
        // If it's a navigation request and not cached, show offline page
        if (event.request.mode === 'navigate') {
          console.log('🚫 No cache available, showing offline page');
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
        }
        
        console.error('❌ Request failed and no cache available:', event.request.url);
        throw error;
      }
    })()
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks here
      console.log('⚡ Processing background sync...')
    );
  }
});

// Push notification support with structured payload handling
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received:', event);
  
  let notificationData = {
    title: 'Little Latte Lane',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    image: null,
    data: {
      url: '/account',
      notification_type: 'general',
      timestamp: Date.now()
    }
  };
  
  // Parse notification payload
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('📦 Notification payload:', payload);
      
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        image: payload.image || null,
        data: {
          url: payload.data?.action_url || payload.action_url || '/account',
          notification_type: payload.data?.notification_type || payload.notification_type || 'general',
          category: payload.data?.category || payload.category,
          order_id: payload.data?.order_id,
          order_number: payload.data?.order_number,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      console.error('❌ Failed to parse notification payload:', error);
      // Use text fallback if JSON parsing fails
      notificationData.body = event.data.text();
    }
  }
  
  // Configure notification options based on type
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    image: notificationData.image,
    vibrate: getVibrationPattern(notificationData.data.notification_type),
    data: notificationData.data,
    requireInteraction: isUrgentNotification(notificationData.data.notification_type),
    tag: getNotificationTag(notificationData.data),
    renotify: notificationData.data.notification_type === 'order_status',
    silent: false,
    actions: getNotificationActions(notificationData.data.notification_type)
  };
  
  console.log('🔔 Displaying notification:', notificationData.title, options);
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Helper function to get vibration pattern based on notification type
function getVibrationPattern(notificationType) {
  switch (notificationType) {
    case 'order_status':
      return [200, 100, 200, 100, 200]; // Urgent pattern
    case 'promotional':
      return [100, 50, 100]; // Gentle pattern
    case 'event_announcement':
      return [150, 75, 150, 75, 150]; // Medium pattern
    default:
      return [200, 100, 200]; // Default pattern
  }
}

// Helper function to determine if notification requires interaction
function isUrgentNotification(notificationType) {
  // Order status notifications require user interaction
  return notificationType === 'order_status';
}

// Helper function to generate notification tag for grouping
function getNotificationTag(data) {
  if (data.order_id) {
    return `order-${data.order_id}`;
  }
  if (data.category) {
    return `${data.notification_type}-${data.category}`;
  }
  return data.notification_type || 'general';
}

// Helper function to get notification actions based on type
function getNotificationActions(notificationType) {
  switch (notificationType) {
    case 'order_status':
      return [
        {
          action: 'view_order',
          title: 'View Order',
          icon: '/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ];
    case 'promotional':
      return [
        {
          action: 'view_offer',
          title: 'View Offer',
          icon: '/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: 'Not Now'
        }
      ];
    case 'event_announcement':
      return [
        {
          action: 'learn_more',
          title: 'Learn More',
          icon: '/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ];
    default:
      return [
        {
          action: 'open',
          title: 'Open App',
          icon: '/icon-192x192.png'
        }
      ];
  }
}

// Enhanced notification click handling with action support
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action, event.notification.data);
  
  event.notification.close();
  
  // Handle different actions
  if (event.action === 'dismiss') {
    console.log('❌ Notification dismissed');
    return;
  }
  
  // Determine target URL based on action and data
  let targetUrl = event.notification.data?.url || '/account';
  
  if (event.action === 'view_order' || event.notification.data?.order_id) {
    targetUrl = '/account'; // Account page shows order history
  } else if (event.action === 'view_offer') {
    targetUrl = '/menu'; // Promotional offers go to menu
  } else if (event.action === 'learn_more') {
    targetUrl = '/'; // Events go to homepage
  }
  
  console.log('🚀 Opening URL:', targetUrl);
  
  event.waitUntil(
    (async () => {
      try {
        // Try to focus existing window first
        const windowClients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        });
        
        for (const client of windowClients) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            console.log('🔍 Focusing existing window');
            return client.focus();
          }
        }
        
        // If no matching window found, open new one
        if (self.clients.openWindow) {
          console.log('🆕 Opening new window');
          return self.clients.openWindow(targetUrl);
        }
      } catch (error) {
        console.error('❌ Failed to handle notification click:', error);
      }
    })()
  );
});

// PWA installation events - DISABLED to prevent automatic popups
// Users should use the dedicated /install page instead
console.log('🔕 PWA install events disabled - use /install page for manual installation');

console.log('🚀 Little Latte Lane Service Worker loaded successfully');