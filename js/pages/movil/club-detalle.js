/* ============================================================
   pages/movil/club-detalle.js — Detalle de club (7) + postular (8)
   ------------------------------------------------------------
   Privacidad por contexto (RF-47/48): los no-miembros ven info
   pública + contador; los miembros ven la nómina interna y los
   documentos privados. Postulación con RN-2 (anti-duplicado).
   ============================================================ */

import {
  getClubById, getMembresias, getUsuarios, getRoles,
  getMembershipForm, canApply, addSolicitud
} from '../../data-service.js';
import { getSession } from '../../auth.js';
import { renderDynamicForm, collectResponses } from '../../components/dynamic-form.js';

const ROOT = '../../';
const PLACEHOLDER = ROOT + 'assets/img/clubes/club_8.png';

const view = document.getElementById('club-view');
const session = getSession();

const clubId = Number(new URLSearchParams(location.search).get('id'));

let club, membershipForm;

function socialLinks(list) {
  if (!list || !list.length) return '';
  return list.map(s =>
    `<a href="${s.link}" target="_blank" rel="noopener" class="chip">${s.network}</a>`).join(' ');
}

function docsList(docs, isMember) {
  const visibles = (docs || []).filter(d => d.is_public || isMember);
  if (!visibles.length) return '<p class="app-muted text-sm">Este club aún no ha publicado documentos.</p>';
  return visibles.map(d => `
    <li class="flex items-center justify-between py-2">
      <span class="text-sm">📄 ${d.title}</span>
      <span class="badge ${d.is_public ? 'badge-success' : 'badge-warning'}">
        ${d.is_public ? 'Público' : 'Privado'}
      </span>
    </li>`).join('');
}

async function rosterTable() {
  const [membresias, usuarios, roles] = await Promise.all([
    getMembresias(), getUsuarios(), getRoles()
  ]);
  const activas = membresias.filter(m => m.club_id === clubId && m.status === 'Active');
  if (!activas.length) return '<p class="app-muted text-sm">Aún no hay miembros registrados.</p>';

  const rows = activas.map(m => {
    const p = usuarios.profiles.find(u => u.id === m.student_id);
    const r = roles.find(x => x.id === m.role_id);
    return `<tr class="divider">
      <td class="py-2 pr-3">${p ? p.first_name + ' ' + p.last_name : '—'}</td>
      <td class="py-2 pr-3 app-muted">${p ? p.career : ''}</td>
      <td class="py-2"><span class="chip">${r ? r.role_name : 'Miembro'}</span></td>
    </tr>`;
  }).join('');

  return `
    <table class="w-full text-sm">
      <thead><tr class="text-left app-muted">
        <th class="pb-2 font-semibold">Nombre</th>
        <th class="pb-2 font-semibold">Carrera</th>
        <th class="pb-2 font-semibold">Rol</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function isMemberOfClub() {
  // El líder/miembro mock trae su club_id en la sesión.
  return session && session.club_id === clubId;
}

async function applyButton() {
  // Solo estudiantes/miembros que NO son ya parte del club pueden postular.
  if (isMemberOfClub()) {
    return `<span class="badge badge-success">Ya perteneces a este club</span>`;
  }
  if (club.status === 'Pending Leader') {
    return `<span class="badge badge-warning">Club sin líder: postulaciones cerradas</span>`;
  }
  const { allowed, reason } = await canApply(session.student_id, clubId);
  if (!allowed) {
    return `<button class="btn btn-ghost" disabled>${reason}</button>`;
  }
  if (!membershipForm) {
    return `<span class="app-muted text-sm">Este club aún no publica formulario de inscripción.</span>`;
  }
  return `<button id="apply-btn" class="btn btn-primary">Postular a este club</button>`;
}

async function render() {
  club = await getClubById(clubId);
  if (!club) {
    view.innerHTML = `<div class="card p-6 mt-3">No se encontró el club solicitado.</div>`;
    return;
  }
  membershipForm = await getMembershipForm(clubId);
  const member = isMemberOfClub();

  view.innerHTML = `
    <div class="card overflow-hidden">
      <div class="h-44 w-full app-surface-2 overflow-hidden">
        <img src="${ROOT}${club.image || ''}" alt="${club.name}"
             class="w-full h-full object-cover" onerror="this.src='${PLACEHOLDER}'">
      </div>
      <div class="p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h1 class="text-2xl font-extrabold tracking-tight">${club.name}</h1>
            <p class="app-muted text-sm font-mono">${club.acronym} · ${club.faculty || ''}</p>
          </div>
          <span class="font-semibold whitespace-nowrap">👥 ${club.members_count ?? 0} miembros</span>
        </div>

        <p class="mt-3">${club.description || ''}</p>

        <div class="flex flex-wrap gap-1.5 mt-3">
          ${(club.interest_areas || []).map(a => `<span class="chip">${a}</span>`).join(' ')}
        </div>

        <div class="mt-3 text-sm app-muted">📍 ${club.location || ''}</div>
        <div class="mt-3 flex flex-wrap gap-1.5">${socialLinks(club.social_media)}</div>

        <div class="mt-6" id="apply-slot"></div>
      </div>
    </div>

    <div class="card p-6 mt-4">
      <h2 class="font-bold mb-2">Documentos</h2>
      <ul class="flex flex-col">${docsList(club.internal_documents, member)}</ul>
    </div>

    ${member ? `
      <div class="card p-6 mt-4">
        <h2 class="font-bold mb-3">Nómina del club <span class="app-muted text-sm font-normal">(vista de miembro)</span></h2>
        <div id="roster">Cargando…</div>
      </div>` : `
      <div class="card p-6 mt-4">
        <p class="app-muted text-sm">🔒 La lista de miembros es privada. Solo se muestra el total a quienes no pertenecen al club.</p>
      </div>`}
  `;

  document.getElementById('apply-slot').innerHTML = await applyButton();
  document.getElementById('apply-btn')?.addEventListener('click', openModal);

  if (member) {
    document.getElementById('roster').innerHTML = await rosterTable();
  }
}

/* ---------- Modal de postulación ---------- */
const modal = document.getElementById('apply-modal');
const fieldsHost = document.getElementById('apply-fields');
const applyForm = document.getElementById('apply-form');

function openModal() {
  document.getElementById('apply-title').textContent = membershipForm.title || 'Postular al club';
  fieldsHost.innerHTML = renderDynamicForm(membershipForm);
  modal.classList.remove('hidden');
}
function closeModal() { modal.classList.add('hidden'); }

document.getElementById('apply-close').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

applyForm.addEventListener('submit', async e => {
  e.preventDefault();
  const { valid, responses } = collectResponses(fieldsHost, membershipForm);
  if (!valid) return;

  await addSolicitud({
    student_id: session.student_id,
    club_id: clubId,
    form_id: membershipForm.id,
    responses
  });

  closeModal();
  document.getElementById('apply-slot').innerHTML =
    `<div class="badge badge-success">✓ Solicitud enviada. Te notificaremos la respuesta.</div>`;
});

render();
