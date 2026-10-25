/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'abdullah-umrah-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/images/1792958846262_f2867194.jpg',
  '/assets/images/Screenshot_20261025_232523_289072df.jpg',
  '/assets/images/Screenshot_20261025_232527_4d468858.jpg',
  '/assets/images/Screenshot_20261025_232536_a8c8a4bf.jpg',
  '/assets/images/Screenshot_20261025_232555_CyberFortress_2450b4ee.jpg',
  '/assets/images/Screenshot_20261025_232558_CyberFortress_f30b8ef8.jpg',
  '/assets/images/Screenshot_20261025_232601_CyberFortress_bd33a43c.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version, but update in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Offline fallback
        return caches.match('/index.html');
      });
    })
  );
});
