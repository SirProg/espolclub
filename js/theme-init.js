/* ============================================================
   theme-init.js — Aplica el tema guardado ANTES del primer
   pintado para evitar el parpadeo (FOUC).
   ------------------------------------------------------------
   Debe cargarse como script clásico (bloqueante) en el <head>,
   no como módulo: los módulos son diferidos y reintroducirían
   el parpadeo. La gestión interactiva del tema vive en app.js.
   ============================================================ */
(function () {
  var t = localStorage.getItem('espolclub_theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (t === 'dark') document.documentElement.classList.add('dark');
})();
