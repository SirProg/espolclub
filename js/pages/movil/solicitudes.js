/* ============================================================
   pages/movil/solicitudes.js — Bandeja del Líder (pantalla 16)
   ------------------------------------------------------------
   RF-27/RF-57: el líder aprueba o rechaza solicitudes Pending de
   su club desde el móvil. RN-5: rechazo exige feedback.
   ============================================================ */

import {
  getClubSolicitudes, approveSolicitud, rejectSolicitud, getProfileById, getFormById
} from '../../data-service.js';
import { getSession } from '../../auth.js';
import { fmtDate, esc } from '../../utils.js';

const session = getSession();
const list = document.getElementById('list');
const empty = document.getElementById('empty');

async function buildCard(s) {
  const [student, form] = await Promise.all([
    getProfileById(s.student_id), getFormById(s.form_id)
  ]);
  const fieldLabel = id => form?.fields.find(f => f.field_id === id)?.label || id;
  const answers = (s.responses || []).map(r => `
    <div class="mt-2">
      <p class="app-muted text-xs">${esc(fieldLabel(r.field_id))}</p>
      <p class="text-sm">${esc(r.answer)}</p>
    </div>`).join('');

  return `
    <div class="card p-5" data-card="${s.id}" data-student="${s.student_id}" data-club="${s.club_id}">
      <div class="flex items-start justify-between gap-2">
        <div>
          <h3 class="font-bold">${esc(student ? student.first_name + ' ' + student.last_name : 'Estudiante')}</h3>
          <p class="app-muted text-sm">${esc(student?.career || '')} · ${esc(student?.enrollment || '')}</p>
        </div>
        <span class="app-muted text-xs">${fmtDate(s.submitted_at)}</span>
      </div>
      <div class="divider mt-3 pt-3">${answers || '<p class="app-muted text-sm">Sin respuestas.</p>'}</div>

      <div class="flex gap-2 mt-4" data-actions>
        <button class="btn btn-primary flex-1" data-approve>Aprobar</button>
        <button class="btn btn-ghost flex-1" data-reject>Rechazar</button>
      </div>
      <div class="hidden mt-3" data-reject-box>
        <label class="label">Motivo del rechazo (obligatorio)</label>
        <textarea class="textarea mt-1" rows="2" data-feedback></textarea>
        <p class="field-error hidden">Debes indicar el motivo del rechazo.</p>
        <div class="flex gap-2 mt-2">
          <button class="btn btn-danger flex-1" data-confirm-reject>Confirmar rechazo</button>
          <button class="btn btn-ghost flex-1" data-cancel-reject>Cancelar</button>
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

  const finish = (msg) => {
    actions.classList.add('hidden');
    rejectBox.classList.add('hidden');
    done.textContent = msg;
    done.classList.remove('hidden');
  };

  card.querySelector('[data-approve]').addEventListener('click', async () => {
    await approveSolicitud({
      id, student_id: Number(card.dataset.student), club_id: Number(card.dataset.club)
    });
    finish('✓ Solicitud aprobada');
  });
  card.querySelector('[data-reject]').addEventListener('click', () => {
    actions.classList.add('hidden');
    rejectBox.classList.remove('hidden');
  });
  card.querySelector('[data-cancel-reject]').addEventListener('click', () => {
    rejectBox.classList.add('hidden');
    actions.classList.remove('hidden');
  });
  card.querySelector('[data-confirm-reject]').addEventListener('click', () => {
    const fb = card.querySelector('[data-feedback]').value.trim();
    const err = card.querySelector('.field-error');
    if (!fb) { err.classList.remove('hidden'); return; }
    rejectSolicitud(id, fb);
    finish('Solicitud rechazada');
  });
}

async function init() {
  const pending = await getClubSolicitudes(session.club_id, 'Pending');

  if (!pending.length) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  const cards = await Promise.all(pending.map(buildCard));
  list.innerHTML = cards.join('');
  list.querySelectorAll('[data-card]').forEach(wire);
}

init();
