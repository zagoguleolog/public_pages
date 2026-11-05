# Temporary News + Photos player

Полноэкранный веб-плеер для временной трансляции на телевизорах Media Hub.

## Target совместимости

| Платформа | Уровень | Статус (2026-11-05) |
| --- | --- | --- |
| Android Edge WebView | **A** (shell) / **не A** (новостной кадр) | Shell приведён к baseline A. Новостной слой — nested `iframe` на Yandex Cloud screen с CSS Grid / `inset` / современным JS → на слабых телеках парка **не гарантирован**. |
| LG webOS 1.4 | — | Не target. Для LG — отдельный legacy page. |

Канон прогона: [android-apk/web-page-compatibility.md](https://github.com/zagoguleolog/media_hub/blob/main/docs/features/android-apk/web-page-compatibility.md) (ссылка также в корневом [README](../README.md)).

**Что ломает слабые Android:** не таймер фото, а iframe-новости (`newsUrl`). Пока нет self-contained новостного leaf / Playlist IMAGE↔WEB без nested frame — на «не тянут» считать эту страницу условно годной только там, где WebView ≈ Chrome 90+.

## Цикл (6 минут)

1. Новости — 60 с  
2. Фото 1 — 60 с  
3. Новости — 60 с  
4. Фото 2 — 60 с  
5. Новости — 60 с  
6. Фото 3 — 60 с  

Затем повтор. Новостной `iframe` один и не пересоздаётся — только скрывается/показывается.

## URL

После публикации на GitHub Pages:

`https://zagoguleolog.github.io/public_pages/temporary-news-page/`

Синхронизация телевизоров:

`...?startAt=1730833200000`

Отладка фаз:

`...?debug=1`

## Настройки

JSON-конфиг в начале `index.html` (`var CONFIG = { ... }`).
Дубликат — `js/config.js`.

## Назначение через Media Hub

Назначить этот URL как обычный веб-контент на нужные телевизоры. APK и штатные плейлисты не трогать.
