/**
 * edit-profile.js — Edición directa del perfil y del nombre del sitio, en cualquier página.
 *
 * - Botón flotante "Editar perfil" y clic en cualquier foto de perfil abren un panel.
 * - Permite cambiar: foto (subida desde el dispositivo), nombre, título, cargo,
 *   especialidad, institución, frase pedagógica y nombre del sitio.
 * - Todo se guarda en IndexedDB (db.js) y se refleja en todas las páginas.
 *
 * Incluir DESPUÉS de db.js y profile-loader.js.
 */
(function () {
  'use strict';

  var DEFAULT_SITE = 'SaberUp';
  var DEFAULT_PHOTO = 'foto-perfil.jpg';
  var TITLES = ['', 'Lic.', 'Mtr.', 'Mtra.', 'Dr.', 'Dra.', 'Ing.', 'Tec.', 'Prof.'];
  var originalTitle = document.title;
  var overlay = null;
  var pendingPhoto = null; // dataURL elegido en el panel (aún sin guardar)

  /* ───────── utilidades ───────── */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function dbReady() {
    var db = window.AulaAbiertaDB;
    if (!db) return Promise.reject(new Error('db.js no cargó'));
    return db._initPromise.then(function () { return db; });
  }

  function titleName(p) {
    var name = (p.name || '').trim();
    var title = (p.title || '').trim();
    if (title && name.toLowerCase().indexOf(title.toLowerCase()) !== 0) return title + ' ' + name;
    return name;
  }

  async function getSite(db) {
    try {
      var s = await db.get('settings', 'siteSettings');
      return s && s.siteName ? s : { key: 'siteSettings', siteName: DEFAULT_SITE };
    } catch (e) {
      return { key: 'siteSettings', siteName: DEFAULT_SITE };
    }
  }

  function applySiteName(name) {
    $$('[data-site="name"]').forEach(function (el) { el.textContent = name; });
    $$('[data-site="gestion"]').forEach(function (el) { el.textContent = name + ' • Gestión'; });
    $$('img[alt^="Logo "]').forEach(function (el) { el.alt = 'Logo ' + name; });
    document.title = originalTitle.split(DEFAULT_SITE).join(name);
  }

  /* Redimensiona y recorta la foto a un cuadrado de 480 px (JPEG) para guardarla ligera */
  function resizeImage(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) return reject(new Error('Elige un archivo de imagen (JPG, PNG, WEBP).'));
      if (file.size > 15 * 1024 * 1024) return reject(new Error('La imagen es muy pesada (máximo 15 MB).'));
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var size = 480;
          var s = Math.min(img.naturalWidth, img.naturalHeight);
          var sx = (img.naturalWidth - s) / 2;
          // Un poco más arriba que el centro: conserva el rostro en retratos
          var sy = Math.max(0, (img.naturalHeight - s) / 2 - (img.naturalHeight - s) * 0.15);
          var c = document.createElement('canvas');
          c.width = size; c.height = size;
          var ctx = c.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
          URL.revokeObjectURL(url);
          resolve(c.toDataURL('image/jpeg', 0.86));
        } catch (err) { reject(err); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen.')); };
      img.src = url;
    });
  }

  /* ───────── estilos ───────── */
  function injectStyles() {
    if ($('#ep-styles')) return;
    var st = document.createElement('style');
    st.id = 'ep-styles';
    st.textContent = [
      '.ep-fab{position:fixed;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 84px);z-index:60;display:flex;align-items:center;gap:6px;padding:10px 16px;border:0;border-radius:999px;background:#0f2042;color:#fff;font:600 14px/1 "Source Sans 3",system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,9,34,.28);cursor:pointer}',
      '.ep-fab:hover{background:#000922}',
      '.ep-fab .material-symbols-outlined{font-size:18px}',
      'img[data-tp="photo"].ep-clickable{cursor:pointer}',
      '.ep-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,9,34,.55);display:flex;align-items:flex-end;justify-content:center;padding:0}',
      '@media(min-width:640px){.ep-overlay{align-items:center;padding:24px}}',
      '.ep-sheet{background:#f7f9fb;width:100%;max-width:520px;max-height:92vh;overflow:auto;border-radius:20px 20px 0 0;padding:20px 20px calc(env(safe-area-inset-bottom,0px) + 20px);font-family:"Source Sans 3",system-ui,sans-serif;color:#191c1e;box-shadow:0 -8px 32px rgba(0,9,34,.25)}',
      '@media(min-width:640px){.ep-sheet{border-radius:20px}}',
      '.ep-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}',
      '.ep-head h2{margin:0;font:600 22px/30px Literata,Georgia,serif;color:#000922}',
      '.ep-x{border:0;background:transparent;font-size:26px;line-height:1;cursor:pointer;color:#45464e;padding:4px 10px;border-radius:8px}',
      '.ep-x:hover{background:#e6e8ea}',
      '.ep-photo{display:flex;align-items:center;gap:16px;margin-bottom:16px}',
      '.ep-photo img{width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid #006398;background:#eceef0;flex-shrink:0}',
      '.ep-photo-btns{display:flex;flex-direction:column;gap:8px}',
      '.ep-btn{border:0;border-radius:10px;padding:10px 14px;font:600 14px/1 "Source Sans 3",system-ui,sans-serif;cursor:pointer}',
      '.ep-btn-primary{background:#0f2042;color:#fff}',
      '.ep-btn-primary:hover{background:#000922}',
      '.ep-btn-ghost{background:#e6e8ea;color:#191c1e}',
      '.ep-btn-ghost:hover{background:#d8dadc}',
      '.ep-field{display:flex;flex-direction:column;gap:4px;margin-bottom:12px}',
      '.ep-field label{font:600 12px/16px "Source Sans 3",system-ui,sans-serif;letter-spacing:.04em;color:#45464e;text-transform:uppercase}',
      '.ep-field input,.ep-field select,.ep-field textarea{font:400 16px/24px "Source Sans 3",system-ui,sans-serif;padding:10px 12px;border:1px solid #c5c6cf;border-radius:10px;background:#fff;color:#191c1e;width:100%;box-sizing:border-box}',
      '.ep-field input:focus,.ep-field select:focus,.ep-field textarea:focus{outline:2px solid #5bb8fe;border-color:#006398}',
      '.ep-row{display:flex;gap:10px}.ep-row .ep-field{flex:1;min-width:0}.ep-row .ep-field.ep-narrow{flex:0 0 38%}',
      '.ep-sep{height:1px;background:#e0e3e5;margin:6px 0 14px}',
      '.ep-actions{display:flex;gap:10px;margin-top:6px}',
      '.ep-actions .ep-btn{flex:1;padding:13px 14px;font-size:15px}',
      '.ep-msg{min-height:20px;margin:0 0 8px;font:600 14px/20px "Source Sans 3",system-ui,sans-serif;color:#ba1a1a}',
      '.ep-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 90px);z-index:300;background:#002718;color:#fff;padding:12px 18px;border-radius:12px;font:600 14px/20px "Source Sans 3",system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.25)}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function toast(text) {
    var t = document.createElement('div');
    t.className = 'ep-toast';
    t.setAttribute('role', 'status');
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }

  /* ───────── panel de edición ───────── */
  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'ep-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'ep-title');
    overlay.hidden = true;

    var opts = TITLES.map(function (t) {
      return '<option value="' + t + '">' + (t || 'Sin título') + '</option>';
    }).join('');

    overlay.innerHTML =
      '<div class="ep-sheet">' +
        '<div class="ep-head"><h2 id="ep-title">Editar perfil</h2>' +
        '<button type="button" class="ep-x" id="ep-close" aria-label="Cerrar">×</button></div>' +

        '<div class="ep-photo">' +
          '<img id="ep-preview" alt="Vista previa de la foto" src="' + DEFAULT_PHOTO + '"/>' +
          '<div class="ep-photo-btns">' +
            '<button type="button" class="ep-btn ep-btn-primary" id="ep-upload">Cambiar foto</button>' +
            '<button type="button" class="ep-btn ep-btn-ghost" id="ep-reset-photo">Usar la original</button>' +
            '<input type="file" id="ep-file" accept="image/*" hidden/>' +
          '</div>' +
        '</div>' +

        '<div class="ep-row">' +
          '<div class="ep-field ep-narrow"><label for="ep-ptitle">Título</label><select id="ep-ptitle">' + opts + '</select></div>' +
          '<div class="ep-field"><label for="ep-name">Nombre</label><input id="ep-name" type="text" maxlength="80" autocomplete="name"/></div>' +
        '</div>' +
        '<div class="ep-field"><label for="ep-role">Cargo</label><input id="ep-role" type="text" maxlength="80"/></div>' +
        '<div class="ep-field"><label for="ep-specialty">Especialidad</label><input id="ep-specialty" type="text" maxlength="100"/></div>' +
        '<div class="ep-field"><label for="ep-school">Institución / distrito</label><input id="ep-school" type="text" maxlength="100"/></div>' +
        '<div class="ep-field"><label for="ep-bio">Frase pedagógica</label><textarea id="ep-bio" rows="3" maxlength="240"></textarea></div>' +
        '<div class="ep-sep"></div>' +
        '<div class="ep-field"><label for="ep-site">Nombre del sitio</label><input id="ep-site" type="text" maxlength="40"/></div>' +

        '<p class="ep-msg" id="ep-msg" aria-live="polite"></p>' +
        '<div class="ep-actions">' +
          '<button type="button" class="ep-btn ep-btn-ghost" id="ep-cancel">Cancelar</button>' +
          '<button type="button" class="ep-btn ep-btn-primary" id="ep-save">Guardar cambios</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) closePanel(); });
    $('#ep-close', overlay).addEventListener('click', closePanel);
    $('#ep-cancel', overlay).addEventListener('click', closePanel);
    $('#ep-upload', overlay).addEventListener('click', function () { $('#ep-file', overlay).click(); });
    $('#ep-file', overlay).addEventListener('change', onFileChosen);
    $('#ep-reset-photo', overlay).addEventListener('click', function () {
      pendingPhoto = DEFAULT_PHOTO;
      $('#ep-preview', overlay).src = DEFAULT_PHOTO;
    });
    $('#ep-save', overlay).addEventListener('click', savePanel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && !overlay.hidden) closePanel();
    });
  }

  function setMsg(text) { $('#ep-msg', overlay).textContent = text || ''; }

  async function onFileChosen(e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setMsg('');
    try {
      pendingPhoto = await resizeImage(file);
      $('#ep-preview', overlay).src = pendingPhoto;
    } catch (err) {
      setMsg(err.message || 'No se pudo cargar la foto.');
    }
  }

  async function openPanel() {
    var db;
    try { db = await dbReady(); } catch (e) { return; }
    if (!overlay) buildOverlay();
    var p = await db.getTeacherProfile();
    var site = await getSite(db);
    pendingPhoto = null;
    setMsg('');
    $('#ep-preview', overlay).src = p.photoUrl || DEFAULT_PHOTO;
    $('#ep-ptitle', overlay).value = TITLES.indexOf(p.title || '') >= 0 ? (p.title || '') : '';
    // Si el nombre guardado trae el título delante, se muestra sin él
    var nm = p.name || '';
    if (p.title && nm.toLowerCase().indexOf(p.title.toLowerCase() + ' ') === 0) nm = nm.slice(p.title.length + 1);
    $('#ep-name', overlay).value = nm;
    $('#ep-role', overlay).value = p.role || '';
    $('#ep-specialty', overlay).value = p.specialty || '';
    $('#ep-school', overlay).value = p.school || '';
    $('#ep-bio', overlay).value = p.bio || '';
    $('#ep-site', overlay).value = site.siteName || DEFAULT_SITE;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#ep-name', overlay).focus();
  }

  function closePanel() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  async function savePanel() {
    var name = $('#ep-name', overlay).value.trim();
    var siteName = $('#ep-site', overlay).value.trim();
    if (!name) { setMsg('Escribe tu nombre.'); $('#ep-name', overlay).focus(); return; }
    if (!siteName) { setMsg('El sitio necesita un nombre.'); $('#ep-site', overlay).focus(); return; }

    var saveBtn = $('#ep-save', overlay);
    saveBtn.disabled = true;
    try {
      var db = await dbReady();
      var before = await db.getTeacherProfile();
      var oldFull = titleName(before);

      var updates = {
        name: name,
        title: $('#ep-ptitle', overlay).value,
        role: $('#ep-role', overlay).value.trim(),
        specialty: $('#ep-specialty', overlay).value.trim(),
        school: $('#ep-school', overlay).value.trim(),
        bio: $('#ep-bio', overlay).value.trim()
      };
      if (pendingPhoto) updates.photoUrl = pendingPhoto;
      var after = await db.updateTeacherProfile(updates);

      await db.put('settings', { key: 'siteSettings', siteName: siteName, updatedAt: Date.now() });

      // Los artículos firmados con el nombre anterior pasan a llevar el nuevo
      var newFull = titleName(after);
      if (oldFull && newFull && oldFull !== newFull) {
        var arts = await db.getAll('articles');
        for (var i = 0; i < arts.length; i++) {
          if (arts[i].author === oldFull) {
            arts[i].author = newFull;
            await db.put('articles', arts[i]);
          }
        }
      }

      closePanel();
      applySiteName(siteName);
      if (window.refreshTeacherProfile) await window.refreshTeacherProfile();
      toast('Cambios guardados');

      // Recarga para que todo (listas, tarjetas, firmas) refleje el cambio,
      // salvo en el editor para no perder un artículo a medio escribir.
      if (!/editor\.html$/.test(location.pathname)) setTimeout(function () { location.reload(); }, 700);
    } catch (err) {
      console.error('[edit-profile]', err);
      setMsg('No se pudo guardar. Intenta de nuevo.');
    } finally {
      saveBtn.disabled = false;
    }
  }

  /* ───────── arranque ───────── */
  function mountFab() {
    if ($('.ep-fab')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ep-fab';
    b.setAttribute('aria-label', 'Editar perfil');
    b.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">edit</span><span>Editar perfil</span>';
    b.addEventListener('click', openPanel);
    document.body.appendChild(b);
  }

  function wireAvatars() {
    $$('img[data-tp="photo"]').forEach(function (img) {
      if (img.classList.contains('ep-clickable')) return;
      img.classList.add('ep-clickable');
      img.setAttribute('role', 'button');
      img.setAttribute('tabindex', '0');
      img.title = 'Editar perfil';
      img.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); openPanel(); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(); }
      });
    });
  }

  async function init() {
    injectStyles();
    mountFab();
    wireAvatars();
    try {
      var db = await dbReady();
      var site = await getSite(db);
      if (site.siteName && site.siteName !== DEFAULT_SITE) applySiteName(site.siteName);
    } catch (e) { /* sin base de datos: el sitio sigue con los valores por defecto */ }
  }

  window.openProfileEditor = openPanel;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
