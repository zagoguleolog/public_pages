/* Offline cache for stopmotion-confa page + mp4 (Android WebView / kiosk). */
var CACHE = "stopmotion-confa-v1";
var PRECACHE = ["./", "./index.html", "./stopmotion-confa.mp4", "./sw.js"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
          return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("message", function (event) {
  var data = event.data || {};
  if (data.type !== "PRECACHE" || !data.urls) return;
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(
        data.urls.map(function (url) {
          return cache.add(url).catch(function () {});
        })
      );
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (!res || res.status !== 200 || res.type === "opaque") return res;
        var clone = res.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(req, clone);
        });
        return res;
      }).catch(function () {
        return caches.match("./index.html");
      });
    })
  );
});
