/**
 * SABERUP — Mi Blog Docente
 * db.js — Módulo desacoplado de abstracción y persistencia (IndexedDB)
 * 
 * Diseñado con interfaz agnóstica para permitir sustituir fácilmente 
 * el almacenamiento local del navegador por llamadas a una API REST / Supabase.
 */

const DB_NAME = 'AulaAbiertaDB';
const DB_VERSION = 1;

class StorageService {
  constructor() {
    this.db = null;
    this._initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Almacén: Artículos (publicaciones)
        if (!db.objectStoreNames.contains('articles')) {
          const articleStore = db.createObjectStore('articles', { keyPath: 'id' });
          articleStore.createIndex('status', 'status', { unique: false });
          articleStore.createIndex('subject', 'subject', { unique: false });
          articleStore.createIndex('grade', 'grade', { unique: false });
          articleStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Almacén: Comentarios
        if (!db.objectStoreNames.contains('comments')) {
          const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
          commentStore.createIndex('articleId', 'articleId', { unique: false });
          commentStore.createIndex('status', 'status', { unique: false }); // pending, approved, rejected, spam
          commentStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Almacén: Biblioteca Multimedia
        if (!db.objectStoreNames.contains('media')) {
          const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
          mediaStore.createIndex('category', 'category', { unique: false });
          mediaStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Almacén: Configuración y Sesión Demo
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        await this._seedInitialData();
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('Error al inicializar IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // ── Métodos internos sin await _initPromise (evitan deadlock en seed) ──
  _countRaw(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  _putRaw(storeName, item) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // ── Contenido inicial: áreas de la Educación Técnico Profesional (ETP) ──
  _ficha(modulo, competencia, indicador, duracion) {
    return `<div style="background:linear-gradient(135deg,#dcefe0,#fff3cd);padding:20px 24px;border-radius:12px;margin-bottom:24px;border-left:4px solid #165b33;">
      <p style="margin:0 0 8px;font-weight:700;color:#165b33;">📋 Ficha Técnica — Educación Técnico Profesional</p>
      <p style="margin:4px 0;"><strong>Módulo formativo:</strong> ${modulo}</p>
      <p style="margin:4px 0;"><strong>Competencia:</strong> ${competencia}</p>
      <p style="margin:4px 0;"><strong>Indicador de logro:</strong> ${indicador}</p>
      <p style="margin:4px 0;"><strong>Duración sugerida:</strong> ${duracion}</p></div>`;
  }

  _contentSeeds() {
    const A = 'Lic. Wilcelis Mateo', R = 'Docente de Educación Técnico Profesional';
    const base = (o) => Object.assign({ author: A, role: R, status: 'published', views: 0 }, o);
    const articles = [
      base({ id: 'art-compost-suelo', title: 'Compost y manejo del suelo en la finca escolar', subject: 'Agropecuaria', grade: 'Bachillerato Técnico • 4to', readTime: 6, views: 1820,
        summary: 'Cómo transformar residuos orgánicos en abono, mejorar la fertilidad del suelo y aplicar prácticas sostenibles en la finca escolar.',
        coverImage: 'portada-agropecuaria.svg', coverAlt: 'Portada del área Agropecuaria', createdAt: new Date('2026-10-14T08:30:00Z').getTime(),
        tags: ['Agropecuaria', 'Compost', 'SuelosSostenibles'],
        content: this._ficha('Producción vegetal y manejo del suelo', 'Aplica técnicas de producción agrícola sostenible', 'Elabora y monitorea una pila de compost con registro técnico.', '3 sesiones de 90 min') +
          `<h2>1. ¿Por qué compostar?</h2><p>El compostaje convierte restos de cocina y de la finca en abono mediante la descomposición aeróbica. Mejora la estructura del suelo, su capacidad de retener agua y la vida microbiana, y reduce el gasto en fertilizantes.</p>
          <h2>2. Receta básica</h2><ul><li><strong>Material verde</strong> (restos frescos de frutas, vegetales, césped): aporta nitrógeno.</li><li><strong>Material seco</strong> (hojas, paja, cartón): aporta carbono. Usa unas 2 a 3 partes secas por 1 verde, en volumen.</li><li>Mantén la humedad como una esponja escurrida y voltea la pila cada 7 a 10 días.</li><li>Evita carnes, grasas, lácteos y heces de mascotas.</li></ul>
          <h2>3. Registro de la práctica</h2><p>Anota cada semana: fecha, temperatura, humedad, olor y acciones realizadas. Un compost bien manejado se calienta entre 55 y 65 °C en su fase inicial y huele a tierra de bosque cuando está listo.</p>` }),
      base({ id: 'art-bpa-borrador', title: 'Buenas Prácticas Agrícolas (BPA) en cultivos de ciclo corto', subject: 'Agropecuaria', grade: 'Bachillerato Técnico • 5to', readTime: 5, status: 'draft',
        summary: 'Registro, higiene y manejo seguro de insumos en la producción de cultivos de ciclo corto.', coverImage: 'portada-agropecuaria.svg', coverAlt: 'Portada del área Agropecuaria', createdAt: new Date('2026-10-15T09:00:00Z').getTime(),
        tags: ['BPA', 'CultivosCicloCorto', 'Inocuidad'],
        content: '<h2>Producir con calidad e inocuidad</h2><p>Borrador en construcción. Pendiente de anexar la lista de cotejo de campo y la rúbrica del módulo.</p>' }),
      base({ id: 'art-asiento-contable', title: 'El asiento contable paso a paso: del documento fuente al libro diario', subject: 'Gestión Administrativa y Tributaria', grade: 'Bachillerato Técnico • 4to', readTime: 7, views: 1430,
        summary: 'Aprende a registrar operaciones comerciales aplicando la partida doble, sin perderte en el proceso.', coverImage: 'portada-gestion.svg', coverAlt: 'Portada del área Gestión Administrativa y Tributaria', createdAt: new Date('2026-10-20T10:00:00Z').getTime(),
        tags: ['Contabilidad', 'PartidaDoble', 'LibroDiario'],
        content: this._ficha('Contabilidad general y registro de operaciones', 'Registra operaciones comerciales según principios contables', 'Registra en el libro diario operaciones aplicando la partida doble.', '4 sesiones de 90 min') +
          `<h2>1. La partida doble</h2><p>Toda operación afecta al menos dos cuentas y el total de los débitos siempre es igual al total de los créditos.</p>
          <h2>2. Pasos para registrar</h2><ol><li>Identifica el documento fuente (factura, recibo, cheque).</li><li>Analiza qué cuentas se afectan.</li><li>Clasifícalas: activo, pasivo, patrimonio, ingreso o gasto.</li><li>Aplica las reglas de débito y crédito.</li><li>Registra en el libro diario: fecha, cuentas, monto y concepto.</li></ol>
          <h2>3. Ejemplo</h2><p>Compra de mercancía al contado por RD$ 10,000:</p><ul><li><strong>Débito:</strong> Inventario de mercancías, RD$ 10,000</li><li><strong>Crédito:</strong> Efectivo en caja, RD$ 10,000</li></ul>
          <p>Recuerda: los activos y los gastos aumentan por el débito; los pasivos, el patrimonio y los ingresos aumentan por el crédito.</p>` }),
      base({ id: 'art-itbis-ncf', title: 'ITBIS y comprobantes fiscales (NCF): lo básico para el módulo tributario', subject: 'Gestión Administrativa y Tributaria', grade: 'Bachillerato Técnico • 5to', readTime: 6, views: 980,
        summary: 'Calcula el ITBIS de una venta y reconoce para qué sirven los comprobantes fiscales.', coverImage: 'portada-gestion.svg', coverAlt: 'Portada del área Gestión Administrativa y Tributaria', createdAt: new Date('2026-10-24T10:00:00Z').getTime(),
        tags: ['ITBIS', 'NCF', 'DGII'],
        content: this._ficha('Obligaciones tributarias', 'Cumple obligaciones fiscales de una empresa', 'Calcula el ITBIS de una venta e identifica el tipo de comprobante fiscal.', '3 sesiones de 90 min') +
          `<h2>1. ¿Qué es el ITBIS?</h2><p>Es el Impuesto sobre Transferencias de Bienes Industrializados y Servicios. La tasa general es del 18 %, aunque algunos bienes y servicios están exentos o tienen un tratamiento distinto.</p>
          <p><strong>Ejemplo:</strong> precio base RD$ 1,000 → ITBIS (18 %) = RD$ 180 → total RD$ 1,180.</p>
          <h2>2. Comprobantes fiscales</h2><p>El Número de Comprobante Fiscal (NCF) lo autoriza la DGII y respalda ventas, compras y gastos. Por ejemplo, la factura de crédito fiscal (serie B01) y la factura de consumo (serie B02).</p>
          <h2>3. Declaración</h2><p>El ITBIS se declara mensualmente, en el formulario IT-1, dentro de los primeros 20 días del mes siguiente. Verifica siempre la norma vigente en dgii.gov.do.</p>` }),
      base({ id: 'art-algoritmos', title: 'Pensamiento algorítmico: del pseudocódigo a tu primer programa', subject: 'Informática y Comunicaciones', grade: 'Bachillerato Técnico • 4to', readTime: 7, views: 1610,
        summary: 'Aprende a diseñar algoritmos en pseudocódigo y conviértelos en un programa funcional.', coverImage: 'portada-informatica.svg', coverAlt: 'Portada del área Informática y Comunicaciones', createdAt: new Date('2026-10-28T10:00:00Z').getTime(),
        tags: ['Programación', 'Algoritmos', 'Pseudocódigo'],
        content: this._ficha('Lógica de programación', 'Desarrolla soluciones informáticas a problemas simples', 'Diseña algoritmos en pseudocódigo y los traduce a un lenguaje de programación.', '4 sesiones de 90 min') +
          `<h2>1. ¿Qué es un algoritmo?</h2><p>Es una secuencia finita y ordenada de pasos para resolver un problema. Sus estructuras básicas son la secuencial, la condicional (si… entonces) y la repetitiva (mientras… / para…).</p>
          <h2>2. Ejemplo: calcular el total con ITBIS</h2><pre><code>Inicio
  Leer precio
  itbis ← precio * 0.18
  total ← precio + itbis
  Escribir total
Fin</code></pre>
          <h2>3. Tu primer programa (Python)</h2><pre><code>precio = float(input("Precio: "))
itbis = precio * 0.18
print("Total:", precio + itbis)</code></pre><p>Prueba con varios valores y verifica que el resultado sea el esperado antes de seguir.</p>` }),
      base({ id: 'art-ciberseguridad', title: 'Ciberseguridad en el taller: contraseñas, phishing y respaldo 3-2-1', subject: 'Informática y Comunicaciones', grade: 'Módulo formativo • 5to', readTime: 6, views: 1210,
        summary: 'Hábitos simples que protegen tus cuentas, tus equipos y tu información.', coverImage: 'portada-informatica.svg', coverAlt: 'Portada del área Informática y Comunicaciones', createdAt: new Date('2026-11-02T10:00:00Z').getTime(),
        tags: ['Ciberseguridad', 'Phishing', 'Respaldo'],
        content: this._ficha('Seguridad informática y redes', 'Protege la información y los equipos de una organización', 'Aplica medidas básicas de seguridad y reconoce intentos de phishing.', '2 sesiones de 90 min') +
          `<h2>1. Contraseñas fuertes</h2><ul><li>Usa frases largas (12 caracteres o más) y distintas para cada cuenta.</li><li>Guarda tus claves en un gestor de contraseñas.</li><li>Activa la verificación en dos pasos.</li></ul>
          <h2>2. Cómo reconocer el phishing</h2><p>Desconfía de remitentes extraños, mensajes que te urgen a actuar, errores de redacción y enlaces acortados o que no coinciden con el sitio oficial.</p>
          <h2>3. Respaldo 3-2-1</h2><p>Mantén <strong>3</strong> copias de tus datos, en <strong>2</strong> tipos de medios distintos y <strong>1</strong> copia fuera del lugar donde trabajas.</p>` }),
      base({ id: 'art-higiene-manos', title: 'Higiene de manos: los 5 momentos de la OMS', subject: 'Enfermería', grade: 'Bachillerato Técnico • 5to', readTime: 5, views: 1750,
        summary: 'La medida más simple y eficaz para prevenir infecciones asociadas a la atención de salud.', coverImage: 'portada-enfermeria.svg', coverAlt: 'Portada del área Enfermería', createdAt: new Date('2026-11-05T10:00:00Z').getTime(),
        tags: ['Enfermería', 'Bioseguridad', 'OMS'],
        content: this._ficha('Fundamentos de enfermería y bioseguridad', 'Aplica medidas de prevención y control de infecciones', 'Ejecuta la higiene de manos en los 5 momentos recomendados por la OMS.', '2 sesiones de 90 min') +
          `<h2>Los 5 momentos</h2><ol><li>Antes del contacto con el paciente.</li><li>Antes de realizar una tarea limpia o aséptica.</li><li>Después del riesgo de exposición a líquidos corporales.</li><li>Después del contacto con el paciente.</li><li>Después del contacto con el entorno del paciente.</li></ol>
          <h2>Técnica</h2><p>La fricción con preparado de base alcohólica dura de 20 a 30 segundos. El lavado con agua y jabón dura de 40 a 60 segundos y se prefiere cuando las manos están visiblemente sucias.</p>` }),
      base({ id: 'art-signos-vitales', title: 'Signos vitales: técnica de toma y valores de referencia', subject: 'Enfermería', grade: 'Bachillerato Técnico • 4to', readTime: 7, views: 1390,
        summary: 'Aprende a medir, interpretar y registrar correctamente los signos vitales.', coverImage: 'portada-enfermeria.svg', coverAlt: 'Portada del área Enfermería', createdAt: new Date('2026-11-09T10:00:00Z').getTime(),
        tags: ['SignosVitales', 'Enfermería', 'Registro'],
        content: this._ficha('Procedimientos básicos de enfermería', 'Realiza la valoración inicial del paciente', 'Toma y registra los signos vitales con la técnica adecuada.', '3 sesiones de 90 min') +
          `<h2>Valores de referencia en adultos</h2><ul><li><strong>Temperatura:</strong> 36.1 a 37.2 °C</li><li><strong>Frecuencia cardíaca:</strong> 60 a 100 latidos por minuto</li><li><strong>Frecuencia respiratoria:</strong> 12 a 20 respiraciones por minuto</li><li><strong>Presión arterial:</strong> menor de 120/80 mmHg</li><li><strong>Saturación de oxígeno:</strong> 95 % o más</li></ul>
          <h2>Técnica</h2><p>Para el pulso radial cuenta durante 30 segundos y multiplica por 2 (60 segundos si es irregular). Cuenta la respiración sin que el paciente lo note. Registra siempre el valor con su unidad, la hora y tus observaciones.</p>
          <p><em>Estos valores son de referencia para adultos; en niños y adultos mayores varían. Sigue siempre el protocolo de tu centro.</em></p>` })
    ];
    const comments = [
      { id: 'comm-1', articleId: 'art-compost-suelo', authorName: 'Prof. Manuel Grullón', authorType: 'teacher', authorBadge: 'Docente Verificado', schoolInfo: 'Centro Politécnico • Distrito 10-01',
        content: 'Excelente desglose. Hicimos hoy la práctica de compostaje con mis 28 estudiantes de 4to Técnico y fue fantástica. ¿Tiene recomendaciones para adaptarla a un espacio pequeño?', status: 'pending', createdAt: Date.now() - 45 * 60 * 1000, teacherReply: null },
      { id: 'comm-2', articleId: 'art-compost-suelo', authorName: 'Estefanía Peña', authorType: 'family', authorBadge: 'Familia Comunidad', schoolInfo: 'Madre de estudiante de 4to Técnico',
        content: 'Leí este recurso junto a mi hijo para su proyecto del módulo formativo. Las preguntas finales nos sirvieron para repasar el tema en casa.', status: 'approved', createdAt: Date.now() - 24 * 3600 * 1000,
        teacherReply: '¡Qué alegría, Estefanía! Cuando la familia participa, el aprendizaje técnico se vuelve parte de la vida diaria. ¡Gracias por acompañarlo!' },
      { id: 'comm-3', articleId: 'art-asiento-contable', authorName: 'Visitante_982', authorType: 'guest', authorBadge: 'Anónimo', schoolInfo: 'IP: 179.53.*.* • Sin credenciales',
        content: 'Para resolver rápido sus tareas miren este link gratis en hxxp://descarga-examenes-rd.cc y ganen puntos sin estudiar.', status: 'pending', isSpamAlert: true, createdAt: Date.now() - 2 * 3600 * 1000, teacherReply: null }
    ];
    const media = [
      { id: 'media-compost', title: 'Diagrama de compost en capas', category: 'infografias', url: 'portada-agropecuaria.svg', sizeKB: 12, dimensions: '1200x800', altText: 'Portada del área Agropecuaria', associatedArticle: 'Compost y manejo del suelo en la finca escolar', createdAt: new Date('2026-10-14').getTime() },
      { id: 'media-asiento', title: 'Plantilla de asiento contable', category: 'fichas', url: 'portada-gestion.svg', sizeKB: 12, dimensions: '1200x800', altText: 'Portada del área Gestión Administrativa y Tributaria', associatedArticle: 'El asiento contable paso a paso', createdAt: new Date('2026-10-20').getTime() },
      { id: 'media-bioseguridad', title: 'Simulacro de higiene de manos', category: 'portadas', url: 'portada-enfermeria.svg', sizeKB: 12, dimensions: '1200x800', altText: 'Portada del área Enfermería', associatedArticle: 'Higiene de manos: los 5 momentos de la OMS', createdAt: new Date('2026-11-05').getTime() }
    ];
    return { articles, comments, media };
  }

  async _putContentSeeds() {
    const s = this._contentSeeds();
    for (const a of s.articles) await this._putRaw('articles', a);
    for (const c of s.comments) await this._putRaw('comments', c);
    for (const m of s.media) await this._putRaw('media', m);
    await this._putRaw('settings', { key: 'contentVersion', version: 2 });
  }

  async _deleteRaw(store, id) {
    return new Promise((resolve) => {
      const tx = this.db.transaction([store], 'readwrite');
      tx.objectStore(store).delete(id);
      tx.oncomplete = () => resolve(); tx.onerror = () => resolve();
    });
  }

  // Migración: reemplaza el contenido de ejemplo anterior (áreas básicas) por el de la ETP.
  // Los artículos y archivos creados por el docente no se tocan.
  async _migrateContent() {
    const cur = await new Promise((resolve) => {
      const req = this.db.transaction(['settings'], 'readonly').objectStore('settings').get('contentVersion');
      req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null);
    });
    if (cur && cur.version >= 2) return;
    for (const id of ['art-ciclo-agua', 'art-fracciones-equiv', 'art-oraciones-claras', 'art-manglares-borrador']) await this._deleteRaw('articles', id);
    for (const id of ['comm-1', 'comm-2', 'comm-3']) await this._deleteRaw('comments', id);
    for (const id of ['media-esquema-ciclo', 'media-manglares', 'media-fracciones']) await this._deleteRaw('media', id);
    await this._putContentSeeds();
    const p = await new Promise((resolve) => {
      const req = this.db.transaction(['settings'], 'readonly').objectStore('settings').get('teacherProfile');
      req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null);
    });
    if (p && (p.specialty === 'Educación Primaria • Mención Ciencias' || p.role === 'Especialista en Didáctica')) {
      await this._putRaw('settings', Object.assign({}, p, {
        role: p.role === 'Especialista en Didáctica' ? 'Docente de Educación Técnico Profesional' : p.role,
        specialty: p.specialty === 'Educación Primaria • Mención Ciencias' ? 'Educación Técnico Profesional (ETP)' : p.specialty,
        school: p.school === 'Distrito Educativo 10-01' ? 'Mi centro educativo' : p.school, updatedAt: Date.now() }));
    }
  }

  async _seedInitialData() {
    const articlesCount = await this._countRaw('articles');
    if (articlesCount === 0) {
      await this._putContentSeeds();
      // Perfil docente por defecto (editable desde perfil.html)
      const settingsCount = await this._countRaw('settings');
      if (settingsCount <= 1) {
        await this._putRaw('settings', {
          key: 'teacherProfile',
          name: 'Wilcelis Mateo',
          title: 'Lic.',
          role: 'Docente de Educación Técnico Profesional',
          specialty: 'Educación Técnico Profesional (ETP)',
          school: 'Mi centro educativo',
          yearsExperience: 14,
          bio: 'Educar con ternura y firmeza es encender una antorcha que nunca dejará de alumbrar el porvenir de nuestra patria.',
          photoUrl: 'foto-perfil.jpg',
          updatedAt: Date.now()
        });
      }
    }
    await this._migrateContent();
    await this._migrateProfile();
  }

  // Migración: si el navegador aún guarda el perfil de ejemplo anterior
  // (sin modificar), lo reemplaza por el perfil actual. Si el docente ya
  // editó su perfil, no se toca.
  async _migrateProfile() {
    const cur = await new Promise((resolve) => {
      const req = this.db.transaction(['settings'], 'readonly').objectStore('settings').get('teacherProfile');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
    const oldSeed = cur && /Ramona Almonte/.test(cur.name || '');
    if (oldSeed) {
      await this._putRaw('settings', Object.assign({}, cur, {
        name: 'Wilcelis Mateo',
        title: 'Lic.',
        photoUrl: 'foto-perfil.jpg',
        updatedAt: Date.now()
      }));
    }
    // Artículos de ejemplo firmados con el nombre anterior
    const arts = await new Promise((resolve) => {
      const req = this.db.transaction(['articles'], 'readonly').objectStore('articles').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
    for (const a of arts) {
      if (a.author === 'Lic. Ramona Almonte') {
        a.author = 'Lic. Wilcelis Mateo';
        await this._putRaw('articles', a);
      }
    }
  }

  // ── Método faltante: actualizar artículo (usado por lectura.html para vistas) ──
  async updateArticle(id, updates) {
    const article = await this.get('articles', id);
    if (!article) return null;
    Object.assign(article, updates, { updatedAt: Date.now() });
    await this.put('articles', article);
    return article;
  }

  // Operaciones CRUD genéricas sobre IndexedDB
  async get(storeName, key) {
    await this._initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getAll(storeName) {
    await this._initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async put(storeName, item) {
    await this._initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async delete(storeName, key) {
    await this._initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async count(storeName) {
    await this._initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // Métodos específicos de Dominio Educativo (Facade)
  async getPublishedArticles() {
    const articles = await this.getAll('articles');
    return articles.filter(a => a.status === 'published').sort((a, b) => b.createdAt - a.createdAt);
  }

  async getArticleById(id) {
    return await this.get('articles', id);
  }

  async saveArticle(articleData) {
    if (!articleData.id) {
      articleData.id = 'art-' + Date.now();
      articleData.createdAt = Date.now();
      articleData.views = 0;
    }
    articleData.updatedAt = Date.now();
    await this.put('articles', articleData);
    return articleData;
  }

  async deleteArticle(id) {
    // Soft-delete: mover a papelera (status = 'trash') en vez de borrar permanentemente
    const article = await this.get('articles', id);
    if (!article) return false;
    article.previousStatus = article.status;
    article.status = 'trash';
    article.trashedAt = Date.now();
    await this.put('articles', article);
    return true;
  }

  async restoreArticle(id) {
    const article = await this.get('articles', id);
    if (!article || article.status !== 'trash') return null;
    article.status = article.previousStatus || 'draft';
    delete article.trashedAt;
    delete article.previousStatus;
    await this.put('articles', article);
    return article;
  }

  async permanentDeleteArticle(id) {
    // Eliminación permanente real (solo para vaciar papelera)
    const comments = await this.getAll('comments');
    for (const c of comments) {
      if (c.articleId === id) {
        await this.delete('comments', c.id);
      }
    }
    return await this.delete('articles', id);
  }

  async getTrashedArticles() {
    const articles = await this.getAll('articles');
    return articles.filter(a => a.status === 'trash').sort((a, b) => b.trashedAt - a.trashedAt);
  }

  async getCommentsByArticle(articleId, onlyApproved = true) {
    const all = await this.getAll('comments');
    return all.filter(c => c.articleId === articleId && (!onlyApproved || c.status === 'approved'))
              .sort((a, b) => b.createdAt - a.createdAt);
  }

  async addComment(commentData) {
    if (!commentData.id) {
      commentData.id = 'comm-' + Date.now();
      commentData.createdAt = Date.now();
      commentData.status = 'pending'; // moderación requerida por defecto
    }
    await this.put('comments', commentData);
    return commentData;
  }

  async updateCommentStatus(id, newStatus, replyText = null) {
    const comm = await this.get('comments', id);
    if (!comm) return null;
    comm.status = newStatus;
    if (replyText !== null) {
      comm.teacherReply = replyText;
    }
    await this.put('comments', comm);
    return comm;
  }

  async deleteComment(id) {
    return await this.delete('comments', id);
  }

  async getAllMedia() {
    const items = await this.getAll('media');
    return items.sort((a, b) => b.createdAt - a.createdAt);
  }

  async saveMedia(mediaData) {
    if (!mediaData.id) {
      mediaData.id = 'media-' + Date.now();
      mediaData.createdAt = Date.now();
    }
    await this.put('media', mediaData);
    return mediaData;
  }

  async deleteMedia(id) {
    return await this.delete('media', id);
  }

  // ── Perfil Docente ──
  async getTeacherProfile() {
    const profile = await this.get('settings', 'teacherProfile');
    // Retornar defaults si no existe
    return profile || {
      key: 'teacherProfile',
      name: 'Docente',
      title: '',
      role: '',
      specialty: '',
      school: '',
      yearsExperience: 0,
      bio: '',
      photoUrl: '',
      updatedAt: Date.now()
    };
  }

  async updateTeacherProfile(updates) {
    const current = await this.getTeacherProfile();
    Object.assign(current, updates, { key: 'teacherProfile', updatedAt: Date.now() });
    await this.put('settings', current);
    return current;
  }
}

// Instancia global exportable
window.AulaAbiertaDB = new StorageService();

// === XSS Sanitization Utilities ===

// Sanitize rich HTML content — strips scripts, iframes, event handlers, dangerous tags
// Use for article body content that legitimately contains formatting (h2, p, strong, etc.)
function sanitizeHTML(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  // Remove dangerous tags
  div.querySelectorAll('script, iframe, object, embed, form, input').forEach(el => el.remove());
  // Remove event handlers and javascript: URLs
  div.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on') || attr.value.startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return div.innerHTML;
}
window.sanitizeHTML = sanitizeHTML;

// Escape plain text for safe insertion into HTML templates
// Use for author names, titles, summaries, comments — any user string in a template literal
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
window.escapeHTML = escapeHTML;

// === Non-blocking Toast Notification ===
window.showToast = function(message, type) {
  if (typeof type === 'string' && !['success','error','warning','info'].includes(type)) type = 'info';
  const toast = document.createElement('div');
  toast.className = 'toast-notification toast-' + (type || 'info');
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:12px 24px;border-radius:8px;color:#fff;font-size:14px;z-index:9999;animation:fadeIn .3s ease;max-width:400px;box-shadow:0 4px 12px rgba(0,0,0,.15);';
  toast.style.backgroundColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6';
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, 3000);
};
