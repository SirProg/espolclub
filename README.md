# ESPOLCLUB - Clubes y Capítulos Estudiantiles

### Stack Tecnológico

**Fase actual (Frontend Web):**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**Próximas fases (Backend, API y Móvil):**

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)

## Índice

1. [Visión General](#1-visión-general-del-proyecto)<br>
    1.1 [Introducción y Propósito](#11-introducción-y-propósito)<br>
    1.2 [El problema](#12-el-problema)<br>
    1.3 [La solución](#13-la-solución)
2. [Modelado del negocio](#2-modelado-del-negocio-y-actores)<br> 
    2.1 [Usuarios](#21-usuarios)<br>
    2.2 [Roles y Permisos](#22-roles-y-permisos)<br>
    2.3 [Procesos principales](#23-procesos-principales)
3. [Reglas y Fronteras](#3-reglas-y-fronteras-del-sistema)<br>
    3.1 [Operaciones Permitidas](#31-operaciones-permitidas-flujos-de-control)<br>
    3.2 [Reglas de Negocio](#32-reglas-de-negocio-lógica-del-sistema)<br>
    3.3 [Restricciones y Limitantes](#33-restricciones-y-limitantes-del-proyecto)
4. [Requerimientos](#4-requerimientos-de-información)<br>
    4.1 [Información de Registro](#41-información-de-registro)<br>
    4.2 [Información de Consulta](#42-información-de-consulta)<br>
    4.3 [Persistencia Futura](#43-persistencia-futura)<br>
    4.4 [Usuarios Mock (Autenticación Simulada)](#44-usuarios-mock-autenticación-simulada---fase-1)
5. [Roadmap de desarrollo](#5-roadmap-de-desarrollo-por-fases)<br>
    5.1 [Fase 1 - Frontend Web](#51-fase-1-frontend-web--prototipado-de-datos-local-html-csstailwindbootstrap-js-ajax)<br>
    5.2 [Fase 2 - Backend y Persistencia](#52-fase-2-backend-lógica-de-negocio-y-persistencia-fastapi--postgresqlmysql)<br>
    5.3 [Fase 3 - Capa de Integración](#53-fase-3-capa-de-integración-y-construcción-de-apis-restful)<br>
    5.4 [Fase 4 - Aplicación Móvil](#54-fase-4-aplicación-móvil-nativa-react-native)
6. [Instalación y Ejecución](#6-instalación-y-ejecución)
7. [Glosario](#7-glosario)
8. [Equipo y Autor](#8-equipo-y-autor)
9. [Licencia](#9-licencia)

📚 [Documentación del Proyecto](#-documentación-del-proyecto) — análisis, diseño y descripción de archivos

## 📚 Documentación del Proyecto

Este repositorio se acompaña de documentos especializados que detallan cada etapa del desarrollo. El `README.md` es el punto de entrada general; los siguientes documentos profundizan en el análisis, el diseño y la implementación:

| Documento | Contenido | Cuándo consultarlo |
| :--- | :--- | :--- |
| **[README.md](README.md)** | Visión general, modelo de negocio, reglas, modelos de datos, roadmap, instalación y glosario. | Para entender **qué es** el proyecto y cómo ejecutarlo. |
| **[requirements.md](requirements.md)** | Documento de requerimientos: problema, usuarios, procesos, reglas de negocio, **57 requerimientos funcionales (RF) y 13 no funcionales (RNF)** y su clasificación por fase. | Para saber **qué debe hacer** el sistema y verificar el alcance. |
| **[frontend_design.md](frontend_design.md)** | Diseño del frontend (Fase 1): inventario de **33 pantallas**, mapa de navegación, formularios, elementos de visualización, datos simulados y **estructura de carpetas**. | Para entender **cómo está estructurada** la interfaz y la navegación. |
| **[pages_description.md](pages_description.md)** | Descripción archivo por archivo de cada **HTML y JS**: su función, qué aplica/modifica y, en los `.js`, la descripción de cada función interna. | Para entender **qué hace cada archivo** del código al implementar o mantener. |

> **Orden de lectura sugerido:** `requirements.md` (qué) → `frontend_design.md` (cómo se diseña) → `pages_description.md` (qué hace cada archivo).

## 1. Visión General del Proyecto

### 1.1 Introducción y Propósito
**ESPOLCLUB** es una plataforma web y móvil diseñada para centralizar, visibilizar y gestionar el ecosistema de clubes y capítulos estudiantiles dentro de la Escuela Superior Politécnica del Litoral (ESPOL). El proyecto actúa como un puente tecnológico entre tres actores clave: la comunidad estudiantil, las directivas de los clubes y la Gerencia de Bienestar Politécnico (GBP).

El propósito del sistema es doble:
1. **Para el estudiante:** Funcionar como un canal oficial de descubrimiento, rompiendo la dependencia actual de las redes sociales tradicionales.
2. **Para las directivas y GBP:** Optimizar la carga administrativa mediante la digitalización del ciclo de vida de los clubes (nomina de miembros actualizados).

### 1.2 El Problema
El entorno de comunidades estudiantiles en ESPOL enfrenta tres desafíos críticos:
* **Brecha de Descubrimiento:** Gran parte de la comunidad politécnica desconoce la existencia y actividades de los clubes debido a la falta de un repositorio centralizado. Los canales de difusión actuales se limitan a eventos presenciales únicos (como la Novatada) o algoritmos de redes sociales externas, aislando a estudiantes que no usan dichas plataformas.
* **Desconexión Operativa de Eventos:** El registro, control de asistencia y difusión de actividades se gestiona de forma fragmentada, perdiendo la trazabilidad de la participación estudiantil histórica.
* **Burocracia Analógica con GBP:** El flujo de rendición de cuentas entre los líderes de los clubes y GBP (entrega de estatutos, listas de miembros por PAO) carece de una vía estandarizada, ágil y auditable.

### 1.3 La Solución
**ESPOLCLUB** unifica la experiencia en un ecosistema digital integrado:
* **Aplicación Móvil (Estudiantes):** Un catálogo dinámico y filtrable para descubrir comunidades, enviar solicitudes de inscripción y registrarse a eventos abiertos.
* **Panel Web Administrativo (Líderes y GBP):** Un entorno plano de gestión de datos donde las directivas configuran sus formularios, controlan accesos y automatizan la generación de la documentación requerida para su respectiva validación institucional.

---

## 2. Modelado del Negocio y Actores

### 2.1 Usuarios
El sistema interactúa exclusivamente con la comunidad e instituciones de ESPOL, segmentados en cuatro perfiles operativos:
1. **Estudiante Politécnico:** Usuario base en busca de comunidades o eventos.
2. **Miembro del Club:** Estudiante aceptado formalmente dentro de una organización.
3. **Líder de Club:** Estudiante miembro de la directiva con control administrativo sobre **un único** club. Su cargo **no se guarda como texto libre**, sino mediante un `role_id` que apunta a la tabla de Roles. Todo club o capítulo nace con **tres roles directivos predeterminados** (`is_default: true`): **Presidente/a, Vicepresidente/a y Secretario/a**. Sobre esa base, el Líder puede crear roles personalizados adicionales (ej. *Staff de Eventos*) y asignarles permisos granulares.
4. **Administrador GBP:** Personal institucional encargado de supervisar la validez legal y operativa de los clubes, con capacidad de crear nuevos clubes y/o capítulos estudiantiles asignando al líder de la directiva para su debida gestión.

### 2.2 Roles y Permisos

| Rol | Entorno | Permisos Clave | Restricciones Críticas |
| :--- | :--- | :--- | :--- |
| **Estudiante Politécnico** | App Móvil | • Autenticación institucional.<br>• Visualizar catálogo de clubes.<br>• Aplicar a membresías y eventos. | • No puede ver la lista de miembros de un club (solo la cantidad total).<br>• No accede al panel web. |
| **Miembro del Club** | App Móvil | • Permisos del Estudiante.<br>• Ver lista de miembros de su club.<br>• Roles internos personalizados.<br>• *Staff:* Escaneo de QR de eventos asignados. | • Sus permisos de visualización interna se limitan a las organizaciones a las que pertenece. |
| **Líder de Club** | Web / Móvil | • Gestión CRUD de eventos, información del club, miembros y roles.<br>• Constructor de formularios dinámicos.<br>• Envío de reportes y cartas a GBP. <br> • Asignar los roles y permisos de acceso al panel administrativo a los miembros.| • **Restricción estricta:** Un líder solo puede administrar **un (1) solo club** en el sistema. |
| **Administrador GBP** | Panel Web | • Recepción de documentos en formato digital.<br>• Aprobación/Rechazo de reportes semestrales.<br>• Descarga de reportería consolidada. | • No edita la información interna de los clubes, solo audita y valida. |

### 2.3 Procesos Principales

#### A. Descubrimiento y Acceso a la Información
* Cualquier usuario autenticado puede explorar el catálogo de organizaciones.
* Los líderes controlan la privacidad de los archivos subidos, decidiendo si son públicos para toda la comunidad politécnica o privados (exclusivos para los miembros del club).

#### B. Ciclo de Inscripción a Clubes (Membresías)
1. El Líder diseña un formulario dinámico con los campos de información específicos que requiere capturar.
2. El Estudiante postula desde la App Móvil llenando dicho formulario.
3. El sistema enruta la solicitud al panel web del Líder en estado *Pendiente*.
4. El Líder evalúa y cambia el estado a *Aprobado* (convirtiendo al usuario en Miembro) o *Rechazado*.

#### C. Gestión de Eventos y Control de Asistencia (Flujo QR)
1. El Líder crea un evento en el panel web y define el formulario de registro.
2. El Politécnico se inscribe al evento desde la App Móvil.
3. El sistema genera automáticamente un **código QR único y encriptado** como credencial de acceso.
4. Durante el evento, los miembros asignados como *Staff* escanean los códigos QR mediante la App Móvil para validar y registrar la asistencia en tiempo real en la base de datos.

#### D. Rendición de Cuentas y Validación (GBP)
1. El sistema consolida la información transaccional (nomina de miembros activos por PAO, líderes).
2. Los Líderes pueden cargar documentos específicos (cartas, estatutos en PDF) y enviar los reportes generados.
3. El Administrador de GBP visualiza los datos estructurados en una interfaz limpia en la web y cuenta con la opción de exportar la información en formatos estandarizados (`.xlsx` para datos, `.pdf` para documentos de texto).
4. GBP emite una resolución digital: *Aprobado* o *Rechazado* (con feedback obligatorio).
---

## 3. Reglas y Fronteras del Sistema

### 3.1 Operaciones Permitidas (Flujos de Control)
Para garantizar la integridad de los datos y evitar conflictos lógicos entre el panel web y la app móvil, el sistema se regirá bajo los siguientes flujos operativos permitidos:

* **Ciclo de Creación de Comunidades:** Un Club o Capítulo Estudiantil solo puede existir en la plataforma si el **Administrador GBP** lo da de alta en el sistema y le vincula la cédula/matrícula de un Estudiante Politécnico, quien automáticamente ascenderá al rol de **Líder de Club**.
* **Gestión Unidireccional de Formularios:** Los formularios de inscripción (tanto para membresía como para eventos) se diseñan, estructuran y modifican *exclusivamente* en el Panel Web por el Líder. La App Móvil actúa únicamente como un cliente que renderiza y envía las respuestas de estos formularios.
* **Trazabilidad del Flujo QR:** El ciclo de un código QR está estrictamente limitado a: *Generación automática tras registro con éxito -> Escaneo y descifrado por cuenta Staff autorizada -> Registro de asistencia único (evitando duplicidad por reescaneo)*.

### 3.2 Reglas de Negocio (Lógica del Sistema)
Estas reglas definen el comportamiento que el Backend deberá validar obligatoriamente mediante código antes de procesar cualquier transacción en la base de datos:

* **RN-1: Exclusividad de Liderazgo:** Un usuario con el rol de Líder de Club puede estar asociado a **un (1) solo club** a la vez en calidad de administrador. Si deja el cargo, el Administrador GBP deberá revocar su acceso y asignar un nuevo líder.
* **RN-2: Restricción de Postulación Activa:** Un Estudiante Politécnico no puede enviar una solicitud de inscripción a un club si ya posee una solicitud en estado *Pendiente* o si ya ostenta el rol de *Miembro* en dicha organización.
* **RN-3: Restricción de Visualización por Privacidad:** Los estudiantes que naveguen por el catálogo móvil solo podrán ver métricas agregadas (ej. "45 miembros"). La lista detallada con nombres y correos de los miembros es confidencial y solo accesible para los miembros internos de ese club específico y el Administrador GBP.
* **RN-4: Caducidad por PAO:** La nómina de miembros activos se consolidará y "congelará" al cierre de cada Término Académico (PAO). Al inicio del nuevo semestre, los líderes deberán emitir la actualización correspondiente para mantener la validez ante GBP.
* **RN-5: Feedback de Rechazo Obligatorio:** Si el Administrador de GBP o el Líder de un Club cambian el estado de un documento o solicitud a *Rechazado*, el sistema exigirá obligatoriamente un campo de texto con la justificación o retroalimentación.

### 3.3 Restricciones y Limitantes del Proyecto
Como este README actúa como guía de decisión para el desarrollo inicial, se establecen los siguientes límites para acotar el esfuerzo de programación:

* **Panel Web Administrativo Plano:** El frontend web no incluirá dashboards con analíticas complejas, gráficos dinámicos o animaciones avanzadas en esta primera etapa. Se diseñará como un panel funcional y limpio basado en tablas, formularios y botones de acción directa.
* **Formatos de Documentación Estáticos:** La generación de reportes se limitará estrictamente a la exportación de archivos estructurados en formato Excel (`.xlsx`) para datos tabulares (listas de miembros y asistencias) y la lectura/almacenamiento de reportes de texto exclusivamente en formato PDF (`.pdf`). No se dará soporte a extensiones `.doc` o `.docx`.
* **Carga de Datos Inicial Semimanual:** El sistema no estará integrado de forma automatizada (mediante APIs externas o Web Scraping) con los sistemas centrales de ESPOL (como el SAAC). La verificación de que un usuario es un estudiante politécnico activo se apoyará en la autenticación institucional configurada y la veracidad de los datos que el propio estudiante declare.
* **Gestión de Roles Staff de Corto Alcance:** Los permisos asignados a un miembro para actuar como *Staff* (escáner de QR) nacerán y morirán con el evento asociado. No existirá un módulo complejo de persistencia de roles jerárquicos a largo plazo dentro del club en esta versión del aplicativo.

---
## 4. Requerimientos de Información

### 4.1 Información de Registro

> **Convención de idioma:** los valores que viajan a la base de datos y enumeraciones de estado se escriben en **inglés** (`Pending`, `Active`...); la capa de presentación (UI) los traduce al **español** para el usuario final.

**Estudiante Politécnico** — La matrícula (`enrollment`) es el **identificador único institucional** (clave natural). La edad **no se almacena**: se deriva de `birth_date`. Las pertenencias a clubes y el cargo de líder ya **no se embeben aquí**; se modelan en la entidad `Membership`.
```json
{
  "id": 1,
  "enrollment": "202311346",
  "first_name": "Kevin",
  "last_name": "Maldonado",
  "birth_date": "2003-05-14",
  "email": "kmaldon@espol.edu.ec",
  "semester": 6,
  "faculty": "FIEC",
  "career": "Computación",
  "description": "Estudiante enfocado en data science y desarrollo de software libre.",
  "skills": ["Python", "React", "SQL"],
  "social_media": [
    { "network": "Instagram", "link": "https://instagram.com/xxxx" },
    { "network": "LinkedIn", "link": "https://linkedin.com/in/xxxx" }
  ]
}
```

**Rol** — Todo cargo (directivo o personalizado) vive en esta tabla; el estudiante solo guarda el `role_id` a través de su `Membership`. Los tres roles directivos (`is_default: true`) se crean automáticamente al dar de alta un club. El bloque `permissions` es un **diccionario extensible**: agregar una nueva capacidad solo requiere añadir una clave; una clave ausente se interpreta como `false`.
```json
{
  "id": 10,
  "club_id": 2,
  "role_name": "Staff de Eventos",
  "is_default": false,
  "is_leadership": false,
  "permissions": {
    "access_web_panel": false,
    "manage_club_info": false,
    "manage_members": false,
    "manage_roles": false,
    "manage_forms": false,
    "manage_events": false,
    "scan_event_qr": true,
    "manage_documents": false,
    "submit_gbp_reports": false
  }
}
```

Ejemplo de **rol directivo predeterminado** (`Presidente/a`), con todos los permisos activos:
```json
{
  "id": 7,
  "club_id": 2,
  "role_name": "Presidente/a",
  "is_default": true,
  "is_leadership": true,
  "permissions": {
    "access_web_panel": true,
    "manage_club_info": true,
    "manage_members": true,
    "manage_roles": true,
    "manage_forms": true,
    "manage_events": true,
    "scan_event_qr": true,
    "manage_documents": true,
    "submit_gbp_reports": true
  }
}
```

**Membership** — Entidad propia que materializa la relación N:M *estudiante–club* con su rol y vigencia por término académico. Sustituye al arreglo embebido del modelo anterior y da soporte directo a la **RN-1** (un solo club con rol directivo) y a la **RN-4** (caducidad por PAO mediante `valid_from` / `valid_until`).
```json
{
  "id": 2001,
  "student_id": 1,
  "club_id": 2,
  "role_id": 7,
  "pao_period": "2026-I",
  "valid_from": "2026-05-01",
  "valid_until": "2026-09-15",
  "status": "Active"
}
```

**Club y Capítulos Estudiantiles**:
```json
{
  "id": 2,
  "name": "Club de Software Libre KOKOA",
  "acronym": "KOKOA",
  "description": "Comunidad politécnica enfocada en promover la filosofía del código abierto.",
  "location": "FIEC 11D",
  "image": "assets/img/clubes/club_1.png",
  "social_media": [
    { "network": "Instagram", "link": "https://instagram.com/kokoaespol" },
    { "network": "GitHub", "link": "https://github.com/kokoaespol" }
  ],
  "internal_documents": [
    {
      "doc_id": 101,
      "title": "Estatutos del Club",
      "file_url": "https://storage.espolclub.com/kokoa/estatutos.pdf",
      "is_public": false
    }
  ]
}
```

**Definición de Formulario Dinámico (`Form`)** — Modela el **esquema** que el Líder construye en el panel web; es lo que la app móvil lee para renderizar los campos y lo que el backend usa para validar. Sirve tanto para membresía (`form_type: "Membership"`) como para eventos (`form_type: "Event"`, con `event_id`). Cada campo tiene un `field_id` estable que es la clave por la que se guardan las respuestas.
```json
{
  "id": 301,
  "club_id": 2,
  "form_type": "Membership",
  "event_id": null,
  "title": "Formulario de Inscripción - KOKOA",
  "is_active": true,
  "fields": [
    {
      "field_id": "q1",
      "label": "¿Por qué quieres unirte?",
      "type": "textarea",
      "required": true,
      "order": 1,
      "options": [],
      "validation": { "max_length": 500 }
    },
    {
      "field_id": "q2",
      "label": "Disponibilidad horaria",
      "type": "select",
      "required": true,
      "order": 2,
      "options": ["Mañana (08:00-12:00)", "Tarde (14:00-17:00)", "Noche (18:00-21:00)"],
      "validation": {}
    }
  ]
}
```
> Tipos de campo soportados (`type`): `text`, `textarea`, `number`, `date`, `select`, `radio`, `checkbox`.

**Solicitud de Membresía (`MembershipApplication`)** — Guarda las **respuestas** referenciando el `form_id` y cada `field_id` del esquema anterior (ya no la pregunta como texto suelto, evitando inconsistencias si el formulario cambia).
```json
{
  "id": 501,
  "student_id": 1,
  "club_id": 2,
  "form_id": 301,
  "submitted_at": "2026-06-19T12:00:00Z",
  "responses": [
    { "field_id": "q1", "answer": "Me apasiona el código abierto." },
    { "field_id": "q2", "answer": "Tarde (14:00-17:00)" }
  ],
  "status": "Pending",
  "leader_feedback": null
}
```

**Evento** — Se vincula a su formulario de registro (`registration_form_id`) y declara la fecha límite de inscripción (`registration_deadline`), que la app usa para habilitar/bloquear el registro.
```json
{
  "id": 50,
  "club_id": 2,
  "event_name": "Taller de Git para Principiantes",
  "mode": "In-person",
  "planned_date": "2026-07-15",
  "planned_hour": "14:30",
  "planned_place": "Auditorio FIEC",
  "description": "Aprende los comandos básicos de Git y GitHub para proyectos colaborativos.",
  "marketing_image": "https://storage.espolclub.com/events/git-taller.png",
  "registration_form_id": 302,
  "registration_deadline": "2026-07-14T23:59:00Z",
  "administrative_data": {
    "objective": "Introducir a los estudiantes de primer año al control de versiones.",
    "sdg": ["Educación de Calidad", "Industria, Innovación e Infraestructura"],
    "expected_participants": 30,
    "responsible_member_id": 1,
    "responsible_task": "Coordinación y dictado del taller",
    "allies": "Rama estudiantil IEEE",
    "resource_links": ["https://link-a-diapositivas.com"],
    "impact_measure": "Encuesta de satisfacción al finalizar el evento"
  }
}
```

**Inscripción a Evento (`EventRegistration`)** — Entidad intermedia (antes inexistente) que representa al estudiante **ya inscrito y con credencial QR, pero aún sin asistir**. Es la fuente de la métrica *Inscritos vs. Asistentes* y la dueña del token QR.
```json
{
  "id": 7001,
  "event_id": 50,
  "student_id": 1,
  "form_id": 302,
  "registered_at": "2026-06-19T12:00:00Z",
  "responses": [
    { "field_id": "f1", "answer": "Primer año" }
  ],
  "qr_token": "b7f3e9a1c2d4...token-opaco-firmado-por-servidor",
  "qr_status": "Active",
  "attendance_status": "Registered"
}
```

> **Diseño del QR (token opaco/firmado):** el `qr_token` es un valor **opaco generado y firmado por el servidor** (no contiene `student_id` ni `event_id` legibles), almacenado en la inscripción. El QR que ve el estudiante solo transporta ese token. Al escanear, el Staff envía el token al backend, que lo **valida contra la BD**: si es válido y `qr_status == "Active"`, registra la asistencia y marca el token como `Used`, impidiendo el reescaneo. Cualquier token alterado o reutilizado se rechaza.

**Asistencia a Evento (`EventAttendance`)** — Se crea **solo** al validar exitosamente el token. Referencia la inscripción de origen y exige unicidad **`UNIQUE (event_id, student_id)`** para evitar duplicados.
```json
{
  "id": 8001,
  "registration_id": 7001,
  "event_id": 50,
  "student_id": 1,
  "scanned_at": "2026-06-19T15:45:00Z",
  "scanned_by_staff_id": 3,
  "qr_token_validated": "b7f3e9a1c2d4...token-opaco-firmado-por-servidor",
  "status": "Attended"
}
```

**Trámite de Documentos GBP (`GbpDocumentProcess`)**:
```json
{
  "id": 901,
  "club_id": 2,
  "pao_period": "2026-I",
  "document_type": "Nómina de Miembros",
  "file_url": "https://storage.espolclub.com/gbp/entregas/kokoa-nomina-2026-1.pdf",
  "uploaded_at": "2026-06-19T12:00:00Z",
  "status": "Under Review",
  "review_feedback": null,
  "reviewed_by_gbp_id": 4
}
```


### 4.2 Información de Consulta

Esta sección define qué información estructural debe retornar el sistema en las consultas (endpoints `GET`), delimitando el acceso según el entorno y los privilegios del actor.

##### A. Entorno Panel Web (Líderes y Administradores GBP)
La interfaz web está optimizada para la gestión de datos tabulares, auditoría y control administrativo.

* **Vista de Control de Miembros (Exclusivo Líderes):**
  * Consulta detallada de la nómina del club: Nombres, matrícula, carrera, correo, habilidades, redes sociales y `role_id` asignado.
  * Bandeja de solicitudes de ingreso `Pendientes`: Respuestas del formulario dinámico de cada postulante.
* **Vista de Gestión de Eventos (Exclusivo Líderes):**
  * Tabla histórica de eventos creados con métricas de conversión (*Inscritos vs. Asistentes Reales*).
  * Panel de asignación de Staff: Lista de miembros habilitados con permisos para interactuar con la API de escaneo de códigos QR.
* **Vista de Auditoría Institucional (Exclusivo GBP):**
  * Catálogo global de clubes activos con la identidad de sus líderes asignados.
  * Buzón de Trámites: Visualización de los documentos PDF cargados por los clubes y estado actual del reporte semestral.
  * Descargas consolidadas: Habilitación de endpoints para exportar estructuras de datos a formato `.xlsx`.

##### B. Entorno Aplicación Móvil (Estudiantes Politécnicos y Miembros)
La interfaz móvil está optimizada para el consumo dinámico de información, restringiendo datos confidenciales por motivos de privacidad.

* **Consulta del Catálogo de Clubes (Público Politécnico):**
  * Tarjetas de descubrimiento: Nombre, acrónimo, descripción corta, ubicación física, redes sociales y **únicamente el contador numérico de miembros activos** (ocultando identidades).
* **Filtros de Accesibilidad Avanzados:**
  * Búsqueda indexada por texto (nombre/acrónimo) y filtrado categórico por Facultad (ej. FIEC, FCNM) o áreas de interés.
* **Sección de Eventos Disponibles (Público Politécnico):**
  * Visualización del "Post de Evento" (Título, descripción, fecha, hora, lugar, imagen de marketing).
  * **Control de Disponibilidad:** Estado del formulario de registro (Habilitado / Bloqueado por fecha límite excedida). Si está bloqueado, se expone el string con el mensaje personalizado del Líder indicando la próxima convocatoria.
* **Módulo de Credenciales QR:**
  * Renderización en la App del código QR único tras la inscripción exitosa a un evento.
* **Módulo de Perfil del Estudiante (CRUD Personal):**
  * Visualización y edición de sus propios datos (descripción, habilidades, redes compartidas) y consulta de su historial de postulaciones o asistencias a eventos.

---

### 4.3 Persistencia Futura

Para asegurar la integridad lógica en la Base de Datos y las validaciones del Backend (FastAPI), se estructuran las siguientes restricciones de datos transaccionales:

#### 1. Ciclo de Vida de una Solicitud de Membresía (`MembershipApplication`)
Cualquier postulación transita estrictamente por los siguientes estados discretos:
* `Pending`: Estado inicial cuando el estudiante envía el formulario desde la App.
* `Approved`: El Líder acepta la solicitud. El registro se congela y el sistema **genera una `Membership` activa** para el usuario en el club.
* `Rejected`: El Líder niega la solicitud. Se activa la obligatoriedad del campo `leader_feedback` con la justificación del rechazo.

#### 2. Ciclo de Vida de una Membresía (`Membership`)
La pertenencia de un estudiante a un club se rige por su vigencia (`valid_from` / `valid_until`) y su estado, dando soporte a la **RN-4 (caducidad por PAO)**:
* `Active`: Membresía vigente dentro del PAO en curso. El estudiante goza de los permisos de su `role_id`.
* `Frozen`: Estado al cierre del PAO. La nómina se "congela" como evidencia histórica auditable; el acceso operativo queda en pausa hasta la renovación.
* `Expired`: Pasó `valid_until` y el Líder no renovó la nómina para el nuevo PAO.
* `Revoked`: Revocación explícita (ej. GBP retira el liderazgo, o el Líder da de baja a un miembro). Para roles directivos, libera la **RN-1** para asignar un nuevo Líder.

#### 3. Ciclo de Vida del Trámite de Rendición de Cuentas (`GbpDocumentProcess`)
El flujo documental ante la Gerencia de Bienestar Politécnico se rige bajo la siguiente jerarquía de estados:
* `Submitted`: El líder del club carga el reporte (PDF) de nóminas o evidencias. Queda bloqueado para edición por parte del club.
* `Under Review`: El administrador de GBP abre el documento para su auditoría.
* `Approved`: GBP valida que la información cumple con los lineamientos institucionales. El club queda certificado para el PAO vigente.
* `Rejected`: GBP deniega el reporte. El sistema exige llenar el campo `review_feedback` y devuelve el trámite al club, reabriendo la posibilidad de que el líder vuelva a subir un archivo corregido.

#### 4. Ciclo de Vida de la Inscripción y la Credencial QR (`EventRegistration`)
Separa la **inscripción** (con credencial emitida) de la **asistencia** (validada presencialmente), habilitando la métrica *Inscritos vs. Asistentes Reales*:
* `attendance_status`: `Registered` (inscrito, aún no asiste) → `Attended` (QR validado) → `NoShow` (evento finalizado sin escaneo).
* `qr_status`: `Active` (token válido y vigente) → `Used` (ya validado, no permite reescaneo) → `Expired` (evento finalizado o credencial caducada).
* El `qr_token` es **opaco y firmado por el servidor**: no expone datos del usuario y solo es verificable contra la BD, garantizando que un token alterado, ajeno o ya usado sea rechazado.

#### 5. Modelo de Captura de Asistencia Transaccional (`EventAttendance`)
Para auditar las evidencias de los eventos y evitar fraudes de asistencia, cada registro guardará obligatoriamente los siguientes puntos de datos inmutables al momento del escaneo QR:
* `registration_id`: Llave foránea a la `EventRegistration` que originó la credencial validada.
* `event_id`: Llave foránea que conecta al evento en cuestión.
* `student_id`: Llave foránea del alumno dueño del código QR.
* `scanned_at`: Marca de tiempo (Timestamp con zona horaria) generada por el servidor al momento exacto de procesar el escaneo.
* `scanned_by_staff_id`: Identificador único del miembro de la directiva o Staff que realizó la lectura del QR, asegurando la trazabilidad del proceso.
* **Restricción de unicidad:** `UNIQUE (event_id, student_id)` impide a nivel de base de datos cualquier registro de asistencia duplicado por reescaneo.

--- 

### 4.4 Usuarios Mock (Autenticación Simulada - Fase 1)

Mientras no exista la autenticación institucional real (que llegará en la Fase 2 vía **JWT**), el inicio de sesión del prototipo se resuelve contra un set de **usuarios mock** servidos desde un `.json` local. Se provee **un usuario por cada rol** para poder visualizar cada perfil en acción. El login se valida por `enrollment` (identificador único) + `password_mock`.

> ⚠️ Las contraseñas en texto plano son **intencionales y exclusivas del prototipo**. En la Fase 2 se reemplazan por credenciales institucionales y tokens firmados.

```json
[
  {
    "enrollment": "202311346",
    "password_mock": "estudiante123",
    "email": "estudiante@espol.edu.ec",
    "display_role": "Estudiante Politécnico",
    "club_id": null,
    "role_id": null
  },
  {
    "enrollment": "202055789",
    "password_mock": "miembro123",
    "email": "miembro@espol.edu.ec",
    "display_role": "Miembro del Club",
    "club_id": 2,
    "role_id": 11
  },
  {
    "enrollment": "201899001",
    "password_mock": "lider123",
    "email": "lider@espol.edu.ec",
    "display_role": "Líder de Club",
    "club_id": 2,
    "role_id": 7
  },
  {
    "enrollment": "GBP-001",
    "password_mock": "gbp123",
    "email": "bienestar@espol.edu.ec",
    "display_role": "Administrador GBP",
    "club_id": null,
    "role_id": null
  }
]
```

| Rol simulado | `enrollment` | Contraseña | Entorno de prueba |
| :--- | :--- | :--- | :--- |
| Estudiante Politécnico | `202311346` | `estudiante123` | App Móvil |
| Miembro del Club | `202055789` | `miembro123` | App Móvil |
| Líder de Club | `201899001` | `lider123` | Web / Móvil |
| Administrador GBP | `GBP-001` | `gbp123` | Panel Web |



### 5.1 Fase 1: Frontend Web & Prototipado de Datos Local (HTML, CSS/Tailwind/Bootstrap, JS, AJAX)
El objetivo de esta fase es crear la interfaz visual completa y simular la interactividad total del sistema. Toda la persistencia será volátil o simulada mediante la lectura y escritura en memoria de los archivos `.json` locales.

* **Arquitectura del Cliente:** Uso de HTML5 para la estructura estática, selectores avanzados y manipuladores del DOM con JavaScript nativo (ES6+), y diseño responsivo adaptado para simular pantallas móviles y web usando utilidades de frameworks de CSS (Tailwind CSS o Bootstrap).
* **Simulación de Base de Datos (Capa AJAX):** * Consumo de los modelos definidos en el punto 4 mediante peticiones asíncronas (`fetch` API) hacia archivos estáticos locales (ej. `usuarios.json`, `eventos.json`).
  * Simulación de inserciones (POST) y actualizaciones (PUT) manipulando arreglos en memoria de JS tras el envío de formularios.
* **Componentes Visuales a Prototipar:**
  * **Panel Web Administrativo:** Tablas de control para líderes (aprobación de solicitudes, asignación de roles), constructor visual de formularios dinámicos y visor de auditoría para GBP (con opción de simular la carga y lectura de archivos PDF).
  * **Simulador de App Móvil:** Vista web adaptada a dimensiones telefónicas que renderice el catálogo con filtros, los formularios de inscripción con validación de fecha límite, y la generación de un código QR simulado (utilizando librerías JS de cliente).

### 5.2 Fase 2: Backend, Lógica de Negocio y Persistencia (FastAPI & PostgreSQL/MySQL)
En esta etapa se descartan los archivos `.json` locales y se migra la inteligencia del proyecto al servidor.

* **Migración de Modelos a Base de Datos:** Transformación de los JSON estructurales de la Fase 1 en tablas relacionales normalizadas. Implementación de llaves foráneas y restricciones en PostgreSQL/MySQL.
* **Desarrollo del Servidor con FastAPI:** * Traducción de las reglas de negocio (RN) del punto 3 a código Python (excepciones de backend, validaciones de tipos con Pydantic).
  * Implementación del módulo de seguridad y autenticación mediante JWT (JSON Web Tokens) para restringir accesos según la matriz de roles y permisos.

### 5.3 Fase 3: Capa de Integración y Construcción de APIs RESTful
El puente de comunicación oficial que independiza el Frontend del Backend.

* **Desarrollo de Endpoints:** Creación de rutas HTTP (`GET`, `POST`, `PUT`, `DELETE`) estandarizadas para alimentar tanto la Web como la futura App Móvil.
* **Contratos de Datos Diferenciados:** Configuración del backend para que el endpoint de consulta móvil filtre los datos privados (ocultar nombres de miembros) mientras que el endpoint administrativo web exponga la nómina completa.
* **Conexión Frontend-Backend:** Reemplazo de las rutas de archivos `.json` locales de la Fase 1 por las URLs de producción de la API de FastAPI.

### 5.4 Fase 4: Aplicación Móvil Nativa (React Native)
Migración de la experiencia del estudiante politécnico del navegador web a su entorno nativo final.

* **Reutilización de Lógica y Estilos:** Aprovechamiento de la curva de aprendizaje del CSS/JS de la Fase 1 para estructurar las vistas en React Native.
* **Consumo de la API Unificada:** Conexión directa de los componentes móviles a los endpoints desarrollados en la Fase 3 (Login institucional, envío de postulaciones dinámicas).
* **Integración de Hardware:** Implementación nativa de la cámara del dispositivo móvil para la lectura y descifrado físico de los códigos QR por parte del perfil Miembro-Staff asignado al evento.

---

## 6. Instalación y Ejecución

> **Estado actual:** El proyecto se encuentra en la **Fase 1 (Frontend Web)**. Es un sitio estático construido con HTML, CSS (Tailwind CSS vía CDN) y JavaScript nativo. **No requiere instalar dependencias ni proceso de build.**

### Requisitos previos
* Un navegador web moderno (Chrome, Firefox o Edge).
* [Git](https://git-scm.com/) para clonar el repositorio.
* Un servidor estático local. Se recomienda porque la aplicación carga datos mediante `fetch` hacia archivos `.json` locales, y abrir el `index.html` directamente con el protocolo `file://` bloquea esas peticiones por seguridad (CORS).

### 1. Clonar el repositorio
```bash
git clone https://github.com/<tu-usuario>/espolclub.git
cd espolclub
```

### 2. Levantar un servidor local
Elige **una** de las siguientes opciones:

**Opción A — Extensión Live Server (VS Code, recomendada):**
1. Instala la extensión *Live Server*.
2. Abre la carpeta del proyecto en VS Code.
3. Clic derecho sobre `index.html` → **Open with Live Server**.

**Opción B — Python (sin instalar nada extra):**
```bash
python -m http.server 8080
```

**Opción C — Node.js:**
```bash
npx serve .
```

### 3. Abrir en el navegador
Visita la URL que indique tu servidor, por ejemplo:
```
http://localhost:8080
```

---

## 7. Glosario

| Término | Significado |
| :--- | :--- |
| **ESPOL** | Escuela Superior Politécnica del Litoral. |
| **GBP** | Gerencia de Bienestar Politécnico. Entidad institucional que valida y audita los clubes. |
| **PAO** | Período Académico Ordinario (semestre académico de ESPOL). |
| **SDG** | *Sustainable Development Goals* (Objetivos de Desarrollo Sostenible / ODS). |
| **FIEC** | Facultad de Ingeniería en Electricidad y Computación. |
| **FCNM** | Facultad de Ciencias Naturales y Matemáticas. |
| **SAAC** | Sistema Académico central de ESPOL. |
| **Staff** | Miembro de un club con permiso temporal para escanear códigos QR durante un evento. |
| **QR** | *Quick Response code*; credencial cifrada que valida la asistencia a un evento. |
| **CRUD** | *Create, Read, Update, Delete*; operaciones básicas sobre datos. |
| **JWT** | *JSON Web Token*; mecanismo de autenticación y autorización por token. |
| **RN** | Regla de Negocio (ver sección 3.2). |

---

## 8. Equipo y Autor

| Autor | Rol |
| :--- | :--- |
| **Kevin Maldonado Paredes** | Desarrollo, diseño y documentación del proyecto. |

Proyecto desarrollado en el contexto de la materia de Desarrollo Web (ESPOL).

---

## 9. Licencia

Este proyecto se distribuye bajo la **Licencia MIT**.

```
MIT License

Copyright (c) 2026 Kevin Maldonado Paredes

Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia
de este software y de los archivos de documentación asociados, para utilizar el
software sin restricción, incluyendo los derechos de uso, copia, modificación,
fusión, publicación, distribución, sublicencia y/o venta de copias del software.

EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO.
```
