# Favicon / иконка вкладки

Канон бренда этого репозитория: файлы в [`branding/`](./) (и зеркала в web-root, откуда их реально отдаёт сервер).

| Файл | Назначение |
| --- | --- |
| `favicon.png` | Основная иконка (512×512 PNG) |
| `favicon-32.png` | Компактный PNG для `<link rel="icon">` |
| `favicon.ico` | Classic `/favicon.ico` для браузеров без `<link>` |

## Обязательное правило

**Любая новая HTML-страница** этого проекта (локальный стенд, панель, GitHub Pages, demo, TV-клиент) должна показывать эту иконку во вкладке браузера — не серую «планету» по умолчанию.

В `<head>` каждой страницы:

```html
<link rel="icon" href="/public_pages/favicon.png" type="image/png" />
<link rel="shortcut icon" href="/public_pages/favicon.ico" />
<link rel="apple-touch-icon" href="/public_pages/favicon.png" />
```

Путь подставь относительно того, **откуда страница реально отдаётся** (корень сайта, `/static/`, `/panel/`, …). Если сомневаешься — положи копию `favicon.png` / `favicon.ico` рядом с `index.html` и ссылайся на `favicon.png`.

Дополнительно положи `favicon.ico` в web-root сервиса, чтобы запрос `GET /favicon.ico` (без `<link>`) тоже отдавал иконку.

## Не делать

- Не оставлять страницу без `<link rel="icon">`.
- Не брать чужую иконку из соседнего проекта.
- Не коммитить временные кропы/`_favicon_crops` — только `branding/` и web-копии.
