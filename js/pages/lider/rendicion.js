/* ============================================================
   pages/lider/rendicion.js — Rendición de cuentas a GBP (27)
   ------------------------------------------------------------
   V-20/F-16: consolida la nómina por PAO, muestra el estado de
   los trámites y permite enviar reportes (PDF) a GBP. Un trámite
   enviado queda en `Submitted` (bloqueado para edición).
   ============================================================ */

import {
  getClubTramites, addTramite, getPaos, getActivePao, getClubMembers
} from '../../data-service.js';
import { getSession } from '../../auth.js';
import { label, statusBadgeClass, fmtDate, fmtDateTime, esc } from '../../utils.js';

const session = getSession();
const content = document.getElementById('content');

const DOC_TYPES = ['Nómina de Miembros', 'Estatutos', 'Evidencias de Actividades'];

function tramitesTable(tramites) {
  if (!tramites.length) return '<p class="app-muted text-sm">Aún no has enviado reportes a GBP.</p>';
  return `
    <table class="w-full text-sm">
      <thead><tr class="text-left app-muted">
        <th class="pb-2 font-semibold">Documento</th>
        <th class="pb-2 font-semibold">PAO</th>
        <th class="pb-2 font-semibold">Enviado</th>
        <th class="pb-2 font-semibold">Estado</th>
        <th class="pb-2 font-semibold">Feedback</th>
      </tr></thead>
      <tbody>
        ${tramites.map(t => `
          <tr class="divider">
            <td class="py-2 pr-3">${esc(t.document_type)}</td>
            <td class="py-2 pr-3 app-muted">${esc(t.pao_period)}</td>
            <td class="py-2 pr-3 app-muted text-xs">${fmtDateTime(t.uploaded_at)}</td>
            <td class="py-2 pr-3"><span class="badge ${statusBadgeClass(t.status)}">${label(t.status)}</span></td>
            <td class="py-2 app-muted text-xs">${esc(t.review_feedback || '')}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

async function init() {
  const [tramites, paos, activePao, members] = await Promise.all([
    getClubTramites(session.club_id), getPaos(), getActivePao(),
    getClubMembers(session.club_id),
  ]);

  content.innerHTML = `
    <div class="grid sm:grid-cols-3 gap-3 mb-6">
      <div class="card p-4 text-center">
        <p class="text-3xl font-extrabold app-primary">${members.length}</p>
        <p class="app-muted text-sm mt-1">Miembros activos (nómina ${esc(activePao?.pao_period || '')})</p>
      </div>
      <div class="card p-4 text-center">
        <p class="text-3xl font-extrabold app-primary">${tramites.length}</p>
        <p class="app-muted text-sm mt-1">Reportes enviados</p>
      </div>
      <div class="card p-4 text-center">
        <p class="text-3xl font-extrabold app-primary">${tramites.filter(t => t.status === 'Approved').length}</p>
        <p class="app-muted text-sm mt-1">Aprobados por GBP</p>
      </div>
    </div>

    <div class="card p-6 mb-6">
      <h2 class="font-bold mb-3">Trámites</h2>
      <div class="overflow-x-auto">${tramitesTable(tramites)}</div>
    </div>

    <div class="card p-6">
      <h2 class="font-bold mb-4">Enviar nuevo reporte</h2>
      <form id="rep-form" class="flex flex-col gap-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Período (PAO)</label>
            <select id="r-pao" class="select mt-1">
              ${paos.map(p => `<option value="${p.pao_period}" ${p.status === 'Active' ? 'selected' : ''}>${p.pao_period}${p.status === 'Active' ? ' (activo)' : ''}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="label">Tipo de documento</label>
            <select id="r-type" class="select mt-1">${DOC_TYPES.map(d => `<option>${d}</option>`).join('')}</select>
          </div>
        </div>
        <div>
          <label class="label">Archivo (PDF)</label>
          <input id="r-file" type="file" accept="application/pdf" class="input mt-1">
        </div>
        <p id="r-error" class="field-error hidden"></p>
        <div class="flex items-center gap-3">
          <button type="submit" class="btn btn-primary">Enviar a GBP</button>
          <span id="r-ok" class="badge badge-success hidden">✓ Reporte enviado</span>
        </div>
      </form>
    </div>`;

  document.getElementById('rep-form').addEventListener('submit', async e => {
    e.preventDefault();
    const file = document.getElementById('r-file').files[0];
    const err = document.getElementById('r-error');
    if (!file) { err.textContent = 'Selecciona el archivo PDF.'; err.classList.remove('hidden'); return; }
    if (file.type !== 'application/pdf') { err.textContent = 'El archivo debe ser un PDF.'; err.classList.remove('hidden'); return; }
    err.classList.add('hidden');
    await addTramite(session.club_id, {
      pao_period: document.getElementById('r-pao').value,
      document_type: document.getElementById('r-type').value,
      file_url: `local/docs/${file.name}`,
    });
    init();
  });
}

init();
