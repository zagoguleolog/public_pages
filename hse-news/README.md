# HSE campus news screens

Static snapshot of the official HSE Saint Petersburg news feed prepared on 2026-10-12.

- `vertical/` — full 1080×1920 version with schedule, weather, next-pair and campus-fact widgets.
- `lg-horizontal/` — reduced 1920×1080 target for LG webOS 1.4: ES5, simple absolute layout, local images and QR codes.
- `shared/` — the common news snapshot and local media.

Serve the directory over HTTP(S); opening `index.html` directly is not the supported deployment mode. Source article URLs are kept in `shared/news.js`. Images are copies from the official `spb.hse.ru` feed and remain attributed in both pages.
