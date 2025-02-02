importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Cache version
const CACHE_VERSION = 'v1.0';

// Assets to precache
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/settings.html',
    '/details.html',
    '/app.js',
    '/weather.js',
    '/location.js',
    '/network.js',
    '/styles.css',
    '/manifest.json',
    '/assets/icons/icon512_maskable.png',
    '/assets/icons/icon512_rounded.png',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// Precache static assets
workbox.precaching.precacheAndRoute([
    ...PRECACHE_ASSETS.map(url => ({
        url,
        revision: CACHE_VERSION
    }))
]);

// Cache images (including weather icons)
workbox.routing.registerRoute(
    ({request, url}) => request.destination === 'image' || 
                       url.href.includes('openweathermap.org/img'),
    new workbox.strategies.CacheFirst({
        cacheName: 'images-' + CACHE_VERSION,
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            }),
        ],
    })
);

// Cache styles
workbox.routing.registerRoute(
    ({request}) => request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'styles-' + CACHE_VERSION,
    })
);

// Cache scripts
workbox.routing.registerRoute(
    ({request}) => request.destination === 'script',
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'scripts-' + CACHE_VERSION,
    })
);

// Cache OpenWeather API responses with longer expiration
workbox.routing.registerRoute(
    ({url}) => url.origin === 'api.openweathermap.org',
    new workbox.strategies.NetworkFirst({
        cacheName: 'weather-api-' + CACHE_VERSION,
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
            }),
            new workbox.cacheableResponse.CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
        networkTimeoutSeconds: 3,
    })
);

// Default page handler
workbox.routing.registerRoute(
    ({request}) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
        cacheName: 'pages-' + CACHE_VERSION,
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
            }),
        ],
    })
);

// Handle offline
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            caches.open('offline-' + CACHE_VERSION).then(cache => {
                return cache.addAll(PRECACHE_ASSETS);
            }),
            self.skipWaiting(),
        ])
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Clean old caches
            caches.keys().then(keys => {
                return Promise.all(
                    keys.filter(key => !key.includes(CACHE_VERSION))
                        .map(key => caches.delete(key))
                );
            }),
            self.clients.claim(),
        ])
    );
});

// Background sync for offline requests
const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('offline-queue', {
    maxRetentionTime: 24 * 60 // Retry for max of 24 Hours
});

// Handle offline API requests
workbox.routing.registerRoute(
    ({url}) => url.origin === 'api.openweathermap.org',
    new workbox.strategies.NetworkFirst({
        cacheName: 'weather-api-' + CACHE_VERSION,
        plugins: [
            bgSyncPlugin,
            new workbox.cacheableResponse.CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
        networkTimeoutSeconds: 3,
    })
);

// Fallback response for API requests when offline
workbox.routing.setCatchHandler(({event}) => {
    if (event.request.destination === 'document') {
        return caches.match('/index.html');
    }
    return Response.error();
});