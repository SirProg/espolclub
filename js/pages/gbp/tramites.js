/* ============================================================
   pages/gbp/tramites.js — Buzón de trámites (pantalla 31)
   ------------------------------------------------------------
   V-23: documentos enviados por los clubes. RF-43/RN-5: aprobar
   o rechazar (rechazo con feedback obligatorio). Exportación
   consolidada (.csv como simulación de .xlsx en Fase 1).
   ============================================================ */

import { getTramitesGBP, getClubs, setTramiteStatus } from '../../data-service.js';
import { getSession } from '../../auth.js';
import { label, statusBadgeClass, fmtDateTime, esc } from '../../utils.js';

const session = getSession();
const content = document.getElementById('content');
let tramites = [], clubsById = {};

const isFinal = t => t.status === 'Approved' || t.status === 'Rejected';

function card(t) {
  const club = clubsById[t.club_id];
  const actions = isFinal(t)
    ? `<p class="app-muted text-sm mt-3">${t.review_feedback ? '💬 ' + esc(t.review_feedback) : 'Resuelto sin comentarios.'}</p>`
    : `<div class="flex gap-2 mt-4" data-actions>
         <button class="btn btn-primary" data-approve>Aprobar</button>
         <button class="btn btn-ghost" data-reject>Rechazar</button>
       </div>
       <div class="hidden mt-3" data-reject-box>
         <label class="label">Motivo del rechazo (obligatorio)</label>
         <textarea class="textarea mt-1" rows="2" data-feedback></textarea>
         <p class="field-error hidden">Debes indicar el motivo del rechazo.</p>
         <div class="flex gap-2 mt-2">
           <button class="btn btn-danger" data-confirm>Confirmar rechazo</button>
           <button class="btn btn-ghost" data-cancel>Cancelar</button>
         </div>
       </div>
       <div class="hidden mt-3 badge badge-success" data-done></div>`;

  return `
    <div class="card p-5" data-card="${t.id}">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="font-bold">${esc(t.document_type)}</h3>
          <p class="app-muted text-sm">${esc(club?.name || 'Club')} · PAO ${esc(t.pao_period)}</p>
          <p class="app-muted text-xs mt-1">Enviado ${fmtDateTime(t.uploaded_at)}</p>
        </div>
        <span class="badge ${statusBadgeClass(t.status)}">${label(t.status)}</span>
      </div>
      <a href="#" class="chip mt-3" data-pdf>📄 Abrir PDF</a>
      ${actions}
    </div>`;
}

function wire(el) {
  const id = Number(el.dataset.card);
  el.querySelector('[data-pdf]')?.addEventListener('click', e => {
    e.preventDefault();
    alert('Vista previa del PDF (simulada en Fase 1).');
  });
  const actions = el.querySelector('[data-actions]');
  if (!actions) return;
  const box = el.querySelector('[data-reject-box]');
  const done = el.querySelector('[data-done]');
  const finish = (msg) => { actions.classList.add('hidden'); box.classList.add('hidden');
    done.textContent = msg; done.classList.remove('hidden'); };

  el.querySelector('[data-approve]').addEventListener('click', () => {
    setTramiteStatus(id, 'Approved', null, session.student_id);
    finish('✓ Trámite aprobado');
  });
  el.querySelector('[data-reject]').addEventListener('click', () => {
    actions.classList.add('hidden'); box.classList.remove('hidden');
  });
  el.querySelector('[data-cancel]').addEventListener('click', () => {
    box.classList.add('hidden'); actions.classList.remove('hidden');
  });
  el.querySelector('[data-confirm]').addEventListener('click', () => {
    const fb = el.querySelector('[data-feedback]').value.trim();
    if (!fb) { el.querySelector('.field-error').classList.remove('hidden'); return; }
    setTramiteStatus(id, 'Rejected', fb, session.student_id);
    finish('Trámite rechazado');
  });
}

function exportCsv() {
  const head = ['Club', 'Documento', 'PAO', 'Estado', 'Enviado', 'Feedback'];
  const rows = tramites.map(t => [
    clubsById[t.club_id]?.name || '', t.document_type, t.pao_period,
    label(t.status), t.uploaded_at, t.review_feedback || ''
  ]);
  const csv = [head, ...rows]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'tramites_gbp.csv'; a.click();
  URL.revokeObjectURL(url);
}

async function init() {
  [tramites, clubsById] = await Promise.all([
    getTramitesGBP(),
    getClubs().then(cs => Object.fromEntries(cs.map(c => [c.id, c]))),
  ]);

  if (!tramites.length) {
    content.innerHTML = '<div class="card p-6 app-muted">No hay trámites por revisar.</div>';
    return;
  }

  content.innerHTML = `
    <div class="flex justify-end mb-4">
      <button id="export" class="btn btn-ghost text-sm">⬇ Exportar consolidado (.csv)</button>
    </div>
    <div id="list" class="flex flex-col gap-4">${tramites.map(card).join('')}</div>`;

  document.getElementById('export').addEventListener('click', exportCsv);
  content.querySelectorAll('[data-card]').forEach(wire);
}

init();
