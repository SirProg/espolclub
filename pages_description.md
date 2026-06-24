# Descripción de Páginas y Scripts — ESPOLCLUB (Fase 1)

Este documento describe cada archivo **HTML** y **JS** que compone las pantallas del frontend. Para cada HTML se indica su función, qué hace y qué aplica o modifica. Para cada JS se listan sus funciones internas con una breve descripción.

> **Convenciones comunes a todos los HTML de página:**
> - En el `<head>`: `theme-init.js` (tema antes de pintar) → Tailwind CSS por CDN → `css/themes.css`.
> - El `<body>` declara su contexto con atributos `data-*`: `data-root` (ruta a la raíz), `data-env` (`movil`/`lider`/`gbp`), `data-active` (ítem de menú activo), `data-protected` (exige sesión) y `data-roles` (roles permitidos).
> - `<header id="app-header">` es llenado por `app.js`; al final del `<body>` se cargan `app.js` (chrome común) y el `.js` específico de la pantalla.
> - Toda escritura es **simulada** mediante un *overlay* en `localStorage` (no hay backend en Fase 1).

---

## 1. Núcleo / Scripts compartidos

### `js/theme-init.js`
**Función:** aplicar el tema (claro/oscuro) guardado **antes del primer pintado** para evitar el parpadeo (FOUC). Se carga como script clásico bloqueante en el `<head>`.
**Aplica/modifica:** agrega la clase `.dark` a `<html>` si corresponde, leyendo `localStorage` o la preferencia del sistema. No define funciones exportables (es un IIFE).

### `js/app.js`
**Función:** arranque común de cada página: tema interactivo, cabecera/navegación por entorno, centro de notificaciones y guarda de sesión.
**Aplica/modifica:** inyecta el header en `#app-header`, conmuta `.dark`, persiste el tema y redirige si la sesión no cumple los roles.
**Funciones:**
- `getTheme()` — devuelve el tema actual (de `localStorage` o preferencia del sistema).
- `applyTheme(theme)` — aplica el tema a `<html>` y lo persiste en `localStorage`.
- `toggleTheme()` — alterna entre claro y oscuro y actualiza los íconos.
- `updateThemeIcons()` — sincroniza el ícono ☀️/🌙 de los botones de tema.
- `extraMovilItems(role)` — añade ítems de menú móvil según el rol (Escáner para Miembro, Solicitudes para Líder).
- `mountHeader(session)` — construye y renderiza la barra superior (marca, nav, tema, usuario, salir).
- `setupNotifications(host, session)` — carga las notificaciones del usuario, muestra el contador de no leídas y el panel desplegable; las marca como leídas al abrir.
- `boot()` — orquesta el arranque: aplica tema, valida sesión/rol y monta el header.

### `js/auth.js`
**Función:** autenticación simulada y enrutamiento por rol.
**Aplica/modifica:** crea/lee/borra la sesión en `localStorage`; redirige al “hogar” de cada rol.
**Funciones:**
- `getSession()` — devuelve el objeto de sesión guardado (o `null`).
- `setSession(session)` — guarda la sesión en `localStorage`.
- `logout()` — elimina la sesión.
- `homeForRole(role)` — devuelve la página inicial correspondiente a un rol.
- `login(enrollment, password)` — valida credenciales contra `usuarios.json`, arma la sesión y la guarda.
- `requireAuth(rootPrefix, allowedRoles)` — guarda de ruta: exige sesión y rol permitido; redirige si no cumple.

### `js/data-service.js`
**Función:** **único punto de acceso a datos**. Lee los `.json` con `fetch` y mantiene una capa de escritura simulada (*overlay* en `localStorage`). En la Fase 2 solo se cambia este archivo para apuntar a la API.
**Aplica/modifica:** fusiona los `.json` base con lo creado/editado en sesión y persiste inserciones, cambios de estado y ediciones.
**Funciones (agrupadas):**

*Carga base y overlay:*
- `getJSON(name)` — carga y cachea un `.json` de `/data`.
- `getOverlay()` / `saveOverlay(o)` — leen/guardan el overlay de escritura en `localStorage` (internas).
- `getUsuarios()`, `getAsistencias()`, `getCatalogos()` — lectores directos de solo lectura.

*Lectores con overlay aplicado:*
- `getClubs()` — clubes base + creados + ediciones + documentos/visibilidad.
- `getRoles()` — roles base + roles personalizados creados.
- `getMembresias()` — membresías base + cambios (rol/estado) + nuevas.
- `getFormularios()` — formularios base + creados/versionados.
- `getEventos()` — eventos base + creados + ediciones.
- `getTramitesGBP()` — trámites base + enviados + cambios de estado.
- `getPaos()` — períodos PAO base + creados/editados.

*Perfil:*
- `getProfileByEnrollment(enrollment)` / `getProfileById(id)` — perfil con ediciones del overlay.
- `updateProfile(enrollment, patch)` — guarda descripción/habilidades/redes editadas.

*Clubes y formularios:*
- `getClubById(id)` — un club por id (con overlay).
- `getMembershipForm(clubId)` — formulario de membresía activo más reciente del club.
- `getFormById(id)` — un formulario por id.
- `getClubForms(clubId)` — formularios de un club.
- `formHasResponses(formId)` — indica si un formulario ya tiene respuestas (para versionar).
- `saveForm({...})` — crea un formulario nuevo, calculando su versión.

*Membresías / miembros:*
- `isActiveMember(studentId, clubId)` — verifica membresía activa.
- `getClubMembers(clubId, {onlyActive})` — nómina con perfil y rol resueltos.
- `setMembershipRole(membershipId, roleId)` — cambia el rol de una membresía.
- `revokeMembership(membershipId)` — da de baja (estado `Revoked`).
- `getNomina(clubId, paoPeriod)` — membresías de un club en un PAO.
- `renewNomina(clubId, membershipIds)` — renueva membresías al PAO activo (RF-21).

*Roles:*
- `getClubRoles(clubId)` — roles de un club.
- `addRole(clubId, {...})` — crea un rol personalizado con permisos.
- `memberRoleId(clubId)` — id del rol “Miembro” predeterminado (interna).

*Solicitudes:*
- `getSolicitudesAll()` — todas las solicitudes (base + creadas + cambios de estado).
- `getClubSolicitudes(clubId, status)` — solicitudes de un club (filtrables por estado).
- `addSolicitud({...})` — crea una solicitud `Pending`.
- `setSolicitudStatus(id, status, feedback)` — cambia el estado (interna/base).
- `approveSolicitud(sol)` — aprueba y **crea la membresía** del estudiante (RF-08).
- `rejectSolicitud(id, feedback)` — rechaza con feedback (RN-5).
- `canApply(studentId, clubId)` — RN-2: valida si puede postular (sin duplicados ni siendo miembro).

*Eventos / inscripciones / QR:*
- `getEventById(id)` — un evento por id.
- `getVisibleEvents(_studentId)` — eventos visibles para el estudiante.
- `getClubEvents(clubId)` — eventos de un club con métricas inscritos/asistentes.
- `addEvent(clubId, data)` / `updateEvent(id, patch)` — crea/edita un evento.
- `getEventStaff(eventId)` / `setEventStaff(eventId, studentIds)` — staff asignado por evento.
- `canRegisterEvent(studentId, event)` — RF-31/34: valida si puede inscribirse.
- `addInscripcion({...})` — crea inscripción y genera el `qr_token` (mock).
- `getInscripcionesAll()` — inscripciones (base + nuevas + asistencias aplicadas).
- `getAsistenciasAll()` — asistencias (base + registradas en sesión).
- `registerScan(qrToken, staffStudentId)` — RN-6: valida el QR y registra asistencia única.

*Notificaciones e historial:*
- `getNotificacionesForUser(userId)` — notificaciones del usuario (con estado leído).
- `markNotificationsRead(ids)` — marca notificaciones como leídas.
- `getStudentHistory(studentId)` — postulaciones y asistencias del estudiante (pantalla 15).

*Club (líder) — información y documentos:*
- `updateClub(clubId, patch)` — edita datos del club.
- `addClubDocument(clubId, {...})` — agrega un documento.
- `setDocVisibility(docId, isPublic)` — cambia visibilidad público/privado (RF-16).

*PAO:*
- `getActivePao()` — período activo.
- `addPao({...})` / `updatePao(paoPeriod, patch)` — crea/edita períodos (garantiza un único activo).
- `closeOtherPaos(o, activePeriod)` — cierra los demás PAO al activar uno (interna).

*Rendición / trámites:*
- `getClubTramites(clubId)` — trámites de un club.
- `addTramite(clubId, {...})` — envía un reporte a GBP (`Submitted`).
- `setTramiteStatus(id, status, feedback, gbpId)` — GBP aprueba/rechaza un trámite (RN-5).

*GBP — catálogo y liderazgo:*
- `getClubLeader(club)` — resuelve el perfil del líder por matrícula.
- `getGlobalCatalog()` — clubes con líder resuelto y miembros activos.
- `addClub({...})` — RF-11/12: crea un club; `Pending Leader` si la matrícula no tiene cuenta.
- `revokeLeader(clubId)` — revoca el líder (RF-13).
- `assignLeader(clubId, enrollment)` — asigna/reasigna líder por matrícula.
- `getHistoryByPao(paoPeriod)` — clubes, líderes y nómina por período (RF-49).

### `js/utils.js`
**Función:** helpers de presentación compartidos.
**Aplica/modifica:** solo transforma texto para mostrar (no toca datos).
**Funciones:**
- `label(v)` — traduce un enum (inglés) a su etiqueta en español (RNF-10).
- `statusBadgeClass(status)` — devuelve la clase de badge (éxito/alerta/peligro) según un estado.
- `fmtDate(iso)` — formatea una fecha legible (ej. *19 jun 2026*).
- `fmtDateTime(iso)` — formatea fecha y hora legibles.
- `esc(s)` — escapa texto para insertarlo de forma segura en HTML.

---

## 2. Componentes reutilizables

### `js/components/card-club.js`
**Función:** generar la tarjeta de un club para el catálogo.
**Aplica/modifica:** produce HTML; respeta privacidad (RN-3) mostrando solo el contador de miembros.
**Funciones:**
- `renderClubCard(club, rootPrefix)` — devuelve el HTML de la tarjeta (imagen, nombre, áreas, contador, estado).

### `js/components/dynamic-form.js`
**Función:** renderizar y validar formularios dinámicos a partir de su esquema.
**Aplica/modifica:** genera campos HTML y recoge/valida respuestas en el cliente.
**Funciones:**
- `renderDynamicForm(form)` — devuelve el HTML de los campos ordenados.
- `renderField(f)` — genera el control de un campo según su tipo (interna).
- `collectResponses(container, form)` — recoge respuestas, valida obligatorios y devuelve `{valid, responses, errors}`.

---

## 3. Autenticación

### `index.html` — Inicio de sesión (pantalla 1)
**Función:** punto de entrada y login de la aplicación.
**Qué hace:** presenta el formulario de acceso y botones de acceso rápido a los 4 usuarios demo; incluye botón de tema.
**Aplica/modifica:** al autenticar, crea la sesión y redirige al hogar del rol.

### `js/pages/auth/login.js`
**Función:** lógica de la pantalla de login (F-01/RF-04).
**Funciones:**
- `showError(msg)` — muestra el mensaje de error de credenciales.
- `doLogin(enrollment, password)` — ejecuta el login y redirige según el rol; (al inicio del módulo, si ya hay sesión, redirige directo).

### `pages/auth/registro.html` — Registro de cuenta (2)
**Función:** crear una cuenta con correo institucional (simulado en Fase 1).
**Qué hace:** formulario F-02 (matrícula, nombres, apellidos, fecha de nacimiento, correo, facultad, carrera, semestre, contraseña×2); al validar deriva a la verificación.
**Aplica/modifica:** valida en cliente; no persiste datos reales (sin backend).

### `js/pages/auth/registro.js`
- `setError(id, msg)` / `clearErrors()` — muestran/limpian errores por campo.
- `validate()` — valida correo `@espol.edu.ec`, semestre entero positivo, fecha no futura, contraseñas coincidentes y obligatorios.
- `init()` — puebla facultades, cablea el envío (redirige a verificación) y el botón de tema.

### `pages/auth/verificacion.html` — Verificación de correo (3)
**Función:** confirmar la cuenta vía enlace (simulado).
**Qué hace:** muestra el correo recibido y un botón para simular la verificación; regresa al login.
**Aplica/modifica:** solo navegación; sin datos reales.

### `js/pages/auth/verificacion.js`
- (script de pantalla) muestra el correo del querystring y, al “verificar”, redirige al login tras un instante.

### `pages/auth/recuperacion.html` — Recuperación de contraseña (4)
**Función:** solicitar instrucciones de recuperación.
**Qué hace:** formulario F-03 (correo institucional) con confirmación de envío.
**Aplica/modifica:** valida `@espol.edu.ec` en cliente; muestra mensaje de confirmación (simulado).

### `js/pages/auth/recuperacion.js`
- (script de pantalla) valida el correo institucional y muestra la confirmación de envío.

---

## 4. Entorno Móvil (Estudiante / Miembro)

### `pages/movil/catalogo.html` — Catálogo de clubes (6)
**Función:** descubrir clubes.
**Qué hace:** muestra filtros (texto, facultad, área) y una grilla de tarjetas.
**Aplica/modifica:** solo lectura; filtra en cliente.

### `js/pages/movil/catalogo.js`
- `fillSelect(select, values)` — puebla un `<select>` con opciones del catálogo.
- `applyFilters()` — filtra los clubes por texto/facultad/área y re-renderiza la grilla.
- `init()` — carga clubes y catálogos, llena filtros y cablea eventos.

### `pages/movil/club-detalle.html` — Detalle de club (7) + Postulación (8)
**Función:** ver un club y postular a su membresía.
**Qué hace:** muestra vista pública o de miembro y un modal con el formulario dinámico de postulación.
**Aplica/modifica:** crea una solicitud `Pending` (respetando RN-2).

### `js/pages/movil/club-detalle.js`
- `socialLinks(list)` — HTML de enlaces de redes sociales.
- `docsList(docs, isMember)` — lista de documentos visibles según privacidad.
- `rosterTable()` — tabla de la nómina interna (solo miembros).
- `isMemberOfClub()` — indica si la sesión pertenece al club.
- `applyButton()` — decide el botón/estado de postulación según RN-2 y el estado del club.
- `render()` — renderiza el detalle completo del club.
- `openModal()` / `closeModal()` — abren/cierran el modal de postulación.

### `pages/movil/eventos.html` — Eventos disponibles (9), detalle (10), inscripción (11)
**Función:** explorar eventos e inscribirse.
**Qué hace:** grilla de eventos; modal con detalle, disponibilidad de registro y formulario dinámico.
**Aplica/modifica:** crea una inscripción y genera la credencial QR.

### `js/pages/movil/eventos.js`
- `eventCard(ev)` — HTML de la tarjeta de un evento.
- `openEvent(eventId)` — abre el modal de detalle y evalúa si puede inscribirse (RF-31/34).
- `showRegisterForm(ev)` — muestra el formulario dinámico y procesa la inscripción.
- `closeModal()` — cierra el modal.
- `init()` — carga eventos y clubes y cablea las tarjetas.

### `pages/movil/credencial-qr.html` — Credencial QR (12)
**Función:** portar las credenciales QR del estudiante.
**Qué hace:** lista cada inscripción con su QR generado por librería cliente.
**Aplica/modifica:** solo lectura.

### `js/pages/movil/credencial-qr.js`
- `qrSvg(token)` — genera el SVG del código QR a partir del token.
- `credential(insc, ev)` — HTML de una tarjeta-credencial.
- `init()` — carga inscripciones del estudiante y renderiza las credenciales.

### `pages/movil/escaner-qr.html` — Escáner QR del Staff (13)
**Función:** registrar asistencia escaneando credenciales.
**Qué hace:** simula el escaneo ingresando/seleccionando un token y muestra el resultado.
**Aplica/modifica:** registra asistencia única (RN-6, evita duplicados).

### `js/pages/movil/escaner-qr.js`
- `showResult(res)` — muestra el resultado del escaneo (éxito/duplicado/inválido).
- `doScan()` — valida el token y registra la asistencia.
- `populateDemo()` — llena el selector demo con los tokens existentes.

### `pages/movil/perfil.html` — Perfil (14) e Historial (15)
**Función:** ver/editar datos propios y consultar historial.
**Qué hace:** muestra datos institucionales (solo lectura), información pública editable e historial de postulaciones y asistencias.
**Aplica/modifica:** guarda descripción, habilidades y redes (F-07).

### `js/pages/movil/perfil.js`
- `ageFrom(birth)` — calcula la edad a partir de la fecha de nacimiento.
- `field(labelTxt, value)` — HTML de un dato de solo lectura.
- `renderReadonly()` — renderiza los datos institucionales.
- `renderPublicView()` — renderiza la información pública (vista).
- `renderForm()` — renderiza el formulario de edición.
- `socialRow(network, link)` — fila para editar una red social.
- `toggleEdit(on)` — alterna entre vista y edición.
- `renderApplications(apps)` — lista de postulaciones del historial.
- `renderAttendances(atts)` — lista de inscripciones/asistencias del historial.
- `init()` — carga perfil e historial y los renderiza.

### `pages/movil/solicitudes.html` — Bandeja del Líder móvil (16)
**Función:** resolver postulaciones desde el móvil (conveniencia del líder).
**Qué hace:** lista solicitudes `Pending` con sus respuestas y botones aprobar/rechazar.
**Aplica/modifica:** aprueba (crea membresía) o rechaza con feedback (RN-5).

### `js/pages/movil/solicitudes.js`
- `buildCard(s)` — HTML de la tarjeta de una solicitud con sus respuestas.
- `wire(card)` — cablea los botones aprobar/rechazar y la validación de feedback.
- `init()` — carga las solicitudes pendientes del club del líder.

---

## 5. Panel del Líder (Web)

### `pages/lider/panel.html` — Panel del club (17)
**Función:** entrada plana al panel con resumen y accesos.
**Qué hace:** muestra métricas (miembros, pendientes, eventos, último trámite) y enlaces a los módulos; avisa si `Pending Leader`.
**Aplica/modifica:** solo lectura.

### `js/pages/lider/panel.js`
- `statCard(value, lbl)` — HTML de una tarjeta de métrica.
- `init()` — carga el club y sus agregados y renderiza el panel.

### `pages/lider/club.html` — Información del club (18)
**Función:** mantener los datos y documentos del club.
**Qué hace:** formulario de edición + gestión de documentos y su visibilidad.
**Aplica/modifica:** edita el club, agrega documentos y cambia visibilidad (RF-16).

### `js/pages/lider/club.js`
- `areaCheckboxes(selected)` — casillas de áreas de interés.
- `docsRows()` — filas de documentos con su toggle de visibilidad.
- `render()` — renderiza el formulario y la sección de documentos, y cablea sus acciones.
- `init()` — carga club y catálogos.

### `pages/lider/miembros.html` — Gestión de miembros (19)
**Función:** administrar la nómina.
**Qué hace:** tabla con nombre, matrícula, carrera, rol y vigencia.
**Aplica/modifica:** cambia el rol de una membresía (RF-09) o la da de baja (`Revoked`).

### `js/pages/lider/miembros.js`
- `roleSelect(membershipId, currentRoleId)` — `<select>` de rol para una membresía.
- `render()` — renderiza la tabla y cablea cambio de rol y baja.
- `init()` — carga los roles del club y renderiza.

### `pages/lider/roles.html` — Roles y permisos (20)
**Función:** configurar los roles internos del club.
**Qué hace:** tabla de roles (predeterminados + personalizados) y formulario para crear roles.
**Aplica/modifica:** crea roles con permisos; `manage_roles` restringido al Presidente (RN-7).

### `js/pages/lider/roles.js`
- `permPills(p)` — chips con los permisos activos de un rol.
- `renderTable()` — tabla de roles y permisos.
- `renderForm()` — formulario para crear un rol.
- `render()` — compone tabla + formulario y cablea el envío.
- `init()` — carga los roles del club.

### `pages/lider/solicitudes.html` — Bandeja de solicitudes (21)
**Función:** resolver postulaciones en el panel web.
**Qué hace:** pendientes con respuestas dinámicas + historial de resueltas.
**Aplica/modifica:** aprueba (crea membresía) o rechaza con feedback (RN-5).

### `js/pages/lider/solicitudes.js`
- `answersHtml(s)` — HTML de las respuestas de una solicitud (con etiquetas del formulario).
- `pendingCard(s)` — tarjeta de una solicitud pendiente.
- `wire(card)` — cablea aprobar/rechazar y validación de feedback.
- `init()` — carga pendientes e historial y los renderiza.

### `pages/lider/formularios.html` — Constructor de formularios (22)
**Función:** diseñar formularios dinámicos.
**Qué hace:** lista los existentes y un constructor para crear campos (tipo, obligatorio, opciones).
**Aplica/modifica:** guarda formularios; versiona si ya hay respuestas (RF-24).

### `js/pages/lider/formularios.js`
- `existingList()` — lista de formularios existentes.
- `fieldRow()` — HTML de una fila de campo en el constructor.
- `wireFieldRow(row)` — cablea el tipo de campo (muestra opciones) y el botón quitar.
- `render()` — renderiza el constructor y el aviso de versionado.
- `onSave(e)` — valida y guarda el formulario nuevo.
- `init()` — carga los formularios del club.

### `pages/lider/eventos.html` — Gestión de eventos (23–25)
**Función:** gestionar eventos, su creación/edición y el staff.
**Qué hace:** tabla con métricas inscritos/asistentes; modales para crear/editar (F-13) y asignar staff (F-14).
**Aplica/modifica:** crea/edita eventos y asigna staff por evento (RF-35).

### `js/pages/lider/eventos.js`
- `table()` — tabla de eventos con métricas y acciones.
- `eventFormModal(ev)` — HTML del modal de crear/editar evento.
- `staffModal(ev)` — HTML del modal de asignación de staff.
- `modalShell(title, body)` — envoltorio reutilizable de modal.
- `toLocal(iso)` — convierte ISO a valor de `datetime-local`.
- `openModal(html)` — abre un modal y devuelve helpers de cierre.
- `openEventForm(ev)` — abre y procesa el formulario de evento (con validaciones de fechas).
- `openStaff(ev)` — abre y guarda la asignación de staff.
- `bind()` — cablea los botones de la tabla.
- `reload()` / `init()` — cargan eventos, formularios y miembros, y renderizan.
- `showErr(el, msg)` — muestra un error de validación.

### `pages/lider/nomina-pao.html` — Renovación de nómina por PAO (26)
**Función:** reactivar la nómina al iniciar el nuevo período.
**Qué hace:** tabla de membresías del período anterior con selección múltiple.
**Aplica/modifica:** crea membresías activas en el PAO vigente (RF-21).

### `js/pages/lider/nomina-pao.js`
- `rowFor(m)` — fila (con casilla) de una membresía candidata a renovar.
- `init()` — calcula candidatos, renderiza la tabla y procesa la renovación.

### `pages/lider/rendicion.html` — Rendición de cuentas a GBP (27)
**Función:** enviar reportes y documentos a Bienestar.
**Qué hace:** resumen de nómina/estado de trámites y formulario para enviar PDF.
**Aplica/modifica:** crea un trámite en estado `Submitted` (F-16).

### `js/pages/lider/rendicion.js`
- `tramitesTable(tramites)` — tabla de trámites con su estado.
- `init()` — carga trámites/PAO/miembros, renderiza y procesa el envío de reportes.

---

## 6. Panel de GBP (Web)

### `pages/gbp/catalogo-global.html` — Catálogo global (28)
**Función:** supervisar todos los clubes.
**Qué hace:** tabla con club, líder, miembros y estado; búsqueda.
**Aplica/modifica:** solo lectura; enlaza al detalle/auditoría.

### `js/pages/gbp/catalogo-global.js`
- `row(c)` — fila de un club en la tabla.
- `render(list)` — renderiza el cuerpo de la tabla.
- `init()` — carga el catálogo global y cablea la búsqueda.

### `pages/gbp/alta-club.html` — Alta de club y asignación de líder (29)
**Función:** crear un club y vincular su líder.
**Qué hace:** formulario con datos del club y matrícula del líder.
**Aplica/modifica:** crea el club; `Pending Leader` si la matrícula no tiene cuenta (RF-11/12).

### `js/pages/gbp/alta-club.js`
- `init()` — renderiza el formulario con catálogos y cablea el envío.
- `onSubmit(e)` — valida, crea el club y muestra el resultado (activo o sin líder).

### `pages/gbp/club-detalle.html` — Detalle de club / GBP (30)
**Función:** auditar el club y gestionar el liderazgo.
**Qué hace:** muestra info, líder, documentos y acciones de liderazgo.
**Aplica/modifica:** revoca o asigna/reasigna líder (RF-13).

### `js/pages/gbp/club-detalle.js`
- `render()` — renderiza el detalle del club y cablea revocar/asignar líder.

### `pages/gbp/tramites.html` — Buzón de trámites (31)
**Función:** revisar y resolver la documentación de los clubes.
**Qué hace:** lista trámites con estado, permite abrir PDF (simulado) y exportar.
**Aplica/modifica:** aprueba/rechaza trámites con feedback (RN-5); exporta consolidado CSV.

### `js/pages/gbp/tramites.js`
- `card(t)` — tarjeta de un trámite con sus acciones.
- `wire(el)` — cablea abrir PDF, aprobar y rechazar (con feedback).
- `exportCsv()` — genera y descarga el consolidado en CSV.
- `init()` — carga trámites y clubes y renderiza.

### `pages/gbp/pao.html` — Configuración de PAO (32)
**Función:** administrar los períodos académicos.
**Qué hace:** tabla de períodos y formulario para crear uno nuevo.
**Aplica/modifica:** crea períodos y marca el activo, garantizando uno solo (RF-45).

### `js/pages/gbp/pao.js`
- `table()` — tabla de períodos con su estado.
- `form()` — formulario de nuevo período.
- `bind()` — cablea activar período y crear período (con validaciones).
- `reload()` — recarga los períodos y re-renderiza.

### `pages/gbp/historico.html` — Histórico por PAO (33)
**Función:** consultar la evidencia de períodos anteriores.
**Qué hace:** selector de período y tabla de clubes/líderes/nómina de ese PAO.
**Aplica/modifica:** solo lectura.

### `js/pages/gbp/historico.js`
- `renderTable(pao)` — tabla de clubes, líderes y miembros del período seleccionado.
- `init()` — carga períodos, fija el activo y cablea el selector.

---

*Documento de descripción de páginas y scripts del frontend (Fase 1) de ESPOLCLUB.*
