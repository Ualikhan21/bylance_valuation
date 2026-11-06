(function () {
  var C = window.SITE, $ = function (s) { return document.querySelector(s); };
  var fmt = function (n) { return n.toLocaleString("ru-RU").replace(/\u00a0/g, " ") + " ₸"; };
  var gb = function (n) { return n >= 1024 ? n / 1024 + " ТБ" : n + " ГБ"; };
  var wa = "https://wa.me/" + C.whatsapp;
  var S = { gen: null, model: null, storage: null, body: null, extras: {}, blocked: false };

  /* ---- контакты и логотип ---- */
  document.querySelectorAll("[data-c]").forEach(function (el) { el.textContent = C[el.dataset.c]; });
  var links = { whatsapp: wa, telegram: "https://t.me/" + C.telegram, gis: C.gis };
  document.querySelectorAll("[data-link]").forEach(function (el) { el.href = links[el.dataset.link]; });
  $("#year").textContent = new Date().getFullYear();
  $("#brand").innerHTML = C.logoImage ? '<img alt="' + C.shopName + '" src="' + C.logoImage + '">' : '<span class="logo">' + C.shopName + "</span>";

  /* ---- карта 2ГИС (ссылка или готовый <iframe>) ---- */
  var src = (C.gisMapEmbed.match(/src=["']([^"']+)["']/) || [null, C.gisMapEmbed.trim()])[1];
  if (/^https:\/\//.test(src)) {
    var f = document.createElement("iframe");
    f.src = src; f.loading = "lazy"; f.title = "Карта 2ГИС"; $("#map").appendChild(f);
  } else { $("#cwrap").classList.add("nomap"); $("#map").remove(); }

  /* ---- кнопки ---- */
  function btn(parent, html, cls, onclick) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "opt " + (cls || ""); b.innerHTML = html; b.setAttribute("aria-pressed", "false");
    b.onclick = function () { onclick(b); }; parent.appendChild(b); return b;
  }
  function pick(parent, b) {
    parent.querySelectorAll(".opt").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
  }
  function show(id) {
    var q = $(id), fresh = q.hidden; q.hidden = false;
    if (fresh) q.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth", block: "start" });
  }
  function hide(ids) { ids.forEach(function (id) { $(id).hidden = true; }); }

  var gens = $("#gens"), vars = $("#vars"), stor = $("#stor"), bodyEl = $("#body"), extrasEl = $("#extras");

  C.generations.forEach(function (g) {
    btn(gens, g.gen, "", function (b) {
      pick(gens, b); S.gen = g; S.model = S.storage = null; vars.innerHTML = stor.innerHTML = "";
      g.models.forEach(function (m) {
        btn(vars, m.label, "", function (b2) {
          pick(vars, b2); S.model = m; S.storage = null; stor.innerHTML = "";
          Object.keys(m.prices).forEach(function (s) {
            btn(stor, gb(+s), "", function (b3) { pick(stor, b3); S.storage = +s; show("#q4"); show("#q5"); calc(); });
          });
          hide(["#q4", "#q5", "#q6"]); S.body = null; pick(bodyEl, null); show("#q3"); calc();
        });
      });
      hide(["#q3", "#q4", "#q5", "#q6"]); S.body = null; pick(bodyEl, null); show("#q2"); calc();
    });
  });

  C.body.forEach(function (o) {
    btn(bodyEl, '<span class="dot" style="background:' + o.color + '"></span>' + o.label + "<small>" + o.hint + "</small>", "bd", function (b) {
      pick(bodyEl, b); S.body = o; show("#q6"); calc();
    });
  });

  C.extras.forEach(function (e, i) {
    btn(extrasEl, e.label, "sm", function (b) {
      S.extras[i] = !S.extras[i]; b.setAttribute("aria-pressed", S.extras[i]); calc();
    });
  });
  btn(extrasEl, C.blocked, "sm warn", function (b) {
    S.blocked = !S.blocked; b.setAttribute("aria-pressed", S.blocked); calc();
  });

  /* ---- аккумулятор ---- */
  var bat = $("#battery"), bval = $("#bval");
  function batt() {
    var v = +bat.value, h = v <= 80 ? (v - 50) / 30 * 50 : 50 + (v - 80) / 20 * 80;
    bval.textContent = v + "%"; bval.style.color = "hsl(" + h + ",75%,42%)"; calc();
  }
  bat.addEventListener("input", batt); batt();

  /* ---- расчёт ---- */
  function calc() {
    var send = $("#send"), price = $("#price"), detail = $("#detail");
    send.classList.add("off"); detail.classList.remove("err"); price.textContent = "—";
    if (S.blocked) { detail.textContent = "Телефоны с блокировкой iCloud мы не покупаем."; detail.classList.add("err"); return; }
    if (!S.model || !S.storage || !S.body) { detail.textContent = "Ответьте на вопросы, и здесь появится цена."; return; }

    var pct = +bat.value, cut = S.body.cut, chosen = [], i;
    for (i = 0; i < C.battery.length; i++) if (pct >= C.battery[i].min) { cut += C.battery[i].cut; break; }
    C.extras.forEach(function (e, k) { if (S.extras[k]) { cut += e.cut; chosen.push(e.label.toLowerCase()); } });
    var total = Math.max(0, Math.round(S.model.prices[S.storage] * (1 - Math.min(cut, 90) / 100) / C.roundTo) * C.roundTo);

    price.textContent = fmt(total);
    detail.textContent = S.model.name + ", " + gb(S.storage) + ", АКБ " + pct + "%";
    var text = "Здравствуйте! Хочу продать iPhone.\nМодель: " + S.model.name + ", " + gb(S.storage) +
      "\nАккумулятор: " + pct + "%\nКорпус: " + S.body.label.toLowerCase() + " (" + S.body.hint.toLowerCase() + ")" +
      (chosen.length ? "\nДополнительно: " + chosen.join(", ") : "") +
      "\nОценка на сайте " + C.shopName + ": " + fmt(total);
    send.href = wa + "?text=" + encodeURIComponent(text);
    send.classList.remove("off");
  }
  calc();
})();
