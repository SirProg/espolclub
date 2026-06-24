/* ============================================================
   pages/gbp/catalogo-global.js — Catálogo global (pantalla 28)
   ------------------------------------------------------------
   V-21: tabla de clubes + líderes + estado. Búsqueda y acceso
   al detalle/auditoría de cada club.
   ============================================================ */

import { getGlobalCatalog } from '../../data-service.js';
import { label, statusBadgeClass, esc } from '../../utils.js';

const content = document.getElementById('content');
let clubs = [];

function row(c) {
  const leader = c.leader
    ? `${esc(c.leader.first_name)} ${esc(c.leader.last_name)} <span class="app-muted text-xs">(${esc(c.leader_enrollment)})</span>`
    : `<span class="app-muted text-sm">Matrícula ${esc(c.leader_enrollment || '—')}</span>`;
  return `
    <tr class="divider">
      <td class="py-3 pr-3">
        <p class="font-medium">${esc(c.name)}</p>
        <p class="app-muted text-xs">${esc(c.acronym)} · ${esc(c.faculty || '')}</p>
      </td>
      <td class="py-3 pr-3">${leader}</td>
      <td class="py-3 pr-3 text-center">${c.active_members}</td>
      <td class="py-3 pr-3"><span class="badge ${statusBadgeClass(c.status === 'Active' ? 'Active' : 'Pending')}">${label(c.status)}</span></td>
      <td class="py-3 text-right"><a href="club-detalle.html?id=${c.id}" class="btn btn-ghost text-xs py-1.5">Ver / Auditar</a></td>
    </tr>`;
}

function render(list) {
  const body = list.length
    ? list.map(row).join('')
    : '<tr><td colspan="5" class="py-6 text-center app-muted">No hay clubes que coincidan.</td></tr>';
  document.getElementById('tbody').innerHTML = body;
}

async function init() {
  clubs = await getGlobalCatalog();
  content.innerHTML = `
    <div class="mb-4">
      <input id="q" class="input" type="search" placeholder="Buscar por nombre, acrónimo o facultad…">
    </div>
    <div class="card p-5 overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="text-left app-muted">
          <th class="pb-2 font-semibold">Club</th>
          <th class="pb-2 font-semibold">Líder</th>
          <th class="pb-2 font-semibold text-center">Miembros</th>
          <th class="pb-2 font-semibold">Estado</th>
          <th></th>
        </tr></thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>`;
  render(clubs);

  document.getElementById('q').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    render(clubs.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.acronym || '').toLowerCase().includes(q) ||
      (c.faculty || '').toLowerCase().includes(q)));
  });
}

init();
