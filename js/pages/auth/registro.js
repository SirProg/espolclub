/* ============================================================
   pages/auth/registro.js — Registro de cuenta (pantalla 2)
   ------------------------------------------------------------
   F-02/RF-01: registro simulado (Fase 1). Valida en el cliente:
   correo @espol.edu.ec, semestre entero positivo, fecha no
   futura y contraseñas coincidentes. Al validar, deriva a la
   pantalla de verificación. Sin backend ni persistencia real.
   ============================================================ */

import { getCatalogos } from '../../data-service.js';
import { toggleTheme } from '../../app.js';

const ESPOL_EMAIL = /^[^\s@]+@espol\.edu\.ec$/i;

function setError(id, msg) {
  const input = document.getElementById(id);
  const err = input.parentElement.querySelector('.field-error');
  if (err) { err.textContent = msg; err.classList.remove('hidden'); }
}
function clearErrors() {
  document.querySelectorAll('#reg-form .field-error').forEach(e => e.classList.add('hidden'));
}
const val = id => document.getElementById(id).value.trim();

function validate() {
  clearErrors();
  let ok = true;
  const fail = (id, msg) => { setError(id, msg); ok = false; };

  if (!val('enrollment')) fail('enrollment', 'La matrícula es obligatoria.');
  if (!val('email')) fail('email', 'El correo es obligatorio.');
  else if (!ESPOL_EMAIL.test(val('email'))) fail('email', 'Debe ser un correo institucional (@espol.edu.ec).');
  if (!val('first_name')) fail('first_name', 'Ingresa tus nombres.');
  if (!val('last_name')) fail('last_name', 'Ingresa tus apellidos.');

  const birth = val('birth_date');
  if (!birth) fail('birth_date', 'Indica tu fecha de nacimiento.');
  else if (new Date(birth) > new Date()) fail('birth_date', 'La fecha no puede ser futura.');

  if (!val('faculty')) fail('faculty', 'Selecciona tu facultad.');

  const sem = val('semester');
  if (!sem) fail('semester', 'Indica tu semestre.');
  else if (!Number.isInteger(Number(sem)) || Number(sem) < 1) fail('semester', 'Debe ser un entero positivo.');

  if (!val('career')) fail('career', 'Ingresa tu carrera.');

  if (!val('password')) fail('password', 'Crea una contraseña.');
  if (!val('password2')) fail('password2', 'Repite la contraseña.');
  else if (val('password') !== val('password2')) fail('password2', 'Las contraseñas no coinciden.');

  return ok;
}

async function init() {
  const cat = await getCatalogos();
  const sel = document.getElementById('faculty');
  cat.facultades.forEach(f => { const o = document.createElement('option'); o.value = f; o.textContent = f; sel.appendChild(o); });

  document.getElementById('reg-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;
    // Registro simulado: deriva a la verificación de correo (pantalla 3).
    window.location.href = `verificacion.html?email=${encodeURIComponent(val('email'))}`;
  });

  document.getElementById('theme-btn').addEventListener('click', toggleTheme);
}

init();
