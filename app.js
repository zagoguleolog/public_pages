/* global window, document, XMLHttpRequest, Image, setInterval, setTimeout */
(function () {
  "use strict";

  var ROTATE_MS = 14000;
  var items = [];
  var currentIndex = 0;
  var slideStartedAt = new Date().getTime();
  var weather = { temperature: null, wind: null };
  var facts = [
    "В Вышке часто используются проектные форматы обучения: от кейсов до полноценной разработки продуктов.",
    "Питерская Вышка объединяет аналитику, креативные индустрии, социальные науки и технологии.",
    "Открытые лекции, конференции и встречи с индустрией проходят в кампусе круглый год.",
    "Студенты могут собирать индивидуальную образовательную траекторию через выбор дисциплин и модулей.",
    "Библиотека и электронные ресурсы дают доступ к учебным и исследовательским материалам онлайн.",
    "Новости кампуса рассказывают о людях, исследованиях, экспедициях и реальных проектах."
  ];

  var el = {
    stage: document.getElementById("stage"),
    content: document.getElementById("content"),
    photo: document.getElementById("photoCard"),
    date: document.getElementById("newsDate"),
    counter: document.getElementById("counter"),
    headline: document.getElementById("headline"),
    lead: document.getElementById("lead"),
    qr: document.getElementById("qrImage"),
    clock: document.getElementById("clock"),
    progress: document.getElementById("progressBar"),
    fact: document.getElementById("factText"),
    error: document.getElementById("errorBanner"),
    pairTitle: document.getElementById("pairTitle"),
    pairSub: document.getElementById("pairSub"),
    nextLabel: document.getElementById("nextLabel"),
    nextIn: document.getElementById("nextIn"),
    weatherTemp: document.getElementById("weatherTemp"),
    weatherWind: document.getElementById("weatherWind")
  };

  function fitStage() {
    var scale = Math.min(document.documentElement.clientWidth / 1920, document.documentElement.clientHeight / 1080);
    if (!isFinite(scale) || scale <= 0) { scale = 1; }
    el.stage.style.transform = "scale(" + scale + ")";
  }

  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function moscowDate() {
    return new Date(new Date().getTime() + 3 * 60 * 60 * 1000);
  }

  function updateClock() {
    var now = moscowDate();
    el.clock.innerHTML = pad(now.getUTCHours()) + ":" + pad(now.getUTCMinutes());
  }

  function minutes(value) {
    var parts = value.split(":");
    return Number(parts[0]) * 60 + Number(parts[1]);
  }

  function durationText(value) {
    var hours = Math.floor(value / 60);
    var mins = value % 60;
    if (hours === 0) { return mins + " мин"; }
    return hours + " ч " + mins + " мин";
  }

  function updateSchedule() {
    var pairs = [
      ["1-я пара", "08:00", "09:20"], ["2-я пара", "09:30", "10:50"],
      ["3-я пара", "11:10", "12:30"], ["4-я пара", "13:00", "14:20"],
      ["5-я пара", "14:40", "16:00"], ["6-я пара", "16:20", "17:40"],
      ["7-я пара", "18:10", "19:30"], ["8-я пара", "19:40", "21:00"]
    ];
    var now = moscowDate();
    var nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    var active = -1;
    var next = -1;
    var i;

    for (i = 0; i < pairs.length; i += 1) {
      if (nowMinutes >= minutes(pairs[i][1]) && nowMinutes < minutes(pairs[i][2])) { active = i; break; }
      if (next < 0 && nowMinutes < minutes(pairs[i][1])) { next = i; }
    }

    if (active >= 0) {
      var left = minutes(pairs[active][2]) - nowMinutes;
      el.pairTitle.innerHTML = "Сейчас идёт " + pairs[active][0];
      el.pairSub.innerHTML = "до конца " + durationText(left) + " · окончание в " + pairs[active][2];
      el.nextLabel.innerHTML = "Перерыв";
      el.nextIn.innerHTML = "через " + durationText(left);
      return;
    }

    for (i = 0; i < pairs.length; i += 1) {
      if (nowMinutes < minutes(pairs[i][1])) { next = i; break; }
    }
    if (next >= 0) {
      var until = minutes(pairs[next][1]) - nowMinutes;
      el.pairTitle.innerHTML = "Перерыв";
      el.pairSub.innerHTML = "следующая пара в " + pairs[next][1];
      el.nextLabel.innerHTML = pairs[next][0];
      el.nextIn.innerHTML = "через " + durationText(until);
    } else {
      el.pairTitle.innerHTML = "Учебный день завершён";
      el.pairSub.innerHTML = "занятия продолжатся завтра";
      el.nextLabel.innerHTML = "—";
      el.nextIn.innerHTML = "через —";
    }
  }

  function fileName(url) {
    var clean = String(url || "").split("?")[0];
    var name = clean.substring(clean.lastIndexOf("/") + 1);
    return /^[a-zA-Z0-9._-]+$/.test(name) ? name : "";
  }

  function assetUrl(url) {
    return "./assets/" + fileName(url);
  }

  function fontSizes(item) {
    var titleLength = String(item.title || "").length;
    var leadLength = String(item.lead || "").length;
    el.headline.style.fontSize = titleLength > 120 ? "40px" : (titleLength > 90 ? "44px" : "50px");
    el.lead.style.fontSize = leadLength > 520 ? "20px" : (leadLength > 360 ? "22px" : "25px");
  }

  function paint(item, index) {
    var image = assetUrl(item.image);
    var qr = assetUrl(item.qrImage);
    el.photo.style.backgroundImage = image ? "url('" + image + "')" : "none";
    el.date.textContent = item.date || "Новости";
    el.counter.textContent = (index + 1) + "/" + items.length;
    el.headline.textContent = item.title || "Новости кампуса";
    el.lead.textContent = item.lead || "";
    el.qr.src = qr;
    el.fact.textContent = facts[index % facts.length];
    fontSizes(item);
  }

  function show(index, immediate) {
    if (!items.length) { return; }
    currentIndex = index % items.length;
    slideStartedAt = new Date().getTime();
    if (immediate) { paint(items[currentIndex], currentIndex); return; }
    el.content.className = "content is-changing";
    setTimeout(function () {
      paint(items[currentIndex], currentIndex);
      el.content.className = "content";
    }, 180);
  }

  function rotate() {
    show(currentIndex + 1, false);
  }

  function updateProgress() {
    var elapsed = new Date().getTime() - slideStartedAt;
    var percent = Math.max(0, Math.min(100, Math.floor(elapsed * 100 / ROTATE_MS)));
    el.progress.style.width = percent + "%";
  }

  function preload() {
    var i;
    for (i = 0; i < items.length; i += 1) {
      var image = new Image();
      image.src = assetUrl(items[i].image);
      var qr = new Image();
      qr.src = assetUrl(items[i].qrImage);
    }
  }

  function renderWeather() {
    if (weather.temperature !== null && weather.temperature !== undefined) {
      el.weatherTemp.textContent = Math.round(Number(weather.temperature)) + "°";
    }
    if (weather.wind !== null && weather.wind !== undefined) {
      el.weatherWind.textContent = "ветер " + Math.round(Number(weather.wind)) + " м/с";
    }
  }

  function loadState() {
    var request = new XMLHttpRequest();
    request.open("GET", "./data/state.json?ts=" + new Date().getTime(), true);
    request.onreadystatechange = function () {
      if (request.readyState !== 4) { return; }
      if (request.status < 200 || request.status >= 300) {
        el.error.style.display = "block";
        return;
      }
      try {
        var state = JSON.parse(request.responseText);
        items = state.news instanceof Array ? state.news : [];
        weather = state.weather || weather;
        if (!items.length) { throw new Error("empty news"); }
        el.error.style.display = "none";
        preload();
        renderWeather();
        show(0, true);
      } catch (error) {
        el.error.title = error && error.message ? error.message : "invalid state";
        el.error.style.display = "block";
      }
    };
    request.send(null);
  }

  fitStage();
  updateClock();
  updateSchedule();
  loadState();
  window.onresize = fitStage;
  setInterval(updateClock, 1000);
  setInterval(updateSchedule, 1000);
  setInterval(updateProgress, 100);
  setInterval(rotate, ROTATE_MS);
  setInterval(loadState, 60000);
}());
