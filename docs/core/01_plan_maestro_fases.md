# OMZONE — Plan Maestro de Fases e Implementación

Versión: 1.0
Fecha: 2026-04-05
Fuente: `docs/core/00_documento_maestro_requerimientos.md`

---

## 1. Resumen

Este documento descompone el documento maestro de OMZONE en fases de implementación ordenadas por dependencias, con tasks concretas asignadas a cada fase. Cada task se documenta en un archivo independiente en `docs/tasks/`.

---

## 2. Fases

### Fase 0 — Setup del proyecto

**Objetivo:** Scaffold del proyecto React + Vite, configuración de Appwrite SDK, routing base, layout shell y auth flow básico.

| Task | Título | Dominio |
|---|---|---|
| TASK-001 | Scaffold proyecto React + Vite + Tailwind + Appwrite SDK | Infraestructura |
| TASK-002 | Auth flow: login, registro, sesión y guards por label | Usuario, Infraestructura |

**Entregable de fase:** App corriendo local, con auth funcional, layout base, guards por label y Appwrite SDK configurado.

---

### Fase 1 — Schema core (Appwrite)

**Objetivo:** Crear todas las colecciones, atributos, relaciones, índices y permisos en Appwrite, con `appwrite.json` consolidado.

| Task | Título | Dominio |
|---|---|---|
| TASK-003 | Schema dominio editorial: experiences, publications, sections, tags | Editorial |
| TASK-004 | Schema dominio comercial: editions, pricing, addons, packages, passes | Comercial |
| TASK-005 | Schema dominio agenda: slots, slot_resources, resources | Agenda |
| TASK-006 | Schema dominio transaccional: orders, order_items, payments, tickets, passes, refunds | Transaccional |
| TASK-007 | Schema dominio usuario y configuración: user_profiles, site_settings | Usuario, Config |

**Entregable de fase:** `appwrite.json` completo con todas las colecciones desplegables. Permisos de colección asignados.

---

### Fase 2 — Auth y roles

**Objetivo:** Sistema de labels funcional, Function de asignación de label, flujo de invitación de operador, guards de ruta en frontend.

| Task | Título | Dominio |
|---|---|---|
| TASK-008 | Function assign-user-label + user profile creation on signup | Usuario |
| TASK-009 | Route guards por label: admin, operator, client, anónimo | Infraestructura, Usuario |

**Entregable de fase:** Un nuevo usuario obtiene label y perfil automáticamente. Las rutas están protegidas por label.

---

### Fase 3 — CRUD admin básico

**Objetivo:** Panel administrativo funcional con CRUD de las entidades core del catálogo.

| Task | Título | Dominio |
|---|---|---|
| TASK-010 | Admin layout: sidebar, navigation, breadcrumbs, shell | Frontend admin |
| TASK-011 | CRUD experiencias desde admin | Editorial, Comercial |
| TASK-012 | CRUD ediciones y pricing tiers desde admin | Comercial |
| TASK-013 | CRUD addons y addon assignments desde admin | Comercial |
| TASK-014 | CRUD slots y agenda desde admin | Agenda |
| TASK-015 | CRUD resources y locations desde admin | Operativo |

**Entregable de fase:** Admin puede crear, editar, listar y archivar experiencias, ediciones, precios, addons, slots y recursos.

---

### Fase 4 — Catálogo público

**Objetivo:** Sitio público donde visitantes exploran experiencias con contenido editorial y agenda.

| Task | Título | Dominio |
|---|---|---|
| TASK-016 | Public layout: header, footer, navigation shell | Frontend público |
| TASK-017 | Listado público de experiencias con filtros y tags | Editorial, Frontend público |
| TASK-018 | Detalle público de experiencia: editorial + comercial + agenda | Editorial, Comercial, Agenda |

**Entregable de fase:** Visitante puede explorar catálogo, filtrar por tags y ver detalle completo con agenda y precios.

---

### Fase 5 — Checkout

**Objetivo:** Flujo de compra desde selección hasta pago con Stripe.

| Task | Título | Dominio |
|---|---|---|
| TASK-019 | Function create-checkout: validación, snapshot, Stripe session | Transaccional |
| TASK-020 | UI de checkout: selección de slot, cantidad, addons, datos, pago | Frontend público, Transaccional |

**Entregable de fase:** Un visitante/client puede completar una compra de experiencia individual con Stripe.

---

### Fase 6 — Webhooks y pagos

**Objetivo:** Procesamiento de pagos post-checkout con reconciliación de órdenes.

| Task | Título | Dominio |
|---|---|---|
| TASK-021 | Function stripe-webhook: procesar payment events | Transaccional |
| TASK-022 | Reconciliación de orden: actualizar status, registrar payment | Transaccional |

**Entregable de fase:** Tras pago confirmado, la orden se actualiza, el payment se registra y el flujo queda listo para emisión.

---

### Fase 7 — Tickets y reservas

**Objetivo:** Generación de tickets tras pago, validación por QR, check-in.

| Task | Título | Dominio |
|---|---|---|
| TASK-023 | Function generate-ticket: emisión post-pago con snapshot | Transaccional, Operativo |
| TASK-024 | Function validate-ticket: escaneo QR y check-in | Operativo |
| TASK-025 | Página de confirmación + ticket digital para el cliente | Frontend público, Frontend portal |

**Entregable de fase:** Tras pago, se emite ticket con QR. Admin puede escanear y validar.

---

### Fase 8 — Pases y paquetes

**Objetivo:** Soporte para pases consumibles y paquetes fijos de experiencia.

| Task | Título | Dominio |
|---|---|---|
| TASK-026 | CRUD pases consumibles desde admin + reglas de consumo | Comercial, Admin |
| TASK-027 | Function consume-pass: redención de pase con trazabilidad | Transaccional |
| TASK-028 | CRUD paquetes de experiencia desde admin + fulfillment rules | Comercial, Admin |
| TASK-029 | Checkout adaptado para pases y paquetes | Transaccional |

**Entregable de fase:** Admin crea pases/paquetes. Cliente compra y consume. Todo trazable.

---

### Fase 9 — Portal de cliente

**Objetivo:** Área autenticada donde el cliente consulta sus compras, tickets, pases y perfil.

| Task | Título | Dominio |
|---|---|---|
| TASK-030 | Portal layout: navegación, dashboard, shell | Frontend portal |
| TASK-031 | Mis órdenes y detalle de orden | Frontend portal, Transaccional |
| TASK-032 | Mis tickets activos y descarga | Frontend portal, Transaccional |
| TASK-033 | Mis pases y consumos | Frontend portal, Comercial |
| TASK-034 | Perfil del cliente: datos editables | Frontend portal, Usuario |

**Entregable de fase:** Cliente autenticado puede consultar órdenes, tickets, pases y editar perfil.

---

### Fase 10 — CMS y publicaciones

**Objetivo:** Sistema de contenido editorial para páginas públicas, blogs y landing pages.

| Task | Título | Dominio |
|---|---|---|
| TASK-035 | CRUD publicaciones y secciones desde admin | Editorial, Admin |
| TASK-036 | Renderizado público de publicaciones con secciones modulares | Editorial, Frontend público |

**Entregable de fase:** Admin crea contenido editorial modular que se renderiza como páginas públicas.

---

### Fase 11 — Media y storage

**Objetivo:** Gestión de imágenes y archivos para experiencias, publicaciones y documentos.

| Task | Título | Dominio |
|---|---|---|
| TASK-037 | Buckets de storage: configuración, permisos, upload desde admin | Media, Infraestructura |
| TASK-038 | Componente de galería y media picker reutilizable | Media, Frontend admin |

**Entregable de fase:** Admin sube y gestiona assets. Las experiencias y publicaciones usan media referenciado.

---

### Fase 12 — Venta asistida y operaciones admin

**Objetivo:** Funcionalidades avanzadas del panel: venta manual, booking requests, dashboard.

| Task | Título | Dominio |
|---|---|---|
| TASK-039 | Venta asistida desde admin (crear orden manual) | Transaccional, Admin |
| TASK-040 | Booking requests: solicitud → cotización → conversión a orden | Transaccional, Operativo |
| TASK-041 | Dashboard admin: métricas de ventas, tickets, ocupación | Admin |

**Entregable de fase:** Admin puede vender manualmente, gestionar solicitudes y ver métricas.

---

### Fase 13 — Notificaciones

**Objetivo:** Correos transaccionales para confirmación, recordatorio y seguimiento.

| Task | Título | Dominio |
|---|---|---|
| TASK-042 | Function send-confirmation: email post-compra | Transaccional |
| TASK-043 | Function send-reminder: recordatorio de próximo evento | Agenda, Transaccional |

**Entregable de fase:** Cliente recibe confirmación y recordatorio por email.

---

### Fase 14 — SEO, performance e i18n

**Objetivo:** Optimización del sitio público para SEO, velocidad de carga y soporte bilingüe.

| Task | Título | Dominio |
|---|---|---|
| TASK-044 | SEO: meta tags, OG images, sitemap, structured data | Frontend público |
| TASK-045 | Performance: image optimization, lazy loading, code splitting | Frontend público |
| TASK-046 | i18n: soporte ES/EN en contenido público | Editorial, Frontend público |

**Entregable de fase:** Sitio público optimizado para buscadores, rápido y bilingüe.

---

### Fase 15 — QA, responsive y deploy

**Objetivo:** Auditoría de calidad, responsive, permisos, y preparación para producción.

| Task | Título | Dominio |
|---|---|---|
| TASK-047 | Auditoría responsive: mobile, tablet, desktop | QA, Frontend |
| TASK-048 | QA de permisos: validar labels × acciones en todas las superficies | QA, Seguridad |
| TASK-049 | QA de flujos transaccionales: checkout, tickets, pases | QA, Transaccional |
| TASK-050 | Deploy: variables de entorno, dominio, SSL, Appwrite producción | Infraestructura |

**Entregable de fase:** Plataforma auditada, testeada y lista para producción.

---

### Fase A — Páginas públicas (post-fase 15)

**Objetivo:** Reemplazar los placeholders de las páginas públicas con diseño editorial premium y contenido real.

| Task | Título | Dominio |
|---|---|---|
| TASK-051 | Landing page completa: hero, discover, why OMZONE, CTA | Frontend público, Editorial |
| TASK-052 | About page: misión, ubicación PV, filosofía wellness | Frontend público, Editorial |
| TASK-053 | Contact page: formulario funcional + collection contact_messages | Frontend público, Configuración |

**Entregable de fase:** Las 3 páginas públicas principales son funcionales, premium y mobile-first.

---

### Fase B — Catálogo editorial

**Objetivo:** Rediseñar el listado de experiencias de formato marketplace a formato editorial vertical.

| Task | Título | Dominio |
|---|---|---|
| TASK-054 | Catálogo experiencias: vertical editorial, sin precios, ExperienceArticle | Frontend público, Editorial |

**Entregable de fase:** El catálogo público muestra experiencias como artículos editoriales sin precios visibles.

---

### Fase C — Admin: secciones faltantes

**Objetivo:** Implementar las 4 secciones admin que quedaron como placeholder.

| Task | Título | Dominio |
|---|---|---|
| TASK-055 | Admin — Tickets: listado + detalle | Frontend admin, Operativo |
| TASK-056 | Admin — Clientes: listado + detalle (user_profiles + Auth) | Frontend admin, Usuario |
| TASK-057 | Admin — Media manager: explorador por bucket | Frontend admin, Media |
| TASK-058 | Admin — Settings: notification templates + system info | Frontend admin, Configuración |

**Entregable de fase:** El panel admin no tiene placeholders. Todas las secciones del sidebar son funcionales.

---

### Fase D — Datos de demostración y QA

**Objetivo:** Crear contenido de demostración y ejecutar QA integral sobre la plataforma completa.

| Task | Título | Dominio |
|---|---|---|
| TASK-059 | Seed: 3-5 experiencias, ediciones, publicaciones, media | Editorial, Comercial, Agenda |
| TASK-060 | QA integral: flujos, permisos, responsive, edge cases | QA, todos los dominios |
| TASK-061 | Responsive audit: 375/768/1024/1280 en todas las vistas | QA, Frontend |

**Entregable de fase:** La plataforma tiene datos reales y ha sido verificada integralmente.

---

### Fase E — Limpieza y cierre

**Objetivo:** Eliminar código muerto, placeholders residuales y actualizar documentación de cierre.

| Task | Título | Dominio |
|---|---|---|
| TASK-062 | Limpieza: AdminPlaceholder, rutas redundantes, docs | Infraestructura, Documentación |

**Entregable de fase:** Código limpio, sin placeholders, documentación alineada con implementación.

---

## 3. Mapa de dependencias entre fases

```
Fase 0 (Setup)
  └─→ Fase 1 (Schema)
       ├─→ Fase 2 (Auth)
       │    └─→ Fase 3 (CRUD Admin)
       │         ├─→ Fase 4 (Catálogo público)
       │         │    └─→ Fase 5 (Checkout)
       │         │         └─→ Fase 6 (Webhooks)
       │         │              └─→ Fase 7 (Tickets)
       │         │                   └─→ Fase 8 (Pases/Paquetes)
       │         ├─→ Fase 10 (CMS)
       │         └─→ Fase 11 (Media)
       └─→ Fase 9 (Portal cliente) [depende de Fase 7]
  
Fase 12 (Venta asistida) ← depende de Fases 3 + 6
Fase 13 (Notificaciones) ← depende de Fase 7
Fase 14 (SEO/i18n) ← depende de Fase 4
Fase 15 (QA/Deploy) ← depende de todas las anteriores

Fase A (Páginas públicas) ← depende de Fase 4 + 14
Fase B (Catálogo editorial) ← depende de Fase 4
Fase C (Admin secciones) ← depende de Fases 3 + 7 + 11
Fase D (Seed + QA) ← depende de Fases A + B + C
Fase E (Limpieza) ← depende de Fase D
```

---

## 4. Resumen de tasks por fase

| Fase | Tasks | Rango |
|---|---|---|
| 0 — Setup | 2 | TASK-001 a TASK-002 |
| 1 — Schema | 5 | TASK-003 a TASK-007 |
| 2 — Auth | 2 | TASK-008 a TASK-009 |
| 3 — CRUD Admin | 6 | TASK-010 a TASK-015 |
| 4 — Catálogo | 3 | TASK-016 a TASK-018 |
| 5 — Checkout | 2 | TASK-019 a TASK-020 |
| 6 — Webhooks | 2 | TASK-021 a TASK-022 |
| 7 — Tickets | 3 | TASK-023 a TASK-025 |
| 8 — Pases/Paquetes | 4 | TASK-026 a TASK-029 |
| 9 — Portal cliente | 5 | TASK-030 a TASK-034 |
| 10 — CMS | 2 | TASK-035 a TASK-036 |
| 11 — Media | 2 | TASK-037 a TASK-038 |
| 12 — Venta asistida | 3 | TASK-039 a TASK-041 |
| 13 — Notificaciones | 2 | TASK-042 a TASK-043 |
| 14 — SEO/i18n | 3 | TASK-044 a TASK-046 |
| 15 — QA/Deploy | 4 | TASK-047 a TASK-050 |
| A — Páginas públicas | 3 | TASK-051 a TASK-053 |
| B — Catálogo editorial | 1 | TASK-054 |
| C — Admin secciones | 4 | TASK-055 a TASK-058 |
| D — Seed + QA | 3 | TASK-059 a TASK-061 |
| E — Limpieza | 1 | TASK-062 |
| **Total** | **62** | |

---

## 5. Criterio de avance

Una fase se considera completada cuando:
1. Todas las tasks de la fase tienen sus criterios de aceptación cumplidos.
2. Se ha ejecutado QA funcional sobre los flujos de la fase.
3. No hay errores críticos pendientes.
4. La fase siguiente tiene sus dependencias resueltas.
