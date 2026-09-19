const CACHE_NAME = 'bangla-fm-cache-v1'; // যখনই বড় আপডেট করবেন, v1 পরিবর্তন করে v2 বা v3 করে দেবেন
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg' // আপনার আইকনের নাম অনুযায়ী মেলাবেন
];

// Install Event
self.addEventListener('install', (event) => {
    self.skipWaiting(); // নতুন সার্ভিস ওয়ার্কার ইনস্টল হওয়ামাত্রই অ্যাকটিভ হবে
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate Event (পুরোনো ক্যাশ ডিলিট করার জন্য)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event (Network First, fallback to Cache)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // নেটওয়ার্ক থেকে লেটেস্ট ফাইল পেলে সেটা রিটার্ন করবে এবং ক্যাশে সেভ করবে
                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, resClone);
                });
                return response;
            })
            .catch(() => {
                // ইন্টারনেট না থাকলে ক্যাশ থেকে লোড করবে
                return caches.match(event.request);
            })
    );
});
