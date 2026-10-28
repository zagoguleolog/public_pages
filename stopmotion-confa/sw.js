/* Shell-only SW. Video is played from a blob URL (page Cache Storage) so
   Android WebView can seek/loop without broken HTTP Range responses. */
var CACHE = "stopmotion-confa-shell-v2";
var PRECACHE = ["./", "./index.html", "./sw.js"];

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
        keys.filter(function (k) {
          return k.indexOf("stopmotion-confa") === 0 && k !== CACHE &&
            k.indexOf("media-") === -1;
        }).map(function (k) {
          return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);
  // Never intercept the mp4 — let the page fetch the full file into a blob.
  if (/\.mp4$/i.test(url.pathname)) return;

  // HTML/shell: network first, cache fallback (so loop fixes ship to stands).
  if (url.pathname.indexOf("/stopmotion-confa") !== -1) {
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var clone = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, clone); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match("./index.html");
        });
      })
    );
  }
});
