/* ============================================================
   pages/lider/formularios.js — Constructor de formularios (22)
   ------------------------------------------------------------
   CRUD de formularios dinámicos. RF-24: un formulario CON
   respuestas es inmutable → editarlo crea una NUEVA versión y
   conserva la anterior; eliminarlo no se permite (se desactiva).
   Un formulario SIN respuestas se edita y elimina libremente.
   ============================================================ */

import {
  getClubForms, saveForm, updateForm, deleteForm, deactivateForm, formHasResponses
} from '../../data-service.js';
import { getSession } from '../../auth.js';
import { label, esc } from '../../utils.js';

const session = getSession();
const content = document.getElementById('content');

const FIELD_TYPES = [
  ['text', 'Texto corto'], ['textarea', 'Texto largo'],
  ['select', 'Lista desplegable'], ['radio', 'Opción única'], ['checkbox', 'Casillas'],
];
const OPTION_TYPES = ['select', 'radio', 'checkbox'];

let forms = [];
let respMap = {};   // { formId: bool }  ¿tiene respuestas?
let editing = null; // formulario en edición, o null
let fieldSeq = 0;

function existingList() {
  if (!forms.length) return '<p class="app-muted text-sm">Aún no has creado formularios.</p>';
  return forms.map(f => {
    const hasResp = respMap[f.id];
    const del = hasResp
      ? (f.is_active ? `<button class="btn btn-ghost text-xs py-1.5" data-deact="${f.id}">Desactivar</button>` : '')
      : `<button class="btn btn-ghost text-xs py-1.5" data-del="${f.id}">Eliminar</button>`;
    return `
      <div class="divider py-3 flex items-center justify-between gap-3">
        <div>
          <p class="font-medium">${esc(f.title)} ${f.is_active ? '' : '<span class="app-muted text-xs">(inactiva)</span>'}</p>
          <p class="app-muted text-xs">${label(f.form_type)} · v${f.version || 1} · ${f.fields.length} campo(s)
            ${hasResp ? '· <span class="app-accent">con respuestas</span>' : ''}</p>
        </div>
        <div class="whitespace-nowrap">
          <button class="btn btn-ghost text-xs py-1.5" data-edit="${f.id}">Editar</button>
          ${del}
        </div>
      </div>`;
  }).join('');
}

function fieldRow(field = {}) {
  const id = ++fieldSeq;
  const sel = t => field.type === t ? 'selected' : '';
  const opts = (field.options || []).join('\n');
  const isOpt = OPTION_TYPES.includes(field.type);
  return `
    <div class="card app-surface-2 p-4" data-field-row="${id}">
      <div class="grid sm:grid-cols-2 gap-3">
        <div>
          <label class="label">Etiqueta</label>
          <input class="input mt-1" data-f-label value="${esc(field.label || '')}" placeholder="¿Pregunta para el postulante?">
        </div>
        <div>
          <label class="label">Tipo</label>
          <select class="select mt-1" data-f-type>
            ${FIELD_TYPES.map(([v, l]) => `<option value="${v}" ${sel(v)}>${l}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="mt-3 ${isOpt ? '' : 'hidden'}" data-f-options-wrap>
        <label class="label">Opciones (una por línea, mínimo 2)</label>
        <textarea class="textarea mt-1" rows="3" data-f-options placeholder="Opción A&#10;Opción B">${esc(opts)}</textarea>
      </div>
      <div class="flex items-center justify-between mt-3">
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" data-f-required ${field.required ? 'checked' : ''}> Obligatorio</label>
        <button type="button" class="btn btn-ghost text-xs py-1.5" data-f-remove>Quitar campo</button>
      </div>
      <p class="field-error hidden"></p>
    </div>`;
}

function wireFieldRow(row) {
  const typeSel = row.querySelector('[data-f-type]');
  const optWrap = row.querySelector('[data-f-options-wrap]');
  const sync = () => optWrap.classList.toggle('hidden', !OPTION_TYPES.includes(typeSel.value));
  typeSel.addEventListener('change', sync); sync();
  row.querySelector('[data-f-remove]').addEventListener('click', () => row.remove());
}

function render() {
  const e = editing;
  content.innerHTML = `
    <div class="card p-6 mb-6">
      <h2 class="font-bold mb-3">Formularios existentes</h2>
      <div>${existingList()}</div>
    </div>

    <div class="card p-6">
      <h2 class="font-bold mb-4">${e ? `Editar formulario: ${esc(e.title)}` : 'Nuevo formulario'}</h2>
      <form id="builder" class="flex flex-col gap-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Título</label>
            <input id="b-title" class="input mt-1" value="${esc(e?.title || '')}" placeholder="Formulario de inscripción">
          </div>
          <div>
            <label class="label">Tipo</label>
            <select id="b-type" class="select mt-1" ${e ? 'disabled' : ''}>
              <option value="Membership" ${e?.form_type === 'Membership' ? 'selected' : ''}>Membresía</option>
              <option value="Event" ${e?.form_type === 'Event' ? 'selected' : ''}>Evento</option>
            </select>
          </div>
        </div>

        <div id="version-note" class="hidden card app-surface-2 p-3 text-sm app-muted"></div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="label">Campos</label>
            <button type="button" id="add-field" class="btn btn-ghost text-xs py-1.5">+ Agregar campo</button>
          </div>
          <div id="fields" class="flex flex-col gap-3"></div>
          <p id="b-error" class="field-error hidden"></p>
        </div>

        <div class="flex items-center gap-3">
          <button type="submit" class="btn btn-primary">${e ? 'Guardar cambios' : 'Guardar formulario'}</button>
          ${e ? '<button type="button" id="cancel-edit" class="btn btn-ghost">Cancelar</button>' : ''}
        </div>
      </form>
    </div>`;

  // Acciones de la lista
  content.querySelectorAll('[data-edit]').forEach(b =>
    b.addEventListener('click', () => { editing = forms.find(f => f.id === Number(b.dataset.edit)); render(); }));
  content.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este formulario? No tiene respuestas, se borrará por completo.')) return;
      deleteForm(Number(b.dataset.del)); await reload();
    }));
  content.querySelectorAll('[data-deact]').forEach(b =>
    b.addEventListener('click', async () => {
      if (!confirm('Este formulario tiene respuestas y no puede borrarse. ¿Desactivarlo para que no se use más?')) return;
      deactivateForm(Number(b.dataset.deact)); await reload();
    }));
  document.getElementById('cancel-edit')?.addEventListener('click', () => { editing = null; render(); });

  // Constructor de campos
  const fieldsHost = document.getElementById('fields');
  const addField = (f) => { fieldsHost.insertAdjacentHTML('beforeend', fieldRow(f)); wireFieldRow(fieldsHost.lastElementChild); };
  document.getElementById('add-field').addEventListener('click', () => addField());
  if (e && e.fields.length) e.fields.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(addField);
  else addField();

  // Aviso de versionado (RF-24)
  const note = document.getElementById('version-note');
  if (e && respMap[e.id]) {
    note.textContent = '⚠️ Este formulario tiene respuestas: guardar los cambios creará una NUEVA versión y conservará la anterior con sus respuestas.';
    note.classList.remove('hidden');
  } else if (!e) {
    const typeEl = document.getElementById('b-type');
    const check = async () => {
      const same = forms.filter(f => f.form_type === typeEl.value);
      let has = false; for (const f of same) if (await formHasResponses(f.id)) { has = true; break; }
      note.classList.toggle('hidden', !has);
      if (has) note.textContent = '⚠️ Ya existe un formulario de este tipo con respuestas. El nuevo se guardará como otra versión.';
    };
    typeEl.addEventListener('change', check); check();
  }

  document.getElementById('builder').addEventListener('submit', onSave);
}

async function onSave(e) {
  e.preventDefault();
  const title = document.getElementById('b-title').value.trim();
  const form_type = document.getElementById('b-type').value;
  const err = document.getElementById('b-error');
  err.classList.add('hidden');
  if (!title) { err.textContent = 'Indica un título.'; err.classList.remove('hidden'); return; }

  const rows = [...document.querySelectorAll('[data-field-row]')];
  if (!rows.length) { err.textContent = 'Agrega al menos un campo.'; err.classList.remove('hidden'); return; }

  const fields = [];
  let order = 0, invalid = false;
  for (const row of rows) {
    const fErr = row.querySelector('.field-error'); fErr.classList.add('hidden');
    const lbl = row.querySelector('[data-f-label]').value.trim();
    const type = row.querySelector('[data-f-type]').value;
    const required = row.querySelector('[data-f-required]').checked;
    let options = [];
    if (!lbl) { fErr.textContent = 'La etiqueta es obligatoria.'; fErr.classList.remove('hidden'); invalid = true; continue; }
    if (OPTION_TYPES.includes(type)) {
      options = row.querySelector('[data-f-options]').value.split('\n').map(s => s.trim()).filter(Boolean);
      if (options.length < 2) { fErr.textContent = 'Este tipo requiere al menos 2 opciones.'; fErr.classList.remove('hidden'); invalid = true; continue; }
    }
    fields.push({ field_id: `f${++order}`, label: lbl, type, required, order, options, validation: {} });
  }
  if (invalid) return;

  if (editing) {
    if (respMap[editing.id]) {
      // RF-24: con respuestas → nueva versión, conserva la anterior (la desactiva).
      deactivateForm(editing.id);
      await saveForm({ club_id: session.club_id, form_type: editing.form_type, title, fields });
    } else {
      updateForm(editing.id, { title, fields });
    }
  } else {
    await saveForm({ club_id: session.club_id, form_type, title, fields });
  }
  editing = null;
  await reload();
}

async function reload() {
  forms = await getClubForms(session.club_id);
  respMap = {};
  for (const f of forms) respMap[f.id] = await formHasResponses(f.id);
  render();
}

reload();
