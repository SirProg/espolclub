/* ============================================================
   pages/movil/eventos.js — Eventos (9), detalle (10), inscripción (11)
   ------------------------------------------------------------
   RF-31 (visibilidad), RF-32 (inscripción + QR), RF-34 (bloqueo
   por fecha límite con mensaje del líder).
   ============================================================ */

import {
  getVisibleEvents, getClubs, getEventById, getFormById,
  canRegisterEvent, addInscripcion
} from '../../data-service.js';
import { getSession } from '../../auth.js';
import { renderDynamicForm, collectResponses } from '../../components/dynamic-form.js';
import { label, fmtDate, fmtDateTime, esc, eventImage } from '../../utils.js';

const ROOT = '../../';
const session = getSession();

const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const modal = document.getElementById('event-modal');
const modalTitle = document.getElementById('event-title');
const modalBody = document.getElementById('event-body');

let clubsById = {};

function eventCard(ev) {
  const club = clubsById[ev.club_id];
  const onlyMembers = ev.visibility === 'MembersOnly'
    ? `<span class="badge badge-warning">${label('MembersOnly')}</span>` : '';
  return `
    <button class="card p-0 overflow-hidden text-left hover:-translate-y-0.5 transition-transform"
            data-event="${ev.id}">
      ${eventImage(ev, ROOT, 'aspect-video w-full')}
      <div class="p-4 flex flex-col gap-2">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-bold leading-snug">${esc(ev.event_name)}</h3>
          ${onlyMembers}
        </div>
        <p class="app-muted text-sm">${esc(club?.name || '')}</p>
        <p class="text-sm line-clamp-2">${esc(ev.description || '')}</p>
        <div class="divider pt-3 mt-1 text-sm app-muted flex flex-wrap gap-x-4 gap-y-1">
          <span>📅 ${fmtDate(ev.planned_date)}</span>
          <span>🕒 ${esc(ev.planned_hour || '')}</span>
          <span>📍 ${esc(ev.planned_place || '')}</span>
        </div>
      </div>
    </button>`;
}

async function openEvent(eventId) {
  const ev = await getEventById(eventId);
  if (!ev) return;
  const club = clubsById[ev.club_id];
  modalTitle.textContent = ev.event_name;

  const status = await canRegisterEvent(session.student_id, ev);

  // Bloque de acción según disponibilidad de registro.
  let action;
  if (status.alreadyRegistered) {
    action = `<div class="badge badge-success">✓ Ya estás inscrito</div>
      <a href="credencial-qr.html" class="btn btn-ghost mt-2">Ver mi credencial QR</a>`;
  } else if (status.allowed) {
    action = `<button id="open-register" class="btn btn-primary w-full">Inscribirme</button>`;
  } else {
    action = `<div class="card app-surface-2 p-3 text-sm app-muted">🔒 ${esc(status.reason)}</div>`;
  }

  modalBody.innerHTML = `
    ${eventImage(ev, ROOT, 'aspect-video w-full rounded-xl mb-4')}
    <p class="app-muted text-sm mb-3">${esc(club?.name || '')}</p>
    <p class="mb-4">${esc(ev.description || '')}</p>
    <div class="grid grid-cols-2 gap-3 text-sm mb-4">
      <div><p class="app-muted text-xs uppercase">Modalidad</p><p>${label(ev.mode)}</p></div>
      <div><p class="app-muted text-xs uppercase">Visibilidad</p><p>${label(ev.visibility)}</p></div>
      <div><p class="app-muted text-xs uppercase">Fecha</p><p>${fmtDate(ev.planned_date)} · ${esc(ev.planned_hour || '')}</p></div>
      <div><p class="app-muted text-xs uppercase">Lugar</p><p>${esc(ev.planned_place || '')}</p></div>
      <div class="col-span-2"><p class="app-muted text-xs uppercase">Cierre de registro</p><p>${fmtDateTime(ev.registration_deadline)}</p></div>
    </div>
    <div id="event-action">${action}</div>
    <div id="register-form-host"></div>`;

  modal.classList.remove('hidden');

  document.getElementById('open-register')?.addEventListener('click', () => showRegisterForm(ev));
}

async function showRegisterForm(ev) {
  const form = await getFormById(ev.registration_form_id);
  const host = document.getElementById('register-form-host');
  document.getElementById('event-action').classList.add('hidden');

  if (!form) {
    host.innerHTML = '<p class="field-error mt-3">Este evento no tiene formulario de registro.</p>';
    return;
  }

  host.innerHTML = `
    <form id="reg-form" class="flex flex-col gap-4 mt-4 divider pt-4" novalidate>
      <p class="font-semibold">${esc(form.title)}</p>
      <div id="reg-fields" class="flex flex-col gap-4">${renderDynamicForm(form)}</div>
      <button type="submit" class="btn btn-primary w-full">Confirmar inscripción</button>
    </form>`;

  const regForm = document.getElementById('reg-form');
  const fieldsHost = document.getElementById('reg-fields');
  regForm.addEventListener('submit', async e => {
    e.preventDefault();
    const { valid, responses } = collectResponses(fieldsHost, form);
    if (!valid) return;
    const insc = await addInscripcion({
      event_id: ev.id, student_id: session.student_id, form_id: form.id, responses
    });
    host.innerHTML = `
      <div class="text-center py-4 mt-4 divider">
        <p class="text-3xl mb-2">🎉</p>
        <p class="font-semibold">¡Inscripción confirmada!</p>
        <p class="app-muted text-sm mt-1">Tu credencial QR ya está disponible.</p>
        <p class="text-xs font-mono app-muted mt-2">${esc(insc.qr_token)}</p>
        <a href="credencial-qr.html" class="btn btn-primary mt-3">Ver mi credencial QR</a>
      </div>`;
  });
}

function closeModal() { modal.classList.add('hidden'); }
document.getElementById('event-close').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

async function init() {
  try {
    const [events, clubs] = await Promise.all([
      getVisibleEvents(session.student_id), getClubs()
    ]);
    clubsById = Object.fromEntries(clubs.map(c => [c.id, c]));

    grid.innerHTML = events.map(eventCard).join('');
    empty.classList.toggle('hidden', events.length > 0);

    grid.querySelectorAll('[data-event]').forEach(btn =>
      btn.addEventListener('click', () => openEvent(Number(btn.dataset.event))));
  } catch (err) {
    grid.innerHTML = `<p class="field-error">Error cargando eventos: ${err.message}</p>`;
  }
}

init();
