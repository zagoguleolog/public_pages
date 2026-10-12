(function () {
  "use strict";
  var items = window.HSE_NEWS || [];
  var facts = ["Питерская Вышка соединяет образование, исследования и реальные городские проекты.","В кампусе развиваются социальные науки, экономика, дизайн, медиа и технологии.","Проектное обучение помогает студентам работать с задачами индустрии уже во время учебы.","Исследовательские центры кампуса изучают общество, культуру, бизнес и цифровую среду."];
  var rotateMs = 17000; var index = 0; var started = Date.now(); var stage = document.getElementById("stage"); var story = document.getElementById("story"); var progress = document.getElementById("progress");
  function fit() { var scale = Math.min(document.documentElement.clientWidth / 1080,document.documentElement.clientHeight / 1920); stage.style.transform = "scale(" + (isFinite(scale) && scale > 0 ? scale : 1) + ")"; }
  function two(value) { return value < 10 ? "0" + value : String(value); }
  function moscowNow() { return new Date(Date.now() + 3 * 60 * 60 * 1000); }
  function minutes(value) { var p = value.split(":"); return Number(p[0]) * 60 + Number(p[1]); }
  function duration(value) { var h = Math.floor(value / 60); var m = value % 60; return h ? h + " ч " + m + " мин" : m + " мин"; }
  function updateClock() { var now = moscowNow(); document.getElementById("clock").textContent = two(now.getUTCHours()) + ":" + two(now.getUTCMinutes()); }
  function updateSchedule() {
    var pairs = [["1-я пара","08:00","09:20"],["2-я пара","09:30","10:50"],["3-я пара","11:10","12:30"],["4-я пара","13:00","14:20"],["5-я пара","14:40","16:00"],["6-я пара","16:20","17:40"],["7-я пара","18:10","19:30"],["8-я пара","19:40","21:00"]];
    var now = moscowNow(); var current = now.getUTCHours() * 60 + now.getUTCMinutes(); var active = -1; var next = -1; var i;
    for (i = 0; i < pairs.length; i += 1) { if (current >= minutes(pairs[i][1]) && current < minutes(pairs[i][2])) { active = i; break; } if (next < 0 && current < minutes(pairs[i][1])) { next = i; } }
    if (active >= 0) { var left = minutes(pairs[active][2]) - current; document.getElementById("pairTitle").textContent = "Сейчас идёт " + pairs[active][0]; document.getElementById("pairSub").textContent = "до конца " + duration(left) + " · окончание в " + pairs[active][2]; document.getElementById("nextLabel").textContent = "Перерыв"; document.getElementById("nextIn").textContent = "через " + duration(left); return; }
    if (next >= 0) { var until = minutes(pairs[next][1]) - current; document.getElementById("pairTitle").textContent = "Перерыв"; document.getElementById("pairSub").textContent = "следующая пара в " + pairs[next][1]; document.getElementById("nextLabel").textContent = pairs[next][0]; document.getElementById("nextIn").textContent = "через " + duration(until); return; }
    document.getElementById("pairTitle").textContent = "Учебный день завершён"; document.getElementById("pairSub").textContent = "занятия продолжатся завтра"; document.getElementById("nextLabel").textContent = "—"; document.getElementById("nextIn").textContent = "через —";
  }
  function paint(item) { document.getElementById("photo").src = item.image; document.getElementById("photo").alt = item.title; document.getElementById("qr").src = item.qr; document.getElementById("date").textContent = item.date; document.getElementById("counter").textContent = (index + 1) + " / " + items.length; document.getElementById("section").textContent = item.section; document.getElementById("title").textContent = item.title; document.getElementById("lead").textContent = item.lead; document.getElementById("fact").textContent = facts[index % facts.length]; document.getElementById("title").style.fontSize = item.title.length > 100 ? "43px" : (item.title.length > 76 ? "48px" : "53px"); }
  function show(next) { index = next % items.length; started = Date.now(); story.className = "changing"; setTimeout(function () { paint(items[index]); story.className = ""; },200); }
  function tick() { var elapsed = Date.now() - started; progress.style.width = Math.min(100,elapsed * 100 / rotateMs) + "%"; if (elapsed >= rotateMs) { show(index + 1); } }
  function updateWeather() { fetch("https://api.open-meteo.com/v1/forecast?latitude=59.94&longitude=30.31&current_weather=true").then(function (r) { return r.json(); }).then(function (d) { if (!d.current_weather) { return; } document.getElementById("weatherTemp").textContent = Math.round(d.current_weather.temperature) + "°"; document.getElementById("weatherWind").textContent = "ветер " + Math.round(d.current_weather.windspeed / 3.6) + " м/с"; }).catch(function () {}); }
  fit(); updateClock(); updateSchedule(); updateWeather(); if (items.length) { paint(items[0]); } window.onresize = fit; setInterval(updateClock,1000); setInterval(updateSchedule,30000); setInterval(tick,100); setInterval(updateWeather,600000);
}());
