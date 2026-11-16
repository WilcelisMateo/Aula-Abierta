/** descargas.js — Descarga real de los recursos didácticos (carpeta /recursos) y catálogo para el buscador. */
(function () {
  'use strict';
  var REC = [
    { k: ['hidrolog', 'ciclo del agua'], file: 'Ciclo_Hidrologico_Ficha5to.pdf', q: 'hidrológico', title: 'Guía didáctica y ficha de experimento: El ciclo hidrológico', desc: 'Ciencias Naturales · 5to · incluye rúbrica' },
    { k: ['fraccion', 'rubrica'], file: 'Rubrica_Fracciones_Equivalentes.pdf', q: 'fracciones', title: 'Rúbrica de evaluación formativa: fracciones equivalentes', desc: 'Matemática · 4to y 5to' },
    { k: ['conector', 'coherencia'], file: 'Conectores_Gramatica_6to_BN.pdf', q: 'conectores', title: 'Ficha de ejercicios: coherencia y conectores', desc: 'Lengua Española · 6to · con solucionario' },
    { k: ['linea tiempo', 'efemerides', 'padres de la patria'], file: 'Linea_Tiempo_Dominicana_Poster.pdf', q: 'efemérides', title: 'Línea de tiempo ilustrada: efemérides dominicanas', desc: 'Ciencias Sociales · 5to · afiche' }
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
      dl(REC[0]);
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
    // Recursos: abrir con ?q=… (desde el buscador)
    var q = new URLSearchParams(location.search).get('q'), input = document.getElementById('resource-search');
    if (q && input) { input.value = q; input.dispatchEvent(new Event('input', { bubbles: true })); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
