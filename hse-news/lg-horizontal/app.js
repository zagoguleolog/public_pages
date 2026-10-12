/* ES5-only target for LG webOS 1.4 / Chrome 38. */
(function () {
  "use strict";
  var items = window.HSE_NEWS || []; var rotateMs = 17000; var index = 0; var started = new Date().getTime(); var stage = document.getElementById("stage"); var content = document.getElementById("content"); var progress = document.getElementById("progress");
  function fit() { var scale = Math.min(document.documentElement.clientWidth / 1920,document.documentElement.clientHeight / 1080); if (!isFinite(scale) || scale <= 0) { scale = 1; } stage.style.transform = "scale(" + scale + ")"; }
  function pad(value) { return value < 10 ? "0" + value : String(value); } function updateClock() { var now = new Date(new Date().getTime() + 3 * 60 * 60 * 1000); document.getElementById("clock").innerHTML = pad(now.getUTCHours()) + ":" + pad(now.getUTCMinutes()); }
  function setText(id,value) { var node = document.getElementById(id); node.innerHTML = ""; node.appendChild(document.createTextNode(value)); }
  function paint(item) { document.getElementById("photo").src = item.image; document.getElementById("photo").alt = item.title; document.getElementById("qr").src = item.qr; setText("date",item.date); setText("counter",(index + 1) + " / " + items.length); setText("section",item.section.toUpperCase()); setText("title",item.title); setText("lead",item.lead); document.getElementById("title").style.fontSize = item.title.length > 105 ? "40px" : (item.title.length > 78 ? "45px" : "50px"); }
  function show(next) { if (!items.length) { return; } index = next % items.length; started = new Date().getTime(); content.className = "content changing"; window.setTimeout(function () { paint(items[index]); content.className = "content"; },200); }
  function tick() { var elapsed = new Date().getTime() - started; progress.style.width = Math.min(100,elapsed * 100 / rotateMs) + "%"; if (elapsed >= rotateMs) { show(index + 1); } }
  fit(); updateClock(); if (items.length) { paint(items[0]); } window.onresize = fit; window.setInterval(updateClock,1000); window.setInterval(tick,100);
}());
