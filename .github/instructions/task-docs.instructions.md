---
description: "Usar cuando se creen o modifiquen task docs de OMZONE: documentación de tareas, tickets de trabajo, especificaciones de implementación."
applyTo: "docs/tasks/**"
---

# Convenciones de Task Docs — OMZONE

## 1. Propósito

Los task docs son la fuente de verdad para cada tarea de implementación. Describen QUÉ se va a hacer, POR QUÉ, con qué entidades, qué permisos, qué criterios de aceptación y qué NO incluye. Son el contrato entre planificación e implementación.

---

## 2. Ubicación y naming

| Elemento | Convención |
|---|---|
| Directorio | `docs/tasks/` |
| Nombre de archivo | `TASK-NNN-descripcion-corta.md` |
| Numeración | Secuencial: `TASK-001`, `TASK-002`, etc. |
| Descripción | `kebab-case`, 3-5 palabras descriptivas |

### Ejemplos
```
docs/tasks/TASK-001-experience-catalog-schema.md
docs/tasks/TASK-002-experience-crud-admin.md
docs/tasks/TASK-003-public-experience-listing.md
docs/tasks/TASK-004-checkout-flow.md
docs/tasks/TASK-005-stripe-webhook-handler.md
```

---

## 3. Template obligatorio

Todo task doc DEBE seguir esta estructura. Las secciones son obligatorias salvo que se indique (opcional).

```markdown
# TASK-NNN: Título descriptivo de la tarea

## Objetivo
Qué se va a lograr y por qué importa para OMZONE.
1-3 oraciones claras.

## Contexto
Requerimientos funcionales relacionados (RF-XX del documento maestro).
Decisiones arquitectónicas previas que afectan esta tarea.
Dependencias de tareas anteriores.

## Alcance
Lista concreta de lo que SÍ incluye esta tarea:
- Punto 1
- Punto 2
- Punto 3

## Fuera de alcance
Lista explícita de lo que NO incluye esta tarea:
- Punto 1
- Punto 2
(Esto evita scope creep y establece límites claros.)

## Dominio
Indicar a qué dominio(s) del sistema pertenece:
- [ ] Editorial (experiencias, publicaciones, tags)
- [ ] Comercial (pricing, addons, paquetes, pases)
- [ ] Agenda (slots, recursos, capacidad)
- [ ] Operativo (bookings, validación, asignación)
- [ ] Transaccional (órdenes, pagos, tickets, reembolsos)
- [ ] Usuario (perfiles, preferencias)
- [ ] Configuración (settings, templates)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `tabla_nombre` | crear / leer / actualizar / borrar | detalles relevantes |

## Atributos nuevos o modificados (si aplica)

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `tabla` | `atributoNuevo` | string / float / enum / etc. | sí/no | qué representa |

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `function-name` | crear nueva / modificar existente | qué cambia |

## Buckets / Storage implicados (si aplica)

| Bucket | Operación | Notas |
|---|---|---|
| `bucket_name` | crear / usar existente | qué archivos |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `ComponentName` | público / admin / portal | crear / modificar | qué hace |

## Hooks implicados (si aplica)

| Hook | Operación | Notas |
|---|---|---|
| `useHookName` | crear / modificar | qué expone |

## Rutas implicadas (si aplica)

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/ruta/ejemplo` | público / admin / portal | ninguno / admin / client | descripción |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| acción 1 | ✅ | ✅ | ❌ | ❌ | ❌ |
| acción 2 | ✅ | ✅ | ✅ | ❌ | ❌ |

## Flujo principal
Describir paso a paso el flujo principal de la tarea:
1. Paso 1
2. Paso 2
3. Paso 3

## Criterios de aceptación
Lista verificable de condiciones que deben cumplirse para considerar la tarea completa:
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3
- [ ] Criterio N

## Validaciones de seguridad (si aplica)
- [ ] Permisos verificados en Function (no solo frontend)
- [ ] Input validado (tipo, rango, formato)
- [ ] Datos de usuario aislados (no cross-user access)
- [ ] Precios leídos de DB (no del cliente)
- [ ] Webhooks verifican firma HMAC

## Dependencias
Tareas que deben completarse ANTES de esta:
- TASK-NNN: descripción
- TASK-NNN: descripción

## Bloquea a (opcional)
Tareas que dependen de que esta se complete:
- TASK-NNN: descripción

## Riesgos y notas
Observaciones, riesgos conocidos, decisiones pendientes, edge cases a considerar.
```

---

## 4. Reglas de redacción

### 4.1 Hacer
- Ser **específico**: nombrar tablas, atributos, Functions, componentes exactos.
- Usar **checkboxes** en criterios de aceptación (se marcan al completar).
- Incluir la **matriz de permisos** cuando la tarea involucra accesos diferenciados.
- Referenciar **RF-XX** del documento maestro cuando aplique.
- Indicar **dependencias** explícitas (qué TASK debe existir antes).
- Declarar **fuera de alcance** explícitamente para evitar scope creep.

### 4.2 No hacer
- No escribir tareas vagas ("mejorar la experiencia de usuario").
- No dejar criterios de aceptación ambiguos ("que funcione bien").
- No omitir la sección "Fuera de alcance" — siempre hay algo que delimitar.
- No mezclar múltiples features no relacionadas en una sola tarea.
- No asumir schemas sin verificar el documento maestro.
- No crear tareas sin indicar dominio y entidades.

---

## 5. Granularidad correcta

### 5.1 Una tarea bien scoped
```
TASK-004: Checkout flow — Create checkout Function
- Objetivo: Function que valida carrito, lee precios, crea orden, genera Stripe session
- Alcance: solo la Function create-checkout
- Fuera de alcance: webhook handler, generación de tickets, UI de checkout
```

### 5.2 Una tarea MAL scoped (demasiado grande)
```
TASK-004: Implementar todo el checkout
- Objetivo: hacer que se pueda comprar
- Alcance: todo
```

### 5.3 Regla de tamaño
- Una tarea debe poder completarse en **1-3 días** de trabajo.
- Si es más grande, **dividir** en sub-tareas.
- Si es trivial (< 1 hora), considerar agruparla con tareas relacionadas.

---

## 6. Dominios de clasificación

Cada tarea pertenece a uno o más de estos dominios:

| # | Dominio | Tablas principales | Functions principales |
|---|---|---|---|
| 1 | Editorial | experiences, publications, publication_sections, tags | — |
| 2 | Comercial | experience_editions, pricing_tiers, pricing_rules, addons, addon_assignments, packages, package_items, passes | — |
| 3 | Agenda | slots, slot_resources, resources | update-slot-capacity, release-expired-slots |
| 4 | Operativo | bookings, booking_participants | validate-ticket |
| 5 | Transaccional | orders, order_items, payments, tickets, ticket_redemptions, pass_consumptions, refunds | create-checkout, stripe-webhook, generate-ticket, process-refund |
| 6 | Usuario | user_profiles, user_preferences | assign-user-label, invite-operator |
| 7 | Configuración | site_settings, notification_templates | — |
| 8 | Frontend público | componentes public/* | — |
| 9 | Frontend admin | componentes admin/* | — |
| 10 | Frontend portal | componentes portal/* | — |
| 11 | Infraestructura | appwrite.json, deploy, env vars | — |

---

## 7. Fases de implementación

Las tareas deben organizarse en estas fases para respetar dependencias:

| Fase | Nombre | Contenido típico |
|---|---|---|
| 0 | Setup | Proyecto Vite, Appwrite SDK, routing base, auth flow |
| 1 | Schema core | Tablas de dominios editorial + comercial + agenda |
| 2 | Auth y roles | Labels, guards, assign-user-label, invite-operator |
| 3 | CRUD admin básico | ABM de experiencias, ediciones, pricing, addons, slots |
| 4 | Catálogo público | Listado, detalle, filtrado, galería, búsqueda |
| 5 | Checkout | create-checkout, Stripe session, orden con snapshot |
| 6 | Webhooks y pagos | stripe-webhook, reconciliación, actualización de orden |
| 7 | Tickets y reservas | generate-ticket, validate-ticket, bookings |
| 8 | Pases y paquetes | Pases consumibles, paquetes, redención |
| 9 | Portal de cliente | Mis órdenes, mis tickets, mis pases, perfil |
| 10 | Notificaciones | send-confirmation, send-reminder |
| 11 | CMS / publicaciones | CRUD publicaciones, secciones, renderizado público |
| 12 | Admin avanzado | Dashboard, métricas, reembolsos, operadores |
| 13 | SEO y performance | Meta tags, lazy loading, preview images, sitemap |
| 14 | QA y responsive | Auditoría responsive, testing de flujos, permisos |
| 15 | Deploy y producción | Variables de entorno, dominio, SSL, monitoring |

---

## 8. Referencias cruzadas

### 8.1 Requerimientos funcionales clave (del documento maestro)

| RF | Descripción | Dominios |
|---|---|---|
| RF-01 | CRUD de experiencias (admin) | Editorial, Comercial |
| RF-02 | Gestión de ediciones y pricing | Comercial |
| RF-03 | Gestión de agenda/slots | Agenda |
| RF-04 | Catálogo público con filtros | Editorial, Frontend público |
| RF-05 | Detalle de experiencia público | Editorial, Comercial, Frontend público |
| RF-06 | Flujo de checkout | Transaccional, Comercial |
| RF-07 | Procesamiento de pagos Stripe | Transaccional |
| RF-08 | Emisión de tickets | Transaccional, Operativo |
| RF-09 | Validación de tickets (QR) | Operativo |
| RF-10 | Portal de cliente | Usuario, Frontend portal |
| RF-11 | Gestión de addons | Comercial |
| RF-12 | Paquetes de experiencias | Comercial |
| RF-13 | Pases consumibles | Comercial, Transaccional |
| RF-14 | CMS / publicaciones | Editorial |
| RF-15 | Panel admin completo | Admin, todos los dominios |
| RF-16 | Reembolsos | Transaccional |

### 8.2 Cómo referenciar
En el campo "Contexto" del task doc, incluir:
```
Relacionado con: RF-06 (Flujo de checkout), RF-07 (Procesamiento de pagos Stripe)
Depende de: TASK-001 (schema transaccional), TASK-003 (pricing tiers)
```

---

## 9. Checklist de calidad de un task doc

- [ ] Tiene número TASK-NNN único y secuencial
- [ ] Objetivo claro en 1-3 oraciones
- [ ] Alcance con lista concreta de entregables
- [ ] Fuera de alcance explícito
- [ ] Dominio identificado
- [ ] Entidades/tablas listadas con operación
- [ ] Functions listadas (si aplica)
- [ ] Componentes frontend listados (si aplica)
- [ ] Permisos/labels documentados con matriz
- [ ] Criterios de aceptación como checkboxes verificables
- [ ] Dependencias explícitas (TASK-NNN)
- [ ] No mezcla features no relacionadas
- [ ] Tamaño adecuado (1-3 días de trabajo)
- [ ] Referencia RF-XX del documento maestro (si aplica)

---

## 10. Errores frecuentes

| Error | Consecuencia | Corrección |
|---|---|---|
| Tarea sin "Fuera de alcance" | Scope creep, la tarea crece indefinidamente | Siempre definir qué NO incluye |
| Criterios ambiguos ("que funcione") | Subjetivo, no se puede verificar | Criterios específicos y medibles |
| Sin dependencias declaradas | Se intenta implementar sin prereqs | Listar TASK-NNN previas |
| Tarea demasiado grande | No se completa, se pierde foco | Dividir en sub-tareas de 1-3 días |
| Sin matriz de permisos | Se implementan permisos incorrectos | Incluir tabla de labels × acciones |
| No nombrar entidades exactas | Se inventan tablas durante implementación | Verificar vs documento maestro |
| Mezclar dominios sin justificación | Tarea confusa, difícil de revisar | Separar por dominio |
