/* ============================================================
   pages/movil/credencial-qr.js — Credencial QR (pantalla 12)
   ------------------------------------------------------------
   Renderiza el QR de cada inscripción del estudiante. El token
   es mock (Fase 1); el token opaco real se firma en el backend.
   ============================================================ */

import { getInscripcionesAll, getEventos } from '../../data-service.js';
import { getSession } from '../../auth.js';
import { label, statusBadgeClass, fmtDate, esc } from '../../utils.js';

const session = getSession();
const list = document.getElementById('list');
const empty = document.getElementById('empty');

/** Devuelve el SVG de un QR para el token dado. */
function qrSvg(token) {
  if (!window.qrcode) return `<p class="app-muted text-xs">${esc(token)}</p>`;
  const qr = window.qrcode(0, 'M');
  qr.addData(token);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 2 });
}

function credential(insc, ev) {
  const used = insc.attendance_status === 'Attended' || insc.qr_status === 'Used';
  return `
    <div class="card p-5 flex flex-col sm:flex-row gap-5 items-center">
      <div class="bg-white p-3 rounded-xl shrink-0" style="width:150px;height:150px">
        ${qrSvg(insc.qr_token)}
      </div>
      <div class="flex-1 w-full">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-bold">${esc(ev?.event_name || 'Evento')}</h3>
          <span class="badge ${statusBadgeClass(insc.attendance_status)}">${label(insc.attendance_status)}</span>
        </div>
        <p class="app-muted text-sm mt-1">📅 ${fmtDate(ev?.planned_date)} · 📍 ${esc(ev?.planned_place || '')}</p>
        <p class="text-xs font-mono app-muted mt-3 break-all">${esc(insc.qr_token)}</p>
        ${used ? '<p class="app-muted text-xs mt-2">Esta credencial ya fue utilizada.</p>'
               : '<p class="app-accent text-xs mt-2">Credencial activa</p>'}
      </div>
    </div>`;
}

async function init() {
  const [insc, eventos] = await Promise.all([getInscripcionesAll(), getEventos()]);
  const mine = insc.filter(i => i.student_id === session.student_id);
  const evById = Object.fromEntries(eventos.map(e => [e.id, e]));

  if (!mine.length) { empty.classList.remove('hidden'); return; }
  list.innerHTML = mine.map(i => credential(i, evById[i.event_id])).join('');
}

init();
