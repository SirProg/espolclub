/* ============================================================
   pages/lider/nomina-pao.js — Renovación de nómina por PAO (26)
   ------------------------------------------------------------
   V-19/RF-21: al iniciar el nuevo PAO, el líder reactiva
   manualmente las membresías congeladas del período anterior.
   ============================================================ */

import {
  getMembresias, getActivePao, getProfileById, getClubRoles, renewNomina
} from '../../data-service.js';
import { getSession } from '../../auth.js';
import { label, statusBadgeClass, fmtDate, esc } from '../../utils.js';

const session = getSession();
const content = document.getElementById('content');
let activePao, roles = [];

async function rowFor(m) {
  const p = await getProfileById(m.student_id);
  const r = roles.find(x => x.id === m.role_id);
  return `
    <tr class="divider" data-m="${m.id}">
      <td class="py-3 pr-3"><input type="checkbox" data-pick value="${m.id}"></td>
      <td class="py-3 pr-3">
        <p class="font-medium">${esc(p ? p.first_name + ' ' + p.last_name : '—')}</p>
        <p class="app-muted text-xs">${esc(p?.enrollment || '')}</p>
      </td>
      <td class="py-3 pr-3"><span class="chip">${esc(r?.role_name || 'Miembro')}</span></td>
      <td class="py-3 pr-3 app-muted text-xs">${esc(m.pao_period || '')}</td>
      <td class="py-3"><span class="badge ${statusBadgeClass(m.status)}">${label(m.status)}</span></td>
    </tr>`;
}

async function init() {
  [activePao, roles] = await Promise.all([getActivePao(), getClubRoles(session.club_id)]);
  const membresias = await getMembresias();

  const clubMembs = membresias.filter(m => m.club_id === session.club_id);
  const activeNow = new Set(clubMembs
    .filter(m => m.pao_period === activePao?.pao_period && m.status === 'Active')
    .map(m => m.student_id));
  // Candidatos: membresías NO del PAO activo y cuyo estudiante no está ya activo este PAO.
  const candidates = clubMembs.filter(m =>
    m.pao_period !== activePao?.pao_period && !activeNow.has(m.student_id));

  if (!candidates.length) {
    content.innerHTML = `
      <div class="card p-6">
        <p class="app-muted">No hay nómina previa pendiente de renovar para el período <strong>${esc(activePao?.pao_period || '')}</strong>.</p>
      </div>`;
    return;
  }

  const rows = (await Promise.all(candidates.map(rowFor))).join('');
  content.innerHTML = `
    <div class="card app-surface-2 p-4 mb-4 text-sm app-muted">
      Período activo: <strong class="app-text">${esc(activePao?.pao_period || '')}</strong>
      (${fmtDate(activePao?.start_date)} – ${fmtDate(activePao?.end_date)}).
      Selecciona los miembros que continúan y renueva su membresía.
    </div>
    <div class="card p-5 overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="text-left app-muted">
          <th class="pb-2"><input type="checkbox" id="pick-all"></th>
          <th class="pb-2 font-semibold">Miembro</th>
          <th class="pb-2 font-semibold">Rol</th>
          <th class="pb-2 font-semibold">PAO origen</th>
          <th class="pb-2 font-semibold">Estado</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="flex items-center gap-3 mt-4">
        <button id="renew" class="btn btn-primary" disabled>Renovar seleccionados</button>
        <span id="renew-ok" class="badge badge-success hidden"></span>
      </div>
    </div>`;

  const picks = () => [...content.querySelectorAll('[data-pick]:checked')].map(i => Number(i.value));
  const renewBtn = document.getElementById('renew');
  const sync = () => { renewBtn.disabled = picks().length === 0; };

  content.querySelectorAll('[data-pick]').forEach(c => c.addEventListener('change', sync));
  document.getElementById('pick-all').addEventListener('change', e => {
    content.querySelectorAll('[data-pick]').forEach(c => { c.checked = e.target.checked; });
    sync();
  });

  renewBtn.addEventListener('click', async () => {
    const ids = picks();
    const created = await renewNomina(session.club_id, ids);
    const ok = document.getElementById('renew-ok');
    ok.textContent = `✓ ${created.length} membresía(s) renovada(s) en ${activePao.pao_period}`;
    ok.classList.remove('hidden');
    init(); // recarga: los renovados desaparecen de candidatos
  });
}

init();
