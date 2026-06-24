/* ============================================================
   pages/auth/recuperacion.js — Recuperar contraseña (pantalla 4)
   ------------------------------------------------------------
   F-03/RF-03: solicita el correo institucional (validación
   @espol.edu.ec) y confirma el envío (simulado en Fase 1).
   ============================================================ */

import { toggleTheme } from '../../app.js';

const ESPOL_EMAIL = /^[^\s@]+@espol\.edu\.ec$/i;

const form = document.getElementById('rec-form');
const emailEl = document.getElementById('email');
const errEl = emailEl.parentElement.querySelector('.field-error');
const done = document.getElementById('done');

form.addEventListener('submit', e => {
  e.preventDefault();
  errEl.classList.add('hidden');
  done.classList.add('hidden');
  const email = emailEl.value.trim();

  if (!email) { errEl.textContent = 'El correo es obligatorio.'; errEl.classList.remove('hidden'); return; }
  if (!ESPOL_EMAIL.test(email)) { errEl.textContent = 'Debe ser un correo institucional (@espol.edu.ec).'; errEl.classList.remove('hidden'); return; }

  done.textContent = '✓ Si el correo existe, recibirás las instrucciones en breve.';
  done.classList.remove('hidden');
  form.querySelector('button').disabled = true;
});

document.getElementById('theme-btn').addEventListener('click', toggleTheme);
