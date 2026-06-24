/* ============================================================
   pages/movil/catalogo.js — Catálogo de clubes (pantalla 6)
   ------------------------------------------------------------
   RF-46 (filtros) y RF-47 (solo contador de miembros).
   ============================================================ */

import { getClubs, getCatalogos } from '../../data-service.js';
import { renderClubCard } from '../../components/card-club.js';

const ROOT = '../../';

const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const count = document.getElementById('result-count');
const qEl = document.getElementById('q');
const facultyEl = document.getElementById('faculty');
const areaEl = document.getElementById('area');

let clubs = [];

function fillSelect(select, values) {
  for (const v of values) {
    const opt = document.createElement('option');
    opt.value = v; opt.textContent = v;
    select.appendChild(opt);
  }
}

function applyFilters() {
  const q = qEl.value.trim().toLowerCase();
  const faculty = facultyEl.value;
  const area = areaEl.value;

  const filtered = clubs.filter(c => {
    const matchText = !q ||
      c.name.toLowerCase().includes(q) ||
      (c.acronym || '').toLowerCase().includes(q);
    const matchFaculty = !faculty || c.faculty === faculty;
    const matchArea = !area || (c.interest_areas || []).includes(area);
    return matchText && matchFaculty && matchArea;
  });

  grid.innerHTML = filtered.map(c => renderClubCard(c, ROOT)).join('');
  empty.classList.toggle('hidden', filtered.length > 0);
  count.textContent = `${filtered.length} club${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}`;
}

async function init() {
  try {
    const [clubData, cat] = await Promise.all([getClubs(), getCatalogos()]);
    clubs = clubData;
    fillSelect(facultyEl, cat.facultades);
    fillSelect(areaEl, cat.areas_interes);
    applyFilters();

    qEl.addEventListener('input', applyFilters);
    facultyEl.addEventListener('change', applyFilters);
    areaEl.addEventListener('change', applyFilters);
  } catch (err) {
    count.textContent = '';
    grid.innerHTML = `<p class="field-error">Error cargando el catálogo: ${err.message}</p>`;
  }
}

init();
