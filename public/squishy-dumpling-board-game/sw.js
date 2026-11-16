/* Squishy Dumpling PWA service worker */
"use strict";

var CACHE_PREFIX = "squishy-dumpling-";
var CACHE_NAME = CACHE_PREFIX + "v1";
var APP_ROOT = new URL("/squishy-dumpling-board-game", self.location.origin).href;

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.add(APP_ROOT).catch(function() {
          // The first visit can still install; the page is cached on its first successful load.
        });
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if (key.indexOf(CACHE_PREFIX) === 0 && key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var isNavigation = request.mode === "navigate";
  var isImage = request.destination === "image";
  var url = new URL(request.url);

  if (isNavigation) {
    event.respondWith(
      fetch(request).then(function(response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, copy);
            cache.put(APP_ROOT, response.clone());
          });
        }
        return response;
      }).catch(function() {
        return caches.match(request).then(function(cached) {
          return cached || caches.match(APP_ROOT);
        });
      })
    );
    return;
  }

  if (isImage) {
    event.respondWith(
      caches.match(request).then(function(cached) {
        if (cached) return cached;
        return fetch(request).then(function(response) {
          if (response && (response.ok || response.type === "opaque")) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, copy);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  if (url.origin === self.location.origin && url.href.indexOf(APP_ROOT) === 0) {
    event.respondWith(
      caches.match(request).then(function(cached) {
        var network = fetch(request).then(function(response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, copy);
            });
          }
          return response;
        });
        return cached || network;
      })
    );
  }
});
