const CACHE_NAME = 'vip-predictor-v1';
const urlsToCache = [
  './',
  './index.html',
  './admin.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './opencv.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache then network strategy for fastest startup
self.addEventListener('fetch', event => {
  // Bỏ qua các request lấy database.json để đảm bảo tính thời gian thực của Key
  if (event.request.url.includes('database.json')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Trả về cache nếu có, đồng thời fetch ngầm để cập nhật cache
        if (response) {
          fetch(event.request).then(res => {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, res.clone());
            });
          }).catch(() => {}); // Bỏ qua lỗi mạng khi fetch ngầm
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Xóa cache cũ khi có phiên bản mới
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
