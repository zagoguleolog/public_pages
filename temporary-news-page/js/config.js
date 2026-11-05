/**
 * Дубликат настроек для удобства правки отдельно от HTML.
 * Приоритет у CONFIG из index.html (если уже объявлен).
 */
if (typeof CONFIG === "undefined") {
  var CONFIG = {
    "newsUrl": "https://hse-xforum-screen-b1g4f2ovc3kv97j09831.website.yandexcloud.net/index.html",
    "newsDuration": 60,
    "photoDuration": 60,
    "photos": [
      "./assets/photo-1.jpg",
      "./assets/photo-2.jpg",
      "./assets/photo-3.jpg"
    ],
    "repeat": true,
    "tickMs": 250,
    "pageReloadHours": 12,
    "photoRetryMs": 5000,
    "startAt": null
  };
}
