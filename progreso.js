/** progreso.js — XP, niveles, insignias y etiquetas de Bloom compartidos por el juego y las actividades.
 *  Se guarda en el navegador (localStorage). */
(function () {
  'use strict';
  var LV = [[0, 'Explorador', '🧭'], [60, 'Aprendiz', '📚'], [150, 'Investigador', '🔬'], [300, 'Maestro del Saber', '🏆']];
  var BD = { primera: ['Primer paso', '🌱'], racha: ['Racha de fuego', '🔥'], estrellas: ['Tres estrellas', '🌟'], memoria: ['Memoria de elefante', '🐘'],
    clasif: ['Gran clasificador', '🗂️'], sopa: ['Detective de palabras', '🔍'], vf: ['Ojo crítico', '🧐'], examen: ['Examen aprobado', '📝'],
    reflexion: ['Mente reflexiva', '💭'], opinion: ['Voz de la comunidad', '💬'] };
  var BL = { Recordar: '🧠', Comprender: '💡', Aplicar: '🛠️', Analizar: '🔎', Evaluar: '⚖️', Crear: '🎨' };

  function load() { try { return JSON.parse(localStorage.getItem('saberup_progreso')) || { xp: 0, b: {} }; } catch (e) { return { xp: 0, b: {} }; } }
  function save(d) { try { localStorage.setItem('saberup_progreso', JSON.stringify(d)); } catch (e) { /* sin almacenamiento */ } }
  function lvl(xp) {
    var i = 0; LV.forEach(function (l, k) { if (xp >= l[0]) i = k; });
    var n = LV[i + 1];
    return { i: i, name: LV[i][1], icon: LV[i][2], from: LV[i][0], next: n ? n[0] : null };
  }
  function css() {
    if (document.getElementById('pg-css')) return;
    var s = document.createElement('style'); s.id = 'pg-css';
    s.textContent = '.pg-bl{display:inline-flex;gap:4px;align-items:center;background:#fff3cd;color:#5c4300;border:1px solid #d4a72c;border-radius:999px;padding:2px 10px;font:600 12px/18px "Source Sans 3",sans-serif;margin:0 6px 6px 0}' +
      '.pg-card{background:#fff;color:#1c1b19;border-radius:16px;padding:14px 16px;margin-top:14px;font-family:"Source Sans 3",sans-serif;border:1px solid #e4dfd8}' +
      '.pg-top{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:16px}' +
      '.pg-bar{height:10px;background:#e4dfd8;border-radius:99px;overflow:hidden;margin:8px 0}.pg-bar i{display:block;height:100%;background:linear-gradient(90deg,#b3202a,#d4a72c);border-radius:99px}' +
      '.pg-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.pg-b{font-size:12px;padding:3px 9px;border-radius:999px;background:#dcefe0;color:#0a2e1f;font-weight:600}.pg-b.off{background:#f1ede8;color:#7b7a73;filter:grayscale(1);opacity:.7}' +
      '.pg-toast{position:fixed;left:50%;top:84px;transform:translateX(-50%);z-index:400;background:#0a2e1f;color:#fff;border:2px solid #d4a72c;padding:12px 18px;border-radius:14px;font:600 15px/22px "Source Sans 3",sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:90vw;text-align:center}';
    document.head.appendChild(s);
  }
  function toast(t) { css(); var e = document.createElement('div'); e.className = 'pg-toast'; e.setAttribute('role', 'status'); e.textContent = t; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 3200); }

  window.SaberUpProgreso = {
    award: function (xp, badge) {
      var d = load(), before = lvl(d.xp).i, msg = '+' + xp + ' XP', nb = false;
      d.xp += xp;
      if (badge && BD[badge] && !d.b[badge]) { d.b[badge] = Date.now(); nb = true; msg += ' · ' + BD[badge][1] + ' ' + BD[badge][0]; }
      save(d);
      var l = lvl(d.xp);
      if (l.i > before) msg += ' · ¡Nivel ' + (l.i + 1) + ': ' + l.name + '!';
      toast('🎉 ' + msg);
      return { xp: d.xp, level: l, newBadge: nb };
    },
    bloom: function (names) {
      css();
      return names.map(function (n) { return '<span class="pg-bl" title="Nivel de la Taxonomía de Bloom">' + (BL[n] || '') + ' ' + n + '</span>'; }).join('');
    },
    card: function (showBadges) {
      css();
      var d = load(), l = lvl(d.xp), pct = l.next ? Math.round((d.xp - l.from) / (l.next - l.from) * 100) : 100;
      var h = '<div class="pg-card"><div class="pg-top"><span>' + l.icon + ' Nivel ' + (l.i + 1) + ': ' + l.name + '</span><span>' + d.xp + ' XP</span></div>' +
        '<div class="pg-bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%"></i></div>' +
        '<small>' + (l.next ? 'Te faltan ' + (l.next - d.xp) + ' XP para el siguiente nivel' : '¡Alcanzaste el nivel máximo!') + '</small>';
      if (showBadges) {
        h += '<div class="pg-badges">' + Object.keys(BD).map(function (k) {
          return '<span class="pg-b' + (d.b[k] ? '' : ' off') + '" title="' + BD[k][0] + '">' + BD[k][1] + ' ' + BD[k][0] + '</span>';
        }).join('') + '</div>';
      }
      return h + '</div>';
    }
  };
})();
