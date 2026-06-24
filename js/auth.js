/* ============================================================
   auth.js — Autenticación simulada y enrutamiento por rol (F1)
   ------------------------------------------------------------
   Valida contra las credenciales mock de usuarios.json,
   guarda la sesión en localStorage y enruta a cada "hogar"
   según el rol. En la Fase 2 esto se reemplaza por JWT.
   ============================================================ */

import { getUsuarios, getProfileByEnrollment } from './data-service.js';

const SESSION_KEY = 'espolclub_session';

/** Mapa rol -> "hogar" relativo a la RAÍZ del proyecto. */
const HOME_BY_ROLE = {
  'Estudiante Politécnico': 'pages/movil/catalogo.html',
  'Miembro del Club':       'pages/movil/catalogo.html',
  'Líder de Club':          'pages/lider/panel.html',
  'Administrador GBP':      'pages/gbp/catalogo-global.html',
};

/* ---------- Sesión ---------- */
export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}
export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

/** Hogar (relativo a raíz) que corresponde al rol de la sesión. */
export function homeForRole(role) {
  return HOME_BY_ROLE[role] || 'index.html';
}

/* ---------- Login mock ---------- */
/**
 * Intenta autenticar. Devuelve { ok, session?, error? }.
 * No redirige: de eso se encarga quien llama.
 */
export async function login(enrollment, password) {
  enrollment = (enrollment || '').trim();
  password = (password || '').trim();
  if (!enrollment || !password) {
    return { ok: false, error: 'Completa matrícula/correo y contraseña.' };
  }

  const { mock_credentials } = await getUsuarios();
  const cred = mock_credentials.find(c =>
    c.enrollment.toLowerCase() === enrollment.toLowerCase() ||
    c.email.toLowerCase() === enrollment.toLowerCase());

  if (!cred || cred.password_mock !== password) {
    return { ok: false, error: 'Credenciales incorrectas. Revisa tus datos.' };
  }

  const profile = await getProfileByEnrollment(cred.enrollment);
  const session = {
    enrollment: cred.enrollment,
    email: cred.email,
    role: cred.display_role,
    club_id: cred.club_id,
    role_id: cred.role_id,
    student_id: profile ? profile.id : null,
    name: profile ? `${profile.first_name} ${profile.last_name}` : cred.display_role,
  };
  setSession(session);
  return { ok: true, session };
}

/**
 * Guarda de ruta: exige sesión y (opcional) un rol permitido.
 * `rootPrefix` es la ruta relativa hasta la raíz (ej. '../../').
 * Si no hay sesión válida, redirige al login y devuelve null.
 */
export function requireAuth(rootPrefix = '', allowedRoles = null) {
  const session = getSession();
  if (!session) {
    window.location.href = `${rootPrefix}index.html`;
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    window.location.href = `${rootPrefix}${homeForRole(session.role)}`;
    return null;
  }
  return session;
}
