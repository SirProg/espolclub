/* ============================================================
   app.js — Arranque común: tema, cabecera/navegación y sesión
   ------------------------------------------------------------
   Cada página declara su contexto con atributos en <body>:
     data-root   → ruta relativa hasta la raíz (ej. "../../")
     data-env    → "movil" | "lider" | "gbp"
     data-active → clave del item de nav activo
     data-protected (presente) → exige sesión
     data-roles  → roles permitidos separados por coma (opcional)
   y coloca <header id="app-header"></header> donde va la barra.
   ============================================================ */

import { getSession, logout, requireAuth, homeForRole } from './auth.js';
import { getNotificacionesForUser, markNotificationsRead } from './data-service.js';
import { fmtDateTime, esc } from './utils.js';

const THEME_KEY = 'espolclub_theme';

/* ---------- Tema claro/oscuro ---------- */
export function getTheme() {
  return localStorage.getItem(THEME_KEY) ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
export function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
}
export function toggleTheme() {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
  updateThemeIcons();
}
function updateThemeIcons() {
  const dark = getTheme() === 'dark';
  document.querySelectorAll('[data-theme-icon]').forEach(el => {
    el.textContent = dark ? '☀️' : '🌙';
  });
}

/* ---------- Navegación por entorno ---------- */
const NAV = {
  movil: [
    { label: 'Clubes',     key: 'catalogo',   href: 'pages/movil/catalogo.html' },
    { label: 'Eventos',    key: 'eventos',    href: 'pages/movil/eventos.html' },
    { label: 'Credencial', key: 'credencial', href: 'pages/movil/credencial-qr.html' },
    { label: 'Perfil',     key: 'perfil',     href: 'pages/movil/perfil.html' },
  ],
  lider: [
    { label: 'Panel',       key: 'panel',       href: 'pages/lider/panel.html' },
    { label: 'Club',        key: 'club',        href: 'pages/lider/club.html' },
    { label: 'Miembros',    key: 'miembros',    href: 'pages/lider/miembros.html' },
    { label: 'Roles',       key: 'roles',       href: 'pages/lider/roles.html' },
    { label: 'Solicitudes', key: 'solicitudes', href: 'pages/lider/solicitudes.html' },
    { label: 'Formularios', key: 'formularios', href: 'pages/lider/formularios.html' },
    { label: 'Eventos',     key: 'eventos',     href: 'pages/lider/eventos.html' },
    { label: 'Nómina PAO',  key: 'nomina',      href: 'pages/lider/nomina-pao.html' },
    { label: 'Rendición',   key: 'rendicion',   href: 'pages/lider/rendicion.html' },
  ],
  gbp: [
    { label: 'Catálogo',  key: 'catalogo',  href: 'pages/gbp/catalogo-global.html' },
    { label: 'Alta club', key: 'alta',      href: 'pages/gbp/alta-club.html' },
    { label: 'Trámites',  key: 'tramites',  href: 'pages/gbp/tramites.html' },
    { label: 'PAO',       key: 'pao',       href: 'pages/gbp/pao.html' },
    { label: 'Histórico', key: 'historico', href: 'pages/gbp/historico.html' },
  ],
};

/* Items extra que dependen del rol (entorno móvil). */
function extraMovilItems(role) {
  if (role === 'Miembro del Club')
    return [{ label: 'Escáner QR', key: 'escaner', href: 'pages/movil/escaner-qr.html' }];
  if (role === 'Líder de Club')
    return [{ label: 'Solicitudes', key: 'msolic', href: 'pages/movil/solicitudes.html' }];
  return [];
}

/* ---------- Render de la cabecera ---------- */
function mountHeader(session) {
  const host = document.getElementById('app-header');
  if (!host) return;

  const root = document.body.dataset.root || '';
  const env = document.body.dataset.env || 'movil';
  const active = document.body.dataset.active || '';

  let items = NAV[env] ? [...NAV[env]] : [];
  if (env === 'movil') items = [...items, ...extraMovilItems(session?.role)];

  const links = items.map(it => {
    const on = it.key === active;
    const cls = on
      ? 'app-primary font-semibold border-b-2'
      : 'app-muted hover:app-text border-b-2 border-transparent';
    const style = on ? 'border-color: var(--primary);' : '';
    return `<a href="${root}${it.href}" class="px-3 py-2 text-sm ${cls}" style="${style}">${it.label}</a>`;
  }).join('');

  host.className = 'app-surface app-border border-b sticky top-0 z-30';
  host.innerHTML = `
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex items-center justify-between h-14 gap-4">
        <a href="${root}${session ? homeForRole(session.role) : 'index.html'}"
           class="flex items-center gap-2 shrink-0">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg btn-primary font-black">E</span>
          <span class="font-extrabold tracking-tight">ESPOL<span class="app-accent">CLUB</span></span>
        </a>
        <nav class="hidden md:flex items-center gap-1 overflow-x-auto">${links}</nav>
        <div class="flex items-center gap-2 shrink-0">
          ${session ? `
          <div class="relative">
            <button data-action="bell" class="btn btn-ghost px-2 py-1 relative" title="Notificaciones">
              🔔
              <span data-bell-count
                class="hidden absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                style="background: var(--danger); color:#fff;"></span>
            </button>
            <div data-bell-panel class="hidden absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto card p-0 z-50">
              <div class="p-3 divider font-bold text-sm flex items-center justify-between">
                <span>Notificaciones</span>
              </div>
              <div data-bell-list class="text-sm"></div>
            </div>
          </div>` : ''}
          <button data-action="theme" class="btn btn-ghost px-2 py-1" title="Cambiar tema">
            <span data-theme-icon>🌙</span>
          </button>
          ${session ? `
            <span class="hidden sm:flex flex-col items-end leading-tight">
              <span class="text-sm font-semibold">${session.name}</span>
              <span class="text-xs app-muted">${session.role}</span>
            </span>
            <button data-action="logout" class="btn btn-ghost px-2 py-1" title="Cerrar sesión">Salir</button>
          ` : ''}
        </div>
      </div>
      <nav class="md:hidden flex items-center gap-1 overflow-x-auto pb-2 -mt-1">${links}</nav>
    </div>`;

  host.querySelector('[data-action="theme"]')?.addEventListener('click', toggleTheme);
  host.querySelector('[data-action="logout"]')?.addEventListener('click', () => {
    logout();
    window.location.href = `${root}index.html`;
  });
  if (session) setupNotifications(host, session);
  updateThemeIcons();
}

/* ---------- Centro de notificaciones (pantalla 5) ---------- */
async function setupNotifications(host, session) {
  if (session.student_id == null) return;
  const bell = host.querySelector('[data-action="bell"]');
  const panel = host.querySelector('[data-bell-panel]');
  const list = host.querySelector('[data-bell-list]');
  const countEl = host.querySelector('[data-bell-count]');

  let notifs = await getNotificacionesForUser(session.student_id);

  function renderCount() {
    const unread = notifs.filter(n => !n.read).length;
    if (unread > 0) { countEl.textContent = unread; countEl.classList.remove('hidden'); }
    else countEl.classList.add('hidden');
  }
  function renderList() {
    list.innerHTML = notifs.length
      ? notifs.map(n => `
        <div class="p-3 divider ${n.read ? '' : 'app-surface-2'}">
          <p class="${n.read ? 'app-muted' : 'font-medium'}">${esc(n.message)}</p>
          <p class="app-muted text-xs mt-1">${fmtDateTime(n.date)}</p>
        </div>`).join('')
      : '<p class="p-4 app-muted text-center">No tienes notificaciones.</p>';
  }
  renderCount(); renderList();

  bell.addEventListener('click', e => {
    e.stopPropagation();
    const open = panel.classList.toggle('hidden') === false;
    if (open && notifs.some(n => !n.read)) {
      markNotificationsRead(notifs.filter(n => !n.read).map(n => n.id));
      notifs = notifs.map(n => ({ ...n, read: true }));
      renderCount(); renderList();
    }
  });
  document.addEventListener('click', e => {
    if (!panel.contains(e.target) && e.target !== bell) panel.classList.add('hidden');
  });
}

/* ---------- Arranque ---------- */
function boot() {
  applyTheme(getTheme());

  const body = document.body;
  const root = body.dataset.root || '';
  let session = getSession();

  if (body.hasAttribute('data-protected')) {
    const roles = body.dataset.roles ? body.dataset.roles.split(',').map(s => s.trim()) : null;
    session = requireAuth(root, roles);
    if (!session) return; // requireAuth ya redirigió
  }

  mountHeader(session);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
