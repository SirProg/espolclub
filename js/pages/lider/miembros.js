/* ============================================================
   pages/lider/miembros.js — Gestión de miembros / nómina (19)
   ------------------------------------------------------------
   V-13: nómina detallada con rol y vigencia. Acciones: cambiar
   rol (RF-09, un rol por membresía) y dar de baja (Revoked).
   ============================================================ */

import { getClubMembers, getClubRoles, setMembershipRole, revokeMembership } from '../../data-service.js';
import { getSession } from '../../auth.js';
import { fmtDate, esc } from '../../utils.js';

const session = getSession();
const content = document.getElementById('content');
let roles = [];

function roleSelect(membershipId, currentRoleId) {
  const opts = roles.map(r =>
    `<option value="${r.id}" ${r.id === currentRoleId ? 'selected' : ''}>${esc(r.role_name)}</option>`).join('');
  return `<select class="select" data-role-for="${membershipId}" style="min-width:160px">${opts}</select>`;
}

async function render() {
  const members = await getClubMembers(session.club_id);
  if (!members.length) {
    content.innerHTML = '<div class="card p-6 app-muted">Este club aún no tiene miembros.</div>';
    return;
  }

  const rows = members.map(({ membership: m, profile: p, role: r }) => `
    <tr class="divider" data-row="${m.id}">
      <td class="py-3 pr-3">
        <p class="font-medium">${esc(p ? p.first_name + ' ' + p.last_name : '—')}</p>
        <p class="app-muted text-xs">${esc(p?.email || '')}</p>
      </td>
      <td class="py-3 pr-3 app-muted">${esc(p?.enrollment || '')}</td>
      <td class="py-3 pr-3 app-muted">${esc(p?.career || '')}</td>
      <td class="py-3 pr-3">${roleSelect(m.id, m.role_id)}</td>
      <td class="py-3 pr-3 app-muted text-xs">${esc(m.pao_period || '')}<br>${fmtDate(m.valid_until)}</td>
      <td class="py-3 text-right"><button class="btn btn-ghost text-xs py-1.5" data-revoke="${m.id}">Dar de baja</button></td>
    </tr>`).join('');

  content.innerHTML = `
    <div class="card p-5 overflow-x-auto">
      <table class="w-full text-sm">
        <thead><tr class="text-left app-muted">
          <th class="pb-2 font-semibold">Miembro</th>
          <th class="pb-2 font-semibold">Matrícula</th>
          <th class="pb-2 font-semibold">Carrera</th>
          <th class="pb-2 font-semibold">Rol</th>
          <th class="pb-2 font-semibold">Vigencia</th>
          <th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  content.querySelectorAll('[data-role-for]').forEach(sel =>
    sel.addEventListener('change', () => {
      setMembershipRole(Number(sel.dataset.roleFor), sel.value);
      sel.style.borderColor = 'var(--success)';
      setTimeout(() => { sel.style.borderColor = ''; }, 1200);
    }));

  content.querySelectorAll('[data-revoke]').forEach(btn =>
    btn.addEventListener('click', () => {
      if (!confirm('¿Dar de baja a este miembro? Su membresía pasará a Revocada.')) return;
      revokeMembership(Number(btn.dataset.revoke));
      render();
    }));
}

async function init() {
  roles = await getClubRoles(session.club_id);
  render();
}

init();
