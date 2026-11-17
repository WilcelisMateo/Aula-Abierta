/** fecha.js — Fecha y hora reales de la República Dominicana (America/Santo_Domingo, UTC-4).
 *  Rellena los elementos marcados con data-fecha / data-fecha-rel y ofrece utilidades a los demás módulos. */
(function () {
  'use strict';
  var TZ = 'America/Santo_Domingo';
  function parts(d) {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(d || new Date()).forEach(function (x) { p[x.type] = x.value; });
    return p;
  }
  function clave(d) { var p = parts(d); return p.year + '-' + p.month + '-' + p.day; }
  function fmt(d, o) { return new Intl.DateTimeFormat('es-DO', Object.assign({ timeZone: TZ }, o)).format(d || new Date()); }
  function add(n) { return new Date(Date.now() + n * 86400000); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function larga(d) { return cap(fmt(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })); }
  function semana(d) {
    var p = parts(d), t = new Date(Date.UTC(+p.year, +p.month - 1, +p.day)), day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    return Math.ceil(((t - new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / 86400000 + 1) / 7);
  }
  function diaAnio(d) {
    var p = parts(d); return Math.floor((Date.UTC(+p.year, +p.month - 1, +p.day) - Date.UTC(+p.year, 0, 0)) / 86400000);
  }
  function anioEscolar(d) { var p = parts(d), y = +p.year, s = +p.month >= 8 ? y : y - 1; return s + '-' + (s + 1); }
  function saludo(d) { var h = +parts(d).hour % 24; return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'; }

  function fill() {
    var now = new Date();
    Array.prototype.forEach.call(document.querySelectorAll('[data-fecha]'), function (el) {
      var k = el.getAttribute('data-fecha');
      el.textContent = k === 'larga' ? larga(now) : k === 'mesanio' ? cap(fmt(now, { month: 'long', year: 'numeric' })) : k === 'anio' ? parts(now).year :
        k === 'semanatxt' ? 'Semana ' + semana(now) : k === 'anioescolar' ? 'Año escolar ' + anioEscolar(now) :
        k === 'hoyhora' ? 'Hoy, ' + fmt(now, { hour: 'numeric', minute: '2-digit', hour12: true }) : el.textContent;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-fecha-rel]'), function (el) {
      var f = el.getAttribute('data-fecha-fmt') || 'corta';
      var o = f === 'corta' ? { day: 'numeric', month: 'short' } : f === 'cortaanio' ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: '2-digit', month: 'long', year: 'numeric' };
      el.textContent = fmt(add(+el.getAttribute('data-fecha-rel')), o) + (el.getAttribute('data-fecha-sfx') || '');
    });
  }
  window.SaberUpFecha = { TZ: TZ, parts: parts, clave: clave, fmt: fmt, add: add, larga: larga, semana: semana, diaAnio: diaAnio, anioEscolar: anioEscolar, saludo: saludo, fill: fill };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill); else fill();
})();
