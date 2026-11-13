/** actividades.js — Centro de Actividades: juegos con nivel de Bloom, mini-examen con rúbrica,
 *  autoevaluación y comentarios. Todo se guarda en el navegador (localStorage). */
(function () {
  'use strict';
  var FORM_URL = ''; // Opcional: pega aquí la URL de un formulario (Formspree, Google Forms) para recibir los comentarios.
  var P = window.SaberUpProgreso, APP = null;
  var AREAS = { 'Ciencias Naturales': 'science', 'Matemática': 'calculate', 'Lengua Española': 'menu_book', 'Ciencias Sociales': 'public' };
  var KS = Object.keys(AREAS);

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function mix(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)) || []; localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return []; } }
  function bl(a) { return P ? P.bloom(a) : ''; }
  function stars(n) { return '⭐'.repeat(n) + '☆'.repeat(3 - n); }
  function $(s, r) { return (r || APP).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || APP).querySelectorAll(s)); }
  function go(v) { location.hash = v; }

  /* ───────── datos ───────── */
  var MEM = {
    'Ciencias Naturales': [['Fotosíntesis', 'Las plantas fabrican su alimento'], ['Corazón', 'Bombea la sangre'], ['Evaporación', 'El agua pasa a vapor'], ['Mercurio', 'Planeta más cercano al Sol'], ['Mamífero', 'Amamanta a sus crías'], ['Sólido', 'Tiene forma propia, como el hielo']],
    'Matemática': [['Perímetro', 'Suma de todos los lados'], ['Triángulo', 'Sus ángulos suman 180°'], ['Mitad', 'Dividir entre 2'], ['7 × 8', '56'], ['Fracción', 'Parte de un entero'], ['Porcentaje', 'Partes de cada 100']],
    'Lengua Española': [['Sinónimo', 'Significa algo parecido'], ['Antónimo', 'Significa lo contrario'], ['Verbo', 'Expresa una acción'], ['Sustantivo', 'Nombra personas o cosas'], ['Adjetivo', 'Dice cómo es algo'], ['Palabra aguda', 'Fuerza en la última sílaba']],
    'Ciencias Sociales': [['27 de febrero', 'Independencia Nacional'], ['16 de agosto', 'Restauración'], ['Duarte', 'Padre de la Patria'], ['Santo Domingo', 'Capital dominicana'], ['Pico Duarte', 'Punto más alto del Caribe'], ['Haití', 'Vecino en La Española']]
  };
  var CLAS = {
    'Ciencias Naturales': { bins: ['Ser vivo', 'No vivo'], items: [['Árbol', 0], ['Roca', 1], ['Perro', 0], ['Agua', 1], ['Hongo', 0], ['Aire', 1], ['Pájaro', 0], ['Montaña', 1]] },
    'Matemática': { bins: ['Número par', 'Número impar'], items: [['12', 0], ['7', 1], ['20', 0], ['15', 1], ['8', 0], ['33', 1], ['40', 0], ['9', 1]] },
    'Lengua Española': { bins: ['Sustantivo', 'Verbo', 'Adjetivo'], items: [['casa', 0], ['correr', 1], ['bonito', 2], ['perro', 0], ['saltar', 1], ['grande', 2], ['escuela', 0], ['cantar', 1]] },
    'Ciencias Sociales': { bins: ['Símbolo patrio', 'Fecha patria'], items: [['Bandera', 0], ['Escudo', 0], ['Himno Nacional', 0], ['27 de febrero', 1], ['16 de agosto', 1], ['6 de noviembre', 1]] }
  };
  var SOPA = {
    'Ciencias Naturales': ['PLANTA', 'AGUA', 'CELULA', 'ATOMO', 'LUNA', 'ENERGIA'],
    'Matemática': ['SUMA', 'RESTA', 'ANGULO', 'FRACCION', 'CUBO', 'DECENA'],
    'Lengua Española': ['VERBO', 'SILABA', 'TILDE', 'RIMA', 'CUENTO', 'POEMA'],
    'Ciencias Sociales': ['DUARTE', 'SANCHEZ', 'MELLA', 'BANDERA', 'ISLA', 'PATRIA']
  };
  var VF = {
    'Ciencias Naturales': [['El Sol es una estrella.', 1, 'Es la estrella más cercana a la Tierra.'], ['Los delfines son peces.', 0, 'Son mamíferos: respiran aire y amamantan a sus crías.'], ['El agua hierve a 100 °C al nivel del mar.', 1, 'Ese es su punto de ebullición.'], ['Las plantas absorben oxígeno para hacer la fotosíntesis.', 0, 'Absorben dióxido de carbono y liberan oxígeno.'], ['El corazón es un músculo.', 1, 'Late para impulsar la sangre.']],
    'Matemática': [['Un triángulo tiene 4 lados.', 0, 'Tiene 3 lados.'], ['La mitad de 50 es 25.', 1, '50 ÷ 2 = 25.'], ['El número 0 es par.', 1, 'Es divisible entre 2.'], ['Un cuadrado tiene 4 lados iguales.', 1, 'Y 4 ángulos rectos.'], ['9 × 9 = 72.', 0, '9 × 9 = 81.']],
    'Lengua Española': [['«Rápido» es un verbo.', 0, 'Es un adjetivo.'], ['«Casa» es un sustantivo.', 1, 'Nombra una cosa.'], ['Las palabras llanas siempre llevan tilde.', 0, 'Solo la llevan si no terminan en vocal, n ni s.'], ['«Enorme» es un sinónimo de «grande».', 1, 'Significan algo parecido.'], ['Una oración empieza con minúscula.', 0, 'Empieza con mayúscula.']],
    'Ciencias Sociales': [['La capital dominicana es Santiago.', 0, 'Es Santo Domingo.'], ['Duarte es uno de los Padres de la Patria.', 1, 'Junto a Sánchez y Mella.'], ['La Independencia Nacional se celebra el 27 de febrero.', 1, 'Se proclamó en 1844.'], ['Compartimos la isla con Cuba.', 0, 'La compartimos con Haití.'], ['El Pico Duarte es el más alto del Caribe.', 1, 'Mide unos 3,098 metros.']]
  };
  var RUBRICA = [['Excelente', '5 de 5', 'Domina el tema y lo explica con seguridad.'], ['Logrado', '4 de 5', 'Comprende lo esencial; repasa un detalle.'], ['En proceso', '3 de 5', 'Entiende parte del tema; necesita practicar.'], ['Inicial', '0 a 2', 'Conviene repasar el tema y volver a intentarlo.']];

  /* ───────── piezas comunes ───────── */
  function shell(title, bloom, body) {
    APP.innerHTML = '<button type="button" class="ac-back" data-go="">← Actividades</button><h2 class="ac-h">' + esc(title) + '</h2><div>' + bl(bloom) + '</div>' + body;
    $('.ac-back').addEventListener('click', function () { go(''); });
  }
  function pickArea(title, bloom, desc, cb) {
    shell(title, bloom, '<p class="ac-p">' + desc + '</p><div class="ac-grid">' + KS.map(function (a) {
      return '<button type="button" class="ac-btn ac-area" data-a="' + esc(a) + '"><span class="material-symbols-outlined">' + AREAS[a] + '</span>' + esc(a) + '</button>';
    }).join('') + '</div>');
    $$('.ac-area').forEach(function (b) { b.addEventListener('click', function () { cb(b.getAttribute('data-a')); }); });
  }
  function end(title, bloom, area, n, total, xp, badge, again) {
    var st = n >= total ? 3 : n >= total * 0.6 ? 2 : 1;
    shell(title + ' · ' + area, bloom, '<div class="ac-card ac-center"><div class="ac-big">' + stars(st) + '</div><p class="ac-p">' + n + ' de ' + total + (st === 3 ? ' — ¡Perfecto!' : ' — ¡Buen trabajo, sigue practicando!') + '</p>' +
      '<div class="ac-row"><button type="button" class="ac-btn ac-pri" id="ac-again">Jugar otra vez</button><button type="button" class="ac-btn" id="ac-hub">Más actividades</button></div></div>');
    $('#ac-again').addEventListener('click', again); $('#ac-hub').addEventListener('click', function () { go(''); });
    if (P) P.award(xp + st * 3, st === 3 ? badge : null);
  }

  /* ───────── 1. Memoria de parejas ───────── */
  function memoria(area) {
    var cards = [];
    MEM[area].forEach(function (p, i) { cards.push({ id: i, t: p[0] }, { id: i, t: p[1] }); });
    cards = mix(cards);
    var open = [], found = 0, moves = 0, lock = false;
    shell('Memoria de parejas · ' + area, ['Recordar'], '<p class="ac-p">Une cada concepto con su significado. Movimientos: <strong id="mv">0</strong></p><div class="ac-mem">' +
      cards.map(function (c, k) { return '<button type="button" class="ac-card-m" data-k="' + k + '" aria-label="Carta oculta"><span>?</span></button>'; }).join('') + '</div>');
    $$('.ac-card-m').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = +b.getAttribute('data-k');
        if (lock || b.classList.contains('up') || b.classList.contains('ok')) return;
        b.classList.add('up'); b.innerHTML = '<span>' + esc(cards[k].t) + '</span>'; open.push(k);
        if (open.length < 2) return;
        moves++; $('#mv').textContent = moves; lock = true;
        var a = open[0], c = open[1];
        setTimeout(function () {
          var ba = $('[data-k="' + a + '"]'), bc = $('[data-k="' + c + '"]');
          if (cards[a].id === cards[c].id) { ba.classList.add('ok'); bc.classList.add('ok'); found++; }
          else { [ba, bc].forEach(function (x) { x.classList.remove('up'); x.innerHTML = '<span>?</span>'; }); }
          open = []; lock = false;
          if (found === 6) { var n = moves <= 9 ? 3 : moves <= 14 ? 2 : 1; end('Memoria de parejas', ['Recordar'], area, n, 3, 15, 'memoria', function () { memoria(area); }); }
        }, 650);
      });
    });
  }

  /* ───────── 2. Clasificar (arrastrar y soltar / tocar) ───────── */
  function clasificar(area) {
    var d = CLAS[area], items = mix(d.items), sel = null, errs = 0, left = items.length;
    shell('Clasifica · ' + area, ['Analizar', 'Aplicar'], '<p class="ac-p">Arrastra cada tarjeta a su grupo (o toca la tarjeta y luego el grupo). Errores: <strong id="er">0</strong></p>' +
      '<div class="ac-pool" id="pool">' + items.map(function (it, i) { return '<button type="button" class="ac-chip" draggable="true" data-i="' + i + '">' + esc(it[0]) + '</button>'; }).join('') + '</div>' +
      '<div class="ac-bins">' + d.bins.map(function (b, i) { return '<div class="ac-bin" data-b="' + i + '"><strong>' + esc(b) + '</strong><div class="ac-in"></div></div>'; }).join('') + '</div><p class="ac-p" id="msg" aria-live="polite"></p>');
    function place(i, b) {
      var chip = $('[data-i="' + i + '"]');
      if (!chip) return;
      if (items[i][1] === b) {
        chip.draggable = false; chip.classList.remove('sel'); chip.classList.add('done'); $('[data-b="' + b + '"] .ac-in').appendChild(chip); sel = null; left--;
        $('#msg').textContent = '¡Correcto!';
        if (!left) { var n = errs === 0 ? 3 : errs <= 2 ? 2 : 1; end('Clasifica', ['Analizar', 'Aplicar'], area, n, 3, 15, 'clasif', function () { clasificar(area); }); }
      } else { errs++; $('#er').textContent = errs; $('#msg').textContent = 'Ese no va ahí. ¡Inténtalo de nuevo!'; chip.classList.add('bad'); setTimeout(function () { chip.classList.remove('bad'); }, 500); }
    }
    $$('.ac-chip').forEach(function (c) {
      c.addEventListener('click', function () { $$('.ac-chip').forEach(function (x) { x.classList.remove('sel'); }); c.classList.add('sel'); sel = +c.getAttribute('data-i'); });
      c.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', c.getAttribute('data-i')); });
    });
    $$('.ac-bin').forEach(function (b) {
      b.addEventListener('click', function () { if (sel !== null) place(sel, +b.getAttribute('data-b')); });
      b.addEventListener('dragover', function (e) { e.preventDefault(); });
      b.addEventListener('drop', function (e) { e.preventDefault(); place(+e.dataTransfer.getData('text/plain'), +b.getAttribute('data-b')); });
    });
  }

  /* ───────── 3. Sopa de letras ───────── */
  function sopa(area) {
    var N = 9, words = SOPA[area], g = [], dirs = [[0, 1], [1, 0], [1, 1]], k, tries;
    for (var r = 0; r < N; r++) { g.push([]); for (var c = 0; c < N; c++) g[r].push(''); }
    mix(words).forEach(function (w) {
      for (tries = 0; tries < 200; tries++) {
        var d = dirs[Math.floor(Math.random() * 3)], r0 = Math.floor(Math.random() * N), c0 = Math.floor(Math.random() * N), ok = true;
        if (r0 + d[0] * (w.length - 1) >= N || c0 + d[1] * (w.length - 1) >= N) continue;
        for (k = 0; k < w.length; k++) { var ch = g[r0 + d[0] * k][c0 + d[1] * k]; if (ch && ch !== w[k]) { ok = false; break; } }
        if (!ok) continue;
        for (k = 0; k < w.length; k++) g[r0 + d[0] * k][c0 + d[1] * k] = w[k];
        break;
      }
    });
    var L = 'ABCDEFGHIJLMNOPRSTUV';
    g.forEach(function (row) { row.forEach(function (_, c) { if (!row[c]) row[c] = L[Math.floor(Math.random() * L.length)]; }); });
    var start = null, found = [], cells = '';
    g.forEach(function (row, r) { row.forEach(function (ch, c) { cells += '<button type="button" class="ac-cell" data-r="' + r + '" data-c="' + c + '">' + ch + '</button>'; }); });
    shell('Sopa de letras · ' + area, ['Recordar'], '<p class="ac-p">Toca la primera y la última letra de cada palabra (horizontal, vertical o diagonal ↘).</p>' +
      '<div class="ac-sopa" style="grid-template-columns:repeat(' + N + ',1fr)">' + cells + '</div><div class="ac-words" id="wl">' + words.map(function (w) { return '<span data-w="' + w + '">' + w + '</span>'; }).join('') + '</div>');
    $$('.ac-cell').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = +b.getAttribute('data-r'), c = +b.getAttribute('data-c');
        if (!start) { start = [r, c]; b.classList.add('sel'); return; }
        var dr = r - start[0], dc = c - start[1], len = Math.max(Math.abs(dr), Math.abs(dc)) + 1, line = [], s = '';
        $$('.ac-cell.sel').forEach(function (x) { x.classList.remove('sel'); });
        if (dr === 0 || dc === 0 || dr === dc) {
          var sr = Math.sign(dr), sc = Math.sign(dc);
          for (k = 0; k < len; k++) { line.push([start[0] + sr * k, start[1] + sc * k]); s += g[start[0] + sr * k][start[1] + sc * k]; }
          var hit = words.filter(function (w) { return w === s && found.indexOf(w) < 0; })[0];
          if (hit) {
            found.push(hit); $('[data-w="' + hit + '"]').classList.add('got');
            line.forEach(function (p) { $('[data-r="' + p[0] + '"][data-c="' + p[1] + '"]').classList.add('ok'); });
            if (found.length === words.length) end('Sopa de letras', ['Recordar'], area, 3, 3, 15, 'sopa', function () { sopa(area); });
          }
        }
        start = null;
      });
    });
  }

  /* ───────── 4. Verdadero o falso ───────── */
  function vf(area) {
    var q = mix(VF[area]), i = 0, ok = 0;
    (function next() {
      if (i >= q.length) return end('Verdadero o falso', ['Evaluar', 'Comprender'], area, ok, q.length, 15, 'vf', function () { vf(area); });
      shell('Verdadero o falso · ' + area, ['Evaluar', 'Comprender'], '<p class="ac-p">Afirmación ' + (i + 1) + ' de ' + q.length + '</p><div class="ac-card"><p class="ac-q">' + esc(q[i][0]) + '</p>' +
        '<div class="ac-row"><button type="button" class="ac-btn ac-v" data-v="1">✅ Verdadero</button><button type="button" class="ac-btn ac-v" data-v="0">❌ Falso</button></div><div id="fb" aria-live="polite"></div></div>');
      $$('.ac-v').forEach(function (b) {
        b.addEventListener('click', function () {
          var good = +b.getAttribute('data-v') === q[i][1]; if (good) ok++;
          $$('.ac-v').forEach(function (x) { x.disabled = true; });
          $('#fb').innerHTML = '<div class="ac-fb ' + (good ? 'g' : 'b') + '"><strong>' + (good ? '¡Correcto!' : 'Revisemos 💪') + '</strong> ' + esc(q[i][2]) + '</div><button type="button" class="ac-btn ac-pri" id="nx">' + (i === q.length - 1 ? 'Ver resultado' : 'Siguiente') + '</button>';
          $('#nx').focus(); $('#nx').addEventListener('click', function () { i++; next(); });
        });
      });
    })();
  }

  /* ───────── 5. Mini-examen con rúbrica ───────── */
  function examen(area) {
    var banco = window.SABERUP_BANCO && window.SABERUP_BANCO[area] && window.SABERUP_BANCO[area].preguntas;
    if (!banco) { shell('Mini-examen', ['Recordar'], '<p class="ac-p">No se pudo cargar el banco de preguntas.</p>'); return; }
    var rub = '<table class="ac-rub"><caption>Rúbrica de evaluación</caption><thead><tr><th>Nivel</th><th>Aciertos</th><th>Qué significa</th></tr></thead><tbody>' +
      RUBRICA.map(function (r) { return '<tr data-n="' + r[0] + '"><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody></table>';
    shell('Mini-examen · ' + area, ['Recordar', 'Comprender', 'Aplicar'], '<p class="ac-p">5 preguntas. No verás las respuestas hasta el final. Así se evalúa:</p>' + rub + '<button type="button" class="ac-btn ac-pri" id="go-ex">Comenzar examen</button>');
    $('#go-ex').addEventListener('click', function () {
      var q = mix(banco).slice(0, 5), i = 0, mis = [], ok = 0;
      (function next() {
        if (i >= q.length) return resultado();
        var o = mix(q[i].o.map(function (t, k) { return { t: t, ok: k === q[i].c }; }));
        shell('Mini-examen · ' + area, ['Recordar', 'Comprender', 'Aplicar'], '<p class="ac-p">Pregunta ' + (i + 1) + ' de 5</p><div class="ac-card"><p class="ac-q">' + esc(q[i].q) + '</p>' +
          o.map(function (x, k) { return '<button type="button" class="ac-btn ac-opt" data-k="' + k + '">' + esc(x.t) + '</button>'; }).join('') + '</div>');
        $$('.ac-opt').forEach(function (b) {
          b.addEventListener('click', function () { var x = o[+b.getAttribute('data-k')]; if (x.ok) ok++; else mis.push({ q: q[i], t: x.t }); i++; next(); });
        });
      })();
      function resultado() {
        var nivel = ok === 5 ? 'Excelente' : ok === 4 ? 'Logrado' : ok === 3 ? 'En proceso' : 'Inicial';
        shell('Resultado · ' + area, ['Recordar', 'Comprender', 'Aplicar'], '<div class="ac-card ac-center"><div class="ac-big">' + ok + ' / 5</div><p class="ac-q">Nivel alcanzado: ' + nivel + '</p></div>' + rub +
          (mis.length ? '<h3 class="ac-h3">Para repasar</h3>' + mis.map(function (m) { return '<div class="ac-fb b"><strong>' + esc(m.q.q) + '</strong><br>Marcaste: ' + esc(m.t) + '<br>Correcta: ' + esc(m.q.o[m.q.c]) + '. ' + esc(m.q.e) + '</div>'; }).join('') : '<p class="ac-p">¡Sin errores! 🎉</p>') +
          '<div class="ac-row"><button type="button" class="ac-btn ac-pri" id="to-ae">Mi autoevaluación</button><button type="button" class="ac-btn" id="rt">Reintentar</button></div>');
        var tr = $('tr[data-n="' + nivel + '"]'); if (tr) tr.classList.add('hit');
        $('#to-ae').addEventListener('click', function () { go('autoevaluacion'); }); $('#rt').addEventListener('click', function () { examen(area); });
        if (P) P.award(5 + ok * 4, ok >= 4 ? 'examen' : null);
      }
    });
  }

  /* ───────── 6. Autoevaluación ───────── */
  function autoeval() {
    var qs = ['Entendí el tema de hoy', 'Puedo explicárselo a otra persona', 'Me sentí motivado(a) aprendiendo'], em = ['😕', '🙂', '😀', '🤩'], vals = [0, 0, 0];
    shell('¿Qué aprendí hoy?', ['Evaluar'], '<p class="ac-p">Autoevaluación: piensa en lo que hiciste y responde con sinceridad.</p><div class="ac-card">' + qs.map(function (t, i) {
      return '<p class="ac-q">' + t + '</p><div class="ac-row" data-q="' + i + '">' + em.map(function (e, k) { return '<button type="button" class="ac-emo" data-v="' + (k + 1) + '" aria-label="Nivel ' + (k + 1) + ' de 4">' + e + '</button>'; }).join('') + '</div>';
    }).join('') + '<label class="ac-l" for="t1">Hoy aprendí…</label><textarea id="t1" maxlength="300" rows="2"></textarea><label class="ac-l" for="t2">Todavía me cuesta…</label><textarea id="t2" maxlength="300" rows="2"></textarea>' +
      '<p class="ac-err" id="er" aria-live="polite"></p><button type="button" class="ac-btn ac-pri" id="sv">Guardar mi autoevaluación</button></div>');
    $$('.ac-emo').forEach(function (b) {
      b.addEventListener('click', function () { var row = b.parentNode; $$('.ac-emo', row).forEach(function (x) { x.classList.remove('sel'); }); b.classList.add('sel'); vals[+row.getAttribute('data-q')] = +b.getAttribute('data-v'); });
    });
    $('#sv').addEventListener('click', function () {
      if (vals.indexOf(0) >= 0) { $('#er').textContent = 'Elige una carita en cada pregunta.'; return; }
      var avg = (vals[0] + vals[1] + vals[2]) / 3, list = store('saberup_autoeval');
      list.push({ f: Date.now(), v: vals, aprendi: $('#t1').value.trim(), cuesta: $('#t2').value.trim() }); store('saberup_autoeval', list);
      shell('¡Gracias por reflexionar!', ['Evaluar'], '<div class="ac-card ac-center"><div class="ac-big">' + em[Math.round(avg) - 1] + '</div><p class="ac-q">' + (avg >= 3 ? '¡Vas muy bien! Sigue explorando nuevos temas.' : avg >= 2 ? 'Buen avance. Repasa lo que te cuesta y lo lograrás.' : 'No te desanimes: practicar un poco cada día te ayuda mucho.') + '</p><p class="ac-p">Autoevaluaciones guardadas: ' + list.length + '</p><button type="button" class="ac-btn ac-pri" id="hb">Volver a actividades</button></div>');
      $('#hb').addEventListener('click', function () { go(''); });
      if (P) P.award(10, 'reflexion');
    });
  }

  /* ───────── 7. Comentarios ───────── */
  function comentarios() {
    var rate = 0;
    shell('Tu opinión nos importa', ['Evaluar'], '<p class="ac-p">Cuéntanos cómo te fue en la plataforma para mejorarla.</p><div class="ac-card">' +
      '<label class="ac-l" for="rol">Soy…</label><select id="rol"><option>Estudiante</option><option>Docente</option><option>Familia</option><option>Otro</option></select>' +
      '<label class="ac-l">¿Cómo la calificas?</label><div class="ac-row" id="st">' + [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" class="ac-emo" data-v="' + n + '" aria-label="' + n + ' estrellas">⭐</button>'; }).join('') + '</div>' +
      '<label class="ac-l" for="c1">¿Qué te gustó?</label><textarea id="c1" maxlength="400" rows="2"></textarea><label class="ac-l" for="c2">¿Qué mejorarías?</label><textarea id="c2" maxlength="400" rows="2"></textarea>' +
      '<label class="ac-l" for="nm">Tu nombre (opcional)</label><input id="nm" maxlength="40" type="text"/><p class="ac-err" id="er" aria-live="polite"></p><button type="button" class="ac-btn ac-pri" id="env">Enviar comentario</button></div>' +
      '<button type="button" class="ac-link" id="ver">Ver comentarios guardados en este dispositivo</button><div id="lst"></div>');
    $$('#st .ac-emo').forEach(function (b) {
      b.addEventListener('click', function () { rate = +b.getAttribute('data-v'); $$('#st .ac-emo').forEach(function (x) { x.classList.toggle('sel', +x.getAttribute('data-v') <= rate); }); });
    });
    $('#ver').addEventListener('click', function () {
      var l = store('saberup_comentarios');
      $('#lst').innerHTML = l.length ? l.slice().reverse().map(function (c) { return '<div class="ac-fb g"><strong>' + esc(c.rol) + (c.n ? ' · ' + esc(c.n) : '') + ' · ' + '⭐'.repeat(c.e) + '</strong><br>👍 ' + esc(c.gusto || '—') + '<br>💡 ' + esc(c.mejora || '—') + '</div>'; }).join('') : '<p class="ac-p">Aún no hay comentarios guardados.</p>';
    });
    $('#env').addEventListener('click', function () {
      if (!rate) { $('#er').textContent = 'Elige cuántas estrellas das.'; return; }
      var c = { f: Date.now(), rol: $('#rol').value, e: rate, gusto: $('#c1').value.trim(), mejora: $('#c2').value.trim(), n: $('#nm').value.trim() };
      var l = store('saberup_comentarios'); l.push(c); store('saberup_comentarios', l);
      if (FORM_URL) { try { fetch(FORM_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(c) }).catch(function () { }); } catch (e) { /* sin red */ } }
      shell('¡Gracias por tu opinión!', ['Evaluar'], '<div class="ac-card ac-center"><div class="ac-big">💚</div><p class="ac-q">Tu comentario nos ayuda a mejorar SaberUp.</p><button type="button" class="ac-btn ac-pri" id="hb">Volver a actividades</button></div>');
      $('#hb').addEventListener('click', function () { go(''); });
      if (P) P.award(10, 'opinion');
    });
  }

  /* ───────── inicio y enrutado ───────── */
  var ACT = [
    ['memoria', 'extension', 'Memoria de parejas', ['Recordar'], 'Une conceptos con su significado.'],
    ['clasificar', 'swap_horiz', 'Arrastra y clasifica', ['Analizar', 'Aplicar'], 'Ordena tarjetas en el grupo correcto.'],
    ['sopa', 'grid_view', 'Sopa de letras', ['Recordar'], 'Encuentra las palabras del tema.'],
    ['vf', 'rule', 'Verdadero o falso', ['Evaluar', 'Comprender'], 'Decide y aprende por qué.'],
    ['examen', 'assignment', 'Mini-examen', ['Recordar', 'Comprender', 'Aplicar'], 'Por tema, con rúbrica visible.'],
    ['autoevaluacion', 'psychology', '¿Qué aprendí hoy?', ['Evaluar'], 'Reflexiona sobre tu aprendizaje.'],
    ['comentarios', 'rate_review', 'Danos tu opinión', ['Evaluar'], 'Ayúdanos a mejorar la plataforma.']
  ];
  function hub() {
    APP.innerHTML = '<h2 class="ac-h">Centro de Actividades</h2><p class="ac-p">Aprende jugando en todas las asignaturas. Cada actividad indica qué nivel de la <strong>Taxonomía de Bloom</strong> trabaja.</p>' + (P ? P.card(true) : '') +
      '<div class="ac-list">' + '<a class="ac-act" href="index.html#juego-saberup"><span class="material-symbols-outlined">sports_esports</span><div><strong>Reto SaberUp</strong><br>' + bl(['Recordar', 'Comprender']) + '<br><small>Preguntas con vidas, puntos y rachas.</small></div></a>' +
      ACT.map(function (a) { return '<button type="button" class="ac-act" data-go="' + a[0] + '"><span class="material-symbols-outlined">' + a[1] + '</span><div><strong>' + a[2] + '</strong><br>' + bl(a[3]) + '<br><small>' + a[4] + '</small></div></button>'; }).join('') + '</div>';
    $$('[data-go]').forEach(function (b) { b.addEventListener('click', function () { go(b.getAttribute('data-go')); }); });
  }
  var JUEGOS = {
    memoria: [memoria, 'Memoria de parejas', ['Recordar'], 'Elige una asignatura y encuentra las 6 parejas.'],
    clasificar: [clasificar, 'Arrastra y clasifica', ['Analizar', 'Aplicar'], 'Elige una asignatura y clasifica las tarjetas.'],
    sopa: [sopa, 'Sopa de letras', ['Recordar'], 'Elige una asignatura y encuentra las palabras.'],
    vf: [vf, 'Verdadero o falso', ['Evaluar', 'Comprender'], 'Elige una asignatura y juzga cada afirmación.'],
    examen: [examen, 'Mini-examen', ['Recordar', 'Comprender', 'Aplicar'], 'Elige el tema del examen. Verás la rúbrica antes de empezar.']
  };
  function route() {
    var v = location.hash.replace('#', '');
    window.scrollTo(0, 0);
    if (JUEGOS[v]) pickArea(JUEGOS[v][1], JUEGOS[v][2], JUEGOS[v][3], JUEGOS[v][0]);
    else if (v === 'autoevaluacion') autoeval();
    else if (v === 'comentarios') comentarios();
    else hub();
  }
  function init() { APP = document.getElementById('actividades-app'); if (!APP) return; window.addEventListener('hashchange', route); route(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
