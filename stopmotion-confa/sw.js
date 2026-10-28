/* Cache shell + mp4. Serve mp4 with Range (206) so seek/loop works offline. */
var CACHE = "stopmotion-confa-v7";
var PRECACHE = ["./", "./index.html", "./sw.js", "./stopmotion-confa.mp4"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf("stopmotion-confa") === 0 && k !== CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function rangeResponse(request, cached) {
  return cached.blob().then(function (blob) {
    var size = blob.size;
    var type = cached.headers.get("Content-Type") || "video/mp4";
    var range = request.headers.get("Range");
    if (!range) {
      return new Response(blob, {
        status: 200,
        headers: {
          "Content-Type": type,
          "Content-Length": String(size),
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000"
        }
      });
    }
    var m = /bytes=(\d+)-(\d*)/.exec(range);
    if (!m) return cached;
    var start = parseInt(m[1], 10);
    var end = m[2] ? parseInt(m[2], 10) : size - 1;
    if (end >= size) end = size - 1;
    if (start > end || start < 0) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": "bytes */" + size }
      });
    }
    var slice = blob.slice(start, end + 1);
    return new Response(slice, {
      status: 206,
      headers: {
        "Content-Type": type,
        "Content-Length": String(end - start + 1),
        "Content-Range": "bytes " + start + "-" + end + "/" + size,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000"
      }
    });
  });
}

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf("/stopmotion-confa") === -1 &&
      url.pathname.indexOf("stopmotion-confa") === -1) {
    // Local server root may be the folder itself
  }

  if (/\.mp4$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE).then(function (cache) {
        return cache.match("./stopmotion-confa.mp4").then(function (hit) {
          if (hit) return rangeResponse(req, hit);
          return fetch(req).then(function (res) {
            if (res && res.status === 200) cache.put("./stopmotion-confa.mp4", res.clone());
            return res;
          });
        });
      })
    );
    return;
  }

  // HTML / shell — network first
  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200 && (req.url.indexOf("index.html") !== -1 ||
          req.url.endsWith("/") || req.url.indexOf("sw.js") !== -1)) {
        var clone = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, clone); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match("./index.html");
      });
    })
  );
});
