/* ============================================================
   components/dynamic-form.js — Render de formularios dinámicos
   ------------------------------------------------------------
   Renderiza el cuerpo de campos a partir del esquema (Form) y
   recoge/valida las respuestas en el cliente (RF-23).
   Tipos soportados: text, textarea, select, radio, checkbox.
   ============================================================ */

/** Devuelve el HTML de los campos de un formulario, ordenados. */
export function renderDynamicForm(form) {
  const fields = [...(form.fields || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  return fields.map(renderField).join('');
}

function renderField(f) {
  const req = f.required ? '<span class="app-accent">*</span>' : '';
  const name = `field_${f.field_id}`;
  let control = '';

  switch (f.type) {
    case 'textarea':
      control = `<textarea class="textarea" rows="3" name="${name}"
        ${f.validation?.max_length ? `maxlength="${f.validation.max_length}"` : ''}></textarea>`;
      break;
    case 'select':
      control = `<select class="select" name="${name}">
        <option value="">Selecciona…</option>
        ${(f.options || []).map(o => `<option value="${o}">${o}</option>`).join('')}
      </select>`;
      break;
    case 'radio':
      control = `<div class="flex flex-col gap-1.5">${(f.options || []).map((o, i) => `
        <label class="flex items-center gap-2 text-sm">
          <input type="radio" name="${name}" value="${o}"> ${o}
        </label>`).join('')}</div>`;
      break;
    case 'checkbox':
      control = `<div class="flex flex-col gap-1.5">${(f.options || []).map(o => `
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" name="${name}" value="${o}"> ${o}
        </label>`).join('')}</div>`;
      break;
    default: // text
      control = `<input type="text" class="input" name="${name}">`;
  }

  return `
    <div class="flex flex-col gap-1.5" data-field="${f.field_id}" data-required="${!!f.required}" data-type="${f.type}">
      <label class="label">${f.label} ${req}</label>
      ${control}
      <p class="field-error hidden"></p>
    </div>`;
}

/**
 * Recoge y valida las respuestas dentro de un contenedor.
 * Devuelve { valid, responses, errors }.
 */
export function collectResponses(container, form) {
  const responses = [];
  const errors = [];

  for (const f of form.fields || []) {
    const wrapper = container.querySelector(`[data-field="${f.field_id}"]`);
    const errEl = wrapper?.querySelector('.field-error');
    errEl?.classList.add('hidden');

    let value;
    if (f.type === 'checkbox') {
      value = [...container.querySelectorAll(`[name="field_${f.field_id}"]:checked`)]
        .map(el => el.value);
    } else if (f.type === 'radio') {
      value = container.querySelector(`[name="field_${f.field_id}"]:checked`)?.value || '';
    } else {
      value = (container.querySelector(`[name="field_${f.field_id}"]`)?.value || '').trim();
    }

    const empty = Array.isArray(value) ? value.length === 0 : value === '';
    if (f.required && empty) {
      errors.push(f.field_id);
      if (errEl) { errEl.textContent = 'Este campo es obligatorio.'; errEl.classList.remove('hidden'); }
      continue;
    }
    responses.push({ field_id: f.field_id, answer: Array.isArray(value) ? value.join(', ') : value });
  }

  return { valid: errors.length === 0, responses, errors };
}
