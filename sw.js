const CACHE_NAME = 'sethu-diary-v1';
const ASSETS = [
    '/',
    'index.html',
    'diary.html',
    'diary-style.css',
    'sticky.css',
    'script.js',
    'manifest.json',
    'icon.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching Assets');
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
