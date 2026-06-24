/* ============================================================
   pages/gbp/club-detalle.js — Detalle de club / GBP (pantalla 30)
   ------------------------------------------------------------
   V-22: auditoría del club. RF-13: revocar/asignar líder. GBP
   no edita el interior del club, solo audita y gestiona liderazgo.
   ============================================================ */

import {
  getClubById, getClubLeader, getClubMembers, revokeLeader, assignLeader
} from '../../data-service.js';
import { label, statusBadgeClass, fmtDate, esc } from '../../utils.js';

const content = document.getElementById('content');
const clubId = Number(new URLSearchParams(location.search).get('id'));

async function render() {
  const club = await getClubById(clubId);
  if (!club) { content.innerHTML = '<div class="card p-6">No se encontró el club.</div>'; return; }
  const [leader, members] = await Promise.all([getClubLeader(club), getClubMembers(clubId)]);

  const docs = (club.internal_documents || []).map(d => `
    <li class="flex items-center justify-between py-2 divider">
      <span class="text-sm">📄 ${esc(d.title)}</span>
      <span class="badge ${d.is_public ? 'badge-success' : 'badge-warning'}">${d.is_public ? 'Público' : 'Privado'}</span>
    </li>`).join('') || '<p class="app-muted text-sm">Sin documentos.</p>';

  content.innerHTML = `
    <a href="catalogo-global.html" class="text-sm app-muted hover:app-text">&larr; Volver al catálogo global</a>

    <div class="card p-6 mt-3">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold">${esc(club.name)}</h2>
          <p class="app-muted text-sm">${esc(club.acronym)} · ${esc(club.faculty || '')} · ${esc(club.location || '')}</p>
        </div>
        <span class="badge ${statusBadgeClass(club.status === 'Active' ? 'Active' : 'Pending')}">${label(club.status)}</span>
      </div>
      <p class="mt-3">${esc(club.description || '')}</p>
      <div class="flex flex-wrap gap-1.5 mt-3">${(club.interest_areas || []).map(a => `<span class="chip">${a}</span>`).join(' ')}</div>
      <div class="grid sm:grid-cols-3 gap-3 mt-5 text-sm">
        <div><p class="app-muted text-xs uppercase">Miembros activos</p><p class="font-semibold">${members.length}</p></div>
        <div><p class="app-muted text-xs uppercase">Documentos</p><p class="font-semibold">${(club.internal_documents || []).length}</p></div>
        <div><p class="app-muted text-xs uppercase">Matrícula líder</p><p class="font-semibold">${esc(club.leader_enrollment || '—')}</p></div>
      </div>
    </div>

    <div class="card p-6 mt-4">
      <h3 class="font-bold mb-3">Gestión de liderazgo</h3>
      ${leader
        ? `<p class="text-sm mb-3">Líder actual: <strong>${esc(leader.first_name)} ${esc(leader.last_name)}</strong>
            <span class="app-muted">(${esc(leader.email)})</span></p>
           <button id="revoke" class="btn btn-danger">Revocar líder</button>`
        : `<p class="text-sm mb-3"><span class="badge badge-warning">Sin líder activo</span>
            ${club.leader_enrollment ? `La matrícula ${esc(club.leader_enrollment)} aún no tiene cuenta.` : ''}</p>`}
      <div class="divider mt-4 pt-4">
        <label class="label">Asignar / reasignar líder por matrícula</label>
        <div class="flex flex-col sm:flex-row gap-2 mt-1">
          <input id="new-leader" class="input" placeholder="Matrícula del nuevo líder">
          <button id="assign" class="btn btn-primary">Asignar</button>
        </div>
        <p id="assign-msg" class="app-muted text-sm mt-2"></p>
      </div>
    </div>

    <div class="card p-6 mt-4">
      <h3 class="font-bold mb-2">Documentos</h3>
      <ul>${docs}</ul>
    </div>`;

  document.getElementById('revoke')?.addEventListener('click', () => {
    if (!confirm('¿Revocar al líder? El club quedará sin líder hasta nueva asignación.')) return;
    revokeLeader(clubId); render();
  });

  document.getElementById('assign').addEventListener('click', async () => {
    const enr = document.getElementById('new-leader').value.trim();
    const msg = document.getElementById('assign-msg');
    if (!enr) { msg.textContent = 'Ingresa una matrícula.'; return; }
    const { activated } = await assignLeader(clubId, enr);
    msg.textContent = activated
      ? 'Líder asignado y club activado.'
      : 'Matrícula sin cuenta: el club queda “Sin líder” hasta que se registre.';
    setTimeout(render, 800);
  });
}

render();
