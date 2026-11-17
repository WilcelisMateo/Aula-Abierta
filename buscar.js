/** buscar.js — Las lupas abren un buscador que recorre artículos, recursos descargables,
 *  archivos subidos, actividades y secciones del blog. */
(function () {
  'use strict';
  var STATIC = [
    ['Centro de Actividades', 'Juegos técnicos, mini-examen, autoevaluación y comentarios', 'actividades.html', 'extension', 'juegos aprender actividades bloom insignias niveles'],
    ['Reto SaberUp', 'Preguntas con vidas, puntos y rachas', 'index.html#juego-saberup', 'sports_esports', 'juego quiz preguntas reto'],
    ['Reto del día', 'Un reto nuevo cada día con racha y XP extra', 'index.html#reto-del-dia', 'today', 'reto diario dia racha xp'],
    ['Ordena los pasos', 'Secuencia procedimientos de los recursos técnicos', 'actividades.html#ordenar', 'format_list_numbered', 'ordenar pasos secuencia procedimiento'],
    ['Memoria de parejas', 'Une conceptos con su significado', 'actividades.html#memoria', 'extension', 'memoria parejas juego'],
    ['Arrastra y clasifica', 'Clasifica tarjetas en el grupo correcto', 'actividades.html#clasificar', 'swap_horiz', 'arrastrar soltar clasificar'],
    ['Sopa de letras', 'Encuentra las palabras del tema', 'actividades.html#sopa', 'grid_view', 'sopa letras palabras'],
    ['Verdadero o falso', 'Decide y aprende por qué', 'actividades.html#vf', 'rule', 'verdadero falso'],
    ['Mini-examen con rúbrica', 'Evaluación por tema', 'actividades.html#examen', 'assignment', 'examen evaluacion rubrica prueba'],
    ['¿Qué aprendí hoy? (autoevaluación)', 'Reflexiona sobre tu aprendizaje', 'actividades.html#autoevaluacion', 'psychology', 'autoevaluacion reflexion'],
    ['Danos tu opinión', 'Comentarios sobre la plataforma', 'actividades.html#comentarios', 'rate_review', 'comentarios opinion sugerencias'],
    ['Recursos técnicos', 'Guías, rúbricas y fichas descargables', 'recursos.html', 'folder_open', 'recursos descargas guias fichas'],
    ['Biblioteca Multimedia', 'Tus archivos subidos', 'biblioteca.html', 'perm_media', 'biblioteca archivos multimedia subir'],
    ['Publicaciones', 'Todos los artículos del blog', 'publicaciones.html', 'article', 'articulos publicaciones blog'],
    ['Agropecuaria', 'Artículos del área', 'publicaciones.html?subject=Agropecuaria', 'agriculture', 'agropecuaria agricultura suelo compost cultivos finca'],
    ['Gestión Administrativa y Tributaria', 'Artículos del área', 'publicaciones.html?subject=Gesti%C3%B3n%20Administrativa%20y%20Tributaria', 'receipt_long', 'gestion administrativa tributaria contabilidad itbis ncf impuestos'],
    ['Informática y Comunicaciones', 'Artículos del área', 'publicaciones.html?subject=Inform%C3%A1tica%20y%20Comunicaciones', 'computer', 'informatica comunicaciones programacion redes ciberseguridad'],
    ['Enfermería', 'Artículos del área', 'publicaciones.html?subject=Enfermer%C3%ADa', 'medical_services', 'enfermeria salud cuidado pacientes signos vitales bioseguridad'],
    ['Mi perfil', 'Cambia tu foto, nombre y datos', 'perfil.html', 'person', 'perfil foto nombre docente']
  ];
  var cache = null, ov = null;
  function norm(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function plain(h) { try { return new DOMParser().parseFromString(String(h || ''), 'text/html').body.textContent.replace(/\s+/g, ' ').trim(); } catch (e) { return ''; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function hl(text, words) {
    if (!words.length) return esc(text);
    var re = new RegExp('(' + words.map(reEsc).join('|') + ')', 'gi');
    return String(text).split(re).map(function (seg, i) { return i % 2 ? '<mark>' + esc(seg) + '</mark>' : esc(seg); }).join('');
  }

  async function gather() {
    var items = [];
    try {
      var d = window.AulaAbiertaDB; await d._initPromise;
      (await d.getPublishedArticles()).forEach(function (a) {
        var body = plain(a.content);
        items.push({ kind: 'Artículo', icon: 'article', t: a.title, d: [a.subject, a.grade].filter(Boolean).join(' · '), u: 'lectura.html?id=' + encodeURIComponent(a.id), snip: body || a.summary || '',
          hay: norm([a.title, a.summary, a.subject, a.grade, a.author, (a.tags || []).join(' '), body].join(' ')) });
      });
      (await d.getAllMedia()).filter(function (m) { return m.blob; }).forEach(function (m) {
        items.push({ kind: 'Archivo subido', icon: 'attach_file', t: m.name, d: m.category || 'documentos', u: 'biblioteca.html', snip: '', hay: norm(m.name + ' ' + (m.category || '')) });
      });
    } catch (e) { /* sin base de datos: se busca solo en lo estático */ }
    (window.SABERUP_RECURSOS || []).forEach(function (r) {
      items.push({ kind: 'Recurso descargable', icon: 'download', t: r.title, d: r.desc, u: 'recursos.html?q=' + encodeURIComponent(r.q), snip: '', hay: norm(r.title + ' ' + r.desc + ' ' + r.k.join(' ')) });
    });
    STATIC.forEach(function (s) { items.push({ kind: 'Sección', icon: s[3], t: s[0], d: s[1], u: s[2], snip: '', hay: norm(s[0] + ' ' + s[1] + ' ' + s[4]) }); });
    return items;
  }
  function search(q) {
    var words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return (cache || []).map(function (it) {
      var sc = 0, ok = words.every(function (w) { if (it.hay.indexOf(w) < 0) return false; sc += norm(it.t).indexOf(w) >= 0 ? 3 : 1; return true; });
      return ok ? { it: it, sc: sc } : null;
    }).filter(Boolean).sort(function (a, b) { return b.sc - a.sc; }).slice(0, 20).map(function (x) { return x.it; });
  }
  function snippet(it, words) {
    if (!it.snip) return '';
    var n = norm(it.snip), i = -1;
    for (var k = 0; k < words.length && i < 0; k++) i = n.indexOf(words[k]);
    if (i < 0) return it.snip.slice(0, 90);
    return (i > 30 ? '…' : '') + it.snip.slice(Math.max(0, i - 30), i + 90) + '…';
  }

  function css() {
    if (document.getElementById('bs-css')) return;
    var s = document.createElement('style'); s.id = 'bs-css';
    s.textContent = '.bs-ov{position:fixed;inset:0;z-index:600;background:rgba(0,9,34,.55);display:flex;justify-content:center;align-items:flex-start;padding:12px}' +
      '.bs-box{background:#fbf8f4;border-radius:18px;width:100%;max-width:560px;max-height:calc(100vh - 24px);display:flex;flex-direction:column;box-shadow:0 12px 40px rgba(0,0,0,.35);font-family:"Source Sans 3",system-ui,sans-serif;border:2px solid #d4a72c}' +
      '.bs-top{display:flex;gap:8px;align-items:center;padding:12px;border-bottom:1px solid #e4dfd8}.bs-top input{flex:1;min-width:0;border:2px solid #165b33;border-radius:12px;padding:11px 14px;font:400 17px "Source Sans 3",sans-serif;background:#fff}' +
      '.bs-x{border:0;background:#ebe6e0;border-radius:10px;padding:10px 14px;font:600 14px "Source Sans 3",sans-serif;cursor:pointer}.bs-res{overflow:auto;padding:6px 12px 14px}' +
      '.bs-r{display:flex;gap:12px;align-items:flex-start;padding:10px;border-radius:12px;text-decoration:none;color:#1c1b19}.bs-r:hover,.bs-r:focus{background:#dcefe0;outline:none}' +
      '.bs-r>.material-symbols-outlined{color:#b3202a;font-size:26px;flex-shrink:0}.bs-r strong{display:block;font:700 16px/22px "Source Sans 3",sans-serif}.bs-r small{display:block;color:#4a4944;font-size:13px;line-height:18px}' +
      '.bs-k{display:inline-block;background:#fff3cd;color:#5c4300;border:1px solid #d4a72c;border-radius:999px;padding:0 8px;font:600 11px/18px "Source Sans 3",sans-serif;margin-bottom:2px}' +
      '.bs-r mark{background:#ffe08a;color:inherit;border-radius:3px;padding:0 1px}.bs-h{color:#4a4944;font-size:14px;padding:8px 6px}.bs-chips{display:flex;flex-wrap:wrap;gap:8px;padding:4px 6px}' +
      '.bs-chip{border:1px solid #165b33;background:#fff;color:#165b33;border-radius:999px;padding:6px 12px;font:600 14px "Source Sans 3",sans-serif;cursor:pointer}';
    document.head.appendChild(s);
  }

  async function open() {
    css();
    if (ov) return;
    ov = document.createElement('div'); ov.className = 'bs-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Buscar en el blog');
    ov.innerHTML = '<div class="bs-box"><div class="bs-top"><input id="bs-q" type="search" placeholder="Busca artículos, recursos, juegos…" autocomplete="off" aria-label="Buscar"/><button type="button" class="bs-x" id="bs-close">Cerrar</button></div><div class="bs-res" id="bs-res" aria-live="polite"></div></div>';
    document.body.appendChild(ov);
    var inp = ov.querySelector('#bs-q'), res = ov.querySelector('#bs-res'), timer = 0;
    function home() {
      res.innerHTML = '<p class="bs-h">Prueba buscando:</p><div class="bs-chips">' + ['compost', 'asiento contable', 'ITBIS', 'algoritmos', 'signos vitales', 'sopa de letras'].map(function (c) { return '<button type="button" class="bs-chip">' + c + '</button>'; }).join('') + '</div>';
      Array.prototype.forEach.call(res.querySelectorAll('.bs-chip'), function (b) { b.addEventListener('click', function () { inp.value = b.textContent; draw(); inp.focus(); }); });
    }
    function draw() {
      var q = inp.value.trim(); if (!q) return home();
      var words = q.split(/\s+/).filter(Boolean), r = search(q);
      res.innerHTML = r.length ? r.map(function (it) {
        var sn = snippet(it, words.map(norm));
        return '<a class="bs-r" href="' + esc(it.u) + '"><span class="material-symbols-outlined" aria-hidden="true">' + esc(it.icon) + '</span><span><span class="bs-k">' + esc(it.kind) + '</span><strong>' + hl(it.t, words) + '</strong>' +
          (it.d ? '<small>' + hl(it.d, words) + '</small>' : '') + (sn ? '<small>' + hl(sn, words) + '</small>' : '') + '</span></a>';
      }).join('') : '<p class="bs-h">No encontré resultados para «' + esc(q) + '». Prueba con otra palabra, por ejemplo el nombre de un área técnica.</p>';
    }
    function close() { ov.remove(); ov = null; document.body.style.overflow = ''; }
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('#bs-close').addEventListener('click', close);
    ov.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Enter') { var a = res.querySelector('.bs-r'); if (a) location.href = a.getAttribute('href'); }
    });
    inp.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(draw, 120); });
    document.body.style.overflow = 'hidden'; home(); inp.focus();
    if (!cache) { cache = await gather(); if (ov && inp.value.trim()) draw(); }
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('button[aria-label^="Buscar"]'), function (b) {
      if (b.hasAttribute('data-bs')) return; b.setAttribute('data-bs', '1');
      b.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    });
    // Recolecta en segundo plano para que el primer resultado sea inmediato
    setTimeout(function () { if (!cache) gather().then(function (c) { cache = c; }); }, 600);
  }
  window.openBuscador = open;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
