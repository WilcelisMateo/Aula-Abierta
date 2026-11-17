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
    'Agropecuaria': { icono: 'agriculture', preguntas: [
      { q: '¿Qué nutriente principal aportan los materiales verdes al compost?', o: ['Nitrógeno', 'Calcio', 'Hierro', 'Sodio'], c: 0, e: 'Los restos frescos aportan nitrógeno; los secos aportan carbono.' },
      { q: '¿Qué pH del suelo es el más favorable para la mayoría de los cultivos?', o: ['Muy ácido (3 a 4)', 'Ligeramente ácido a neutro (6 a 7)', 'Muy alcalino (9 a 10)', 'Cualquier pH sirve igual'], c: 1, e: 'En ese rango las plantas aprovechan mejor los nutrientes.' },
      { q: '¿Qué práctica ayuda a conservar la fertilidad del suelo y a reducir plagas?', o: ['Rotación de cultivos', 'Sembrar siempre lo mismo', 'Dejar el suelo sin cobertura', 'Quemar los residuos'], c: 0, e: 'Alternar cultivos equilibra los nutrientes y rompe el ciclo de las plagas.' },
      { q: 'El riego por goteo se caracteriza por…', o: ['Inundar toda la parcela', 'Aplicar el agua gota a gota cerca de la raíz', 'Regar solo con lluvia', 'Usar mangueras sin control'], c: 1, e: 'Ahorra agua porque la entrega justo donde la planta la necesita.' },
      { q: '¿Cuál de estos es un cultivo de ciclo corto?', o: ['Cacao', 'Mango', 'Tomate', 'Palma de coco'], c: 2, e: 'El tomate se cosecha en pocos meses; los otros son cultivos perennes.' },
      { q: 'En las Buenas Prácticas Agrícolas, ¿para qué sirve el registro de campo?', o: ['Para decorar la finca', 'Para documentar siembra, aplicaciones y cosecha', 'Para vender más caro', 'No sirve'], c: 1, e: 'Permite la trazabilidad y mejora la calidad e inocuidad.' }
    ]},
    'Gestión Administrativa y Tributaria': { icono: 'receipt_long', preguntas: [
      { q: 'En contabilidad, la partida doble significa que…', o: ['Se registra todo dos veces al mes', 'Todo débito tiene un crédito de igual valor', 'Solo se usan dos cuentas', 'Se duplica el inventario'], c: 1, e: 'Por eso los asientos siempre quedan balanceados.' },
      { q: '¿Cuál es la tasa general del ITBIS en la República Dominicana?', o: ['8 %', '12 %', '18 %', '25 %'], c: 2, e: 'La tasa general es del 18 %, con algunas excepciones.' },
      { q: '¿Qué institución autoriza los números de comprobante fiscal (NCF)?', o: ['DGII', 'Banco Central', 'TSS', 'MINERD'], c: 0, e: 'La Dirección General de Impuestos Internos administra los impuestos internos.' },
      { q: 'La ecuación contable básica es…', o: ['Activo = Pasivo + Patrimonio', 'Activo = Gastos + Ingresos', 'Pasivo = Activo + Patrimonio', 'Patrimonio = Pasivo × Activo'], c: 0, e: 'Los bienes de la empresa se financian con deudas o con aportes propios.' },
      { q: '¿Cuál es el documento fuente de una venta?', o: ['El balance general', 'La factura', 'El libro mayor', 'El estado de resultados'], c: 1, e: 'La factura respalda la operación y da origen al asiento.' },
      { q: '¿Qué tipo de cuentas aumentan por el débito?', o: ['Pasivos e ingresos', 'Activos y gastos', 'Solo el patrimonio', 'Ninguna'], c: 1, e: 'Activos y gastos aumentan por el débito; pasivos, patrimonio e ingresos por el crédito.' }
    ]},
    'Informática y Comunicaciones': { icono: 'computer', preguntas: [
      { q: '¿Qué es un algoritmo?', o: ['Un virus informático', 'Una secuencia ordenada de pasos para resolver un problema', 'Un tipo de monitor', 'Un lenguaje de marcado'], c: 1, e: 'Es la base de cualquier programa.' },
      { q: '¿Cuál es un ejemplo de estructura repetitiva?', o: ['si… entonces', 'mientras… / para…', 'leer un dato', 'escribir un resultado'], c: 1, e: 'Los ciclos repiten instrucciones mientras se cumple una condición.' },
      { q: '¿Qué significan las siglas CPU?', o: ['Unidad Central de Procesamiento', 'Control Personal de Usuario', 'Código Principal Universal', 'Computadora Portátil Ultra'], c: 0, e: 'Es el procesador: ejecuta las instrucciones del equipo.' },
      { q: 'La regla de respaldo 3-2-1 indica…', o: ['3 discos, 2 clics y 1 nube', '3 copias, en 2 tipos de medios, con 1 fuera del lugar', '3 contraseñas, 2 usuarios y 1 antivirus', '3 equipos, 2 redes y 1 servidor'], c: 1, e: 'Así proteges tus datos aunque falle un medio o ocurra un desastre local.' },
      { q: '¿Qué es el phishing?', o: ['Un tipo de respaldo', 'Un engaño para robar datos haciéndose pasar por una entidad de confianza', 'Una red inalámbrica', 'Un programa de edición'], c: 1, e: 'Desconfía de mensajes urgentes y enlaces dudosos.' },
      { q: '¿Qué memoria pierde su contenido al apagar el equipo?', o: ['El disco duro', 'La memoria RAM', 'Una memoria USB', 'El disco SSD'], c: 1, e: 'La RAM es memoria temporal de trabajo.' }
    ]},
    'Enfermería': { icono: 'medical_services', preguntas: [
      { q: '¿Cuántos momentos de higiene de manos define la OMS?', o: ['3', '4', '5', '7'], c: 2, e: 'Son 5 momentos, desde antes del contacto con el paciente hasta después del contacto con su entorno.' },
      { q: 'La frecuencia cardíaca normal de un adulto en reposo es…', o: ['20 a 40 lpm', '60 a 100 lpm', '120 a 160 lpm', '200 lpm'], c: 1, e: 'Más de 100 lpm es taquicardia y menos de 60 es bradicardia.' },
      { q: 'La fricción con preparado de base alcohólica dura…', o: ['2 a 3 segundos', '5 segundos', '20 a 30 segundos', '5 minutos'], c: 2, e: 'Cubre todas las superficies de las manos hasta que se sequen.' },
      { q: 'La temperatura corporal normal de un adulto ronda…', o: ['30 a 32 °C', '36.1 a 37.2 °C', '38.5 a 39.5 °C', '40 °C'], c: 1, e: 'Por encima de 38 °C se considera fiebre.' },
      { q: '¿Qué medida previene las infecciones cruzadas entre pacientes?', o: ['Compartir los guantes', 'La higiene de manos', 'Usar la misma bata todo el turno', 'Evitar la mascarilla'], c: 1, e: 'Es la medida más simple y eficaz.' },
      { q: 'La presión arterial normal en un adulto es…', o: ['Menor de 120/80 mmHg', '200/120 mmHg', '80/40 mmHg', 'Mayor de 180/110 mmHg'], c: 0, e: 'Valores persistentes más altos requieren valoración.' }
    ]}
  };

  // Preguntas basadas en los recursos descargables (guía de compost, rúbrica del asiento, ficha de pseudocódigo, lista de cotejo)
  BANCO["Agropecuaria"].preguntas.push({ q: "Según la guía de compost, ¿cada cuánto se voltea la pila?", o: ["Cada 7 a 10 días", "Una vez al año", "Todos los días", "Nunca"], c: 0, e: "Voltear airea la pila y acelera la descomposición." },
    { q: "¿Cómo debe quedar la humedad del compost?", o: ["Seca como polvo", "Como una esponja escurrida", "Encharcada", "Congelada"], c: 1, e: "Ni muy seca ni encharcada: así trabajan los microorganismos." });
  BANCO["Gestión Administrativa y Tributaria"].preguntas.push({ q: "Compra de mercancía al contado por RD$ 10,000: ¿qué cuenta se debita?", o: ["Efectivo en caja", "Inventario de mercancías", "Ventas", "Cuentas por pagar"], c: 1, e: "El inventario (activo) aumenta por el débito; el efectivo disminuye por el crédito." },
    { q: "Un alquiler pagado en efectivo se registra con débito a…", o: ["Gasto de alquiler", "Ventas", "Cuentas por cobrar", "Patrimonio"], c: 0, e: "Los gastos aumentan por el débito y el efectivo disminuye por el crédito." });
  BANCO["Informática y Comunicaciones"].preguntas.push({ q: "En el ejemplo del ITBIS, ¿qué hace «itbis = precio * 0.18»?", o: ["Calcula el 18 % del precio", "Suma 18 al precio", "Resta el ITBIS", "Lee el precio"], c: 0, e: "Multiplica el precio por 0.18, que equivale al 18 %." },
    { q: "¿Qué estructura usa «Si nota >= 70 entonces Aprobado»?", o: ["Secuencial", "Condicional", "Repetitiva", "Ninguna"], c: 1, e: "Decide entre caminos según una condición." });
  BANCO["Enfermería"].preguntas.push({ q: "¿Cuál es el momento 2 de higiene de manos de la OMS?", o: ["Después del contacto con el paciente", "Antes de realizar una tarea limpia o aséptica", "Después de tocar el entorno", "Al terminar el turno"], c: 1, e: "Es antes de una tarea limpia o aséptica, como preparar un medicamento." },
    { q: "Si las manos están visiblemente sucias, ¿qué se hace?", o: ["Solo fricción con alcohol", "Lavado con agua y jabón de 40 a 60 segundos", "Usar guantes y seguir", "Secarlas al aire"], c: 1, e: "Con suciedad visible se prefiere agua y jabón." });

  window.SABERUP_BANCO = BANCO; // lo usa el mini-examen de actividades.html
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
      '.sg-daily{grid-column:1/-1;display:flex;align-items:center;gap:10px;background:#ffd166;color:#3b2a00}',
      '.sg-daily:hover{background:#ffe08a}',
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

  /* ───── Reto del día (según la fecha real de República Dominicana) ───── */
  function F() { return window.SaberUpFecha; }
  function fkey() { return F() ? F().clave() : new Date().toISOString().slice(0, 10); }
  function diaIdx() { return F() ? F().diaAnio() : Math.floor(Date.now() / 86400000); }
  function hoyTxt() { return F() ? F().fmt(new Date(), { weekday: 'long', day: 'numeric', month: 'long' }) : ''; }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = seed >>> 0; return function () { a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function areaDelDia() { var ks = Object.keys(BANCO); return ks[diaIdx() % ks.length]; }
  function listaDelDia(area) {
    var r = rng(hash(fkey() + area)), a = BANCO[area].preguntas.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a.slice(0, 5);
  }
  function diario() { try { return JSON.parse(localStorage.getItem('saberup_reto_dia')) || {}; } catch (e) { return {}; } }
  function empezarDia() {
    var area = areaDelDia();
    G = { area: area, lista: listaDelDia(area), i: 0, pts: 0, vidas: VIDAS, racha: 0, aciertos: 0, respondida: false, daily: true };
    pregunta();
  }

  function dailyCard() {
    var d = diario(), hecho = d.ultimo === fkey(), area = areaDelDia();
    return '<button type="button" class="sg-btn sg-daily" id="sg-daily"><span class="material-symbols-outlined" aria-hidden="true">today</span><span>🎯 Reto del día · ' + esc(hoyTxt()) +
      '<small style="display:block">Área: ' + esc(area) + ' · 5 preguntas · ' + (hecho ? '✅ ¡Completado hoy!' : '+10 XP extra') + (d.racha ? ' · 🔥 Racha: ' + d.racha + ' día(s)' : '') + '</small></span></button>';
  }

  function menu() {
    G = null;
    var h = '<span class="sg-badge"><span class="material-symbols-outlined" style="font-size:16px" aria-hidden="true">sports_esports</span>Aprende jugando</span>' +
      '<h2>Reto SaberUp</h2><p>Responde, suma puntos y conserva tus 3 vidas. Aprenderás por qué después de cada pregunta.</p>' +
      '<div style="margin-top:8px">' + (window.SaberUpProgreso ? SaberUpProgreso.bloom(['Recordar', 'Comprender']) : '') + '</div>' +
      (window.SaberUpProgreso ? SaberUpProgreso.card(false) : '') +
      '<div class="sg-grid">' + dailyCard();
    Object.keys(BANCO).forEach(function (a) {
      var b = mejor(a);
      h += '<button type="button" class="sg-btn sg-area" data-area="' + esc(a) + '">' +
        '<span class="material-symbols-outlined" aria-hidden="true">' + BANCO[a].icono + '</span>' + esc(a) +
        '<small>' + (b ? 'Mejor: ' + b + ' pts' : '6 preguntas') + '</small></button>';
    });
    h += '<button type="button" class="sg-btn sg-area sg-mix" data-area="' + MIXTO + '">' +
      '<span class="material-symbols-outlined" aria-hidden="true">shuffle</span><span>' + MIXTO +
      '<small style="display:block">8 preguntas de las 4 áreas técnicas' + (mejor(MIXTO) ? ' · Mejor: ' + mejor(MIXTO) + ' pts' : '') + '</small></span></button></div>';
    ROOT.innerHTML = '<div class="sg">' + h + '</div>';
    Array.prototype.forEach.call(ROOT.querySelectorAll('[data-area]'), function (b) {
      b.addEventListener('click', function () { empezar(b.getAttribute('data-area')); });
    });
    var dd = document.getElementById('sg-daily'); if (dd) dd.addEventListener('click', empezarDia);
  }

  function empezar(area) {
    var lista;
    if (area === MIXTO) {
      lista = [];
      Object.keys(BANCO).forEach(function (a) { lista = lista.concat(BANCO[a].preguntas); });
      lista = barajar(lista).slice(0, 8);
    } else {
      lista = barajar(BANCO[area].preguntas).slice(0, 6);
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
    var h = '<div class="sg-top"><span class="sg-pill">' + (G.daily ? '🎯 ' : '') + esc(G.area) + '</span><span aria-label="Vidas">' + vidas + '</span><span class="sg-pill">⭐ ' + G.pts + '</span></div>' +
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
      G.racha++; G.aciertos++; G.maxR = Math.max(G.maxR || 0, G.racha);
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
    if (window.SaberUpProgreso) {
      var badge = estrellas === 3 ? 'estrellas' : (G.maxR >= 3 ? 'racha' : 'primera');
      SaberUpProgreso.award(5 + Math.round(G.pts / 2), badge);
      if (G.daily && diario().ultimo !== fkey()) {
        var dd0 = diario(), ayer = F() ? F().clave(F().add(-1)) : '', racha = dd0.ultimo === ayer ? (dd0.racha || 0) + 1 : 1;
        try { localStorage.setItem('saberup_reto_dia', JSON.stringify({ ultimo: fkey(), racha: racha })); } catch (e) { /* sin almacenamiento */ }
        G.rachaDia = racha;
        setTimeout(function () { SaberUpProgreso.award(10, racha >= 3 ? 'constancia' : null); }, 1600);
      }
    }
    ROOT.innerHTML = '<div class="sg sg-end"><span class="sg-badge">Resultado · ' + esc(area) + '</span>' +
      '<div class="sg-stars" aria-label="' + estrellas + ' de 3 estrellas">' + st + '</div>' +
      '<div class="sg-score">' + G.pts + ' pts</div>' +
      (G.daily ? '<p>🎯 Reto del día' + (G.rachaDia ? ' · 🔥 Racha: ' + G.rachaDia + ' día(s)' : ' (ya lo habías completado hoy)') + '</p>' : '') + '<p>' + G.aciertos + ' de ' + total + ' respuestas correctas</p><p>' + msg + (rec && G.pts > 0 ? ' 🏆 ¡Nuevo récord!' : '') + '</p>' +
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
    if (location.hash === '#reto-del-dia') { empezarDia(); ROOT.scrollIntoView(); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
