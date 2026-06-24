/* ============================================================
   pages/gbp/alta-club.js — Alta de club + líder (pantalla 29)
   ------------------------------------------------------------
   F-17/RF-11: GBP da de alta el club y vincula la matrícula del
   líder. Si la matrícula no tiene cuenta, queda `Pending Leader`.
   ============================================================ */

import { getCatalogos, addClub, getProfileByEnrollment } from '../../data-service.js';
import { esc } from '../../utils.js';

const content = document.getElementById('content');

async function init() {
  const cat = await getCatalogos();

  content.innerHTML = `
    <form id="club-form" class="card p-6 flex flex-col gap-4 max-w-2xl">
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="label">Nombre del club *</label><input id="c-name" class="input mt-1"></div>
        <div><label class="label">Acrónimo *</label><input id="c-acr" class="input mt-1"></div>
      </div>
      <div><label class="label">Descripción *</label><textarea id="c-desc" class="textarea mt-1" rows="3"></textarea></div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="label">Ubicación *</label><input id="c-loc" class="input mt-1"></div>
        <div><label class="label">Facultad *</label>
          <select id="c-fac" class="select mt-1">
            <option value="">Selecciona…</option>
            ${cat.facultades.map(f => `<option>${f}</option>`).join('')}
          </select></div>
      </div>
      <div>
        <label class="label">Áreas de interés * (mínimo 1)</label>
        <div id="c-areas" class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          ${cat.areas_interes.map(a => `<label class="flex items-center gap-2 text-sm"><input type="checkbox" value="${a}"> ${a}</label>`).join('')}
        </div>
      </div>
      <div>
        <label class="label">Matrícula del líder *</label>
        <input id="c-leader" class="input mt-1" placeholder="Ej. 201899001">
        <p class="app-muted text-xs mt-1">Si la matrícula aún no tiene cuenta, el club quedará en estado “Sin líder” hasta que el estudiante se registre.</p>
      </div>
      <p id="c-error" class="field-error hidden"></p>
      <div><button type="submit" class="btn btn-primary">Dar de alta el club</button></div>
    </form>
    <div id="result" class="hidden card p-6 mt-4 max-w-2xl"></div>`;

  document.getElementById('club-form').addEventListener('submit', onSubmit);
}

async function onSubmit(e) {
  e.preventDefault();
  const err = document.getElementById('c-error');
  err.classList.add('hidden');

  const v = id => document.getElementById(id).value.trim();
  const areas = [...document.querySelectorAll('#c-areas input:checked')].map(i => i.value);
  const data = {
    name: v('c-name'), acronym: v('c-acr'), description: v('c-desc'),
    location: v('c-loc'), faculty: v('c-fac'), interest_areas: areas,
    leader_enrollment: v('c-leader'),
  };

  if (!data.name || !data.acronym || !data.description || !data.location || !data.faculty || !data.leader_enrollment) {
    err.textContent = 'Completa todos los campos obligatorios.'; err.classList.remove('hidden'); return;
  }
  if (!areas.length) { err.textContent = 'Selecciona al menos un área de interés.'; err.classList.remove('hidden'); return; }

  const leader = await getProfileByEnrollment(data.leader_enrollment);
  const club = await addClub(data);

  const result = document.getElementById('result');
  result.classList.remove('hidden');
  result.innerHTML = `
    <p class="text-2xl mb-2">✅</p>
    <h2 class="font-bold">Club creado: ${esc(club.name)}</h2>
    ${leader
      ? `<p class="app-muted text-sm mt-1">Líder vinculado: <strong class="app-text">${esc(leader.first_name)} ${esc(leader.last_name)}</strong>. El club está <span class="badge badge-success">Activo</span>.</p>`
      : `<p class="app-muted text-sm mt-1">La matrícula <strong class="app-text">${esc(data.leader_enrollment)}</strong> aún no tiene cuenta. El club queda <span class="badge badge-warning">Sin líder</span> hasta que se registre.</p>`}
    <a href="catalogo-global.html" class="btn btn-ghost mt-4">Ir al catálogo global</a>`;
  document.getElementById('club-form').reset();
}

init();
