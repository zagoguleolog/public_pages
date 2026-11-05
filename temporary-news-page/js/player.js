(function () {
  "use strict";

  var cfg = typeof CONFIG === "object" && CONFIG ? CONFIG : {};
  var newsDuration = Number(cfg.newsDuration) > 0 ? Number(cfg.newsDuration) : 60;
  var photoDuration = Number(cfg.photoDuration) > 0 ? Number(cfg.photoDuration) : 60;
  var photos = Array.isArray(cfg.photos) ? cfg.photos.slice() : [];
  var tickMs = Number(cfg.tickMs) > 0 ? Number(cfg.tickMs) : 250;
  var pageReloadHours = Number(cfg.pageReloadHours) > 0 ? Number(cfg.pageReloadHours) : 12;
  var photoRetryMs = Number(cfg.photoRetryMs) > 0 ? Number(cfg.photoRetryMs) : 5000;
  var repeat = cfg.repeat !== false;

  var sequence = [
    { type: "news", duration: newsDuration },
    { type: "photo", index: 0, duration: photoDuration },
    { type: "news", duration: newsDuration },
    { type: "photo", index: 1, duration: photoDuration },
    { type: "news", duration: newsDuration },
    { type: "photo", index: 2, duration: photoDuration }
  ];

  var cycleMs = 0;
  for (var i = 0; i < sequence.length; i++) {
    cycleMs += sequence[i].duration * 1000;
  }

  var params = new URLSearchParams(window.location.search || "");
  var debug = params.get("debug") === "1";
  var startAt = resolveStartAt(params.get("startAt") || cfg.startAt);
  var pageLoadedAt = Date.now();

  var newsLayer = document.getElementById("news-layer");
  var photoLayer = document.getElementById("photo-layer");
  var newsFrame = document.getElementById("news-frame");
  var photoImg = document.getElementById("photo-img");
  var debugEl = document.getElementById("debug");

  var currentKey = "";
  var lastGoodPhotoSrc = "";
  var photoCache = {};
  var retryTimers = {};
  var tickTimer = null;
  var reloadTimer = null;

  if (debug) {
    document.body.classList.add("debug");
  }

  function resolveStartAt(raw) {
    if (raw == null || raw === "") {
      return Date.now();
    }
    if (typeof raw === "number" && isFinite(raw)) {
      return normalizeEpoch(raw);
    }
    var text = String(raw).trim();
    if (/^\d+(\.\d+)?$/.test(text)) {
      return normalizeEpoch(Number(text));
    }
    var parsed = Date.parse(text);
    if (!isNaN(parsed)) {
      return parsed;
    }
    return Date.now();
  }

  function normalizeEpoch(value) {
    // секунды → миллисекунды, если похоже на unix seconds
    if (value > 0 && value < 1e12) {
      return Math.round(value * 1000);
    }
    return Math.round(value);
  }

  function getPhase(now) {
    var elapsed = now - startAt;
    if (!repeat && elapsed >= cycleMs) {
      return {
        index: sequence.length - 1,
        item: sequence[sequence.length - 1],
        offsetMs: cycleMs,
        cycleIndex: 0
      };
    }
    var mod = ((elapsed % cycleMs) + cycleMs) % cycleMs;
    var acc = 0;
    for (var s = 0; s < sequence.length; s++) {
      var dur = sequence[s].duration * 1000;
      if (mod < acc + dur) {
        return {
          index: s,
          item: sequence[s],
          offsetMs: mod,
          remainingMs: acc + dur - mod,
          cycleIndex: Math.floor(elapsed / cycleMs)
        };
      }
      acc += dur;
    }
    return {
      index: 0,
      item: sequence[0],
      offsetMs: 0,
      remainingMs: sequence[0].duration * 1000,
      cycleIndex: 0
    };
  }

  function showNews() {
    newsLayer.classList.add("is-active");
    photoLayer.classList.remove("is-active");
  }

  function showPhoto(src) {
    if (src && photoImg.getAttribute("src") !== src) {
      photoImg.setAttribute("src", src);
    }
    photoLayer.classList.add("is-active");
    newsLayer.classList.remove("is-active");
  }

  function applyPhase(phase) {
    var item = phase.item;
    var key = item.type === "news" ? "news" : "photo:" + item.index;

    if (key !== currentKey) {
      if (item.type === "news") {
        currentKey = key;
        showNews();
      } else {
        var src = resolvePhotoSrc(item.index);
        if (src) {
          currentKey = key;
          showPhoto(src);
        } else if (lastGoodPhotoSrc) {
          // фото не готово — держим последний удачный кадр, не чёрный экран
          currentKey = key;
          showPhoto(lastGoodPhotoSrc);
        }
        // иначе оставляем текущий слой (новости), пока фото не подгрузится
      }
    } else if (item.type === "photo") {
      var ready = resolvePhotoSrc(item.index);
      if (ready && photoImg.getAttribute("src") !== ready) {
        showPhoto(ready);
      }
    }

    if (debug && debugEl) {
      var label =
        item.type === "news"
          ? "NEWS"
          : "PHOTO_" + (item.index + 1);
      debugEl.textContent =
        label +
        " · phase " +
        (phase.index + 1) +
        "/6 · left " +
        Math.ceil((phase.remainingMs || 0) / 1000) +
        "s · cycle #" +
        (phase.cycleIndex + 1);
    }
  }

  function resolvePhotoSrc(index) {
    if (index < 0 || index >= photos.length) {
      return "";
    }
    var path = photos[index];
    if (photoCache[path] && photoCache[path].ok) {
      return path;
    }
    return "";
  }

  function preloadPhoto(path, index) {
    if (!path) {
      return;
    }
    if (!photoCache[path]) {
      photoCache[path] = { ok: false, index: index };
    }

    var img = new Image();
    img.onload = function () {
      photoCache[path].ok = true;
      lastGoodPhotoSrc = path;
      if (retryTimers[path]) {
        clearTimeout(retryTimers[path]);
        delete retryTimers[path];
      }
      // если сейчас как раз фаза этого фото — показать без ожидания следующего тика
      tick();
    };
    img.onerror = function () {
      photoCache[path].ok = false;
      schedulePhotoRetry(path, index);
    };
    img.src = path;
  }

  function schedulePhotoRetry(path, index) {
    if (retryTimers[path]) {
      return;
    }
    retryTimers[path] = setTimeout(function () {
      delete retryTimers[path];
      preloadPhoto(path, index);
    }, photoRetryMs);
  }

  function preloadAll() {
    for (var p = 0; p < photos.length; p++) {
      preloadPhoto(photos[p], p);
    }
  }

  function tick() {
    applyPhase(getPhase(Date.now()));
  }

  function armPageReload() {
    var ms = pageReloadHours * 60 * 60 * 1000;
    reloadTimer = setTimeout(function () {
      var url = new URL(window.location.href);
      // сохраняем исходный startAt, чтобы после reload фаза не сбилась
      if (!url.searchParams.has("startAt")) {
        url.searchParams.set("startAt", String(startAt));
      }
      window.location.replace(url.toString());
    }, ms);
  }

  function initNewsFrame() {
    if (!newsFrame) {
      return;
    }
    var url = cfg.newsUrl || "";
    if (!url) {
      return;
    }
    // Один iframe на всё время жизни страницы
    if (newsFrame.getAttribute("src") !== url) {
      newsFrame.setAttribute("src", url);
    }
  }

  function start() {
    initNewsFrame();
    preloadAll();
    tick();
    tickTimer = setInterval(tick, tickMs);
    armPageReload();

    window.addEventListener("online", function () {
      preloadAll();
    });

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        tick();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
