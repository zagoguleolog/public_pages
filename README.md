# public_pages

Статический сайт на GitHub Pages: `https://zagoguleolog.github.io/public_pages/`

Репозиторий: `https://github.com/zagoguleolog/public_pages`

## Совместимость с телеками (обязательно)

Страницы, которые крутят на ТВ / вывесках Media Hub, **до публикации** прогонять по профилю:

| Платформа | Документ |
| --- | --- |
| Android Edge (APK WebView) | [media_hub → android-apk/web-page-compatibility.md](https://github.com/zagoguleolog/media_hub/blob/main/docs/features/android-apk/web-page-compatibility.md) — baseline **A** (~Chrome 70): без CSS Grid / `inset` / ES2020 как единственного пути; nested `iframe` на чужой SPA — не baseline |
| LG webOS 1.4 | [media_hub → lg-webos/web-page-compatibility.md](https://github.com/zagoguleolog/media_hub/blob/main/docs/features/lg-webos/web-page-compatibility.md) |

В README конкретной страницы указать target (**A** / **B** / LG) и дату проверки. Успех в десктопном Chrome или AVD API 33 **не** закрывает слабый парк.

## Правило публикации

Положить страницу на public_pages = **страница в репозитории** + **ссылка в эту корневую доку** с короткой пометкой, что это.

Без строки в таблице ниже страница считается незадокументированной.

## Публичные ссылки

| Что это | URL |
| --- | --- |
| Новости кампуса HSE, 16:9 для LG webOS (корень сайта) | https://zagoguleolog.github.io/public_pages/ |
| Новости кампуса HSE, вертикальный экран 1080×1920 | https://zagoguleolog.github.io/public_pages/hse-news/vertical/ |
| Новости кампуса HSE, упрощённый 16:9 под LG webOS 1.4 | https://zagoguleolog.github.io/public_pages/hse-news/lg-horizontal/ |
| Временный плеер: вертикальные новости + 3 фото (цикл 6 мин); Android shell A, iframe-новости не baseline A | https://zagoguleolog.github.io/public_pages/temporary-news-page/ |
| Зацикленный stop-motion ролик «конфа» | https://zagoguleolog.github.io/public_pages/stopmotion-confa/ |
| Тестовая лента новостей с баннером «испытания до понедельника» | https://zagoguleolog.github.io/public_pages/test-until-monday/ |
| Демо мобильного UI Media Hub | https://zagoguleolog.github.io/public_pages/media_hub_mobile_demo.html |
| Скрытая служебная страница (noindex; ключ только в `#fragment`) | https://zagoguleolog.github.io/public_pages/x/1facbbb5fc240b8454485be53602d029/ |

Синхронизация временного плеера на нескольких ТВ: `...?startAt=<unix_ms>`.

<!-- favicon-doc -->
## Favicon

Иконка вкладок браузера: [`branding/`](branding/) (`favicon.png` / `favicon.ico`). Правило для новых HTML: [`branding/README.md`](branding/README.md).
