/**
 * juego-saberup.js — "Reto SaberUp": juego de preguntas para aprender jugando.
 *
 * Se muestra dentro de <section id="juego-saberup"></section> (index.html).
 * Para cambiar o agregar preguntas, edita el arreglo BANCO (más abajo):
 *   { q: 'pregunta', o: ['op1','op2','op3','op4'], c: 1, e: 'explicación' }
 *   c = posición de la respuesta correcta (0 = primera, 1 = segunda...)
 */
(function () {
  'use strict';

  var BANCO = {
    'Ciencias Naturales': { icono: 'science', preguntas: [
      { q: '¿Qué gas toman las plantas del aire para hacer la fotosíntesis?', o: ['Oxígeno', 'Dióxido de carbono', 'Nitrógeno', 'Hidrógeno'], c: 1, e: 'Con luz solar, agua y dióxido de carbono fabrican su alimento y liberan oxígeno.' },
      { q: 'El paso del agua líquida a vapor se llama…', o: ['Condensación', 'Precipitación', 'Evaporación', 'Solidificación'], c: 2, e: 'El calor del Sol evapora el agua de mares y ríos: es el inicio del ciclo del agua.' },
      { q: '¿Cuál es el planeta más cercano al Sol?', o: ['Venus', 'Mercurio', 'Marte', 'Tierra'], c: 1, e: 'Mercurio es el más cercano al Sol y también el más pequeño del sistema solar.' },
      { q: '¿Qué órgano bombea la sangre por todo el cuerpo?', o: ['El pulmón', 'El hígado', 'El corazón', 'El estómago'], c: 2, e: 'El corazón es un músculo que impulsa la sangre a través de arterias y venas.' },
      { q: 'El hielo es agua en estado…', o: ['Líquido', 'Gaseoso', 'Sólido', 'Plasma'], c: 2, e: 'Al enfriarse a 0 °C el agua se solidifica y forma hielo.' },
      { q: '¿Cuál de estos animales es un mamífero?', o: ['Tiburón', 'Delfín', 'Cocodrilo', 'Pulpo'], c: 1, e: 'El delfín respira aire con pulmones y alimenta a sus crías con leche, aunque vive en el mar.' }
    ]},
    'Matemática': { icono: 'calculate', preguntas: [
      { q: '¿Cuánto es 7 × 8?', o: ['54', '56', '63', '48'], c: 1, e: '7 × 8 = 56. Truco: 5, 6, 7, 8 → 56 = 7 × 8.' },
      { q: '¿Cuál es la mitad de 250?', o: ['115', '120', '125', '150'], c: 2, e: 'Dividir entre 2: 250 ÷ 2 = 125.' },
      { q: 'Los ángulos interiores de un triángulo suman…', o: ['90°', '180°', '270°', '360°'], c: 1, e: 'En cualquier triángulo los tres ángulos suman siempre 180°.' },
      { q: '¿Cuánto es 3/4 de 20?', o: ['5', '12', '15', '16'], c: 2, e: '20 ÷ 4 = 5 y 5 × 3 = 15.' },
      { q: '¿Cuál es el perímetro de un cuadrado de 6 cm de lado?', o: ['12 cm', '24 cm', '36 cm', '18 cm'], c: 1, e: 'El perímetro suma los 4 lados: 6 + 6 + 6 + 6 = 24 cm.' },
      { q: '¿Cuánto es el 15 % de 200?', o: ['15', '20', '30', '35'], c: 2, e: '10 % de 200 es 20 y 5 % es 10; 20 + 10 = 30.' }
    ]},
    'Lengua Española': { icono: 'menu_book', preguntas: [
      { q: '¿Cuál de estas palabras es aguda?', o: ['Árbol', 'Canción', 'Teléfono', 'Mesa'], c: 1, e: 'Can-CIÓN: la sílaba más fuerte es la última. Termina en n y lleva tilde.' },
      { q: 'Un sinónimo de «feliz» es…', o: ['Triste', 'Cansado', 'Contento', 'Molesto'], c: 2, e: 'Los sinónimos son palabras con significado parecido: feliz y contento.' },
      { q: '¿Cuál palabra está bien escrita?', o: ['Exivir', 'Exibir', 'Exhibir', 'Ehxibir'], c: 2, e: 'Se escribe «exhibir», con h después de la x.' },
      { q: 'Un antónimo de «generoso» es…', o: ['Amable', 'Tacaño', 'Valiente', 'Alegre'], c: 1, e: 'Los antónimos significan lo contrario: generoso ↔ tacaño.' },
      { q: 'En «El niño corre rápido», ¿cuál es el verbo?', o: ['niño', 'El', 'corre', 'rápido'], c: 2, e: 'El verbo expresa la acción: corre.' },
      { q: 'En español, una pregunta se escribe entre los signos…', o: ['¿ ?', '¡ !', '« »', '( )'], c: 0, e: 'Las preguntas llevan signo de apertura (¿) y de cierre (?).' }
    ]},
    'Ciencias Sociales': { icono: 'public', preguntas: [
      { q: '¿Cuál es la capital de la República Dominicana?', o: ['Santiago', 'La Romana', 'Santo Domingo', 'Puerto Plata'], c: 2, e: 'Santo Domingo, fundada en 1496, es la ciudad más antigua de América con vida continua.' },
      { q: '¿Qué día celebramos la Independencia Nacional?', o: ['16 de agosto', '27 de febrero', '24 de septiembre', '12 de octubre'], c: 1, e: 'El 27 de febrero de 1844 se proclamó la independencia frente a Haití.' },
      { q: '¿Quiénes son los Padres de la Patria?', o: ['Duarte, Sánchez y Mella', 'Luperón, Gregorio y Heureaux', 'Trujillo, Balaguer y Bosch', 'Colón, Ovando y Cortés'], c: 0, e: 'Juan Pablo Duarte, Francisco del Rosario Sánchez y Matías Ramón Mella.' },
      { q: '¿Cuál es el pico más alto del Caribe?', o: ['Pico Duarte', 'Loma Redonda', 'Monte Isabel de Torres', 'Loma Miranda'], c: 0, e: 'El Pico Duarte mide unos 3,098 metros y está en la Cordillera Central.' },
      { q: '¿Con qué país compartimos la isla La Española?', o: ['Cuba', 'Jamaica', 'Puerto Rico', 'Haití'], c: 3, e: 'La isla se divide entre la República Dominicana y Haití.' },
      { q: '¿Qué fecha recuerda la Guerra de la Restauración?', o: ['16 de agosto', '27 de febrero', '6 de enero', '1 de mayo'], c: 0, e: 'El 16 de agosto de 1863 se inició la Restauración de la República.' }
    ]}
  };

  var MIXTO = 'Reto mixto';
  var VIDAS = 3;
  var ROOT = null;
  var G = null; // estado de la partida

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function barajar(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function mejor(area) {
    try { return +(JSON.parse(localStorage.getItem('saberup_mejor') || '{}')[area] || 0); } catch (e) { return 0; }
  }
  function guardarMejor(area, pts) {
    try {
      var m = JSON.parse(localStorage.getItem('saberup_mejor') || '{}');
      if (pts > (m[area] || 0)) { m[area] = pts; localStorage.setItem('saberup_mejor', JSON.stringify(m)); return true; }
    } catch (e) { /* sin almacenamiento: el juego sigue funcionando */ }
    return false;
  }

  function css() {
    if (document.getElementById('sg-css')) return;
    var s = document.createElement('style');
    s.id = 'sg-css';
    s.textContent = [
      '.sg{position:relative;border:2px solid #d4a72c;background:linear-gradient(160deg,#0a2e1f,#165b33 60%,#1f6b3e);color:#fff;border-radius:20px;padding:20px;box-shadow:0 6px 20px rgba(0,9,34,.18);font-family:"Source Sans 3",system-ui,sans-serif}',
      '.sg::before{content:"🎄";position:absolute;top:-16px;right:16px;font-size:30px}',
      '.sg h2{margin:0;font:700 24px/30px Literata,Georgia,serif}',
      '.sg p{margin:6px 0 0;color:#dcefe0;font-size:16px;line-height:24px}',
      '.sg-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.14);border-radius:999px;padding:4px 12px;font:600 12px/16px "Source Sans 3",sans-serif;letter-spacing:.05em;text-transform:uppercase;margin-bottom:10px}',
      '.sg-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}',
      '.sg-btn{border:0;cursor:pointer;font:600 16px/22px "Source Sans 3",sans-serif;border-radius:14px;padding:14px 12px;text-align:left;transition:transform .12s,background .15s}',
      '.sg-btn:active{transform:scale(.97)}',
      '.sg-area{background:#fff;color:#0a2e1f;display:flex;flex-direction:column;gap:4px}',
      '.sg-area:hover{background:#dcefe0}',
      '.sg-area .material-symbols-outlined{font-size:26px;color:#b3202a}',
      '.sg-area small{font-weight:400;font-size:13px;color:#4a4944}',
      '.sg-mix{grid-column:1/-1;background:#ffd166;color:#3b2a00;flex-direction:row;align-items:center;gap:10px}',
      '.sg-mix:hover{background:#ffe08a}',
      '.sg-top{display:flex;justify-content:space-between;align-items:center;gap:8px;font-weight:600;font-size:15px}',
      '.sg-pill{background:rgba(255,255,255,.14);border-radius:999px;padding:4px 12px}',
      '.sg-bar{height:8px;border-radius:99px;background:rgba(255,255,255,.2);margin:12px 0;overflow:hidden}',
      '.sg-bar i{display:block;height:100%;background:#4edea3;border-radius:99px;transition:width .3s}',
      '.sg-q{font:600 20px/28px Literata,Georgia,serif;margin:6px 0 14px}',
      '.sg-opts{display:flex;flex-direction:column;gap:10px}',
      '.sg-opt{background:#fff;color:#0a2e1f}',
      '.sg-opt:hover:not(:disabled){background:#dcefe0}',
      '.sg-opt:disabled{cursor:default}',
      '.sg-opt.ok{background:#4edea3;color:#002113}',
      '.sg-opt.no{background:#ffdad6;color:#93000a}',
      '.sg-opt.dim{opacity:.55}',
      '.sg-fb{margin-top:14px;background:rgba(255,255,255,.12);border-radius:14px;padding:12px 14px;font-size:15px;line-height:22px}',
      '.sg-fb strong{display:block;font-size:17px;margin-bottom:2px}',
      '.sg-next{background:#4edea3;color:#002113;margin-top:12px;width:100%;text-align:center}',
      '.sg-next:hover{background:#6ffbbe}',
      '.sg-alt{background:rgba(255,255,255,.14);color:#fff;text-align:center}',
      '.sg-alt:hover{background:rgba(255,255,255,.24)}',
      '.sg-end{text-align:center}',
      '.sg-stars{font-size:38px;letter-spacing:6px;margin:6px 0}',
      '.sg-score{font:700 44px/52px Literata,Georgia,serif;color:#6ffbbe}',
      '.sg-row{display:flex;gap:10px;margin-top:16px}.sg-row .sg-btn{flex:1;text-align:center}',
      '.sg-btn:focus-visible{outline:3px solid #6ffbbe;outline-offset:2px}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ───── pantallas ───── */
  function menu() {
    G = null;
    var h = '<span class="sg-badge"><span class="material-symbols-outlined" style="font-size:16px" aria-hidden="true">sports_esports</span>Aprende jugando</span>' +
      '<h2>Reto SaberUp</h2><p>Responde, suma puntos y conserva tus 3 vidas. Después de cada pregunta aprenderás por qué.</p>' +
      '<div class="sg-grid">';
    Object.keys(BANCO).forEach(function (a) {
      var b = mejor(a);
      h += '<button type="button" class="sg-btn sg-area" data-area="' + esc(a) + '">' +
        '<span class="material-symbols-outlined" aria-hidden="true">' + BANCO[a].icono + '</span>' + esc(a) +
        '<small>' + (b ? 'Mejor: ' + b + ' pts' : '6 preguntas') + '</small></button>';
    });
    h += '<button type="button" class="sg-btn sg-area sg-mix" data-area="' + MIXTO + '">' +
      '<span class="material-symbols-outlined" aria-hidden="true">shuffle</span><span>' + MIXTO +
      '<small style="display:block">8 preguntas de todas las áreas' + (mejor(MIXTO) ? ' · Mejor: ' + mejor(MIXTO) + ' pts' : '') + '</small></span></button></div>';
    ROOT.innerHTML = '<div class="sg">' + h + '</div>';
    Array.prototype.forEach.call(ROOT.querySelectorAll('[data-area]'), function (b) {
      b.addEventListener('click', function () { empezar(b.getAttribute('data-area')); });
    });
  }

  function empezar(area) {
    var lista;
    if (area === MIXTO) {
      lista = [];
      Object.keys(BANCO).forEach(function (a) { lista = lista.concat(BANCO[a].preguntas); });
      lista = barajar(lista).slice(0, 8);
    } else {
      lista = barajar(BANCO[area].preguntas);
    }
    G = { area: area, lista: lista, i: 0, pts: 0, vidas: VIDAS, racha: 0, aciertos: 0, respondida: false };
    pregunta();
  }

  function pregunta() {
    var p = G.lista[G.i];
    // Se barajan las opciones recordando cuál es la correcta
    var ops = barajar(p.o.map(function (t, k) { return { t: t, ok: k === p.c }; }));
    G.ops = ops; G.respondida = false;
    var vidas = '';
    for (var v = 0; v < VIDAS; v++) vidas += v < G.vidas ? '❤️' : '🤍';
    var h = '<div class="sg-top"><span class="sg-pill">' + esc(G.area) + '</span><span aria-label="Vidas">' + vidas + '</span><span class="sg-pill">⭐ ' + G.pts + '</span></div>' +
      '<div class="sg-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + G.lista.length + '" aria-valuenow="' + G.i + '"><i style="width:' + (G.i / G.lista.length * 100) + '%"></i></div>' +
      '<p style="margin:0;font-size:14px">Pregunta ' + (G.i + 1) + ' de ' + G.lista.length + (G.racha > 1 ? ' · 🔥 Racha x' + G.racha : '') + '</p>' +
      '<div class="sg-q">' + esc(p.q) + '</div><div class="sg-opts">';
    ops.forEach(function (o, k) { h += '<button type="button" class="sg-btn sg-opt" data-k="' + k + '">' + esc(o.t) + '</button>'; });
    h += '</div><div id="sg-fb" aria-live="polite"></div>';
    ROOT.innerHTML = '<div class="sg">' + h + '</div>';
    Array.prototype.forEach.call(ROOT.querySelectorAll('.sg-opt'), function (b) {
      b.addEventListener('click', function () { responder(+b.getAttribute('data-k')); });
    });
  }

  function responder(k) {
    if (G.respondida) return;
    G.respondida = true;
    var p = G.lista[G.i], acierto = G.ops[k].ok, extra = 0;
    if (acierto) {
      G.racha++; G.aciertos++;
      extra = Math.min(G.racha - 1, 3) * 2;
      G.pts += 10 + extra;
    } else { G.racha = 0; G.vidas--; }

    Array.prototype.forEach.call(ROOT.querySelectorAll('.sg-opt'), function (b, idx) {
      b.disabled = true;
      if (G.ops[idx].ok) b.classList.add('ok');
      else if (idx === k) b.classList.add('no');
      else b.classList.add('dim');
    });
    var ultima = G.i === G.lista.length - 1 || G.vidas === 0;
    var fb = '<div class="sg-fb"><strong>' + (acierto ? '¡Correcto! +' + (10 + extra) + ' pts' + (extra ? ' (racha 🔥)' : '') : 'Casi. Se aprende de cada intento 💪') + '</strong>' + esc(p.e) + '</div>' +
      '<button type="button" class="sg-btn sg-next" id="sg-next">' + (ultima ? 'Ver resultado' : 'Siguiente pregunta') + '</button>';
    document.getElementById('sg-fb').innerHTML = fb;
    var nx = document.getElementById('sg-next');
    nx.focus();
    nx.addEventListener('click', function () {
      if (ultima) fin(); else { G.i++; pregunta(); }
    });
  }

  function fin() {
    var total = G.lista.length, pct = G.aciertos / total;
    var estrellas = pct >= 0.84 ? 3 : pct >= 0.5 ? 2 : G.aciertos > 0 ? 1 : 0;
    var rec = guardarMejor(G.area, G.pts);
    var msg = G.vidas === 0 ? 'Se acabaron las vidas, ¡pero ya aprendiste algo nuevo!' :
      estrellas === 3 ? '¡Excelente! Dominas este tema.' : estrellas === 2 ? '¡Muy bien! Un repaso más y lo logras.' : 'Buen comienzo. ¡Inténtalo otra vez!';
    var st = '';
    for (var s = 0; s < 3; s++) st += s < estrellas ? '⭐' : '☆';
    var area = G.area;
    ROOT.innerHTML = '<div class="sg sg-end"><span class="sg-badge">Resultado · ' + esc(area) + '</span>' +
      '<div class="sg-stars" aria-label="' + estrellas + ' de 3 estrellas">' + st + '</div>' +
      '<div class="sg-score">' + G.pts + ' pts</div>' +
      '<p>' + G.aciertos + ' de ' + total + ' respuestas correctas</p><p>' + msg + (rec && G.pts > 0 ? ' 🏆 ¡Nuevo récord!' : '') + '</p>' +
      '<div class="sg-row"><button type="button" class="sg-btn sg-next" id="sg-again" style="margin-top:0">Jugar otra vez</button>' +
      '<button type="button" class="sg-btn sg-alt" id="sg-menu">Cambiar de área</button></div></div>';
    document.getElementById('sg-again').addEventListener('click', function () { empezar(area); });
    document.getElementById('sg-menu').addEventListener('click', menu);
  }

  function init() {
    ROOT = document.getElementById('juego-saberup');
    if (!ROOT) return;
    css();
    menu();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
