/* ============================================================
   pages/movil/perfil.js — Perfil (14) e Historial (15)
   ------------------------------------------------------------
   F-07: edición de descripción, habilidades y redes (cliente).
   RF-50: el estudiante ve y edita sus datos y su historial.
   ============================================================ */

import { getProfileByEnrollment, updateProfile, getStudentHistory } from '../../data-service.js';
import { getSession } from '../../auth.js';
import { label, statusBadgeClass, fmtDate, fmtDateTime, esc } from '../../utils.js';

const session = getSession();

const roEl = document.getElementById('profile-readonly');
const viewEl = document.getElementById('profile-view');
const formEl = document.getElementById('profile-form');
const editBtn = document.getElementById('edit-btn');

let profile;

function ageFrom(birth) {
  if (!birth) return '—';
  const d = new Date(birth);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / 31557600000) + ' años';
}

function field(labelTxt, value) {
  return `<div>
    <p class="app-muted text-xs uppercase tracking-wide">${labelTxt}</p>
    <p class="font-medium">${esc(value ?? '—')}</p>
  </div>`;
}

function renderReadonly() {
  roEl.innerHTML = [
    field('Matrícula', profile.enrollment),
    field('Nombre', `${profile.first_name} ${profile.last_name}`),
    field('Correo', profile.email),
    field('Edad', ageFrom(profile.birth_date)),
    field('Facultad', profile.faculty),
    field('Carrera', profile.career),
    field('Semestre', profile.semester),
  ].join('');
}

function renderPublicView() {
  const skills = (profile.skills || []).map(s => `<span class="chip">${esc(s)}</span>`).join(' ') ||
    '<span class="app-muted text-sm">Sin habilidades registradas.</span>';
  const social = (profile.social_media || []).length
    ? profile.social_media.map(s =>
        `<a href="${esc(s.link)}" target="_blank" rel="noopener" class="chip">${esc(s.network)}</a>`).join(' ')
    : '<span class="app-muted text-sm">Sin redes registradas.</span>';
  viewEl.innerHTML = `
    <div class="flex flex-col gap-3">
      <div>
        <p class="app-muted text-xs uppercase tracking-wide mb-1">Descripción</p>
        <p>${esc(profile.description) || '<span class="app-muted text-sm">Sin descripción.</span>'}</p>
      </div>
      <div>
        <p class="app-muted text-xs uppercase tracking-wide mb-1">Habilidades</p>
        <div class="flex flex-wrap gap-1.5">${skills}</div>
      </div>
      <div>
        <p class="app-muted text-xs uppercase tracking-wide mb-1">Redes sociales</p>
        <div class="flex flex-wrap gap-1.5">${social}</div>
      </div>
    </div>`;
}

function renderForm() {
  const social = profile.social_media || [];
  formEl.innerHTML = `
    <div>
      <label class="label" for="f-desc">Descripción</label>
      <textarea id="f-desc" class="textarea mt-1" rows="3" maxlength="280">${esc(profile.description || '')}</textarea>
      <p class="field-error hidden"></p>
    </div>
    <div>
      <label class="label" for="f-skills">Habilidades (separadas por coma)</label>
      <input id="f-skills" class="input mt-1" type="text" value="${esc((profile.skills || []).join(', '))}">
    </div>
    <div>
      <label class="label">Redes sociales</label>
      <div id="f-social" class="flex flex-col gap-2 mt-1">
        ${social.map(s => socialRow(s.network, s.link)).join('')}
        ${socialRow('', '')}
      </div>
      <button type="button" id="add-social" class="btn btn-ghost text-xs py-1.5 mt-2">+ Agregar red</button>
    </div>
    <div class="flex gap-2">
      <button type="submit" class="btn btn-primary">Guardar cambios</button>
      <button type="button" id="cancel-btn" class="btn btn-ghost">Cancelar</button>
    </div>`;

  formEl.querySelector('#add-social').addEventListener('click', () => {
    formEl.querySelector('#f-social').insertAdjacentHTML('beforeend', socialRow('', ''));
  });
  formEl.querySelector('#cancel-btn').addEventListener('click', () => toggleEdit(false));
}

function socialRow(network, link) {
  return `<div class="flex gap-2" data-social-row>
    <input class="input" style="flex:0 0 38%" type="text" placeholder="Red (GitHub)" value="${esc(network)}" data-net>
    <input class="input" type="url" placeholder="https://…" value="${esc(link)}" data-link>
  </div>`;
}

function toggleEdit(on) {
  viewEl.classList.toggle('hidden', on);
  formEl.classList.toggle('hidden', !on);
  formEl.classList.toggle('flex', on);
  editBtn.classList.toggle('hidden', on);
  if (on) renderForm();
}

editBtn.addEventListener('click', () => toggleEdit(true));

formEl.addEventListener('submit', e => {
  e.preventDefault();
  const desc = formEl.querySelector('#f-desc').value.trim();
  const skills = formEl.querySelector('#f-skills').value
    .split(',').map(s => s.trim()).filter(Boolean);

  // Valida URLs de redes y arma la lista.
  const rows = [...formEl.querySelectorAll('[data-social-row]')];
  const social_media = [];
  let urlError = false;
  for (const r of rows) {
    const net = r.querySelector('[data-net]').value.trim();
    const link = r.querySelector('[data-link]').value.trim();
    if (!net && !link) continue;
    try { new URL(link); } catch { urlError = true; r.querySelector('[data-link]').focus(); break; }
    social_media.push({ network: net || 'Web', link });
  }
  if (urlError) {
    const err = formEl.querySelector('.field-error');
    err.textContent = 'Revisa que las redes tengan una URL válida (https://…).';
    err.classList.remove('hidden');
    return;
  }

  updateProfile(profile.enrollment, { description: desc, skills, social_media });
  profile = { ...profile, description: desc, skills, social_media };
  renderPublicView();
  toggleEdit(false);
});

/* ---------- Historial ---------- */
function renderApplications(apps) {
  const host = document.getElementById('hist-applications');
  if (!apps.length) { host.innerHTML = '<p class="app-muted text-sm">Todavía no registras postulaciones.</p>'; return; }
  host.innerHTML = apps.map(a => `
    <div class="divider py-3 flex items-start justify-between gap-3">
      <div>
        <p class="font-medium">${esc(a.club?.name || 'Club')}</p>
        <p class="app-muted text-xs">${fmtDate(a.submitted_at)}</p>
        ${a.leader_feedback ? `<p class="app-muted text-sm mt-1">💬 ${esc(a.leader_feedback)}</p>` : ''}
      </div>
      <span class="badge ${statusBadgeClass(a.status)}">${label(a.status)}</span>
    </div>`).join('');
}

function renderAttendances(atts) {
  const host = document.getElementById('hist-attendances');
  if (!atts.length) { host.innerHTML = '<p class="app-muted text-sm">Todavía no te inscribes a eventos.</p>'; return; }
  host.innerHTML = atts.map(i => `
    <div class="divider py-3 flex items-start justify-between gap-3">
      <div>
        <p class="font-medium">${esc(i.event?.event_name || 'Evento')}</p>
        <p class="app-muted text-xs">Inscrito el ${fmtDate(i.registered_at)}</p>
      </div>
      <span class="badge ${statusBadgeClass(i.attendance_status)}">${label(i.attendance_status)}</span>
    </div>`).join('');
}

async function init() {
  profile = await getProfileByEnrollment(session.enrollment);
  if (!profile) { roEl.innerHTML = '<p class="field-error">No se encontró el perfil.</p>'; return; }
  renderReadonly();
  renderPublicView();

  const { applications, attendances } = await getStudentHistory(session.student_id);
  renderApplications(applications);
  renderAttendances(attendances);
}

init();
