/** descargas.js — Descarga real de los recursos didácticos (carpeta /recursos) y catálogo para el buscador. */
(function () {
  'use strict';
  var REC = [
    { k: ['compost', 'suelo'], file: 'Guia_Compost_Suelo_Finca.pdf', q: 'compost', title: 'Guía práctica: compost y manejo del suelo', desc: 'Agropecuaria · 4to · con registro y rúbrica' },
    { k: ['asiento', 'contable', 'partida doble'], file: 'Rubrica_Asiento_Contable.pdf', q: 'asiento contable', title: 'Rúbrica y práctica: el asiento contable', desc: 'Gestión Administrativa y Tributaria · 4to' },
    { k: ['pseudocodigo', 'algoritmo'], file: 'Ficha_Pseudocodigo_Algoritmos.pdf', q: 'algoritmos', title: 'Ficha de ejercicios: algoritmos y pseudocódigo', desc: 'Informática y Comunicaciones · 4to · con solucionario' },
    { k: ['higiene de manos', 'higiene manos', 'lista cotejo', 'cotejo'], file: 'Lista_Cotejo_Higiene_Manos_OMS.pdf', q: 'higiene de manos', title: 'Lista de cotejo: higiene de manos (OMS)', desc: 'Enfermería · 5to · 5 momentos de la OMS' }
  ];
  window.SABERUP_RECURSOS = REC;

  function norm(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[_\-.]+/g, ' '); }
  function fileFor(text) {
    var t = norm(text);
    for (var i = 0; i < REC.length; i++) for (var j = 0; j < REC[i].k.length; j++) if (t.indexOf(REC[i].k[j]) >= 0) return REC[i];
    return null;
  }
  function toast(msg) {
    var e = document.createElement('div');
    e.setAttribute('role', 'status');
    e.textContent = msg;
    e.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:96px;z-index:500;background:#0a2e1f;color:#fff;border:2px solid #d4a72c;padding:12px 18px;border-radius:12px;font:600 14px/20px "Source Sans 3",sans-serif;max-width:90vw;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.3)';
    document.body.appendChild(e); setTimeout(function () { e.remove(); }, 2800);
  }
  function dl(r) {
    var a = document.createElement('a');
    a.href = r.file; a.download = r.file.split('/').pop(); a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    toast('⬇️ Descargando: ' + a.download);
  }
  function recFor(subject) {
    var t = norm(subject || '');
    return /agropec/.test(t) ? REC[0] : /gestion|tributar/.test(t) ? REC[1] : /informat/.test(t) ? REC[2] : /enfermer/.test(t) ? REC[3] : REC[0];
  }
  function byText(text) { var r = fileFor(text); if (r) dl(r); return !!r; }
  window.SaberUpDescargas = { byText: byText, toast: toast };

  // Recursos: botones de las tarjetas y del modal; Lectura: «Descargar Guía».
  // Se aplica de nuevo al terminar de cargar la página para imponerse a los textos de ejemplo.
  function override() {
    window.triggerDownload = function (name) {
      if (!byText(name)) toast('Este recurso todavía no está disponible para descargar.');
    };
    window.simulateResourceDownload = function (btn) {
      var old = btn.innerHTML;
      dl(recFor(window.__saberupArt && window.__saberupArt.subject));
      btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check_circle</span> <span>¡Descargado!</span>';
      setTimeout(function () { btn.innerHTML = old; }, 2200);
    };
  }
  override();
  window.addEventListener('DOMContentLoaded', override);
  window.addEventListener('load', override);

  function init() {
    // Portada: «Descargar Guía»
    Array.prototype.forEach.call(document.querySelectorAll('button, a'), function (b) {
      if (/Descargar Guía/.test(b.textContent) && !b.hasAttribute('onclick')) {
        b.addEventListener('click', function (e) { e.preventDefault(); dl(REC[0]); });
      }
      // Biblioteca: «Descargar original» del archivo de ejemplo seleccionado
      if (/Descargar original/.test(b.textContent) && !b.hasAttribute('data-ar')) {
        b.addEventListener('click', function () {
          var box = b, n = 0;
          while (box.parentElement && box.textContent.length < 300 && n++ < 8) box = box.parentElement;
          if (!byText(box.textContent)) toast('Este archivo de ejemplo no tiene original. Sube el tuyo con «+ Subir» y podrás descargarlo desde «Mis archivos subidos».');
        });
      }
    });
    // Lectura: la tarjeta de descarga muestra el recurso del área del artículo
    if (/lectura\.html$/.test(location.pathname)) {
      var tries = 0, iv = setInterval(function () {
        if (++tries > 30) return clearInterval(iv);
        if (!window.__saberupArt) return;
        clearInterval(iv);
        var r = recFor(window.__saberupArt.subject);
        Array.prototype.forEach.call(document.querySelectorAll('span'), function (sp) {
          if (sp.textContent === 'Recurso descargable del área') sp.textContent = r.title;
          else if (sp.textContent === 'Guía, rúbrica o lista de cotejo imprimible · PDF') sp.textContent = r.desc + ' · PDF';
        });
      }, 300);
    }
    // Recursos: abrir con ?q=… (desde el buscador)
    var q = new URLSearchParams(location.search).get('q'), input = document.getElementById('resource-search');
    if (q && input) { input.value = q; input.dispatchEvent(new Event('input', { bubbles: true })); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
