'use strict';

const CACHE_NAME = 'tiny-loops-pwa-v16';
const BASE = '/tinyloops/';
const APP_URL = new URL(BASE, self.location.origin).href;
const INDEX_URL = new URL(BASE + 'index.html', self.location.origin).href;
const APP_SHELL = [
  INDEX_URL,
  new URL(BASE + 'manifest.webmanifest', self.location.origin).href,
  new URL(BASE + 'icons/icon.svg', self.location.origin).href,
  new URL(BASE + 'icons/icon-192.png', self.location.origin).href,
  new URL(BASE + 'icons/icon-512.png', self.location.origin).href,
  new URL(BASE + 'icons/icon-maskable-512.png', self.location.origin).href,
  new URL(BASE + 'icons/apple-touch-icon.png', self.location.origin).href
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    const index = await cache.match(INDEX_URL);
    if (index) await cache.put(APP_URL, index.clone());
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith('tiny-loops-pwa-') && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request, { ignoreSearch: true }) || await cache.match(APP_URL) || await cache.match(INDEX_URL);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && response.ok) await cache.put(INDEX_URL, response.clone());
        return response;
      } catch (error) {
        return new Response('Tiny Loops is not available offline yet. Open it once while connected to the internet, then try again.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const response = await fetch(request);
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  })());
});
