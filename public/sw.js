// Service Worker for FresherJobs
const CACHE_NAME = 'fresherjobs-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Background sync for job updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'job-update') {
    event.waitUntil(updateJobs());
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-job-update') {
    event.waitUntil(updateJobs());
  }
});

async function updateJobs() {
  try {
    // This would typically make API calls to update job data
    console.log('Background job update triggered');
    
    // Send message to main thread
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'JOB_UPDATE',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Background job update failed:', error);
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 