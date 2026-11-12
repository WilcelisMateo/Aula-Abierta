/**
 * profile-loader.js — Carga dinámica del perfil docente desde IndexedDB.
 * Incluir DESPUÉS de db.js en cada página.
 *
 * Uso: await window.applyTeacherProfile()
 *   — o se ejecuta automáticamente al cargar si el body tiene data-auto-profile
 *
 * Los elementos usan atributos data-tp="campo" para ser actualizados:
 *   data-tp="name"         → nombre completo
 *   data-tp="title"        → título académico (Lic., Dr., etc.)
 *   data-tp="role"         → rol / cargo
 *   data-tp="specialty"    → área de especialidad
 *   data-tp="school"       → escuela / distrito
 *   data-tp="years"        → años de experiencia
 *   data-tp="bio"          → frase pedagógica
 *   data-tp="photo"        → src de la foto (en <img>)
 *   data-tp="photo-alt"    → alt text con el nombre
 *   data-tp="greeting"     → saludo: "¡Buen día, [Título] [Nombre]!"
 *   data-tp="titleName"    → "Título Nombre" combinado
 *   data-tp="schoolYears"  → "Escuela • N años de experiencia"
 */
(function() {
  'use strict';

  // Foto por defecto (archivo foto-perfil.jpg) — editable desde perfil.html
  const DEFAULT_PHOTO = 'foto-perfil.jpg';

  let cachedProfile = null;

  async function getProfile() {
    if (cachedProfile) return cachedProfile;
    const db = window.AulaAbiertaDB;
    if (!db) return null;
    try {
      cachedProfile = await db.getTeacherProfile();
      return cachedProfile;
    } catch (e) {
      console.warn('[profile-loader] Error cargando perfil:', e);
      return null;
    }
  }

  function firstName(fullName) {
    // Extract first name after title: "Lic. Wilcelis Mateo" → "Wilcelis"
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) return fullName;
    // Skip title-like prefixes
    const titles = ['lic.','licda.','mtro.','mtr.','mtra.','dr.','dra.','ing.','prof.','tec.'];
    let start = 0;
    if (titles.includes(parts[0].toLowerCase())) start = 1;
    return parts[start] || fullName;
  }

  async function applyTeacherProfile() {
    const p = await getProfile();
    if (!p) return null;

    const photoSrc = p.photoUrl || DEFAULT_PHOTO;
    const titleName = (p.title && !(p.name || '').toLowerCase().startsWith(p.title.toLowerCase())) ? `${p.title} ${p.name}` : p.name;
    const yearsText = p.yearsExperience
      ? `${p.school} • ${p.yearsExperience} años de experiencia`
      : p.school;

    document.querySelectorAll('[data-tp]').forEach(el => {
      const field = el.getAttribute('data-tp');
      switch (field) {
        case 'name':        el.textContent = p.name; break;
        case 'title':       el.textContent = p.title; break;
        case 'role':        el.textContent = p.role; break;
        case 'specialty':   el.textContent = p.specialty; break;
        case 'school':      el.textContent = p.school; break;
        case 'years':       el.textContent = p.yearsExperience; break;
        case 'bio':         el.textContent = p.bio; break;
        case 'titleName':   el.textContent = titleName; break;
        case 'schoolYears': el.textContent = yearsText; break;
        case 'photo':
          el.src = photoSrc;
          if (!el.alt || el.alt === 'Profile') el.alt = p.name;
          break;
        case 'photo-alt':
          el.alt = p.name;
          break;
        case 'greeting':
          el.textContent = `¡Buen día, ${p.title ? p.title + ' ' : ''}${firstName(p.name)}!`;
          break;
        case 'roleBadge':
          el.textContent = p.role || el.textContent;
          break;
        case 'authorLine':
          el.textContent = `Por ${titleName}`;
          break;
        case 'emptyGreeting':
          el.textContent = `¡Bandeja al día, ${p.title ? p.title + ' ' : 'Maestra '}${firstName(p.name)}!`;
          break;
        case 'districtQuota':
          el.textContent = `Cuota institucional del ${p.school}`;
          break;
        case 'photoTitle':
          el.textContent = `Retrato ${titleName}`;
          break;
      }
    });

    return p;
  }

  // Expose globally
  window.refreshTeacherProfile = async function() { cachedProfile = null; return applyTeacherProfile(); };
  window.applyTeacherProfile = applyTeacherProfile;
  window.getTeacherProfile = getProfile;
  window.TEACHER_DEFAULT_PHOTO = DEFAULT_PHOTO;

  // Auto-apply when DOM ready if body has data-auto-profile
  if (document.body && document.body.hasAttribute('data-auto-profile')) {
    applyTeacherProfile();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.body.hasAttribute('data-auto-profile')) {
        applyTeacherProfile();
      }
    });
  }
})();
