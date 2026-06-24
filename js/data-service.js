/* ============================================================
   data-service.js — Único punto de acceso a datos (Fase 1)
   ------------------------------------------------------------
   Lee los .json locales con fetch (simula el acceso a datos).
   En la Fase 2 SOLO se cambia este archivo para apuntar a la
   API de FastAPI; las pantallas no se tocan.

   La ruta a /data se resuelve con import.meta.url, de modo que
   funciona igual desde index.html (raíz) o desde pages/**.
   ============================================================ */

const DATA_BASE = new URL('../data/', import.meta.url);
const _cache = new Map();

/** Carga y cachea un archivo .json del directorio /data. */
export async function getJSON(name) {
  if (_cache.has(name)) return _cache.get(name);
  const res = await fetch(new URL(name, DATA_BASE));
  if (!res.ok) throw new Error(`No se pudo cargar ${name} (HTTP ${res.status})`);
  const data = await res.json();
  _cache.set(name, data);
  return data;
}

/* ---------- Lectores base (solo lectura de .json) ---------- */
export const getUsuarios    = () => getJSON('usuarios.json');
export const getAsistencias = () => getJSON('asistencias.json');
export const getCatalogos   = () => getJSON('catalogos.json');

/* ---------- Lectores con overlay aplicado ----------
   Estos fusionan los .json con lo creado/editado en la sesión,
   de modo que TODAS las pantallas ven el estado coherente. */

export async function getClubs() {
  const base = await getJSON('clubes.json');
  const { clubEdits, clubDocs, docVisibility, newClubs, docDeletes } = getOverlay();
  const apply = c => {
    let club = clubEdits[c.id] ? { ...c, ...clubEdits[c.id] } : { ...c };
    const baseDocs = (club.internal_documents || []).map(d =>
      d.doc_id in docVisibility ? { ...d, is_public: docVisibility[d.doc_id] } : d);
    club.internal_documents = [...baseDocs, ...(clubDocs[c.id] || [])]
      .filter(d => !docDeletes.includes(d.doc_id));
    return club;
  };
  return [...base.map(apply), ...newClubs.map(apply)];
}

export async function getRoles() {
  const base = await getJSON('roles.json');
  const { newRoles, roleEdits, roleDeletes } = getOverlay();
  return [...base, ...newRoles]
    .filter(r => !roleDeletes.includes(r.id))
    .map(r => roleEdits[r.id] ? { ...r, ...roleEdits[r.id] } : r);
}

export async function getMembresias() {
  const base = await getJSON('membresias.json');
  const { membershipChanges, newMemberships } = getOverlay();
  const merged = base.map(m =>
    membershipChanges[m.id] ? { ...m, ...membershipChanges[m.id] } : m);
  return [...merged, ...newMemberships];
}

export async function getFormularios() {
  const base = await getJSON('formularios.json');
  const { newForms, formEdits, formDeletes } = getOverlay();
  return [...base, ...newForms]
    .filter(f => !formDeletes.includes(f.id))
    .map(f => formEdits[f.id] ? { ...f, ...formEdits[f.id] } : f);
}

export async function getEventos() {
  const base = await getJSON('eventos.json');
  const { eventEdits, newEvents, eventDeletes } = getOverlay();
  return [...base, ...newEvents]
    .filter(e => !eventDeletes.includes(e.id))
    .map(e => eventEdits[e.id] ? { ...e, ...eventEdits[e.id] } : e);
}

export async function getTramitesGBP() {
  const base = await getJSON('tramites_gbp.json');
  const { newTramites, tramiteStatus } = getOverlay();
  const apply = t => tramiteStatus[t.id] ? { ...t, ...tramiteStatus[t.id] } : t;
  return [...base.map(apply), ...newTramites.map(apply)];
}

/* ============================================================
   Capa de escritura SIMULADA (overlay en localStorage)
   ------------------------------------------------------------
   Los .json son de solo lectura. Las inserciones, cambios de
   estado y ediciones de la Fase 1 se guardan como un "overlay"
   en localStorage para que el prototipo recuerde lo hecho en
   la sesión. En la Fase 2 esto lo asume el backend.
   ============================================================ */

const OVERLAY_KEY = 'espolclub_overlay';

const OVERLAY_DEFAULTS = {
  solicitudes: [], inscripciones: [], asistencias: [],
  solicitudStatus: {}, profileEdits: {}, readNotifs: [],
  // ---- Panel del Líder ----
  clubEdits: {},         // { clubId: {...patch} }
  clubDocs: {},          // { clubId: [doc,...] }  documentos añadidos
  docVisibility: {},     // { docId: bool }        override de visibilidad
  membershipChanges: {}, // { membershipId: {role_id?, status?} }
  newMemberships: [],    // membresías creadas (aprobaciones, renovación PAO)
  newRoles: [],          // roles personalizados creados
  roleEdits: {},         // { roleId: {...patch} }  edición de roles base
  roleDeletes: [],       // [roleId] roles eliminados
  newForms: [],          // formularios creados/versionados
  formEdits: {},         // { formId: {...patch} }  edición de formularios base
  formDeletes: [],       // [formId] formularios eliminados
  newEvents: [],         // eventos creados
  eventEdits: {},        // { eventId: {...patch} }
  eventDeletes: [],      // [eventId] eventos eliminados
  eventStaff: {},        // { eventId: [studentId,...] }
  docDeletes: [],        // [docId] documentos eliminados
  newTramites: [],       // reportes enviados a GBP
  // ---- Panel de GBP ----
  newClubs: [],          // clubes creados por GBP
  tramiteStatus: {},     // { tramiteId: {status, review_feedback, reviewed_by_gbp_id} }
  newPaos: [],           // períodos PAO creados
  paoEdits: {},          // { pao_period: {...patch} }
};

function getOverlay() {
  try {
    return Object.assign(structuredClone(OVERLAY_DEFAULTS),
      JSON.parse(localStorage.getItem(OVERLAY_KEY)) || {});
  } catch {
    return structuredClone(OVERLAY_DEFAULTS);
  }
}
function saveOverlay(o) { localStorage.setItem(OVERLAY_KEY, JSON.stringify(o)); }

/* ---------- Perfil (con ediciones del overlay) ---------- */
export async function getProfileByEnrollment(enrollment) {
  const u = await getUsuarios();
  const base = u.profiles.find(p => p.enrollment === enrollment);
  if (!base) return null;
  const edit = getOverlay().profileEdits[enrollment];
  return edit ? { ...base, ...edit } : base;
}

export async function getProfileById(id) {
  const u = await getUsuarios();
  const base = u.profiles.find(p => p.id === Number(id));
  if (!base) return null;
  const edit = getOverlay().profileEdits[base.enrollment];
  return edit ? { ...base, ...edit } : base;
}

/** Guarda campos editables del perfil (descripción, habilidades, redes). */
export function updateProfile(enrollment, patch) {
  const o = getOverlay();
  o.profileEdits[enrollment] = { ...(o.profileEdits[enrollment] || {}), ...patch };
  saveOverlay(o);
}

/* ---------- Clubes / formularios ---------- */
export async function getClubById(id) {
  const clubs = await getClubs();
  return clubs.find(c => c.id === Number(id)) || null;
}
export async function getMembershipForm(clubId) {
  const forms = (await getFormularios())
    .filter(f => f.club_id === Number(clubId) && f.form_type === 'Membership' && f.is_active)
    .sort((a, b) => (b.version || 1) - (a.version || 1));
  return forms[0] || null;
}
export async function getFormById(id) {
  const forms = await getFormularios();
  return forms.find(f => f.id === Number(id)) || null;
}

/** ¿Es el estudiante miembro activo del club? */
export async function isActiveMember(studentId, clubId) {
  const m = await getMembresias();
  return m.some(x => x.student_id === Number(studentId) &&
                     x.club_id === Number(clubId) && x.status === 'Active');
}

/* ---------- Solicitudes de membresía ---------- */
export async function getSolicitudesAll() {
  const base = await getJSON('solicitudes.json');
  const o = getOverlay();
  // Aplica cambios de estado del overlay sobre las base.
  const merged = base.map(s => o.solicitudStatus[s.id] ? { ...s, ...o.solicitudStatus[s.id] } : s);
  return [...merged, ...o.solicitudes];
}

export async function addSolicitud({ student_id, club_id, form_id, responses }) {
  const o = getOverlay();
  const nueva = {
    id: Date.now(), student_id, club_id, form_id,
    submitted_at: new Date().toISOString(),
    responses, status: 'Pending', leader_feedback: null
  };
  o.solicitudes.push(nueva);
  saveOverlay(o);
  return nueva;
}

/** Líder: cambia el estado de una solicitud (RF-27, RN-5). */
export function setSolicitudStatus(id, status, feedback = null) {
  const o = getOverlay();
  // Si es una solicitud creada en sesión, edítala in situ; si es base, regístrala.
  const local = o.solicitudes.find(s => s.id === id);
  if (local) { local.status = status; local.leader_feedback = feedback; }
  else o.solicitudStatus[id] = { status, leader_feedback: feedback };
  saveOverlay(o);
}

/** RN-2: ¿puede el estudiante postular a este club? */
export async function canApply(studentId, clubId) {
  studentId = Number(studentId); clubId = Number(clubId);
  if (await isActiveMember(studentId, clubId))
    return { allowed: false, reason: 'Ya eres miembro activo de este club.' };
  const solicitudes = await getSolicitudesAll();
  const pendiente = solicitudes.some(s =>
    s.student_id === studentId && s.club_id === clubId && s.status === 'Pending');
  if (pendiente)
    return { allowed: false, reason: 'Ya tienes una solicitud pendiente en este club.' };
  return { allowed: true, reason: null };
}

/* ---------- Inscripciones a eventos / QR ---------- */
export async function getInscripcionesAll() {
  const base = await getJSON('inscripciones.json');
  const o = getOverlay();
  // Aplica asistencias registradas (cambio de qr/attendance) sobre las base.
  const merged = base.map(i => {
    const a = o.asistencias.find(x => x.event_id === i.event_id && x.student_id === i.student_id);
    return a ? { ...i, qr_status: 'Used', attendance_status: 'Attended' } : i;
  });
  return [...merged, ...o.inscripciones];
}

/** Evento por id. */
export async function getEventById(id) {
  const ev = await getEventos();
  return ev.find(e => e.id === Number(id)) || null;
}

/**
 * Eventos visibles para un estudiante. Los `MembersOnly` SON visibles
 * para no-miembros (RF-31); el bloqueo aplica solo al registro.
 */
export async function getVisibleEvents(_studentId) {
  return getEventos();
}

/**
 * RF-31/RF-34: ¿puede el estudiante inscribirse a este evento?
 * Devuelve { allowed, reason, alreadyRegistered }.
 */
export async function canRegisterEvent(studentId, event) {
  studentId = Number(studentId);
  const insc = await getInscripcionesAll();
  const yaInscrito = insc.some(i => i.event_id === event.id && i.student_id === studentId);
  if (yaInscrito)
    return { allowed: false, alreadyRegistered: true, reason: 'Ya estás inscrito en este evento.' };

  if (!event.registration_form_id)
    return { allowed: false, reason: 'Este evento no tiene registro abierto.' };

  if (event.visibility === 'MembersOnly') {
    const member = await isActiveMember(studentId, event.club_id);
    if (!member)
      return { allowed: false, reason: event.blocked_message || 'Evento exclusivo para miembros.' };
  }

  if (event.registration_deadline && new Date() > new Date(event.registration_deadline))
    return { allowed: false, reason: event.blocked_message || 'El registro está cerrado.' };

  return { allowed: true, reason: null };
}

/** Crea una inscripción y su credencial QR (mock). */
export async function addInscripcion({ event_id, student_id, form_id, responses }) {
  const o = getOverlay();
  const id = Date.now();
  const nueva = {
    id, event_id, student_id, form_id,
    registered_at: new Date().toISOString(),
    responses,
    qr_token: `MOCKQR-${id}-${Math.random().toString(36).slice(2, 8)}`,
    qr_status: 'Active',
    attendance_status: 'Registered'
  };
  o.inscripciones.push(nueva);
  saveOverlay(o);
  return nueva;
}

/* ---------- Asistencias (escaneo Staff, RN-6) ---------- */
export async function getAsistenciasAll() {
  const base = await getJSON('asistencias.json');
  return [...base, ...getOverlay().asistencias];
}

/**
 * Valida un qr_token y registra asistencia única (RN-6).
 * Devuelve { ok, status, message, inscripcion? }.
 */
export async function registerScan(qrToken, staffStudentId) {
  qrToken = (qrToken || '').trim();
  if (!qrToken) return { ok: false, status: 'empty', message: 'Ingresa o escanea un código.' };

  const insc = await getInscripcionesAll();
  const found = insc.find(i => i.qr_token === qrToken);
  if (!found)
    return { ok: false, status: 'invalid', message: 'Credencial no reconocida.' };

  if (found.attendance_status === 'Attended' || found.qr_status === 'Used')
    return { ok: false, status: 'duplicate', message: 'Esta credencial ya registró asistencia.' };

  const o = getOverlay();
  o.asistencias.push({
    id: Date.now(),
    event_id: found.event_id,
    student_id: found.student_id,
    scanned_at: new Date().toISOString(),
    scanned_by_staff_id: Number(staffStudentId) || null,
    status: 'Attended'
  });
  saveOverlay(o);
  return { ok: true, status: 'ok', message: 'Asistencia registrada correctamente.', inscripcion: found };
}

/* ---------- Notificaciones (centro in-app, RF-51) ---------- */
export async function getNotificacionesForUser(userId) {
  const base = await getJSON('notificaciones.json');
  const read = new Set(getOverlay().readNotifs);
  return base
    .filter(n => n.user_id === Number(userId))
    .map(n => ({ ...n, read: n.read || read.has(n.id) }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
export function markNotificationsRead(ids) {
  const o = getOverlay();
  o.readNotifs = [...new Set([...o.readNotifs, ...ids])];
  saveOverlay(o);
}

/* ---------- Historial del estudiante (pantalla 15) ---------- */
export async function getStudentHistory(studentId) {
  studentId = Number(studentId);
  const [solicitudes, inscripciones, eventos, clubs] = await Promise.all([
    getSolicitudesAll(), getInscripcionesAll(), getEventos(), getClubs()
  ]);
  const applications = solicitudes
    .filter(s => s.student_id === studentId)
    .map(s => ({ ...s, club: clubs.find(c => c.id === s.club_id) }))
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
  const attendances = inscripciones
    .filter(i => i.student_id === studentId)
    .map(i => ({ ...i, event: eventos.find(e => e.id === i.event_id) }))
    .sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at));
  return { applications, attendances };
}

/* ============================================================
   PANEL DEL LÍDER (pantallas 17–27)
   ============================================================ */

/* ---------- 18. Información del club ---------- */
export function updateClub(clubId, patch) {
  const o = getOverlay();
  o.clubEdits[clubId] = { ...(o.clubEdits[clubId] || {}), ...patch };
  saveOverlay(o);
}
export function addClubDocument(clubId, { title, file_url, is_public }) {
  const o = getOverlay();
  (o.clubDocs[clubId] ||= []).push({
    doc_id: Date.now(), title, file_url, is_public: !!is_public
  });
  saveOverlay(o);
}
/** Elimina un documento del club. */
export function deleteClubDocument(docId) {
  const o = getOverlay();
  // Si es un doc añadido en sesión, quítalo; si es base, márcalo eliminado.
  let removed = false;
  for (const list of Object.values(o.clubDocs)) {
    const i = list.findIndex(d => d.doc_id === docId);
    if (i >= 0) { list.splice(i, 1); removed = true; break; }
  }
  if (!removed && !o.docDeletes.includes(docId)) o.docDeletes.push(docId);
  saveOverlay(o);
}
export function setDocVisibility(docId, isPublic) {
  const o = getOverlay();
  // Si es un doc añadido en sesión, edítalo in situ; si es base, registra override.
  let found = false;
  for (const list of Object.values(o.clubDocs)) {
    const d = list.find(x => x.doc_id === docId);
    if (d) { d.is_public = isPublic; found = true; break; }
  }
  if (!found) o.docVisibility[docId] = isPublic;
  saveOverlay(o);
}

/* ---------- 19. Miembros / nómina ---------- */
export async function getClubMembers(clubId, { onlyActive = true } = {}) {
  const [membresias, usuarios, roles] = await Promise.all([
    getMembresias(), getUsuarios(), getRoles()
  ]);
  return membresias
    .filter(m => m.club_id === Number(clubId) && (!onlyActive || m.status === 'Active'))
    .map(m => ({
      membership: m,
      profile: usuarios.profiles.find(p => p.id === m.student_id) || null,
      role: roles.find(r => r.id === m.role_id) || null,
    }));
}
export function setMembershipRole(membershipId, roleId) {
  const o = getOverlay();
  const local = o.newMemberships.find(m => m.id === membershipId);
  if (local) local.role_id = Number(roleId);
  else o.membershipChanges[membershipId] = { ...(o.membershipChanges[membershipId] || {}), role_id: Number(roleId) };
  saveOverlay(o);
}
export function revokeMembership(membershipId) {
  const o = getOverlay();
  const local = o.newMemberships.find(m => m.id === membershipId);
  if (local) local.status = 'Revoked';
  else o.membershipChanges[membershipId] = { ...(o.membershipChanges[membershipId] || {}), status: 'Revoked' };
  saveOverlay(o);
}

/* ---------- 20. Roles y permisos ---------- */
export async function getClubRoles(clubId) {
  return (await getRoles()).filter(r => r.club_id === Number(clubId));
}
export async function addRole(clubId, { role_name, is_leadership, permissions }) {
  const o = getOverlay();
  const nuevo = {
    id: Date.now(), club_id: Number(clubId), role_name,
    is_default: false, is_leadership: !!is_leadership, permissions
  };
  o.newRoles.push(nuevo);
  saveOverlay(o);
  return nuevo;
}
/** Edita un rol (los predeterminados no se editan). */
export function updateRole(roleId, patch) {
  const o = getOverlay();
  const local = o.newRoles.find(r => r.id === roleId);
  if (local) Object.assign(local, patch);
  else o.roleEdits[roleId] = { ...(o.roleEdits[roleId] || {}), ...patch };
  saveOverlay(o);
}
/** Elimina un rol personalizado (los predeterminados no se eliminan). */
export function deleteRole(roleId) {
  const o = getOverlay();
  const idx = o.newRoles.findIndex(r => r.id === roleId);
  if (idx >= 0) o.newRoles.splice(idx, 1);
  else if (!o.roleDeletes.includes(roleId)) o.roleDeletes.push(roleId);
  saveOverlay(o);
}
/** ¿El rol está asignado a alguna membresía activa? (bloquea su borrado) */
export async function isRoleInUse(roleId) {
  return (await getMembresias()).some(m => m.role_id === roleId && m.status === 'Active');
}

/* ---------- 21. Solicitudes (aprobación crea membresía, RF-08) ---------- */
async function memberRoleId(clubId) {
  const roles = await getRoles();
  const r = roles.find(x => x.club_id === Number(clubId) && x.role_name === 'Miembro' && x.is_default);
  return r ? r.id : null;
}
export async function approveSolicitud(sol) {
  setSolicitudStatus(sol.id, 'Approved');
  const pao = await getActivePao();
  const roleId = await memberRoleId(sol.club_id);
  const o = getOverlay();
  o.newMemberships.push({
    id: Date.now(), student_id: sol.student_id, club_id: sol.club_id, role_id: roleId,
    pao_period: pao?.pao_period || null,
    valid_from: pao?.start_date || null, valid_until: pao?.end_date || null,
    status: 'Active'
  });
  saveOverlay(o);
}
export function rejectSolicitud(id, feedback) {
  setSolicitudStatus(id, 'Rejected', feedback);
}
export async function getClubSolicitudes(clubId, status = null) {
  const all = await getSolicitudesAll();
  return all.filter(s => s.club_id === Number(clubId) && (!status || s.status === status));
}

/* ---------- 22. Constructor de formularios ---------- */
export async function getClubForms(clubId) {
  return (await getFormularios()).filter(f => f.club_id === Number(clubId));
}
/** RF-24: ¿el formulario ya tiene respuestas? (entonces se versiona). */
export async function formHasResponses(formId) {
  const [sol, insc] = await Promise.all([getSolicitudesAll(), getInscripcionesAll()]);
  return sol.some(s => s.form_id === Number(formId)) || insc.some(i => i.form_id === Number(formId));
}
export async function saveForm({ club_id, form_type, event_id = null, title, fields }) {
  const o = getOverlay();
  // Versión = max(versión existente del mismo club+tipo) + 1
  const forms = await getClubForms(club_id);
  const sameType = forms.filter(f => f.form_type === form_type);
  const version = sameType.length ? Math.max(...sameType.map(f => f.version || 1)) + 1 : 1;
  const nuevo = {
    id: Date.now(), club_id: Number(club_id), form_type, event_id,
    title, is_active: true, version, fields
  };
  o.newForms.push(nuevo);
  saveOverlay(o);
  return nuevo;
}
/** Edita un formulario SIN respuestas (in situ). Si tiene respuestas, usar saveForm (nueva versión, RF-24). */
export function updateForm(formId, patch) {
  const o = getOverlay();
  const local = o.newForms.find(f => f.id === formId);
  if (local) Object.assign(local, patch);
  else o.formEdits[formId] = { ...(o.formEdits[formId] || {}), ...patch };
  saveOverlay(o);
}
/** Elimina un formulario SIN respuestas. */
export function deleteForm(formId) {
  const o = getOverlay();
  const idx = o.newForms.findIndex(f => f.id === formId);
  if (idx >= 0) o.newForms.splice(idx, 1);
  else if (!o.formDeletes.includes(formId)) o.formDeletes.push(formId);
  saveOverlay(o);
}
/** Desactiva un formulario CON respuestas (conserva la evidencia, RNF-12). */
export function deactivateForm(formId) {
  updateForm(formId, { is_active: false });
}

/* ---------- 23–25. Eventos y Staff ---------- */
export async function getClubEvents(clubId) {
  const [eventos, insc] = await Promise.all([getEventos(), getInscripcionesAll()]);
  return eventos
    .filter(e => e.club_id === Number(clubId))
    .map(e => {
      const regs = insc.filter(i => i.event_id === e.id);
      return {
        ...e,
        metrics: {
          registered: regs.length,
          attended: regs.filter(i => i.attendance_status === 'Attended').length,
        }
      };
    });
}
export async function addEvent(clubId, data) {
  const o = getOverlay();
  const nuevo = { id: Date.now(), club_id: Number(clubId), stats: { registered: 0, attended: 0 }, ...data };
  o.newEvents.push(nuevo);
  saveOverlay(o);
  return nuevo;
}
export function updateEvent(id, patch) {
  const o = getOverlay();
  const local = o.newEvents.find(e => e.id === id);
  if (local) Object.assign(local, patch);
  else o.eventEdits[id] = { ...(o.eventEdits[id] || {}), ...patch };
  saveOverlay(o);
}
/** ¿El evento tiene inscritos? (bloquea su borrado para preservar evidencia) */
export async function eventHasRegistrations(eventId) {
  return (await getInscripcionesAll()).some(i => i.event_id === eventId);
}
/** Elimina un evento sin inscritos. */
export function deleteEvent(id) {
  const o = getOverlay();
  const idx = o.newEvents.findIndex(e => e.id === id);
  if (idx >= 0) o.newEvents.splice(idx, 1);
  else if (!o.eventDeletes.includes(id)) o.eventDeletes.push(id);
  saveOverlay(o);
}
export function getEventStaff(eventId) {
  return getOverlay().eventStaff[eventId] || [];
}
export function setEventStaff(eventId, studentIds) {
  const o = getOverlay();
  o.eventStaff[eventId] = studentIds.map(Number);
  saveOverlay(o);
}

/* ---------- 26. PAO y renovación de nómina ---------- */
export async function getPaos() {
  const base = (await getCatalogos()).pao_periods;
  const { newPaos, paoEdits } = getOverlay();
  const merged = base.map(p => paoEdits[p.pao_period] ? { ...p, ...paoEdits[p.pao_period] } : p);
  return [...merged, ...newPaos];
}
export async function getActivePao() {
  return (await getPaos()).find(p => p.status === 'Active') || null;
}
/** Nómina (membresías) de un club en un PAO dado. */
export async function getNomina(clubId, paoPeriod) {
  return (await getMembresias())
    .filter(m => m.club_id === Number(clubId) && m.pao_period === paoPeriod);
}
/** RF-21: renueva membresías seleccionadas hacia el PAO activo. */
export async function renewNomina(clubId, membershipIds) {
  const pao = await getActivePao();
  if (!pao) return [];
  const [membresias] = await Promise.all([getMembresias()]);
  const o = getOverlay();
  const created = [];
  for (const id of membershipIds) {
    const src = membresias.find(m => m.id === id);
    if (!src) continue;
    const nueva = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      student_id: src.student_id, club_id: src.club_id, role_id: src.role_id,
      pao_period: pao.pao_period, valid_from: pao.start_date, valid_until: pao.end_date,
      status: 'Active'
    };
    o.newMemberships.push(nueva);
    created.push(nueva);
  }
  saveOverlay(o);
  return created;
}

/* ---------- 27. Rendición de cuentas (trámites GBP) ---------- */
export async function getClubTramites(clubId) {
  return (await getTramitesGBP()).filter(t => t.club_id === Number(clubId));
}
export async function addTramite(clubId, { pao_period, document_type, file_url }) {
  const o = getOverlay();
  const nuevo = {
    id: Date.now(), club_id: Number(clubId), pao_period, document_type, file_url,
    uploaded_at: new Date().toISOString(), status: 'Submitted',
    review_feedback: null, reviewed_by_gbp_id: null
  };
  o.newTramites.push(nuevo);
  saveOverlay(o);
  return nuevo;
}

/* ============================================================
   PANEL DE GBP (pantallas 28–33)
   ============================================================ */

/** Resuelve el perfil del líder de un club a partir de su matrícula. */
export async function getClubLeader(club) {
  if (!club?.leader_enrollment) return null;
  return getProfileByEnrollment(club.leader_enrollment);
}

/** Catálogo global con líder resuelto y conteo de miembros activos. */
export async function getGlobalCatalog() {
  const [clubs, membresias, usuarios] = await Promise.all([
    getClubs(), getMembresias(), getUsuarios()
  ]);
  return clubs.map(c => {
    const leader = usuarios.profiles.find(p => p.enrollment === c.leader_enrollment) || null;
    const active = membresias.filter(m => m.club_id === c.id && m.status === 'Active').length;
    return { ...c, leader, active_members: active };
  });
}

/* ---------- 29. Alta de club + asignación de líder ---------- */
/**
 * RF-11/RF-12: GBP crea el club. Si la matrícula del líder no tiene
 * cuenta, el club queda en `Pending Leader`.
 */
export async function addClub({ name, acronym, description, location, faculty, interest_areas, leader_enrollment }) {
  const leader = await getProfileByEnrollment(leader_enrollment);
  const o = getOverlay();
  const nuevo = {
    id: Date.now(), name, acronym, description, location, faculty,
    interest_areas, image: 'assets/img/clubes/club_3.png',
    leader_enrollment, status: leader ? 'Active' : 'Pending Leader',
    members_count: 0, social_media: [], internal_documents: []
  };
  o.newClubs.push(nuevo);
  saveOverlay(o);
  return nuevo;
}

/* ---------- 30. Auditoría / gestión de liderazgo ---------- */
/** RF-13: revoca al líder; el club pasa a `Pending Leader`. */
export function revokeLeader(clubId) {
  updateClub(clubId, { leader_enrollment: null, status: 'Pending Leader' });
}
/** Asigna (o reasigna) un líder por matrícula. */
export async function assignLeader(clubId, enrollment) {
  const leader = await getProfileByEnrollment(enrollment);
  updateClub(clubId, { leader_enrollment: enrollment, status: leader ? 'Active' : 'Pending Leader' });
  return { activated: !!leader };
}

/* ---------- 31. Buzón de trámites ---------- */
/** RF-43/RN-5: GBP aprueba o rechaza un trámite (rechazo exige feedback). */
export function setTramiteStatus(id, status, feedback, gbpId) {
  const o = getOverlay();
  const local = o.newTramites.find(t => t.id === id);
  const patch = { status, review_feedback: feedback || null, reviewed_by_gbp_id: gbpId || null };
  if (local) Object.assign(local, patch);
  else o.tramiteStatus[id] = patch;
  saveOverlay(o);
}

/* ---------- 32. Configuración de PAO ---------- */
export async function addPao({ pao_period, start_date, end_date, status }) {
  const o = getOverlay();
  if (status === 'Active') await closeOtherPaos(o, pao_period);
  o.newPaos.push({ pao_period, start_date, end_date, status: status || 'Closed' });
  saveOverlay(o);
}
export async function updatePao(paoPeriod, patch) {
  const o = getOverlay();
  if (patch.status === 'Active') await closeOtherPaos(o, paoPeriod);
  const local = o.newPaos.find(p => p.pao_period === paoPeriod);
  if (local) Object.assign(local, patch);
  else o.paoEdits[paoPeriod] = { ...(o.paoEdits[paoPeriod] || {}), ...patch };
  saveOverlay(o);
}
/** Garantiza un solo PAO activo: cierra los demás. */
async function closeOtherPaos(o, activePeriod) {
  const paos = await getPaos();
  for (const p of paos) {
    if (p.pao_period === activePeriod) continue;
    if (p.status === 'Active') {
      const local = o.newPaos.find(x => x.pao_period === p.pao_period);
      if (local) local.status = 'Closed';
      else o.paoEdits[p.pao_period] = { ...(o.paoEdits[p.pao_period] || {}), status: 'Closed' };
    }
  }
}

/* ---------- 33. Histórico por PAO ---------- */
/** Clubes con su líder y nº de miembros registrados en un PAO dado. */
export async function getHistoryByPao(paoPeriod) {
  const [clubs, membresias, usuarios] = await Promise.all([
    getClubs(), getMembresias(), getUsuarios()
  ]);
  return clubs.map(c => {
    const leader = usuarios.profiles.find(p => p.enrollment === c.leader_enrollment) || null;
    const count = membresias.filter(m => m.club_id === c.id && m.pao_period === paoPeriod).length;
    return { club: c, leader, members_in_pao: count };
  }).filter(x => x.members_in_pao > 0 || x.club.status === 'Active');
}
