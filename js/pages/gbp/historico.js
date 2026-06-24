/* ============================================================
   pages/gbp/historico.js — Histórico por PAO (pantalla 33)
   ------------------------------------------------------------
   V-25/RF-49: GBP consulta la evidencia de períodos anteriores
   (clubes, líderes y nómina por PAO).
   ============================================================ */

import { getPaos, getHistoryByPao } from '../../data-service.js';
import { label, esc } from '../../utils.js';

const content = document.getElementById('content');
let paos = [];

async function renderTable(pao) {
  const data = await getHistoryByPao(pao);
  const host = document.getElementById('hist-table');
  if (!data.length) {
    host.innerHTML = '<div class="card p-6 app-muted">No hay información histórica para este período.</div>';
    return;
  }
  host.innerHTML = `
    <div class="card p-5 overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="text-left app-muted">
          <th class="pb-2 font-semibold">Club</th>
          <th class="pb-2 font-semibold">Líder</th>
          <th class="pb-2 font-semibold text-center">Miembros en ${esc(pao)}</th>
        </tr></thead>
        <tbody>
          ${data.map(({ club, leader, members_in_pao }) => `
            <tr class="divider">
              <td class="py-3 pr-3">
                <p class="font-medium">${esc(club.name)}</p>
                <p class="app-muted text-xs">${esc(club.acronym)} · ${esc(club.faculty || '')}</p>
              </td>
              <td class="py-3 pr-3">${leader ? esc(leader.first_name + ' ' + leader.last_name) : '<span class="app-muted">—</span>'}</td>
              <td class="py-3 text-center font-semibold">${members_in_pao}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

async function init() {
  paos = await getPaos();
  const active = paos.find(p => p.status === 'Active') || paos[0];

  content.innerHTML = `
    <div class="mb-4 max-w-xs">
      <label class="label">Período académico</label>
      <select id="pao-select" class="select mt-1">
        ${paos.map(p => `<option value="${esc(p.pao_period)}" ${p === active ? 'selected' : ''}>${esc(p.pao_period)} (${label(p.status) || p.status})</option>`).join('')}
      </select>
    </div>
    <div id="hist-table">Cargando…</div>`;

  const sel = document.getElementById('pao-select');
  sel.addEventListener('change', () => renderTable(sel.value));
  if (active) renderTable(active.pao_period);
}

init();
