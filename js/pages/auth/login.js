/* ============================================================
   pages/auth/login.js — Pantalla de inicio de sesión (1)
   ------------------------------------------------------------
   F-01/RF-04: login mock con los 4 usuarios demo y enrutamiento
   por rol. Si ya hay sesión, redirige al hogar correspondiente.
   ============================================================ */

import { login, getSession, homeForRole } from '../../auth.js';
import { toggleTheme } from '../../app.js';

// Si ya hay sesión, ir directo al hogar del rol.
const existing = getSession();
if (existing) window.location.href = homeForRole(existing.role);

// Credenciales demo para el acceso rápido.
const MOCK = {
  estudiante: ['202311346', 'estudiante123'],
  miembro:    ['202055789', 'miembro123'],
  lider:      ['201899001', 'lider123'],
  gbp:        ['GBP-001',   'gbp123'],
};

const form = document.getElementById('login-form');
const enrollmentEl = document.getElementById('enrollment');
const passwordEl = document.getElementById('password');
const errorEl = document.getElementById('login-error');

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
}

async function doLogin(enrollment, password) {
  errorEl.classList.add('hidden');
  // F-01: si el identificador parece un correo, validar su formato.
  if (enrollment.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enrollment.trim())) {
    showError('Ingresa un correo con formato válido o tu matrícula.');
    return;
  }
  const res = await login(enrollment, password);
  if (!res.ok) { showError(res.error); return; }
  window.location.href = homeForRole(res.session.role);
}

form.addEventListener('submit', e => {
  e.preventDefault();
  doLogin(enrollmentEl.value, passwordEl.value);
});

document.querySelectorAll('[data-mock]').forEach(btn => {
  btn.addEventListener('click', () => {
    const [enr, pwd] = MOCK[btn.dataset.mock];
    enrollmentEl.value = enr;
    passwordEl.value = pwd;
    doLogin(enr, pwd);
  });
});

document.getElementById('theme-btn').addEventListener('click', toggleTheme);
