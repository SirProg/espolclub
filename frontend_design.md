# Diseño del Frontend — ESPOLCLUB (Fase 1)

**Sistema:** ESPOLCLUB — Clubes y Capítulos Estudiantiles
**Etapa:** Fase 1 — Frontend con datos simulados (HTML, CSS + Tailwind CDN, JS nativo, `.json` locales).
**Alcance de este documento:** inventario de pantallas, mapa de navegación, formularios, elementos de visualización de datos, datos simulados y estructura de carpetas.
**Base:** requerimientos aprobados (`requirements.md`). No introduce funcionalidad nueva.

> Criterio rector transversal: **privacidad por contexto** (RF-47/RF-48). La misma entidad se muestra distinta según quién la ve. En Fase 1 toda la persistencia es simulada con `.json` locales (RNF-02) y el login es mock (RF-04).

---

## Índice

1. [Inventario de Pantallas](#1-inventario-de-pantallas)
2. [Mapa de Navegación](#2-mapa-de-navegación)
3. [Formularios](#3-formularios)
4. [Elementos de Visualización de Datos](#4-elementos-de-visualización-de-datos)
5. [Datos Simulados](#5-datos-simulados)
6. [Estructura de Carpetas](#6-estructura-de-carpetas)

---

## 1. Inventario de Pantallas

33 pantallas: 5 compartidas (auth), 11 móviles, 11 del panel del Líder y 6 del panel de GBP. Cada pantalla rastrea a uno o más RF.

### A. Compartidas (autenticación — web y móvil)

| # | Pantalla | Usuario | Objetivo |
| :-- | :--- | :--- | :--- |
| 1 | Inicio de sesión | Todos | Acceso según rol (mock en Fase 1) |
| 2 | Registro de cuenta | Estudiante | Crear cuenta con correo institucional |
| 3 | Verificación de correo | Estudiante | Confirmar la cuenta vía enlace |
| 4 | Recuperación de contraseña | Todos | Restablecer acceso |
| 5 | Centro de notificaciones | Todos | Cambios de estado de solicitudes, reportes, membresías |

### B. Entorno Móvil (Estudiante / Miembro)

| # | Pantalla | Objetivo principal | Acciones |
| :-- | :--- | :--- | :--- |
| 6 | Catálogo de clubes | Descubrir clubes (eje prioritario) | Buscar, filtrar, abrir detalle |
| 7 | Detalle de club | Ver info del club (pública o interna) | Postular, ir a eventos |
| 8 | Formulario de postulación | Enviar solicitud de membresía | Responder y enviar |
| 9 | Eventos disponibles | Mostrar eventos inscribibles | Abrir detalle |
| 10 | Detalle de evento | Ver evento y disponibilidad de registro | Iniciar inscripción |
| 11 | Formulario de inscripción a evento | Registrar participación y generar QR | Responder y confirmar |
| 12 | Credencial QR | Portar la credencial de acceso | Visualizar |
| 13 | Escáner QR (Staff) | Validar y registrar asistencia | Escanear |
| 14 | Perfil del estudiante | Gestionar datos propios | Ver y editar |
| 15 | Historial personal | Consultar postulaciones y asistencias | Consultar, abrir detalle |
| 16 | Bandeja de solicitudes (móvil) | Aprobar solicitudes (conveniencia del Líder) | Aprobar / rechazar |

### C. Entorno Web — Panel del Líder

| # | Pantalla | Objetivo principal | Acciones |
| :-- | :--- | :--- | :--- |
| 17 | Panel del club | Entrada plana a la gestión | Navegar a módulos |
| 18 | Información del club | Mantener datos y documentos | Editar, cargar PDF, definir visibilidad |
| 19 | Gestión de miembros / nómina | Administrar la nómina detallada | Ver, asignar rol, dar de baja |
| 20 | Roles y permisos | Configurar roles del club | Crear roles, asignar permisos |
| 21 | Bandeja de solicitudes | Resolver postulaciones | Aprobar / rechazar con feedback |
| 22 | Constructor de formularios | Diseñar formularios dinámicos | Crear, estructurar, versionar |
| 23 | Gestión de eventos | Histórico y desempeño de eventos | Crear, abrir detalle, asignar Staff |
| 24 | Creación / edición de evento | Definir evento y su registro | Crear / editar |
| 25 | Asignación de Staff | Habilitar escaneo por evento | Asignar / retirar Staff |
| 26 | Renovación de nómina por PAO | Reactivar la nómina del nuevo PAO | Renovar |
| 27 | Rendición de cuentas a GBP | Enviar reportes y documentos | Cargar PDF, enviar reporte |

### D. Entorno Web — Panel de GBP

| # | Pantalla | Objetivo principal | Acciones |
| :-- | :--- | :--- | :--- |
| 28 | Catálogo global de clubes | Supervisar clubes activos | Buscar, abrir detalle, ver histórico |
| 29 | Alta de club y asignación de líder | Crear clubes y vincular líder | Dar de alta |
| 30 | Detalle de club (GBP) | Auditar y gestionar liderazgo | Revocar / asignar líder |
| 31 | Buzón de trámites | Auditar y resolver documentación | Abrir PDF, aprobar/rechazar, exportar |
| 32 | Configuración de PAO | Administrar calendario académico | Crear / editar períodos |
| 33 | Histórico por PAO | Revisar evidencia de semestres pasados | Seleccionar PAO y consultar |

---

## 2. Mapa de Navegación

### Pantalla inicial y enrutamiento

La **pantalla inicial es Inicio de sesión (1)**, único punto de entrada. Actúa como enrutador: según el rol autenticado lleva a uno de tres "hogares". Los flujos de **Registro (2) → Verificación (3)** y **Recuperación (4)** siempre regresan al login.

```
                 Registro (2) → Verificación (3)
                                      │
                                      ▼
   Recuperación (4) ───────────►  Inicio de sesión (1)
                                      │  (enruta por rol)
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
     Catálogo de clubes (6)    Panel del club (17)     Catálogo global (28)
     Móvil (estudiante)        Web (líder)             Web (GBP)
```

### Menú principal por entorno

- **Móvil (Estudiante / Miembro)** — hogar: Catálogo (6): Clubes · Eventos · Mi credencial QR · Perfil · Historial · Notificaciones. *(Staff ve además Escáner QR; Líder ve además su Bandeja móvil.)*
- **Web del Líder** — hogar: Panel del club (17): Información · Miembros · Roles · Solicitudes · Formularios · Eventos · Renovación de nómina · Rendición de cuentas · Notificaciones.
- **Web de GBP** — hogar: Catálogo global (28): Catálogo · Alta de club · Buzón de trámites · Configuración de PAO · Histórico · Notificaciones.

### Relación entre pantallas (navegación interna)

- **Móvil:** Catálogo (6) → Detalle (7) → Postulación (8) · Eventos (9) → Detalle (10) → Inscripción (11) → Credencial QR (12) · Escáner QR (13, solo Staff) · Perfil (14) · Historial (15) · Bandeja móvil (16, solo Líder).
- **Web Líder:** Panel (17) → Información (18) · Miembros (19) ↔ Roles (20) · Solicitudes (21) · Formularios (22) · Eventos (23) → Crear/editar (24) → Staff (25) · Nómina PAO (26) · Rendición (27).
- **Web GBP:** Catálogo global (28) → Alta (29) · Detalle (30) · Buzón (31) · PAO (32) · Histórico (33).

### Flujo básico por rol

- **Estudiante:** Login → Catálogo (6) → Detalle (7) → Postula (8) → notificación (5) → Eventos (9) → Detalle (10) → Inscripción (11) → Credencial QR (12). Edita Perfil (14) y revisa Historial (15).
- **Staff:** Login → Escáner QR (13) → valida asistencias durante el evento.
- **Líder:** Login → Panel (17) → resuelve Solicitudes (21), diseña Formularios (22), crea Eventos (24) y asigna Staff (25), renueva nómina (26), envía Rendición (27).
- **GBP:** Login → Catálogo global (28) → Alta (29), audita en Detalle (30) y Buzón (31), administra PAO (32), consulta Histórico (33).

### Clasificación de pantallas por operación

- **Registran información:** 2, 8, 11, 13, 18, 20, 22, 24, 25, 27, 29, 32.
- **Consultan información:** 5, 6, 7, 9, 10, 12, 15, 16, 19, 21, 23, 28, 30, 31, 33.
- **Editan / cambian estado:** 14, 18, 20, 22, 24, 32 (edición); 16, 21, 25, 26, 30, 31 (cambio de estado / baja lógica).

> No hay eliminación física de datos: se usan cambios de estado y vigencias (`Revoked`, `Frozen`, `Expired`) para preservar la trazabilidad (RF-52, RNF-12).

---

## 3. Formularios

19 formularios. Los de postulación (F-05) e inscripción (F-06) son **dinámicos**: envoltorio fijo + cuerpo de campos construido por el Líder (F-12). Todos los formularios de rechazo comparten la regla de **feedback obligatorio** (RN-5).

### A. Autenticación

| ID | Pantalla | Campos clave | Validaciones cliente |
| :-- | :--- | :--- | :--- |
| F-01 | Login (1) | matrícula/correo, contraseña, selector mock | obligatorios; formato de correo |
| F-02 | Registro (2) | matrícula, nombres, apellidos, fecha nac., correo, facultad, carrera, semestre, contraseña×2 | correo `@espol.edu.ec`; semestre entero+; fecha no futura; contraseñas coinciden |
| F-03 | Recuperación (4) | correo institucional | obligatorio; formato `@espol.edu.ec` |

### B. Entorno móvil

| ID | Pantalla | Campos clave | Validaciones cliente |
| :-- | :--- | :--- | :--- |
| F-04 | Catálogo (6) | búsqueda texto, facultad, área de interés | ninguno obligatorio; selects del catálogo |
| F-05 | Postulación (8) *(dinámico)* | cuerpo dinámico según esquema | `required` del esquema; bloqueo si `Pending` o ya es miembro |
| F-06 | Inscripción evento (11) *(dinámico)* | cuerpo dinámico según esquema | `required`; bloqueo por fecha límite o `MembersOnly` |
| F-07 | Perfil (14) | descripción, habilidades, redes | URLs válidas; longitud máxima |
| F-08 | Bandeja móvil (16) | decisión (aprobar/rechazar), feedback | feedback obligatorio al rechazar |

### C. Panel del Líder

| ID | Pantalla | Campos clave | Validaciones cliente |
| :-- | :--- | :--- | :--- |
| F-09 | Información del club (18) | nombre, acrónimo, descripción, ubicación, áreas, redes, documento PDF + visibilidad | obligatorios; ≥1 área; archivo `.pdf`; URLs válidas |
| F-10 | Roles (20) | nombre del rol, checkboxes de permisos | nombre único; `manage_roles` solo Presidente/delegado |
| F-11 | Solicitudes (21) | decisión, feedback | feedback obligatorio al rechazar |
| F-12 | Constructor de formularios (22) | título, tipo; por campo: etiqueta, tipo, obligatorio, opciones, orden | título y ≥1 campo; tipos de opción exigen ≥2 opciones; aviso de nueva versión si hay respuestas |
| F-13 | Crear/editar evento (24) | nombre, modalidad, fecha, hora, `end_datetime`, lugar, descripción, imagen, visibilidad, fecha límite, mensaje bloqueo, participantes, formulario | fin posterior al inicio; límite ≤ inicio; imagen válida |
| F-14 | Asignación de Staff (25) | miembros (multiselección) | solo miembros activos |
| F-15 | Renovación de nómina (26) | PAO, miembros a mantener | PAO requerido; ≥1 miembro |
| F-16 | Rendición de cuentas (27) | PAO, tipo de documento, archivo PDF | PAO y tipo obligatorios; archivo `.pdf` |

### D. Panel de GBP

| ID | Pantalla | Campos clave | Validaciones cliente |
| :-- | :--- | :--- | :--- |
| F-17 | Alta de club (29) | nombre, acrónimo, descripción, ubicación, áreas, matrícula del líder | obligatorios; ≥1 área; aviso si la matrícula no tiene cuenta (`Pending Leader`) |
| F-18 | Buzón de trámites (31) | decisión, feedback; exportar `.xlsx`/`.pdf` | feedback obligatorio al rechazar |
| F-19 | Configuración de PAO (32) | identificador, fecha inicio, fecha fin | fin posterior al inicio; identificador único |

### Mensajes (patrón general)

- **Error de validación:** mensaje específico junto al campo (ej. "El correo debe ser institucional (@espol.edu.ec)").
- **Bloqueo por regla:** mensaje contextual (ej. "Ya tienes una solicitud pendiente en este club", "El registro está cerrado").
- **Confirmación:** mensaje de éxito tras enviar (ej. "Solicitud enviada. Te notificaremos la respuesta").

---

## 4. Elementos de Visualización de Datos

25 elementos. Criterio de tipo: **tarjetas** para descubrimiento, **tablas** para gestión/auditoría, **paneles** para detalle de una entidad, **listas** para flujos secuenciales.

### A. Entorno móvil

| ID | Pantalla | Tipo | Datos · Sin datos |
| :-- | :--- | :--- | :--- |
| V-01 | Catálogo (6) | Tarjetas | Club + **solo contador** de miembros · "No se encontraron clubes con esos filtros" |
| V-02 | Detalle club / no miembro (7) | Panel | Info + documentos públicos + conteo · "Este club aún no ha publicado información" |
| V-03 | Detalle club / miembro (7) | Lista | Nómina interna + documentos privados · "Aún no hay miembros registrados" |
| V-04 | Eventos disponibles (9) | Tarjetas | Post de evento; etiqueta `MembersOnly` · "No hay eventos disponibles por ahora" |
| V-05 | Detalle de evento (10) | Panel | Evento + estado de registro · muestra mensaje del Líder si está cerrado |
| V-06 | Credencial QR (12) | Tarjeta-credencial | QR + datos del evento · "Aún no tienes credenciales" |
| V-07 | Escáner QR (13) | Panel confirmación | Resultado de validación · estado inicial "Apunta la cámara al QR" |
| V-08 | Historial (15) | Lista (2 secciones) | Postulaciones + asistencias · "Todavía no registras postulaciones ni asistencias" |
| V-09 | Perfil (14) | Sección/panel | Datos solo lectura + editables · siempre existe |

### B. Transversal

| ID | Pantalla | Tipo | Datos · Sin datos |
| :-- | :--- | :--- | :--- |
| V-10 | Notificaciones (5) | Lista | Notificaciones con tipo/fecha/leído · "No tienes notificaciones" |
| V-11 | Bandeja móvil (16) | Lista | Solicitudes `Pending` + respuestas · "No hay solicitudes pendientes" |

### C. Panel del Líder

| ID | Pantalla | Tipo | Datos · Sin datos |
| :-- | :--- | :--- | :--- |
| V-12 | Panel del club (17) | Panel | Estado + accesos · aviso si `Pending Leader` |
| V-13 | Miembros (19) | Tabla | Nómina detallada + rol + vigencia · "Este club aún no tiene miembros" |
| V-14 | Roles (20) | Tabla | 4 predeterminados + personalizados + permisos · siempre existen los 4 |
| V-15 | Solicitudes (21) | Tabla/lista | `Pending` + respuestas dinámicas · "No hay solicitudes pendientes" |
| V-16 | Constructor (22) | Panel/lista | Campos añadidos + versión activa · "Aún no has añadido campos" |
| V-17 | Eventos (23) | Tabla | Eventos + **inscritos vs. asistentes** · "Este club aún no ha creado eventos" |
| V-18 | Staff (25) | Lista | Disponibles vs. asignados · "No hay miembros disponibles para asignar" |
| V-19 | Renovación PAO (26) | Tabla con selección | Nómina congelada + vigencia · "No hay nómina previa para renovar" |
| V-20 | Rendición (27) | Tabla | Nómina consolidada + estado de trámites · "Aún no has enviado reportes a GBP" |

### D. Panel de GBP

| ID | Pantalla | Tipo | Datos · Sin datos |
| :-- | :--- | :--- | :--- |
| V-21 | Catálogo global (28) | Tabla | Clubes + líderes + estado · "No hay clubes registrados" |
| V-22 | Detalle club GBP (30) | Panel | Info + líder actual · aviso si `Pending Leader` |
| V-23 | Buzón de trámites (31) | Tabla/bandeja | PDFs + estado del trámite · "No hay trámites por revisar" |
| V-24 | Configuración PAO (32) | Tabla | Períodos + fechas · "No hay períodos configurados" |
| V-25 | Histórico por PAO (33) | Tabla | Clubes + líderes del período · "No hay información histórica para este período" |

> Dos componentes reutilizables que se derivan de aquí: la **dualidad de privacidad** (detalle público V-02 vs. nómina interna V-03; contador V-01 vs. tabla V-13) como un mismo componente con dos modos de render; y los **estados vacíos** como parte intencional del diseño (en Fase 1 muchas vistas arrancan vacías).

---

## 5. Datos Simulados

12 archivos `.json` locales con referencias cruzadas validadas (mecanismo de la Fase 1, RNF-02). Sirven solo para probar la interfaz antes del backend.

### Credenciales mock (login por rol)

| Rol | `enrollment` | Contraseña | Entorno |
| :--- | :--- | :--- | :--- |
| Estudiante Politécnico | `202311346` | `estudiante123` | Móvil |
| Miembro del Club | `202055789` | `miembro123` | Móvil |
| Líder de Club | `201899001` | `lider123` | Web / Móvil |
| Administrador GBP | `GBP-001` | `gbp123` | Web |

### Catálogos

- **Facultades** (provisional, PPD-01): FIEC, FCNM, FIMCP, FICT, FCSH, FCV, FADCOM.
- **Áreas de interés** (catálogo cerrado): Tecnología, Ciencia, Cultura, Deporte, Emprendimiento, Social, Arte, Académico.
- **PAO:** `2025-II` (cerrado) y `2026-I` (activo).

### Archivos y cobertura de prueba

| Archivo | Contenido | Permite probar |
| :--- | :--- | :--- |
| `usuarios.json` | Credenciales mock + 6 perfiles | Login, perfil, historial |
| `clubes.json` | KOKOA (activo) y RoboESPOL (`Pending Leader`) | Catálogo, detalle, estado pendiente |
| `roles.json` | 4 predeterminados + 1 personalizado (KOKOA) | Tabla de roles y permisos |
| `membresias.json` | 3 activas (2026-I) + 1 `Frozen` (2025-II) | Nómina, renovación por PAO |
| `formularios.json` | Esquema de membresía y de evento | Formularios dinámicos, constructor |
| `solicitudes.json` | 1 `Pending` + 1 `Rejected` con feedback | Bandeja del líder, historial, reaplicación |
| `eventos.json` | 1 `Public` (con métricas) + 1 `MembersOnly` | Catálogo de eventos, bloqueo de registro |
| `inscripciones.json` | 1 `Active`/`Registered` + 1 `Used`/`Attended` | Credencial QR, métrica inscritos/asistentes |
| `asistencias.json` | 1 asistencia validada por Staff | Escaneo, no duplicado (RN-6) |
| `tramites_gbp.json` | 1 `Under Review` + 1 `Approved` (histórico) | Buzón de trámites, histórico |
| `notificaciones.json` | Mensajes para estudiante y líder | Centro de notificaciones |
| `catalogos.json` | Facultades, áreas, PAO | Selects y filtros |

> Coherencia deliberada: Kevin (`202311346`) no es miembro de KOKOA y tiene una postulación rechazada, lo que permite probar la reaplicación (RF-29) sin chocar con la regla anti-spam. Los `qr_token` son cadenas mock legibles; el token opaco real se genera en el servidor (Fase 2).

---

## 6. Estructura de Carpetas

Estructura plana, sin build, adecuada para un proyecto académico de una persona. Mantiene separados los tres entornos y una sola fuente de datos.

```

espolclub/
│
├── index.html                  → Punto de entrada: pantalla de Inicio de sesión (1)
├── README.md                   → Documentación del proyecto e instrucciones de ejecución
│
├── assets/                     → Recursos estáticos (no cambian en ejecución)
│   ├── img/                    → Imágenes: logos, marketing de eventos, placeholders
│   │   ├── clubes/             → Logos/portadas de clubes (referenciados por club.image)
│   │   └── events/             → Imágenes de marketing de eventos
│   └── icons/                  → Íconos de la interfaz
│
├── css/                        → Estilos
│   └── themes.css              → Paleta de colores y soporte de tema claro/oscuro (variables CSS); Tailwind se carga por CDN en el HTML
│
├── data/                       → Datos simulados (los .json locales que ya generamos)
│   ├── usuarios.json
│   ├── clubes.json
│   ├── roles.json
│   ├── membresias.json
│   ├── formularios.json
│   ├── solicitudes.json
│   ├── eventos.json
│   ├── inscripciones.json
│   ├── asistencias.json
│   ├── tramites_gbp.json
│   ├── notificaciones.json
│   └── catalogos.json
│
├── js/                         → Lógica del cliente (JavaScript nativo, ES6+)
│   ├── theme-init.js           → Aplica el tema antes del primer pintado (anti-FOUC; script clásico en <head>)
│   ├── app.js                  → Arranque común, navegación, tema y centro de notificaciones (5)
│   ├── data-service.js         → Carga los .json con fetch + capa de escritura simulada (overlay)
│   ├── auth.js                 → Login mock y enrutamiento por rol
│   ├── utils.js                → Helpers de presentación (traducción de enums, fechas, escape)
│   ├── components/             → Piezas de UI reutilizables
│   │   ├── card-club.js        → Tarjeta de club (catálogo)
│   │   ├── data-table.js       → Tabla genérica (nóminas, eventos, trámites)
│   │   ├── dynamic-form.js     → Render de formularios dinámicos (postulación/evento)
│   │   ├── feedback-modal.js   → Modal de rechazo con feedback obligatorio (RN-5)
│   │   └── notifications.js    → Centro de notificaciones
│   └── pages/                  → Lógica específica de cada pantalla (un .js por HTML)
│       ├── auth/              → login, registro, verificacion, recuperacion
│       ├── movil/              → Entorno del estudiante/miembro
│       ├── lider/              → Panel web del líder
│       └── gbp/                → Panel web de GBP
│
└── pages/                      → Vistas HTML, agrupadas por entorno
    ├── auth/
    │   ├── registro.html       → Registro de cuenta (2)
    │   ├── verificacion.html   → Verificación de correo (3)
    │   └── recuperacion.html   → Recuperación de contraseña (4)
    ├── movil/
    │   ├── catalogo.html       → Catálogo de clubes (6)
    │   ├── club-detalle.html   → Detalle de club (7)
    │   ├── eventos.html        → Eventos disponibles (9) y detalle (10)
    │   ├── credencial-qr.html  → Credencial QR (12)
    │   ├── escaner-qr.html     → Escáner QR del Staff (13)
    │   ├── perfil.html         → Perfil e historial (14, 15)
    │   └── solicitudes.html    → Bandeja de solicitudes móvil del líder (16)
    ├── lider/
    │   ├── panel.html          → Panel del club (17)
    │   ├── club.html           → Información del club (18)
    │   ├── miembros.html       → Gestión de miembros / nómina (19)
    │   ├── roles.html          → Roles y permisos (20)
    │   ├── solicitudes.html    → Bandeja de solicitudes (21)
    │   ├── formularios.html    → Constructor de formularios (22)
    │   ├── eventos.html        → Gestión y creación de eventos (23, 24, 25)
    │   ├── nomina-pao.html     → Renovación de nómina por PAO (26)
    │   └── rendicion.html      → Rendición de cuentas a GBP (27)
    └── gbp/
        ├── catalogo-global.html → Catálogo global de clubes (28)
        ├── alta-club.html       → Alta de club y asignación de líder (29)
        ├── club-detalle.html    → Detalle de club GBP (30)
        ├── tramites.html        → Buzón de trámites (31)
        ├── pao.html             → Configuración de PAO (32)
        └── historico.html       → Histórico por PAO (33)

```

### Para qué sirve cada parte

- **`index.html`** en la raíz para que el servidor estático lo sirva por defecto.
- **`assets/`** guarda lo estático (imágenes e íconos).
- **`css/`** centraliza estilos; Tailwind entra por CDN, así que `themes.css` solo contiene la paleta de colores y el soporte de tema claro/oscuro mediante variables CSS.
- **`data/`** es la fuente única de datos simulados (los 12 `.json`), compartida por los tres entornos.
- **`js/data-service.js`** es la pieza clave: el único módulo que accede a los datos. En la Fase 2 **solo se cambia este archivo** para apuntar a la API, sin tocar las pantallas.
- **`js/auth.js`** maneja el login mock y el enrutamiento por rol.
- **El centro de notificaciones (pantalla 5)** se implementa como una campana en la cabecera compartida (`app.js`), disponible en todos los entornos sin una página propia.
- **`js/components/`** son las piezas repetidas (tarjeta, tabla, formulario dinámico, modal de rechazo, notificaciones), construidas una sola vez.
- **`js/pages/`** y **`pages/`** agrupan lógica y vistas por entorno, espejando la frontera de acceso del sistema.

### Reglas de criterio

- **Una sola fuente de datos + un solo punto de acceso** (`data/` + `data-service.js`): es lo que abarata la transición al backend en la Fase 2.
- Si el proyecto resulta pequeño, se puede **aplanar** `js/pages/` y poner la lógica en `<script>` dentro de cada HTML; si crece, la estructura ya escala sin reorganizar.

---

*Documento de diseño del frontend de la Fase 1. Consolidado a partir de los pasos 2.1 a 2.6 del análisis y diseño de ESPOLCLUB.*
