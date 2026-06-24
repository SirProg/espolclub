/* ============================================================
   pages/lider/eventos.js — Eventos (23), crear/editar (24), staff (25)
   ------------------------------------------------------------
   V-17: tabla con métricas inscritos vs. asistentes. F-13 crear/
   editar evento. F-14 asignar Staff por evento (RF-35).
   ============================================================ */

import {
  getClubEvents, addEvent, updateEvent, deleteEvent, eventHasRegistrations,
  getClubForms, getClubMembers, getEventStaff, setEventStaff
} from '../../data-service.js';
import { getSession } from '../../auth.js';
import { label, fmtDate, fmtDateTime, esc, eventImage } from '../../utils.js';

const ROOT = '../../';
const session = getSession();
const content = document.getElementById('content');
let events = [], eventForms = [], members = [];

function table() {
  const rows = events.length ? events.map(e => `
    <tr class="divider">
      <td class="py-3 pr-3">
        <div class="flex items-center gap-3">
          ${eventImage(e, ROOT, 'h-12 w-16 rounded-md')}
          <div>
            <p class="font-medium">${esc(e.event_name)}</p>
            <p class="app-muted text-xs">${fmtDate(e.planned_date)} · ${esc(e.planned_hour || '')}</p>
          </div>
        </div>
      </td>
      <td class="py-3 pr-3"><span class="badge ${e.visibility === 'Public' ? 'badge-success' : 'badge-warning'}">${label(e.visibility)}</span></td>
      <td class="py-3 pr-3 text-center">${e.metrics.registered} / ${e.metrics.attended}</td>
      <td class="py-3 text-right whitespace-nowrap">
        <button class="btn btn-ghost text-xs py-1.5" data-edit="${e.id}">Editar</button>
        <button class="btn btn-ghost text-xs py-1.5" data-staff="${e.id}">Staff</button>
        <button class="btn btn-ghost text-xs py-1.5" data-del="${e.id}">Eliminar</button>
      </td>
    </tr>`).join('')
    : '<tr><td colspan="4" class="py-6 text-center app-muted">Este club aún no ha creado eventos.</td></tr>';

  return `
    <div class="flex justify-end mb-3">
      <button id="new-event" class="btn btn-primary">+ Nuevo evento</button>
    </div>
    <div class="card p-5 overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="text-left app-muted">
          <th class="pb-2 font-semibold">Evento</th>
          <th class="pb-2 font-semibold">Visibilidad</th>
          <th class="pb-2 font-semibold text-center">Inscritos / Asistentes</th>
          <th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div id="modal-host"></div>`;
}

function eventFormModal(ev) {
  const v = ev || {};
  const formOpts = ['<option value="">Sin registro</option>',
    ...eventForms.map(f => `<option value="${f.id}" ${v.registration_form_id === f.id ? 'selected' : ''}>${esc(f.title)}</option>`)].join('');
  return modalShell(ev ? 'Editar evento' : 'Nuevo evento', `
    <form id="ev-form" class="flex flex-col gap-3">
      <div><label class="label">Nombre</label><input id="e-name" class="input mt-1" value="${esc(v.event_name || '')}"></div>
      <div><label class="label">Descripción</label><textarea id="e-desc" class="textarea mt-1" rows="2">${esc(v.description || '')}</textarea></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="label">Modalidad</label>
          <select id="e-mode" class="select mt-1">
            <option value="In-person" ${v.mode === 'In-person' ? 'selected' : ''}>Presencial</option>
            <option value="Virtual" ${v.mode === 'Virtual' ? 'selected' : ''}>Virtual</option>
          </select></div>
        <div><label class="label">Visibilidad</label>
          <select id="e-vis" class="select mt-1">
            <option value="Public" ${v.visibility === 'Public' ? 'selected' : ''}>Público</option>
            <option value="MembersOnly" ${v.visibility === 'MembersOnly' ? 'selected' : ''}>Solo miembros</option>
          </select></div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="label">Fecha</label><input id="e-date" type="date" class="input mt-1" value="${esc(v.planned_date || '')}"></div>
        <div><label class="label">Hora</label><input id="e-hour" type="time" class="input mt-1" value="${esc(v.planned_hour || '')}"></div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="label">Lugar</label><input id="e-place" class="input mt-1" value="${esc(v.planned_place || '')}"></div>
        <div><label class="label">Fin (fecha y hora)</label><input id="e-end" type="datetime-local" class="input mt-1" value="${toLocal(v.end_datetime)}"></div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="label">Cierre de registro</label><input id="e-deadline" type="datetime-local" class="input mt-1" value="${toLocal(v.registration_deadline)}"></div>
        <div><label class="label">Participantes esperados</label><input id="e-exp" type="number" min="0" class="input mt-1" value="${v.expected_participants ?? ''}"></div>
      </div>
      <div><label class="label">Formulario de registro</label><select id="e-form" class="select mt-1">${formOpts}</select></div>
      <div><label class="label">Mensaje si el registro está cerrado</label><input id="e-blocked" class="input mt-1" value="${esc(v.blocked_message || '')}"></div>
      <p id="e-error" class="field-error hidden"></p>
      <div><button type="submit" class="btn btn-primary w-full">${ev ? 'Guardar cambios' : 'Crear evento'}</button></div>
    </form>`);
}

function staffModal(ev) {
  const assigned = new Set(getEventStaff(ev.id));
  const list = members.length ? members.map(({ membership: m, profile: p }) => `
    <label class="flex items-center gap-2 text-sm divider py-2">
      <input type="checkbox" value="${p?.id}" ${assigned.has(p?.id) ? 'checked' : ''}>
      ${esc(p ? p.first_name + ' ' + p.last_name : '—')} <span class="app-muted text-xs">(${esc(p?.career || '')})</span>
    </label>`).join('')
    : '<p class="app-muted text-sm">No hay miembros disponibles para asignar.</p>';
  return modalShell(`Staff — ${esc(ev.event_name)}`, `
    <form id="staff-form">
      <p class="app-muted text-sm mb-3">Selecciona los miembros que podrán escanear el QR durante este evento.</p>
      <div id="staff-list" class="mb-4">${list}</div>
      <button type="submit" class="btn btn-primary w-full">Guardar staff</button>
    </form>`);
}

function modalShell(title, body) {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,.5)" data-modal>
      <div class="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-5 divider">
          <h3 class="font-bold text-lg">${title}</h3>
          <button class="btn btn-ghost px-2 py-1" data-close>✕</button>
        </div>
        <div class="p-5">${body}</div>
      </div>
    </div>`;
}

function toLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso); if (isNaN(d)) return '';
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function openModal(html) {
  const host = document.getElementById('modal-host');
  host.innerHTML = html;
  const modal = host.querySelector('[data-modal]');
  const close = () => { host.innerHTML = ''; };
  modal.querySelector('[data-close]').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  return { host, close };
}

function openEventForm(ev) {
  const { close } = openModal(eventFormModal(ev));
  document.getElementById('ev-form').addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      event_name: val('e-name'), description: val('e-desc'), mode: val('e-mode'),
      visibility: val('e-vis'), planned_date: val('e-date'), planned_hour: val('e-hour'),
      planned_place: val('e-place'),
      end_datetime: val('e-end') ? new Date(val('e-end')).toISOString() : null,
      registration_deadline: val('e-deadline') ? new Date(val('e-deadline')).toISOString() : null,
      expected_participants: val('e-exp') ? Number(val('e-exp')) : null,
      registration_form_id: val('e-form') ? Number(val('e-form')) : null,
      blocked_message: val('e-blocked'),
    };
    const err = document.getElementById('e-error');
    if (!data.event_name || !data.planned_date) { showErr(err, 'Nombre y fecha son obligatorios.'); return; }
    if (data.end_datetime && data.planned_date && new Date(data.end_datetime) < new Date(data.planned_date)) {
      showErr(err, 'El fin debe ser posterior al inicio.'); return;
    }
    if (data.registration_deadline && data.end_datetime && new Date(data.registration_deadline) > new Date(data.end_datetime)) {
      showErr(err, 'El cierre de registro no puede ser posterior al fin del evento.'); return;
    }
    if (ev) updateEvent(ev.id, data); else await addEvent(session.club_id, data);
    close(); await reload();
  });
}

function openStaff(ev) {
  const { close } = openModal(staffModal(ev));
  document.getElementById('staff-form').addEventListener('submit', e => {
    e.preventDefault();
    const ids = [...document.querySelectorAll('#staff-list input:checked')].map(i => Number(i.value));
    setEventStaff(ev.id, ids);
    close();
  });
}

const val = id => document.getElementById(id).value.trim();
const showErr = (el, msg) => { el.textContent = msg; el.classList.remove('hidden'); };

function bind() {
  document.getElementById('new-event').addEventListener('click', () => openEventForm(null));
  content.querySelectorAll('[data-edit]').forEach(b =>
    b.addEventListener('click', () => openEventForm(events.find(e => e.id === Number(b.dataset.edit)))));
  content.querySelectorAll('[data-staff]').forEach(b =>
    b.addEventListener('click', () => openStaff(events.find(e => e.id === Number(b.dataset.staff)))));
  content.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', () => onDelete(Number(b.dataset.del))));
}

async function onDelete(id) {
  if (await eventHasRegistrations(id)) {
    alert('No puedes eliminar este evento: ya tiene inscritos. Se conserva para preservar la evidencia de asistencia.');
    return;
  }
  if (!confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')) return;
  deleteEvent(id);
  await reload();
}

async function reload() {
  events = await getClubEvents(session.club_id);
  content.innerHTML = table();
  bind();
}

async function init() {
  [events, eventForms, members] = await Promise.all([
    getClubEvents(session.club_id),
    getClubForms(session.club_id).then(fs => fs.filter(f => f.form_type === 'Event')),
    getClubMembers(session.club_id),
  ]);
  content.innerHTML = table();
  bind();
}

init();
