/* ============================================================
   utils.js — Helpers de presentación compartidos
   ------------------------------------------------------------
   Traducción de enumeraciones (que viajan en inglés a la BD)
   al español para el usuario final (RNF-10) y formato de fechas.
   ============================================================ */

const LABELS = {
  // Solicitudes / membresías
  Pending: 'Pendiente', Approved: 'Aprobada', Rejected: 'Rechazada',
  Active: 'Activa', Frozen: 'Congelada', Expired: 'Expirada', Revoked: 'Revocada',
  // Trámites GBP
  Submitted: 'Enviado', 'Under Review': 'En revisión',
  // Eventos / QR
  Registered: 'Inscrito', Attended: 'Asistió', NoShow: 'No asistió',
  Used: 'Usado',
  // Visibilidad / modalidad
  Public: 'Público', MembersOnly: 'Solo miembros',
  'In-person': 'Presencial', Virtual: 'Virtual',
  // Estado de club
  'Pending Leader': 'Sin líder',
};

/** Traduce un enum a su etiqueta en español (o lo devuelve igual). */
export const label = (v) => LABELS[v] || v || '';

/** Clase de badge según un estado típico. */
export function statusBadgeClass(status) {
  if (['Approved', 'Active', 'Attended', 'Used'].includes(status)) return 'badge-success';
  if (['Rejected', 'Revoked', 'Expired', 'NoShow'].includes(status)) return 'badge-danger';
  return 'badge-warning'; // Pending, Frozen, Submitted, Under Review, Registered
}

/** Fecha legible: 19 jun 2026. */
export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Fecha y hora legible: 19 jun 2026, 14:30. */
export function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString('es-EC',
    { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * Bloque de imagen de un evento con dimensiones fijas.
 * - `boxClass` define el tamaño de la caja (proporción 16:9 por defecto), de
 *   modo que TODAS las imágenes comparten exactamente las mismas dimensiones.
 * - `object-contain`: la imagen se muestra COMPLETA y centrada; el espacio
 *   sobrante queda con el fondo neutro de la tarjeta (sin recortar).
 * - Si no hay `marketing_image` o la imagen no carga, se muestra la vista
 *   previa "Imagen no disponible" que queda detrás (el <img> se elimina solo
 *   con onerror, revelando el placeholder).
 */
export function eventImage(ev, rootPrefix = '', boxClass = 'aspect-video w-full') {
  const src = ev?.marketing_image ? rootPrefix + ev.marketing_image : '';
  return `
    <div class="${boxClass} app-surface-2 overflow-hidden relative shrink-0">
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center app-muted">
        <span class="text-2xl">🖼️</span>
        <span class="text-[10px] leading-tight px-1">Imagen no disponible</span>
      </div>
      ${src ? `<img src="${esc(src)}" alt="${esc(ev.event_name || 'Evento')}"
                   class="relative w-full h-full object-contain" loading="lazy"
                   onerror="this.remove()">` : ''}
    </div>`;
}

/** Escapa texto para insertar de forma segura en HTML. */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
