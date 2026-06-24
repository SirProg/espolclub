/* ============================================================
   pages/movil/escaner-qr.js — Escáner QR del Staff (pantalla 13)
   ------------------------------------------------------------
   Valida el token y registra asistencia única (RN-6). En Fase 1
   el "escaneo" se simula ingresando/seleccionando el código.
   ============================================================ */

import { getInscripcionesAll, getEventos, registerScan } from '../../data-service.js';
import { getSession } from '../../auth.js';
import { esc } from '../../utils.js';

const session = getSession();
const tokenEl = document.getElementById('token');
const demoEl = document.getElementById('token-demo');
const resultEl = document.getElementById('result');

function showResult(res) {
  resultEl.classList.remove('hidden');
  const map = {
    ok: ['var(--success-soft)', 'var(--success)', '✓'],
    duplicate: ['var(--warning-soft)', 'var(--warning)', '⚠️'],
    invalid: ['var(--danger-soft)', 'var(--danger)', '✕'],
    empty: ['var(--danger-soft)', 'var(--danger)', '✕'],
  };
  const [bg, fg, icon] = map[res.status] || map.invalid;
  resultEl.style.background = bg;
  resultEl.style.color = fg;
  resultEl.innerHTML = `<p class="text-2xl mb-1">${icon}</p><p class="font-semibold">${esc(res.message)}</p>`;
}

async function doScan() {
  const res = await registerScan(tokenEl.value, session.student_id);
  showResult(res);
  if (res.ok) await populateDemo(); // refresca: el código usado ya no debe servir 2 veces
}

document.getElementById('scan-btn').addEventListener('click', doScan);
demoEl.addEventListener('change', () => { tokenEl.value = demoEl.value; });

async function populateDemo() {
  const [insc, eventos] = await Promise.all([getInscripcionesAll(), getEventos()]);
  const evById = Object.fromEntries(eventos.map(e => [e.id, e]));
  demoEl.innerHTML = '<option value="">—</option>' + insc.map(i => {
    const used = i.attendance_status === 'Attended' || i.qr_status === 'Used';
    const ev = evById[i.event_id];
    return `<option value="${esc(i.qr_token)}">${esc(ev?.event_name || 'Evento')} · ${esc(i.qr_token)}${used ? ' (usado)' : ''}</option>`;
  }).join('');
}

populateDemo();
