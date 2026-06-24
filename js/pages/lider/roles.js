/* ============================================================
   pages/lider/roles.js — Roles y permisos (pantalla 20)
   ------------------------------------------------------------
   CRUD completo de roles del club. Los 4 roles predeterminados
   (is_default) están protegidos: no se editan ni eliminan.
   RN-7: solo el Presidente/a puede otorgar `manage_roles`.
   ============================================================ */

import { getClubRoles, addRole, updateRole, deleteRole, isRoleInUse } from '../../data-service.js';
import { getSession } from '../../auth.js';
import { esc } from '../../utils.js';

const session = getSession();
const content = document.getElementById('content');

const PERMS = [
  ['access_web_panel', 'Acceder al panel web'],
  ['manage_club_info', 'Editar información del club'],
  ['manage_members', 'Gestionar miembros'],
  ['manage_roles', 'Gestionar roles'],
  ['manage_forms', 'Gestionar formularios'],
  ['manage_events', 'Gestionar eventos'],
  ['scan_event_qr', 'Escanear QR de eventos'],
  ['manage_documents', 'Gestionar documentos'],
  ['submit_gbp_reports', 'Enviar reportes a GBP'],
];
const OPTION_TYPES = ['select', 'radio', 'checkbox'];

// El líder mock es Presidente/a (role_id 7); puede delegar manage_roles.
const isPresident = session.role_id === 7;

let roles = [];
let editing = null; // rol en edición, o null

function permPills(p) {
  const active = PERMS.filter(([k]) => p?.[k]).map(([, l]) => `<span class="chip">${l}</span>`);
  return active.length ? active.join(' ') : '<span class="app-muted text-sm">Sin permisos</span>';
}

function renderTable() {
  const rows = roles.map(r => `
    <tr class="divider align-top">
      <td class="py-3 pr-3">
        <p class="font-medium">${esc(r.role_name)}</p>
        <div class="flex gap-1 mt-1">
          ${r.is_default ? '<span class="badge badge-warning">Predeterminado</span>' : ''}
          ${r.is_leadership ? '<span class="badge badge-success">Directivo</span>' : ''}
        </div>
      </td>
      <td class="py-3"><div class="flex flex-wrap gap-1.5">${permPills(r.permissions)}</div></td>
      <td class="py-3 text-right whitespace-nowrap">
        ${r.is_default
          ? '<span class="app-muted text-xs">🔒 Protegido</span>'
          : `<button class="btn btn-ghost text-xs py-1.5" data-edit="${r.id}">Editar</button>
             <button class="btn btn-ghost text-xs py-1.5" data-del="${r.id}">Eliminar</button>`}
      </td>
    </tr>`).join('');

  return `
    <div class="card p-5 overflow-x-auto mb-6">
      <table class="w-full text-sm">
        <thead><tr class="text-left app-muted">
          <th class="pb-2 font-semibold">Rol</th>
          <th class="pb-2 font-semibold">Permisos</th>
          <th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderForm() {
  const r = editing || {};
  const checked = k => (r.permissions?.[k] ? 'checked' : '');
  return `
    <div class="card p-6">
      <h2 class="font-bold mb-4">${editing ? 'Editar rol' : 'Crear rol personalizado'}</h2>
      <form id="role-form" class="flex flex-col gap-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Nombre del rol</label>
            <input id="r-name" class="input mt-1" value="${esc(r.role_name || '')}" placeholder="Ej. Coordinador de Logística">
            <p class="field-error hidden">Indica un nombre único para el rol.</p>
          </div>
          <label class="flex items-end gap-2 text-sm pb-2">
            <input type="checkbox" id="r-leadership" ${r.is_leadership ? 'checked' : ''}> Es rol directivo (is_leadership)
          </label>
        </div>
        <div>
          <label class="label">Permisos</label>
          <div class="grid sm:grid-cols-2 gap-2 mt-2">
            ${PERMS.map(([k, l]) => `
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" value="${k}" ${checked(k)} ${k === 'manage_roles' && !isPresident ? 'disabled' : ''}>
                ${l}${k === 'manage_roles' && !isPresident ? ' <span class="app-muted text-xs">(solo Presidente/a)</span>' : ''}
              </label>`).join('')}
          </div>
        </div>
        <div class="flex gap-2">
          <button type="submit" class="btn btn-primary">${editing ? 'Guardar cambios' : 'Crear rol'}</button>
          ${editing ? '<button type="button" id="cancel-edit" class="btn btn-ghost">Cancelar</button>' : ''}
        </div>
      </form>
    </div>`;
}

function render() {
  content.innerHTML = renderTable() + renderForm();

  content.querySelectorAll('[data-edit]').forEach(b =>
    b.addEventListener('click', () => { editing = roles.find(r => r.id === Number(b.dataset.edit)); render(); }));

  content.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', () => onDelete(Number(b.dataset.del))));

  document.getElementById('cancel-edit')?.addEventListener('click', () => { editing = null; render(); });

  document.getElementById('role-form').addEventListener('submit', onSave);
}

async function onDelete(id) {
  if (await isRoleInUse(id)) {
    alert('No puedes eliminar este rol: está asignado a uno o más miembros activos. Reasigna esos miembros primero.');
    return;
  }
  if (!confirm('¿Eliminar este rol personalizado? Esta acción no se puede deshacer.')) return;
  deleteRole(id);
  if (editing?.id === id) editing = null;
  await reload();
}

async function onSave(e) {
  e.preventDefault();
  const name = document.getElementById('r-name').value.trim();
  const err = document.querySelector('#role-form .field-error');
  const dup = roles.some(r => r.role_name.toLowerCase() === name.toLowerCase() && r.id !== editing?.id);
  if (!name || dup) { err.classList.remove('hidden'); return; }
  err.classList.add('hidden');

  const permissions = Object.fromEntries(PERMS.map(([k]) => [k, false]));
  document.querySelectorAll('#role-form input[type="checkbox"][value]:checked')
    .forEach(c => { permissions[c.value] = true; });
  const is_leadership = document.getElementById('r-leadership').checked;

  if (editing) updateRole(editing.id, { role_name: name, is_leadership, permissions });
  else await addRole(session.club_id, { role_name: name, is_leadership, permissions });

  editing = null;
  await reload();
}

async function reload() {
  roles = await getClubRoles(session.club_id);
  render();
}

reload();
