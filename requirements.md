# Documento de Requerimientos — ESPOLCLUB

**Sistema:** ESPOLCLUB — Clubes y Capítulos Estudiantiles
**Contexto:** Materia de Desarrollo Web (ESPOL)
**Autor:** Kevin Maldonado Paredes
**Estado de la etapa:** Análisis y levantamiento de requerimientos **APROBADO** para pasar al diseño del frontend.
**Stack definido:** Frontend (HTML/CSS+Tailwind CDN/JS) → Backend **FastAPI** + BD relacional (PostgreSQL/MySQL) → APIs REST → App móvil **React Native**.

> Convención de idioma: las enumeraciones y valores que viajan a la base de datos se escriben en **inglés** (`Pending`, `Active`...); la capa de presentación los traduce al **español** para el usuario final.

---

## Índice

1. [Visión General del Problema](#1-visión-general-del-problema)
2. [Usuarios del Sistema](#2-usuarios-del-sistema)
3. [Procesos Principales del Negocio](#3-procesos-principales-del-negocio)
4. [Datos Principales](#4-datos-principales)
5. [Reglas de Negocio](#5-reglas-de-negocio)
6. [Decisiones Definitivas del Análisis](#6-decisiones-definitivas-del-análisis)
7. [Requerimientos Funcionales](#7-requerimientos-funcionales)
8. [Requerimientos No Funcionales](#8-requerimientos-no-funcionales)
9. [Clasificación de Requerimientos por Fase](#9-clasificación-de-requerimientos-por-fase)
10. [Preguntas Pendientes de Definición](#10-preguntas-pendientes-de-definición)
11. [Estado de Validación de la Etapa](#11-estado-de-validación-de-la-etapa)

---

## 1. Visión General del Problema

ESPOLCLUB ataca la **fragmentación de información y de procesos** alrededor de los clubes y capítulos estudiantiles de ESPOL. Convierte un ecosistema informal y disperso en un **canal oficial, centralizado y trazable** que conecta a tres mundos que hoy se comunican mal: la comunidad estudiantil, las directivas de los clubes y la Gerencia de Bienestar Politécnico (GBP).

El problema se manifiesta en tres síntomas:

- **Brecha de descubrimiento:** no existe un repositorio oficial y centralizado de clubes; el estudiante depende de redes sociales externas o de eventos presenciales puntuales (como la Novatada), lo que aísla a quien no usa esas plataformas.
- **Desconexión operativa:** la inscripción a clubes, el registro a eventos y el control de asistencia se llevan de forma manual y dispersa, perdiendo la trazabilidad de la participación estudiantil histórica.
- **Burocracia analógica con GBP:** la rendición de cuentas entre los líderes y la institución (nóminas, estatutos, reportes por PAO) carece de una vía estandarizada, ágil y auditable.

**Prioridad de la primera versión:** el **descubrimiento**. Si los estudiantes no encuentran los clubes, lo demás no importa.

**Núcleo irrenunciable del sistema:** que un estudiante pueda descubrir un club que no conocía y postular, y que ese club pueda demostrarle a GBP quiénes son sus miembros activos.

---

## 2. Usuarios del Sistema

El sistema es cerrado a la comunidad ESPOL, con cuatro perfiles diferenciados por qué pueden ver y qué pueden hacer:

| Perfil | Entorno | Naturaleza |
| :--- | :--- | :--- |
| **Estudiante Politécnico** | App Móvil | Comunidad — descubre, postula, se inscribe |
| **Miembro del Club** | App Móvil | Comunidad — estudiante aceptado; puede ser Staff temporal |
| **Líder de Club** | Web / Móvil | Comunidad — directiva con poder administrativo sobre **un único** club |
| **Administrador GBP** | Panel Web | Institución — audita y valida; no edita el interior de los clubes |

**Reglas de pertenencia y rol confirmadas:**
- Un estudiante puede ser **miembro de varios clubes** simultáneamente.
- Un estudiante puede ser **líder de un club mientras es miembro de otro**, pero **líder de uno solo**.
- En GBP puede haber **varios administradores**, todos con el **mismo poder** (sin jerarquías internas en esta versión).
- La cuenta del estudiante **la crea él mismo** al registrarse con su correo institucional.
- Al graduarse o dejar ESPOL, la cuenta y sus membresías **caducan al cerrar el PAO** y no se renuevan; no se borran (quedan como histórico).

> Quedan **fuera de alcance** otros actores como tutores docentes o coordinadores de facultad.

---

## 3. Procesos Principales del Negocio

Los cuatro flujos son el corazón del sistema y se modelan como **máquinas de estado**.

### A. Ciclo de Creación de Comunidades (GBP → Líder)
Un club **nunca nace por iniciativa del estudiante**: siempre lo origina GBP, que lo da de alta y vincula la matrícula de un estudiante, quien asciende a Líder.

### B. Ciclo de Membresía (Estudiante → Líder)
El Líder diseña un formulario dinámico → el estudiante postula desde la app → la solicitud queda `Pending` → el Líder aprueba (lo convierte en Miembro) o rechaza con justificación obligatoria.

### C. Gestión de Eventos y Asistencia (Flujo QR)
El Líder crea el evento y su formulario → el estudiante se inscribe y recibe una credencial QR (token opaco firmado) → durante el evento el Staff escanea para registrar asistencia real, sin duplicados.

### D. Rendición de Cuentas (Líder → GBP)
El sistema consolida la nómina por PAO → el Líder carga documentos (PDF) y envía reportes → GBP revisa y emite resolución (`Approved`/`Rejected` con feedback obligatorio).

### Máquinas de estado

- **Solicitud de membresía (`MembershipApplication`):** `Pending` → `Approved` | `Rejected`.
- **Membresía (`Membership`):** `Active` → `Frozen` → `Expired` | `Revoked`.
- **Trámite GBP (`GbpDocumentProcess`):** `Submitted` → `Under Review` → `Approved` | `Rejected`.
- **Credencial QR (`EventRegistration`):** `attendance_status`: `Registered` → `Attended` | `NoShow`; `qr_status`: `Active` → `Used` | `Expired`.

---

## 4. Datos Principales

A nivel conceptual, el sistema captura cinco familias de información; el criterio rector es guardar **evidencia trazable** (quién hizo qué, cuándo y con qué resultado).

1. **Identidad y perfil del estudiante** — matrícula (`enrollment`, identificador único), nombres, `birth_date` (la edad se deriva), correo institucional, facultad, carrera, semestre. Opcionales: descripción, habilidades, redes sociales.
2. **Estructura organizativa** — clubes (nombre, acrónimo, descripción, ubicación, líder, documentos, `interest_areas`, `image` de portada), roles internos y sus permisos.
3. **Pertenencia y vigencia** — membresías con `role_id`, `pao_period`, `valid_from`, `valid_until` y estado.
4. **Actividad transaccional** — definiciones de formularios, solicitudes y respuestas, eventos, inscripciones, credenciales QR y asistencias.
5. **Documentación y auditoría** — estatutos y nóminas (PDF), reportes a GBP con su estado y retroalimentación.

**Entidades del modelo de datos (definidas en el README):** `Estudiante`, `Rol`, `Membership`, `Club`, `Form`, `MembershipApplication`, `Evento`, `EventRegistration`, `EventAttendance`, `GbpDocumentProcess`.

**Formatos de archivo permitidos:** `.xlsx` (datos tabulares) y `.pdf` (texto). Sin soporte para `.doc`/`.docx`.

**Privacidad por contexto (regla transversal):** el mismo dato (nómina de miembros) es confidencial en la app pública (solo se muestra el contador numérico) y visible en el panel interno del club y para GBP.

---

## 5. Reglas de Negocio

- **RN-1 — Exclusividad de liderazgo:** un Líder administra **un solo club**. Si deja el cargo, GBP revoca su acceso y asigna un nuevo líder.
- **RN-2 — Restricción de postulación activa:** un estudiante no puede tener dos solicitudes `Pending` al mismo club, ni postular a uno donde ya es Miembro. Una solicitud rechazada puede reenviarse **inmediatamente**.
- **RN-3 — Visualización por privacidad:** los no-miembros solo ven métricas agregadas (ej. "45 miembros"); la nómina detallada es exclusiva de los miembros internos y de GBP.
- **RN-4 — Caducidad por PAO:** las membresías se **congelan automáticamente** al alcanzar la `end_date` del PAO; el Líder debe **renovar manualmente** la nómina al inicio del nuevo PAO.
- **RN-5 — Feedback de rechazo obligatorio:** rechazar una solicitud o un reporte **exige** un campo de justificación.
- **RN-6 — No reescaneo de QR:** un mismo QR no puede registrar asistencia dos veces; se garantiza con unicidad `(event_id, student_id)` y el cambio de `qr_status` a `Used`.
- **RN-7 — Otorgamiento de permisos:** solo roles con `is_leadership: true` pueden asignar roles/permisos; `manage_roles` queda restringido al **Presidente/a**, salvo delegación explícita.

---

## 6. Decisiones Definitivas del Análisis

Resoluciones a los puntos que estuvieron faltantes, ambiguos o conflictivos:

- **Autenticación:** registro/login con correo `@espol.edu.ec` validado por enlace de verificación; contraseña propia con recuperación por correo. Fase 1 simulada con mocks; Fase 2 con JWT.
- **Rol base de Miembro:** cuarto rol predeterminado (`is_default: true`, `is_leadership: false`), sin permisos administrativos, asignado por defecto al aprobar una solicitud.
- **Áreas de interés:** campo `interest_areas` con catálogo cerrado — Tecnología, Ciencia, Cultura, Deporte, Emprendimiento, Social, Arte, Académico.
- **Calendario de PAO:** GBP administra `pao_period`, `start_date`, `end_date`. Congelamiento **automático** al alcanzar `end_date`; renovación **manual** del Líder.
- **Líder sin cuenta:** GBP vincula por matrícula; el club queda en `Pending Leader` y el rol Presidente se activa cuando esa matrícula completa su registro.
- **Notificaciones:** centro de notificaciones **in-app obligatorio** en web y móvil; push opcional.
- **Staff:** **asignación por evento** (ya no permiso de rol permanente); el escaneo es válido solo durante ese evento.
- **Eventos exclusivos:** `visibility` = `Public` | `MembersOnly`; los `MembersOnly` son **visibles** para no-miembros pero con el formulario de inscripción **bloqueado**.
- **Cupo de evento:** **sin tope**; `expected_participants` es solo dato de planificación.
- **Multi-rol en un club:** una membresía admite **un solo `role_id`** por club.
- **Versionado de formularios:** inmutables una vez tienen respuestas; editar genera una nueva versión y conserva las respuestas en su versión original.
- **Expiración del QR:** el evento incorpora `end_datetime`; el `qr_token` pasa a `Expired` automáticamente al alcanzarlo.

---

## 7. Requerimientos Funcionales

### Autenticación y cuentas
- **RF-01:** Permitir el registro únicamente con correo institucional `@espol.edu.ec`, validado mediante enlace de verificación.
- **RF-02:** Permitir el inicio de sesión mediante contraseña propia del sistema.
- **RF-03:** Ofrecer recuperación de contraseña por correo.
- **RF-04:** En la Fase 1, simular el inicio de sesión con cuatro usuarios mock, uno por rol.
- **RF-05:** Impedir el registro de dos cuentas con la misma matrícula (`enrollment`).

### Roles y permisos
- **RF-06:** Crear automáticamente, en cada club, cuatro roles predeterminados: Presidente/a, Vicepresidente/a, Secretario/a y Miembro.
- **RF-07:** Permitir al Líder crear roles personalizados y asignarles permisos granulares.
- **RF-08:** Asignar el rol Miembro por defecto al crear una membresía tras aprobar una solicitud.
- **RF-09:** Permitir un único `role_id` por membresía dentro de un mismo club.
- **RF-10:** Permitir asignar roles/permisos solo a roles con `is_leadership: true`, restringiendo `manage_roles` al Presidente/a salvo delegación explícita.

### Ciclo de vida del club
- **RF-11:** Permitir que únicamente GBP dé de alta un club y asigne un líder vinculando una matrícula.
- **RF-12:** Dejar el club en `Pending Leader` cuando la matrícula asignada no tiene cuenta, y activar el Presidente/a automáticamente al completarse el registro.
- **RF-13:** Al revocar a un líder, pasar su membresía directiva a `Revoked`, poner el club en `Pending Leader` y mantenerlo en solo lectura hasta nueva asignación.
- **RF-14:** Exigir, para registrar un club, nombre, acrónimo, descripción, ubicación, líder asignado y documentos formales.
- **RF-15:** Capturar en el club el campo `interest_areas` a partir de un catálogo cerrado.
- **RF-16:** Permitir al Líder definir cada documento del club como público o privado.

### Membresías y vigencia
- **RF-17:** Permitir que un estudiante sea miembro de varios clubes simultáneamente, pero líder de uno solo.
- **RF-18:** Registrar en cada membresía su `pao_period`, `valid_from` y `valid_until`.
- **RF-19:** Gestionar los estados de membresía: `Active`, `Frozen`, `Expired`, `Revoked`.
- **RF-20:** Congelar automáticamente las membresías vigentes al alcanzar la `end_date` del PAO.
- **RF-21:** Permitir la renovación manual de la nómina por parte del Líder al inicio del nuevo PAO.

### Formularios dinámicos
- **RF-22:** Permitir al Líder construir, desde la web, formularios dinámicos de membresía y de evento.
- **RF-23:** Permitir que la app móvil renderice y envíe respuestas de dichos formularios, actuando solo como cliente.
- **RF-24:** Tratar como inmutable un formulario con respuestas, generando una nueva versión al editarlo y conservando las respuestas en su versión original.

### Solicitudes de membresía
- **RF-25:** Permitir al estudiante postular a un club desde la app móvil llenando el formulario dinámico.
- **RF-26:** Enrutar la solicitud al panel web del Líder en estado `Pending`.
- **RF-27:** Permitir al Líder aprobar o rechazar la solicitud, exigiendo retroalimentación obligatoria en el rechazo.
- **RF-28:** Impedir más de una solicitud `Pending` al mismo club o postular donde ya es miembro.
- **RF-29:** Permitir reenviar inmediatamente una solicitud rechazada, sin tiempo de espera.

### Eventos y asistencia (QR)
- **RF-30:** Permitir al Líder crear un evento con sus datos de planificación, su `end_datetime` y la fecha límite de registro.
- **RF-31:** Manejar la `visibility` del evento (`Public`/`MembersOnly`); los `MembersOnly` son visibles pero con formulario bloqueado para no-miembros.
- **RF-32:** Permitir al estudiante inscribirse a un evento desde la app móvil, generando una inscripción y un `qr_token` opaco firmado.
- **RF-33:** Permitir inscripciones sin tope; `expected_participants` es solo planificación.
- **RF-34:** Bloquear el registro al exceder la fecha límite, mostrando el mensaje personalizado del Líder.
- **RF-35:** Permitir al Líder asignar miembros como Staff de un evento específico, habilitando el escaneo solo durante ese evento.
- **RF-36:** Registrar la asistencia validando el `qr_token` contra la BD e impedir duplicados por reescaneo mediante unicidad `(evento, estudiante)`.
- **RF-37:** Marcar el `qr_token` como `Expired` automáticamente al alcanzar el `end_datetime`.
- **RF-38:** Calcular y mostrar la métrica de inscritos vs. asistentes reales por evento.

### Rendición de cuentas (GBP)
- **RF-39:** Consolidar la nómina de miembros activos por PAO.
- **RF-40:** Permitir al Líder cargar documentos en PDF y enviar los reportes generados.
- **RF-41:** Congelar el reporte enviado, bloqueándolo para edición mientras está en revisión.
- **RF-42:** Permitir a GBP visualizar los datos estructurados y exportarlos en `.xlsx` y `.pdf`.
- **RF-43:** Permitir a GBP emitir una resolución `Approved`/`Rejected`, exigiendo feedback en el rechazo y reabriendo el trámite.
- **RF-44:** Gestionar los estados del trámite: `Submitted`, `Under Review`, `Approved`, `Rejected`.

### Configuración de PAO
- **RF-45:** Permitir a GBP administrar la configuración del PAO (`pao_period`, `start_date`, `end_date`).

### Consulta y visibilidad
- **RF-46:** Ofrecer un catálogo de clubes filtrable por texto (nombre/acrónimo), facultad y área de interés.
- **RF-47:** Mostrar a no-miembros únicamente el contador numérico de miembros, ocultando identidades.
- **RF-48:** Mostrar la nómina detallada solo a miembros internos del club y a GBP.
- **RF-49:** Permitir consultar información histórica por PAO (clubes y líderes de semestres anteriores).
- **RF-50:** Permitir al estudiante visualizar/editar sus datos y consultar su historial de postulaciones y asistencias.

### Notificaciones y trazabilidad
- **RF-51:** Contar con un centro de notificaciones in-app, en web y móvil, para cambios de estado de solicitudes, reportes y membresías.
- **RF-52:** Registrar como auditables las acciones del Líder (quién aprobó/rechazó y cuándo).

### Distribución de acciones web/móvil
- **RF-53:** Permitir exclusivamente desde la web la construcción de formularios, la gestión de miembros/roles y el envío de documentación a GBP.
- **RF-54:** Permitir al Administrador GBP operar únicamente desde la web.
- **RF-55:** Permitir al estudiante, desde la app móvil, explorar el catálogo, postular, inscribirse a eventos, ver su QR y consultar su historial.
- **RF-56:** Permitir al Staff escanear códigos QR desde la app móvil.
- **RF-57:** Permitir al Líder aprobar solicitudes desde la app móvil como conveniencia.

---

## 8. Requerimientos No Funcionales

- **RNF-01:** Operar en dos entornos: panel web administrativo y aplicación móvil para estudiantes.
- **RNF-02:** En la Fase 1, el frontend debe funcionar con datos simulados (`.json` locales), sin build, usando Tailwind CSS vía CDN.
- **RNF-03:** Desarrollarse progresivamente en cuatro fases: (1) frontend, (2) backend con FastAPI y BD relacional, (3) APIs REST, (4) app móvil en React Native.
- **RNF-04:** Implementar autenticación y autorización mediante JWT a partir de la Fase 2.
- **RNF-05:** El código QR debe basarse en un token opaco firmado por el servidor, verificable solo contra la BD.
- **RNF-06:** Proteger la privacidad de los datos personales de los miembros, con información diferenciada entre móvil (oculta identidades) y web (las expone a roles autorizados).
- **RNF-07:** El panel web debe ser plano (tablas, formularios, botones), sin dashboards analíticos, gráficos dinámicos ni animaciones avanzadas.
- **RNF-08:** Limitar la documentación a `.xlsx` (datos tabulares) y `.pdf` (texto), sin `.doc`/`.docx`.
- **RNF-09:** No integrarse con el SAAC ni otros sistemas centrales de ESPOL; la verificación se apoya en el correo institucional y los datos declarados.
- **RNF-10:** Usar enumeraciones en inglés a nivel de BD y su traducción al español en la presentación.
- **RNF-11:** La app móvil debe requerir acceso a la cámara para el escaneo de QR; no exige modo totalmente offline.
- **RNF-12:** Los registros de asistencia deben ser inmutables al momento del escaneo.
- **RNF-13:** El proyecto se distribuye bajo Licencia MIT.

---

## 9. Clasificación de Requerimientos por Fase

> Muchos requerimientos son **transversales**: se prototipan con mocks en F1, se implementan en F2, se exponen en F3 y se reconstruyen nativamente en F4.

### Exclusivos de cada fase

| Fase | Requerimientos exclusivos |
| :--- | :--- |
| **F1 — Frontend** | RF-04, RNF-02, RNF-07 |
| **F2 — Backend y BD** | RF-05, RF-06, RF-08, RF-09, RF-12, RF-13, RF-17, RF-18, RF-19, RF-20, RF-24, RF-28, RF-29, RF-33, RF-37, RF-39, RF-41, RF-44, RF-52, RNF-05, RNF-09, RNF-12 |
| **F3 — APIs** | *(ninguno propio; expone la lógica de F2 hacia F1 y F4)* |
| **F4 — App Móvil** | RNF-11 |

### Transversales (resumen)

| Requerimiento | Fases | Motivo |
| :--- | :--- | :--- |
| RF-01, RF-02, RF-03 | F1+F2+F3+F4 | UI simulada (F1), lógica real (F2), servicio (F3), registro/login nativo (F4) |
| RF-07, RF-10, RF-11, RF-14, RF-15 | F1+F2 | Acción en web + lógica/persistencia en backend |
| RF-16 | F1+F2+F3+F4 | Toggle público/privado operado, persistido, respetado por API y mostrado en móvil |
| RF-21, RF-45 | F1+F2 | Iniciado en web por el actor + procesado en backend |
| RF-22 | F1+F2 | Constructor en web + persistencia del esquema |
| RF-23 | F2+F3+F4 (+F1 simulador) | Móvil renderiza/envía consumiendo API sobre lógica de backend |
| RF-25, RF-32, RF-50 | F1+F2+F3+F4 | Acción del estudiante en todo el recorrido |
| RF-26, RF-30, RF-38, RF-40, RF-42, RF-43 | F1+F2 | Mostrado/operado en web + lógica en backend |
| RF-27 | F1+F2+F4 | Aprobar/rechazar en web y conveniencia móvil + lógica backend |
| RF-31, RF-46, RF-47, RF-48, RF-51 | F1+F2+F3+F4 | Regla/contrato en backend y API, reflejado en ambos frontends |
| RF-34, RF-35 | F1+F2+F4 | Regla en backend mostrada/operada en web y móvil |
| RF-36, RF-56, RF-57 | F2+F3+F4 | Escaneo/acción móvil que valida por API contra backend |
| RF-49 | F1+F2+F3 | Histórico almacenado, consultado por API y mostrado |
| RF-53, RF-54 | F1+F2 | Acción en frontend web + autorización de backend |
| RF-55 | F1+F4 | Prototipo en simulador móvil + construcción nativa |
| RNF-01 | F1+F4 | Los dos entornos se materializan en sus frontends |
| RNF-04 | F2+F3 | JWT implementado en backend y protege rutas |
| RNF-06 | F1+F2+F3+F4 | Privacidad diferenciada como regla, contrato y presentación |
| RNF-08 | F1+F2 | Restricción en carga/visualización web y generación backend |
| RNF-10 | F1+F2+F4 | Enums en datos y traducción en presentación |
| RNF-03, RNF-13 | F1+F2+F3+F4 | Gobiernan todo el proyecto (proceso y licencia) |

**Cobertura:** 57 RF + 13 RNF. Dato clave de planificación: **la Fase 3 no tiene requerimientos propios**; el peso de la lógica vive en el backend (Fase 2).

---

## 10. Preguntas Pendientes de Definición

Ninguna bloquea el diseño del frontend de la Fase 1; conviene resolverlas antes de cerrar la Fase 2.

- **PPD-01:** No se ha especificado la **lista completa de facultades** de ESPOL sobre la que opera el filtro del catálogo (solo se citan FIEC y FCNM como ejemplos). *Único punto con efecto visible en el frontend; puede arrancar con un catálogo provisional ampliable.*
- **PPD-02:** No se ha definido el **mecanismo de provisión de las cuentas de Administrador GBP** (tema de Fase 2; en Fase 1 se usa el usuario mock).
- **PPD-03:** No se ha definido el **comportamiento del escaneo de QR ante un fallo puntual de conexión** durante el evento (modo degradado; propio de la Fase 4).

---

## 11. Estado de Validación de la Etapa

| Criterio | Estado |
| :--- | :--- |
| Problema claramente definido | ✅ |
| Usuarios identificados | ✅ |
| Procesos principales claros | ✅ |
| Datos principales definidos | ✅ |
| Reglas de negocio claras | ✅ |
| Requerimientos verificables | ✅ |
| Información suficiente para diseñar pantallas, formularios y navegación | ✅ (con PPD-01 como catálogo provisional) |

**Veredicto:** **Aprobado para pasar al diseño del frontend.**
