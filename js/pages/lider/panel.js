/* ============================================================
   pages/lider/panel.js — Panel del club (pantalla 17)
   ------------------------------------------------------------
   Entrada plana: resumen del club y accesos a cada módulo
   (V-12). Avisa si el club está en `Pending Leader`.
   ============================================================ */

import {
  getClubById, getClubMembers, getClubSolicitudes,
  getClubEvents, getClubTramites
} from '../../data-service.js';
import { getSession } from '../../auth.js';
import { label, statusBadgeClass, fmtDate, esc } from '../../utils.js';

const session = getSession();
const content = document.getElementById('content');

const MODULES = [
  ['club.html', '🏷️', 'Información', 'Datos y documentos'],
  ['miembros.html', '👥', 'Miembros', 'Nómina y roles asignados'],
  ['roles.html', '🔑', 'Roles', 'Permisos del club'],
  ['solicitudes.html', '📨', 'Solicitudes', 'Postulaciones pendientes'],
  ['formularios.html', '📝', 'Formularios', 'Constructor dinámico'],
  ['eventos.html', '📅', 'Eventos', 'Gestión y staff'],
  ['nomina-pao.html', '🔄', 'Nómina PAO', 'Renovación de período'],
  ['rendicion.html', '📤', 'Rendición', 'Reportes a GBP'],
];

function statCard(value, lbl) {
  return `<div class="card p-4 text-center">
    <p class="text-3xl font-extrabold app-primary">${value}</p>
    <p class="app-muted text-sm mt-1">${lbl}</p>
  </div>`;
}

async function init() {
  const club = await getClubById(session.club_id);
  if (!club) { content.innerHTML = '<div class="card p-6">No se encontró tu club.</div>'; return; }

  const [members, pending, events, tramites] = await Promise.all([
    getClubMembers(session.club_id),
    getClubSolicitudes(session.club_id, 'Pending'),
    getClubEvents(session.club_id),
    getClubTramites(session.club_id),
  ]);
  const lastTramite = [...tramites].sort((a, b) =>
    new Date(b.uploaded_at) - new Date(a.uploaded_at))[0];

  const pendingBanner = club.status === 'Pending Leader'
    ? `<div class="card app-surface-2 p-4 mb-5"><span class="badge badge-warning">Club sin líder activo</span>
        <p class="app-muted text-sm mt-2">Este club espera la activación de su líder por parte de GBP.</p></div>` : '';

  content.innerHTML = `
    ${pendingBanner}
    <div class="card p-5 mb-6 flex items-center gap-4">
      <div class="w-14 h-14 rounded-xl btn-primary flex items-center justify-center text-2xl font-black shrink-0">
        ${esc(club.acronym?.[0] || 'C')}
      </div>
      <div>
        <h2 class="font-bold text-lg">${esc(club.name)}</h2>
        <p class="app-muted text-sm">${esc(club.acronym)} · ${esc(club.faculty || '')} · ${esc(club.location || '')}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      ${statCard(members.length, 'Miembros activos')}
      ${statCard(pending.length, 'Solicitudes pendientes')}
      ${statCard(events.length, 'Eventos creados')}
      ${statCard(lastTramite ? label(lastTramite.status) : '—', 'Último trámite GBP')}
    </div>

    <h3 class="font-bold mb-3">Módulos de gestión</h3>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      ${MODULES.map(([href, icon, title, desc]) => `
        <a href="${href}" class="card p-4 hover:-translate-y-0.5 transition-transform">
          <p class="text-2xl">${icon}</p>
          <p class="font-semibold mt-2">${title}</p>
          <p class="app-muted text-sm">${desc}</p>
        </a>`).join('')}
    </div>`;
}

init();
