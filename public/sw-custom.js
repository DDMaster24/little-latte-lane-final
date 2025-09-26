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

// Push notification support
self.addEventListener('push', (event) => {
  console.log('📬 Push message received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Little Latte Lane',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Little Latte Lane', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || '/')
  );
});

// PWA installation events - DISABLED to prevent automatic popups
// Users should use the dedicated /install page instead
console.log('🔕 PWA install events disabled - use /install page for manual installation');

console.log('🚀 Little Latte Lane Service Worker loaded successfully');