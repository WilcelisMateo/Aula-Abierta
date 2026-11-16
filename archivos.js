/** archivos.js — Subir, guardar, listar y descargar archivos (se guardan en el navegador, IndexedDB 'media'). */
(function () {
  'use strict';
  var MAX = 15 * 1024 * 1024;
  var page = location.pathname.split('/').pop() || 'index.html';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
  function ico(m) {
    var t = (m.type || '') + ' ' + (m.name || '');
    return /image/.test(t) ? 'image' : /pdf/i.test(t) ? 'picture_as_pdf' : /word|\.docx?\b/i.test(t) ? 'description' : /sheet|excel|\.xlsx?\b|csv/i.test(t) ? 'table_chart' : /presentation|\.pptx?\b/i.test(t) ? 'slideshow' : /video/.test(t) ? 'movie' : /audio/.test(t) ? 'audio_file' : 'attach_file';
  }
  function toast(t, err) {
    var e = document.createElement('div'); e.setAttribute('role', 'status'); e.textContent = t;
    e.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:96px;z-index:500;color:#fff;border:2px solid #d4a72c;padding:12px 18px;border-radius:12px;font:600 14px/20px "Source Sans 3",sans-serif;max-width:90vw;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.3);background:' + (err ? '#93000a' : '#0a2e1f');
    document.body.appendChild(e); setTimeout(function () { e.remove(); }, 3000);
  }
  function db() { var d = window.AulaAbiertaDB; return d ? d._initPromise.then(function () { return d; }) : Promise.reject(new Error('db')); }
  function pick(o) {
    return new Promise(function (res) {
      var i = document.createElement('input'); i.type = 'file'; i.accept = o.accept || ''; i.multiple = !!o.multiple; i.style.display = 'none';
      i.addEventListener('change', function () { res(Array.prototype.slice.call(i.files)); i.remove(); });
      i.addEventListener('cancel', function () { res([]); i.remove(); });
      document.body.appendChild(i); i.click();
    });
  }
  async function save(files, cat) {
    var d = await db(), out = [];
    for (var k = 0; k < files.length; k++) {
      var f = files[k];
      if (f.size > MAX) { toast(f.name + ' pesa más de 15 MB.', 1); continue; }
      var m = { id: 'media-' + Date.now() + '-' + k + Math.floor(Math.random() * 1000), name: f.name, type: f.type || '', size: f.size, sizeKB: Math.round(f.size / 1024), category: cat || 'documentos', createdAt: Date.now(), blob: f };
      try { await d.put('media', m); out.push(m); } catch (e) { toast('No se pudo guardar ' + f.name + ' (almacenamiento lleno).', 1); }
    }
    return out;
  }
  function download(m) {
    var url = URL.createObjectURL(m.blob), a = document.createElement('a');
    a.href = url; a.download = m.name; a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  async function downloadById(id) { var d = await db(), m = await d.get('media', id); if (m && m.blob) download(m); else toast('No se encontró el archivo.', 1); }
  function imgData(file, max) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var s = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
        c.width = Math.round(im.naturalWidth * s); c.height = Math.round(im.naturalHeight * s);
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.85));
      };
      im.onerror = function () { URL.revokeObjectURL(url); rej(new Error('img')); }; im.src = url;
    });
  }
  function css() {
    var s = document.createElement('style');
    s.textContent = '.ar-item{display:flex;align-items:center;gap:10px;background:#f6f3ef;border-radius:12px;padding:10px;margin-top:8px}.ar-item>.material-symbols-outlined{font-size:28px;color:#b3202a;flex-shrink:0}' +
      '.ar-item .ar-t{flex:1;min-width:0}.ar-item strong{display:block;font:700 14px/18px "Source Sans 3",sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ar-item small{color:#4a4944;font-size:12px}' +
      '.ar-b{border:0;background:#165b33;color:#fff;border-radius:9px;padding:7px 10px;font:600 13px "Source Sans 3",sans-serif;cursor:pointer}.ar-b.x{background:#ffdad6;color:#7a0e16}' +
      '.ar-thumb{width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0}.ar-empty{color:#4a4944;font-size:14px;margin:8px 0}' +
      '.ar-ov{position:fixed;inset:0;z-index:300;background:rgba(0,9,34,.55);display:flex;align-items:center;justify-content:center;padding:16px}.ar-sheet{background:#fbf8f4;border-radius:18px;padding:16px;max-width:460px;width:100%;max-height:80vh;overflow:auto}' +
      '.ar-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.ar-grid img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;cursor:pointer;border:2px solid transparent}.ar-grid img:hover{border-color:#d4a72c}';
    document.head.appendChild(s);
  }
  function items(list, canRemove) {
    return list.map(function (m) {
      return '<div class="ar-item"><span class="material-symbols-outlined">' + ico(m) + '</span><div class="ar-t"><strong>' + esc(m.name) + '</strong><small>' + fmt(m.size || 0) + '</small></div>' +
        '<button type="button" class="ar-b" data-dl="' + esc(m.id) + '" aria-label="Descargar ' + esc(m.name) + '">Descargar</button>' +
        (canRemove ? '<button type="button" class="ar-b x" data-rm="' + esc(m.id) + '" aria-label="Quitar ' + esc(m.name) + '">✕</button>' : '') + '</div>';
    }).join('');
  }

  /* ───── Editor: adjuntar archivos, portada e imágenes ───── */
  function editor() {
    var attach = [], list = null, area = $('main .flex.flex-col.gap-space-md.font-body-md'), cover = $('.relative.w-full.h-44 img'), range = null;
    var h = $$('h2').filter(function (x) { return /Recursos Asociados/.test(x.textContent); })[0], box = h && h.closest('.bg-surface-container-lowest');
    if (box) {
      var old = $(':scope > .bg-surface-container-low', box); if (old) old.remove();
      list = document.createElement('div'); list.id = 'ar-list'; box.appendChild(list);
    }
    function render() {
      if (!list) return;
      list.innerHTML = attach.length ? items(attach, true) : '<p class="ar-empty">Aún no hay archivos adjuntos. Usa el clip 📎 de la barra o «Subir otro».</p>';
      $$('[data-dl]', list).forEach(function (b) { b.addEventListener('click', function () { downloadById(b.getAttribute('data-dl')); }); });
      $$('[data-rm]', list).forEach(function (b) { b.addEventListener('click', function () { attach = attach.filter(function (a) { return a.id !== b.getAttribute('data-rm'); }); render(); }); });
    }
    async function add() {
      var f = await pick({ multiple: true }); if (!f.length) return;
      var s = await save(f, 'adjuntos');
      s.forEach(function (m) { attach.push({ id: m.id, name: m.name, size: m.size, type: m.type }); }); render();
      if (s.length) toast('📎 ' + s.length + ' archivo(s) adjuntado(s). Guarda el artículo para conservarlos.');
    }
    document.addEventListener('selectionchange', function () {
      var s = window.getSelection(); if (s.rangeCount && area && area.contains(s.anchorNode)) range = s.getRangeAt(0).cloneRange();
    });
    $$('button').forEach(function (b) {
      var lbl = b.getAttribute('aria-label') || '', tx = b.textContent;
      if (lbl === 'Adjuntar archivo' || /Subir otro/.test(tx)) b.addEventListener('click', add);
      if (lbl === 'Insertar imagen') b.addEventListener('click', async function () {
        var f = (await pick({ accept: 'image/*' }))[0]; if (!f) return;
        try {
          var data = await imgData(f, 1200), html = '<img src="' + data + '" alt="' + esc(f.name.replace(/\.[^.]+$/, '')) + '" style="max-width:100%;border-radius:12px"/>';
          area.focus();
          if (range) { var s = window.getSelection(); s.removeAllRanges(); s.addRange(range); }
          if (!document.execCommand('insertHTML', false, html)) area.insertAdjacentHTML('beforeend', html);
          toast('🖼️ Imagen insertada en el artículo.');
        } catch (e) { toast('No se pudo leer la imagen.', 1); }
      });
      if (/Cambiar foto/.test(tx) && cover) b.addEventListener('click', async function () {
        var f = (await pick({ accept: 'image/*' }))[0]; if (!f) return;
        try { cover.src = await imgData(f, 1280); toast('Portada actualizada.'); } catch (e) { toast('No se pudo leer la imagen.', 1); }
      });
      if (/^\s*Biblioteca\s*$/.test(tx) && cover) b.addEventListener('click', async function () {
        var d = await db(), imgs = (await d.getAllMedia()).filter(function (m) { return m.blob && /^image\//.test(m.type); });
        var ov = document.createElement('div'); ov.className = 'ar-ov';
        ov.innerHTML = '<div class="ar-sheet"><strong style="font:700 18px Literata,serif">Elige una imagen de tu biblioteca</strong>' + (imgs.length ? '<div class="ar-grid"></div>' : '<p class="ar-empty">Aún no hay imágenes. Usa «Cambiar foto» o sube imágenes en la Biblioteca Multimedia.</p>') + '<button type="button" class="ar-b" style="margin-top:12px">Cerrar</button></div>';
        document.body.appendChild(ov);
        ov.addEventListener('click', function (e) { if (e.target === ov || e.target.tagName === 'BUTTON') ov.remove(); });
        var g = $('.ar-grid', ov), urls = [];
        imgs.forEach(function (m) { var im = document.createElement('img'), u = URL.createObjectURL(m.blob); urls.push(u); im.src = u; im.alt = m.name; im.addEventListener('click', async function () { try { cover.src = await imgData(m.blob, 1280); toast('Portada actualizada.'); } catch (e) { /* ignora */ } ov.remove(); }); g.appendChild(im); });
      });
    });
    db().then(function (d) {
      var orig = d.saveArticle.bind(d);
      d.saveArticle = function (a) { a.attachments = attach.slice(); return orig(a); };
      var id = new URLSearchParams(location.search).get('id');
      if (id) d.getArticleById(id).then(function (a) { if (a && a.attachments) { attach = a.attachments.slice(); render(); } });
    });
    render();
  }

  /* ───── Biblioteca: «+ Subir» y «Mis archivos subidos» ───── */
  function biblioteca() {
    var first = $('main section'); if (!first) return;
    var sec = document.createElement('section'); sec.className = 'px-gutter-mobile pt-space-sm';
    sec.innerHTML = '<h2 style="font:700 18px Literata,serif;color:#0a2e1f">Mis archivos subidos</h2><div id="ar-mine"></div>';
    first.after(sec);
    var cnt = null, ind = null;
    async function render() {
      var d = await db(), all = (await d.getAllMedia()).filter(function (m) { return m.blob; }), box = $('#ar-mine');
      var total = all.reduce(function (s, m) { return s + (m.size || 0); }, 0);
      cnt = cnt || $$('p').filter(function (p) { return /archivos pedag/.test(p.textContent); })[0];
      if (cnt) cnt.innerHTML = '<span class="material-symbols-outlined text-[16px] text-secondary">cloud_done</span> ' + all.length + ' archivo(s) subido(s)';
      if (!ind) { var sp = $$('span').filter(function (s) { return /MB utilizados/.test(s.textContent); })[0]; ind = sp && sp.closest('div[class*="p-3.5"]'); }
      if (ind) ind.innerHTML = '<div class="flex items-center gap-1.5 text-on-surface font-label-md text-label-md"><span class="material-symbols-outlined text-[18px] text-secondary">folder_data</span><span class="font-semibold">' + fmt(total) + ' utilizados en este dispositivo</span></div>';
      box.innerHTML = all.length ? all.map(function (m) {
        return '<div class="ar-item">' + (/^image\//.test(m.type) ? '<img class="ar-thumb" alt="" data-th="' + esc(m.id) + '"/>' : '<span class="material-symbols-outlined">' + ico(m) + '</span>') +
          '<div class="ar-t"><strong>' + esc(m.name) + '</strong><small>' + fmt(m.size || 0) + ' · ' + new Date(m.createdAt).toLocaleDateString('es-DO') + '</small></div>' +
          '<button type="button" class="ar-b" data-dl="' + esc(m.id) + '">Descargar</button><button type="button" class="ar-b x" data-del="' + esc(m.id) + '" aria-label="Eliminar ' + esc(m.name) + '">✕</button></div>';
      }).join('') : '<p class="ar-empty">Todavía no has subido archivos. Pulsa «+ Subir» para agregar PDF, Word, imágenes, videos y más.</p>';
      all.forEach(function (m) { var im = $('[data-th="' + m.id + '"]', box); if (im && m.blob) im.src = URL.createObjectURL(m.blob); });
      $$('[data-dl]', box).forEach(function (b) { b.addEventListener('click', function () { downloadById(b.getAttribute('data-dl')); }); });
      $$('[data-del]', box).forEach(function (b) { b.addEventListener('click', async function () { if (confirm('¿Eliminar este archivo?')) { await d.deleteMedia(b.getAttribute('data-del')); render(); } }); });
    }
    $$('button').filter(function (b) { return /\+ Subir/.test(b.textContent); }).forEach(function (b) {
      b.addEventListener('click', async function () {
        var f = await pick({ multiple: true }); if (!f.length) return;
        var s = await save(f, 'documentos'); if (s.length) { toast('✅ ' + s.length + ' archivo(s) subido(s).'); render(); }
      });
    });
    render();
  }

  /* ───── Panel: «Subir Recurso» ───── */
  function panel() {
    $$('button').filter(function (b) { return /Subir Recurso/.test(b.textContent); }).forEach(function (b) {
      b.addEventListener('click', async function () {
        var f = await pick({ multiple: true }); if (!f.length) return;
        var s = await save(f, 'recursos'); if (s.length) { toast('✅ ' + s.length + ' recurso(s) subido(s) a tu biblioteca.'); setTimeout(function () { location.reload(); }, 1100); }
      });
    });
  }

  /* ───── Lectura: archivos adjuntos del artículo ───── */
  function lectura() {
    var id = new URLSearchParams(location.search).get('id'), art = $('article'); if (!id || !art) return;
    db().then(function (d) { return d.getArticleById(id); }).then(function (a) {
      if (!a || !a.attachments || !a.attachments.length) return;
      var s = document.createElement('section'); s.className = 'px-gutter-mobile py-space-sm';
      s.innerHTML = '<h2 style="font:700 18px Literata,serif;color:#0a2e1f">📎 Archivos adjuntos</h2>' + items(a.attachments, false);
      art.after(s);
      $$('[data-dl]', s).forEach(function (b) { b.addEventListener('click', function () { downloadById(b.getAttribute('data-dl')); }); });
    }).catch(function () { /* sin adjuntos */ });
  }

  function init() {
    css();
    if (page === 'editor.html') editor();
    else if (page === 'biblioteca.html') biblioteca();
    else if (page === 'panel.html') panel();
    else if (page === 'lectura.html') lectura();
  }
  window.SaberUpArchivos = { pick: pick, save: save, download: download };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
