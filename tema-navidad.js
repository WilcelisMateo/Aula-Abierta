/**
 * tema-navidad.js — Nieve, mensaje de fiestas y foto + nombre en el encabezado de cada página.
 * Se incluye al final de cada página (junto a tema-navidad.css).
 */
(function () {
  'use strict';
  var DEFAULT_NAME = 'Lic. Wilcelis Mateo';
  var DEFAULT_PHOTO = 'foto-perfil.jpg';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn();
  }

  /* ── Foto + nombre en el perfil de cada encabezado ── */
  function profileChip() {
    var header = document.querySelector('header');
    if (!header) return;
    var photo = header.querySelector('img[data-tp="photo"]');
    var hasName = header.querySelector('[data-tp="titleName"]');
    if (photo && !hasName) {
      var n = document.createElement('span');
      n.className = 'nv-name';
      n.setAttribute('data-tp', 'titleName');
      n.textContent = DEFAULT_NAME;
      photo.insertAdjacentElement('afterend', n);
    } else if (!photo) {
      // Páginas sin foto en el encabezado (p. ej. Mi Perfil): se agrega el chip completo
      var inner = header.firstElementChild;
      if (!inner) return;
      var chip = document.createElement('div');
      chip.className = 'nv-chip';
      chip.innerHTML = '<img alt="" data-tp="photo" src="' + DEFAULT_PHOTO + '"/><span class="nv-name" data-tp="titleName"></span>';
      chip.lastChild.textContent = DEFAULT_NAME;
      inner.insertBefore(chip, inner.lastElementChild);
    }
    if (window.refreshTeacherProfile) { try { window.refreshTeacherProfile(); } catch (e) { /* se queda el valor por defecto */ } }
  }

  /* ── Mensaje de fiestas en la portada ── */
  function banner() {
    var isHome = /(^|\/)(index\.html)?$/.test(location.pathname);
    var main = document.querySelector('main');
    if (!isHome || !main || document.querySelector('.nv-banner')) return;
    var b = document.createElement('div');
    b.className = 'nv-banner';
    b.innerHTML = '<strong>🎄 ¡Felices Fiestas! 🎁</strong>' +
      '<small>Que esta Navidad llegue con mucho aprendizaje, alegría y esperanza. ¡Hoy toca aprender jugando! ⛄</small>';
    main.insertBefore(b, main.firstChild);
  }

  /* ── Nieve (se puede apagar; respeta "reducir movimiento") ── */
  function snow() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var on = true;
    try { on = localStorage.getItem('saberup_nieve') !== '0'; } catch (e) { /* sin almacenamiento */ }
    if (reduce) on = false;

    var cv = document.createElement('canvas');
    cv.className = 'nv-snow';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d'), W = 0, H = 0, flakes = [], raf = 0;

    function size() {
      var d = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * d; cv.height = H * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      var n = W < 500 ? 36 : 70;
      while (flakes.length < n) flakes.push(mk(true));
      flakes.length = n;
    }
    function mk(any) {
      return { x: Math.random() * W, y: any ? Math.random() * H : -8, r: 1.2 + Math.random() * 2.6,
               v: 0.5 + Math.random() * 1.1, s: Math.random() * Math.PI * 2 };
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      ctx.shadowColor = 'rgba(22,91,51,.35)'; ctx.shadowBlur = 3;
      flakes.forEach(function (f) {
        f.y += f.v; f.s += 0.015; f.x += Math.sin(f.s) * 0.5;
        if (f.y > H + 8) { var nf = mk(false); f.x = nf.x; f.y = nf.y; }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.2832); ctx.fill();
      });
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf) { size(); raf = requestAnimationFrame(frame); cv.style.display = ''; } }
    function stop() { cancelAnimationFrame(raf); raf = 0; ctx.clearRect(0, 0, W, H); cv.style.display = 'none'; }

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nv-snow-toggle';
    btn.setAttribute('aria-label', 'Activar o desactivar la nieve');
    btn.textContent = '❄️';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.addEventListener('click', function () {
      on = !on;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      try { localStorage.setItem('saberup_nieve', on ? '1' : '0'); } catch (e) { /* ignora */ }
      if (on) start(); else stop();
    });
    document.body.appendChild(btn);
    window.addEventListener('resize', function () { if (on) size(); });
    if (on) start(); else cv.style.display = 'none';
  }

  ready(function () {
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
    m.content = '#165b33';
    profileChip();
    banner();
    snow();
  });
})();
