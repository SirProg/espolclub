/* ============================================================
   pages/lider/solicitudes.js — Bandeja de solicitudes (21)
   ------------------------------------------------------------
   V-15: pendientes con respuestas dinámicas. RF-27 aprobar/
   rechazar; RN-5 feedback obligatorio en el rechazo.
   ============================================================ */

import {
  getClubSolicitudes, approveSolicitud, rejectSolicitud,
  getProfileById, getFormById
} from '../../data-service.js';
import { getSession } from '../../auth.js';
import { label, statusBadgeClass, fmtDate, esc } from '../../utils.js';

const session = getSession();
const content = document.getElementById('content');

async function answersHtml(s) {
  const form = await getFormById(s.form_id);
  const fieldLabel = id => form?.fields.find(f => f.field_id === id)?.label || id;
  return (s.responses || []).map(r => `
    <div class="mt-2">
      <p class="app-muted text-xs">${esc(fieldLabel(r.field_id))}</p>
      <p class="text-sm">${esc(r.answer)}</p>
    </div>`).join('') || '<p class="app-muted text-sm">Sin respuestas.</p>';
}

async function pendingCard(s) {
  const student = await getProfileById(s.student_id);
  return `
    <div class="card p-5" data-card="${s.id}" data-student="${s.student_id}" data-club="${s.club_id}">
      <div class="flex items-start justify-between gap-2">
        <div>
          <h3 class="font-bold">${esc(student ? student.first_name + ' ' + student.last_name : 'Estudiante')}</h3>
          <p class="app-muted text-sm">${esc(student?.career || '')} · ${esc(student?.enrollment || '')} · ${esc(student?.email || '')}</p>
        </div>
        <span class="app-muted text-xs">${fmtDate(s.submitted_at)}</span>
      </div>
      <div class="divider mt-3 pt-3">${await answersHtml(s)}</div>
      <div class="flex gap-2 mt-4" data-actions>
        <button class="btn btn-primary" data-approve>Aprobar</button>
        <button class="btn btn-ghost" data-reject>Rechazar</button>
      </div>
      <div class="hidden mt-3" data-reject-box>
        <label class="label">Motivo del rechazo (obligatorio)</label>
        <textarea class="textarea mt-1" rows="2" data-feedback></textarea>
        <p class="field-error hidden">Debes indicar el motivo del rechazo.</p>
        <div class="flex gap-2 mt-2">
          <button class="btn btn-danger" data-confirm-reject>Confirmar rechazo</button>
          <button class="btn btn-ghost" data-cancel-reject>Cancelar</button>
        </div>
      </div>
      <div class="hidden mt-3 badge badge-success" data-done></div>
    </div>`;
}

function wire(card) {
  const id = Number(card.dataset.card);
  const actions = card.querySelector('[data-actions]');
  const rejectBox = card.querySelector('[data-reject-box]');
  const done = card.querySelector('[data-done]');
  const finish = msg => { actions.classList.add('hidden'); rejectBox.classList.add('hidden');
    done.textContent = msg; done.classList.remove('hidden'); };

  card.querySelector('[data-approve]').addEventListener('click', async () => {
    await approveSolicitud({ id, student_id: Number(card.dataset.student), club_id: Number(card.dataset.club) });
    finish('✓ Aprobada — el estudiante ya es miembro');
  });
  card.querySelector('[data-reject]').addEventListener('click', () => {
    actions.classList.add('hidden'); rejectBox.classList.remove('hidden');
  });
  card.querySelector('[data-cancel-reject]').addEventListener('click', () => {
    rejectBox.classList.add('hidden'); actions.classList.remove('hidden');
  });
  card.querySelector('[data-confirm-reject]').addEventListener('click', () => {
    const fb = card.querySelector('[data-feedback]').value.trim();
    if (!fb) { card.querySelector('.field-error').classList.remove('hidden'); return; }
    rejectSolicitud(id, fb);
    finish('Solicitud rechazada');
  });
}

async function init() {
  const [pending, all] = await Promise.all([
    getClubSolicitudes(session.club_id, 'Pending'),
    getClubSolicitudes(session.club_id),
  ]);
  const resolved = all.filter(s => s.status !== 'Pending');

  const pendingHtml = pending.length
    ? (await Promise.all(pending.map(pendingCard))).join('')
    : '<div class="card p-6 app-muted">No hay solicitudes pendientes.</div>';

  const resolvedHtml = resolved.length ? `
    <h2 class="font-bold mt-8 mb-3">Historial</h2>
    <div class="card p-5 overflow-x-auto">
      <table class="w-full text-sm"><tbody>
        ${(await Promise.all(resolved.map(async s => {
          const p = await getProfileById(s.student_id);
          return `<tr class="divider">
            <td class="py-2 pr-3">${esc(p ? p.first_name + ' ' + p.last_name : '—')}</td>
            <td class="py-2 pr-3 app-muted">${fmtDate(s.submitted_at)}</td>
            <td class="py-2 pr-3"><span class="badge ${statusBadgeClass(s.status)}">${label(s.status)}</span></td>
            <td class="py-2 app-muted text-xs">${esc(s.leader_feedback || '')}</td>
          </tr>`;
        }))).join('')}
      </tbody></table>
    </div>` : '';

  content.innerHTML = `<div class="flex flex-col gap-4">${pendingHtml}</div>${resolvedHtml}`;
  content.querySelectorAll('[data-card]').forEach(wire);
}

init();
