/* ============================================================
   pages/auth/verificacion.js — Verificación de correo (pantalla 3)
   ------------------------------------------------------------
   Confirma la cuenta vía enlace (simulado en Fase 1). Muestra el
   correo recibido por querystring y regresa al login al verificar.
   ============================================================ */

import { toggleTheme } from '../../app.js';
import { esc } from '../../utils.js';

const email = new URLSearchParams(location.search).get('email');
if (email) document.getElementById('email-target').textContent = esc(email);

document.getElementById('verify-btn').addEventListener('click', () => {
  document.getElementById('done').classList.remove('hidden');
  document.getElementById('verify-btn').disabled = true;
  setTimeout(() => { window.location.href = '../../index.html'; }, 1500);
});

document.getElementById('theme-btn').addEventListener('click', toggleTheme);
