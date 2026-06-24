/* ============================================================
   components/card-club.js — Tarjeta de club para el catálogo
   ------------------------------------------------------------
   Vista pública (V-01): muestra SOLO el contador de miembros,
   nunca identidades (RN-3 / RF-47).
   ============================================================ */

const PLACEHOLDER = 'assets/img/clubes/club_8.png';

/** Devuelve el HTML de una tarjeta de club. */
export function renderClubCard(club, rootPrefix = '') {
  const img = rootPrefix + (club.image || PLACEHOLDER);
  const areas = (club.interest_areas || [])
    .map(a => `<span class="chip">${a}</span>`).join(' ');
  const pending = club.status === 'Pending Leader'
    ? `<span class="badge badge-warning">Sin líder asignado</span>` : '';

  return `
    <a href="${rootPrefix}pages/movil/club-detalle.html?id=${club.id}"
       class="card overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform">
      <div class="h-32 w-full app-surface-2 overflow-hidden">
        <img src="${img}" alt="${club.name}" class="w-full h-full object-cover"
             onerror="this.src='${rootPrefix}${PLACEHOLDER}'">
      </div>
      <div class="p-4 flex flex-col gap-2 flex-1">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-bold leading-snug">${club.name}</h3>
          <span class="text-xs font-mono app-muted shrink-0">${club.acronym}</span>
        </div>
        <p class="text-sm app-muted line-clamp-2">${club.description || ''}</p>
        <div class="flex flex-wrap gap-1.5 mt-1">${areas}</div>
        <div class="divider mt-auto pt-3 flex items-center justify-between text-sm">
          <span class="app-muted">📍 ${club.faculty || club.location || ''}</span>
          <span class="font-semibold">👥 ${club.members_count ?? 0} miembros</span>
        </div>
        ${pending ? `<div>${pending}</div>` : ''}
      </div>
    </a>`;
}
