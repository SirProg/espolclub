/* ============================================================
   pages/lider/club.js — Información del club (pantalla 18)
   ------------------------------------------------------------
   F-09: edita datos del club, gestiona documentos y su
   visibilidad pública/privada (RF-16).
   ============================================================ */

import { getClubById, getCatalogos, updateClub, addClubDocument, setDocVisibility, deleteClubDocument } from '../../data-service.js';
import { getSession } from '../../auth.js';
import { esc } from '../../utils.js';

const session = getSession();
const content = document.getElementById('content');
let club, catalogos;

function areaCheckboxes(selected) {
  return catalogos.areas_interes.map(a => `
    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" value="${a}" ${selected.includes(a) ? 'checked' : ''}> ${a}
    </label>`).join('');
}

function docsRows() {
  const docs = club.internal_documents || [];
  if (!docs.length) return '<p class="app-muted text-sm">Aún no hay documentos.</p>';
  return docs.map(d => `
    <div class="divider py-3 flex items-center justify-between gap-3" data-doc="${d.doc_id}">
      <span class="text-sm">📄 ${esc(d.title)}</span>
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" data-vis ${d.is_public ? 'checked' : ''}>
          <span>${d.is_public ? 'Público' : 'Privado'}</span>
        </label>
        <button class="btn btn-ghost text-xs py-1" data-doc-del>Eliminar</button>
      </div>
    </div>`).join('');
}

function render() {
  content.innerHTML = `
    <form id="club-form" class="card p-6 mb-4 flex flex-col gap-4">
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="label">Nombre</label><input id="c-name" class="input mt-1" value="${esc(club.name)}"></div>
        <div><label class="label">Acrónimo</label><input id="c-acr" class="input mt-1" value="${esc(club.acronym)}"></div>
      </div>
      <div><label class="label">Descripción</label><textarea id="c-desc" class="textarea mt-1" rows="3">${esc(club.description || '')}</textarea></div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="label">Ubicación</label><input id="c-loc" class="input mt-1" value="${esc(club.location || '')}"></div>
        <div><label class="label">Facultad</label><input id="c-fac" class="input mt-1" value="${esc(club.faculty || '')}"></div>
      </div>
      <div>
        <label class="label">Áreas de interés</label>
        <div id="c-areas" class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">${areaCheckboxes(club.interest_areas || [])}</div>
        <p class="field-error hidden">Selecciona al menos un área.</p>
      </div>
      <div class="flex items-center gap-3">
        <button type="submit" class="btn btn-primary">Guardar cambios</button>
        <span id="saved" class="badge badge-success hidden">✓ Guardado</span>
      </div>
    </form>

    <div class="card p-6">
      <h2 class="font-bold mb-3">Documentos del club</h2>
      <div id="docs">${docsRows()}</div>
      <div class="divider mt-4 pt-4">
        <p class="label mb-2">Agregar documento (PDF)</p>
        <div class="flex flex-col sm:flex-row gap-2">
          <input id="d-title" class="input" placeholder="Título del documento">
          <input id="d-file" type="file" accept="application/pdf" class="input">
          <label class="flex items-center gap-2 text-sm whitespace-nowrap"><input type="checkbox" id="d-pub"> Público</label>
          <button id="d-add" class="btn btn-primary">Agregar</button>
        </div>
        <p id="d-error" class="field-error hidden"></p>
      </div>
    </div>`;

  // Guardar datos del club
  document.getElementById('club-form').addEventListener('submit', e => {
    e.preventDefault();
    const areas = [...document.querySelectorAll('#c-areas input:checked')].map(i => i.value);
    const err = document.querySelector('#club-form .field-error');
    if (!areas.length) { err.classList.remove('hidden'); return; }
    err.classList.add('hidden');
    const patch = {
      name: document.getElementById('c-name').value.trim(),
      acronym: document.getElementById('c-acr').value.trim(),
      description: document.getElementById('c-desc').value.trim(),
      location: document.getElementById('c-loc').value.trim(),
      faculty: document.getElementById('c-fac').value.trim(),
      interest_areas: areas,
    };
    updateClub(club.id, patch);
    Object.assign(club, patch);
    const saved = document.getElementById('saved');
    saved.classList.remove('hidden');
    setTimeout(() => saved.classList.add('hidden'), 2000);
  });

  // Toggle de visibilidad y eliminación de documentos
  document.querySelectorAll('#docs [data-doc]').forEach(row => {
    const id = Number(row.dataset.doc);
    row.querySelector('[data-vis]').addEventListener('change', e => {
      setDocVisibility(id, e.target.checked);
      e.target.nextElementSibling.textContent = e.target.checked ? 'Público' : 'Privado';
    });
    row.querySelector('[data-doc-del]').addEventListener('click', async () => {
      if (!confirm('¿Eliminar este documento?')) return;
      deleteClubDocument(id);
      club = await getClubById(club.id);
      render();
    });
  });

  // Agregar documento
  document.getElementById('d-add').addEventListener('click', async () => {
    const title = document.getElementById('d-title').value.trim();
    const file = document.getElementById('d-file').files[0];
    const err = document.getElementById('d-error');
    if (!title || !file) { err.textContent = 'Indica un título y selecciona un PDF.'; err.classList.remove('hidden'); return; }
    if (file.type !== 'application/pdf') { err.textContent = 'El archivo debe ser un PDF.'; err.classList.remove('hidden'); return; }
    addClubDocument(club.id, { title, file_url: `local/docs/${file.name}`, is_public: document.getElementById('d-pub').checked });
    club = await getClubById(club.id);
    render();
  });
}

async function init() {
  [club, catalogos] = await Promise.all([getClubById(session.club_id), getCatalogos()]);
  if (!club) { content.innerHTML = '<div class="card p-6">No se encontró tu club.</div>'; return; }
  render();
}

init();
