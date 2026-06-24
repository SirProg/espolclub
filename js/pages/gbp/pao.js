/* ============================================================
   pages/gbp/pao.js — Configuración de PAO (pantalla 32)
   ------------------------------------------------------------
   V-24/F-19/RF-45: GBP administra los períodos académicos.
   Solo puede haber un PAO activo a la vez.
   ============================================================ */

import { getPaos, addPao, updatePao } from '../../data-service.js';
import { label, statusBadgeClass, fmtDate, esc } from '../../utils.js';

const content = document.getElementById('content');
let paos = [];

function table() {
  const rows = paos.map(p => `
    <tr class="divider">
      <td class="py-3 pr-3 font-medium">${esc(p.pao_period)}</td>
      <td class="py-3 pr-3 app-muted">${fmtDate(p.start_date)} – ${fmtDate(p.end_date)}</td>
      <td class="py-3 pr-3"><span class="badge ${statusBadgeClass(p.status === 'Active' ? 'Active' : 'Pending')}">${label(p.status) || p.status}</span></td>
      <td class="py-3 text-right">
        ${p.status !== 'Active' ? `<button class="btn btn-ghost text-xs py-1.5" data-activate="${esc(p.pao_period)}">Marcar activo</button>` : ''}
      </td>
    </tr>`).join('');

  return `
    <div class="card p-5 overflow-x-auto mb-6">
      <table class="w-full text-sm">
        <thead><tr class="text-left app-muted">
          <th class="pb-2 font-semibold">Período</th>
          <th class="pb-2 font-semibold">Fechas</th>
          <th class="pb-2 font-semibold">Estado</th>
          <th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function form() {
  return `
    <div class="card p-6 max-w-2xl">
      <h2 class="font-bold mb-4">Nuevo período</h2>
      <form id="pao-form" class="flex flex-col gap-4">
        <div class="grid sm:grid-cols-3 gap-4">
          <div><label class="label">Identificador *</label><input id="p-id" class="input mt-1" placeholder="2026-II"></div>
          <div><label class="label">Inicio *</label><input id="p-start" type="date" class="input mt-1"></div>
          <div><label class="label">Fin *</label><input id="p-end" type="date" class="input mt-1"></div>
        </div>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" id="p-active"> Marcar como período activo</label>
        <p id="p-error" class="field-error hidden"></p>
        <div><button type="submit" class="btn btn-primary">Crear período</button></div>
      </form>
    </div>`;
}

function bind() {
  content.querySelectorAll('[data-activate]').forEach(b =>
    b.addEventListener('click', async () => {
      await updatePao(b.dataset.activate, { status: 'Active' });
      await reload();
    }));

  document.getElementById('pao-form').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('p-id').value.trim();
    const start = document.getElementById('p-start').value;
    const end = document.getElementById('p-end').value;
    const active = document.getElementById('p-active').checked;
    const err = document.getElementById('p-error');

    if (!id || !start || !end) { err.textContent = 'Completa identificador, inicio y fin.'; err.classList.remove('hidden'); return; }
    if (paos.some(p => p.pao_period.toLowerCase() === id.toLowerCase())) { err.textContent = 'Ya existe un período con ese identificador.'; err.classList.remove('hidden'); return; }
    if (new Date(end) <= new Date(start)) { err.textContent = 'El fin debe ser posterior al inicio.'; err.classList.remove('hidden'); return; }
    err.classList.add('hidden');

    await addPao({ pao_period: id, start_date: start, end_date: end, status: active ? 'Active' : 'Closed' });
    await reload();
  });
}

async function reload() {
  paos = await getPaos();
  content.innerHTML = table() + form();
  bind();
}

reload();
