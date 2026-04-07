# Plan: OMZONE — Completar funcionalidad pendiente

Todo lo que queda pendiente post-TASK-050 se organiza en **12 nuevas tasks** agrupadas en **5 fases incrementales**, para ir trabajando poco a poco.

---

## Diagnóstico del estado actual

| Área                     | Estado                                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **HomePage**             | Placeholder puro — solo texto "OMZONE" centrado, sin hero, sin imágenes, sin secciones                                       |
| **AboutPage**            | Placeholder — título + 1 párrafo + "Full content coming soon"                                                                |
| **ContactPage**          | Placeholder — icons + "form coming soon", sin formulario                                                                     |
| **ExperiencesListPage**  | Funcional pero aspecto marketplace (grid de cards 3 columnas con precios visibles)                                           |
| **ExperienceDetailPage** | Completo — hero, secciones, pricing sidebar, addons, agenda                                                                  |
| **Checkout**             | Completo (4 pasos + success/cancel)                                                                                          |
| **Admin**                | 30 páginas implementadas, **4 placeholders**: Tickets, Clientes, Media, Configuración                                        |
| **Portal cliente**       | Completo (dashboard, órdenes, tickets, pases, perfil)                                                                        |
| **Datos de prueba**      | Seeds parciales (locations, addons, slots, packages). Sin experiencias ni publicaciones de ejemplo creadas                   |
| **Storage**              | 7 buckets configurados. `public-resources` existe con helpers (`getPublicImageUrl`). Solo `auth-bg.jpg` como imagen estática |

---

## Fases y Tasks

### Fase A — Landing & páginas públicas (paralelo entre sí)

#### TASK-051: Landing page completa

- Hero section con imagen de `public-resources` (o imagen libre wellness)
- Sección "Discover" — preview de tipos de experiencia con thumbnails
- Sección "Why OMZONE" — propuesta de valor con iconos/imágenes
- CTA final hacia /experiences
- Sin precios, sin testimoniales
- Textos con voz premium del copywriter agent
- Nuevos componentes en `src/components/public/home/`
- i18n keys nuevos en landing.json (EN/ES)
- Mobile-first responsive
- **Archivos**: `src/pages/public/HomePage.jsx` (reescritura completa)

#### TASK-052: About page completa

- Hero con imagen de fondo
- Sección de misión/visión
- Sección de ubicación (Puerto Vallarta / Bahía de Banderas)
- Sección de filosofía wellness / equipo
- CTA hacia experiencias
- Textos editoriales premium (copywriter)
- **Archivos**: `src/pages/public/AboutPage.jsx` (reescritura completa), componentes en `src/components/public/about/`

#### TASK-053: Contact page completa

- Formulario de contacto funcional (nombre, email, mensaje)
- Info de contacto (email, ubicación, redes sociales)
- Mapa o referencia visual a la zona
- Imagen de fondo o sección hero
- **Archivos**: `src/pages/public/ContactPage.jsx` (reescritura completa), componentes en `src/components/public/contact/`

---

### Fase B — Catálogo editorial (paralelo con Fase A)

#### TASK-054: Rediseño experiencias listing page

- Hero banner con background image y texto evocador
- Cada experiencia como sección/artículo editorial (no card de marketplace)
- **Ocultar precios** del listado — solo mostrar tipo, título, descripción corta
- Layout vertical tipo revista en vez de grid 3 columnas
- Transición elegante a detalle al hacer click
- Filtros de tipo mantenidos pero con diseño más sutil
- Mobile-first
- **Archivos**: `src/pages/public/ExperiencesListPage.jsx`, `src/components/public/experiences/ExperienceCard.jsx` → refactor a `ExperienceArticle.jsx`

---

### Fase C — Admin: secciones faltantes (paralelo con A/B)

#### TASK-055: Admin — Listado de tickets

- Lista de todos los tickets emitidos con filtros (status, experiencia, fecha)
- Detalle de ticket con QR, estado, historial de validaciones
- Acciones: invalidar, marcar como usado
- Patterns: seguir `OrderListPage` como referencia
- **Archivos**: nuevos `TicketListPage.jsx`, `TicketDetailPage.jsx` en `src/pages/admin/`

#### TASK-056: Admin — Gestión de clientes

- Listado de clientes (customers + user_profiles)
- Búsqueda por nombre/email
- Detalle de cliente: órdenes, tickets, pases asociados
- Sin crear clientes (vienen del registro)
- **Archivos**: nuevos `ClientListPage.jsx`, `ClientDetailPage.jsx` en `src/pages/admin/`

#### TASK-057: Admin — Media manager

- Explorador de archivos por bucket del proyecto
- Upload de imágenes a `public-resources`, `experience_media`, `publication_media`
- Preview de imágenes
- Copiar URL / ID de archivo
- Eliminar archivos
- Basado en `ImageUpload` existente
- **Archivos**: nuevo `MediaManagerPage.jsx` en `src/pages/admin/`

#### TASK-058: Admin — Settings / Configuración

- Site settings básicos (nombre del sitio, tagline, contact email, social links)
- Puede ser estático/read-only inicialmente si no hay collection `site_settings`
- Links a configuraciones externas (Stripe, Appwrite)
- **Archivos**: nuevo `SettingsPage.jsx` en `src/pages/admin/`

---

### Fase D — Datos de prueba y QA (depende de Fase C)

#### TASK-059: Seed experiencias + publicaciones de ejemplo

- Crear 3-5 experiencias con datos reales y variados (sesión, inmersión, retiro, estancia)
- Cada una con ediciones, pricing tiers, slots asignados
- Crear 2-3 publicaciones con secciones editoriales (hero, text, gallery, cta)
- Subir imágenes a buckets correspondientes (desde `public-resources` o imágenes libres)
- Script seed o documentación de datos manuales
- **Resultado**: la plataforma queda con ejemplos funcionales visibles en público y admin

#### TASK-060: QA integral de flujos

- Test manual de cada formulario admin (crear/editar experiencia, edición, pricing, addon, slot, publicación, paquete, pase)
- Test del flujo público (listing → detail → checkout intent)
- Test portal cliente (login → dashboard → tickets → pases → perfil)
- Test check-in
- Test booking requests
- Documentar y corregir bugs encontrados

---

### Fase E — Pulido final (depende de todo lo anterior)

#### TASK-061: Responsive audit + fixes

- Auditoría responsive de landing, about, contact, experiencias listing, detalle
- Auditoría responsive de admin (sidebar, formularios, tablas)
- Auditoría responsive de portal cliente
- Fix de overflow, touch targets, tipografía, breakpoints
- Probar en 375px, 768px, 1024px, 1280px

#### TASK-062: Limpieza y cierre

- Eliminar rutas admin redundantes (`/admin/editions`, `/admin/pricing` placeholder)
- Limpiar `AdminPlaceholder` component si ya no se usa
- Verificar que sidebar no tiene links muertos
- Actualizar `PENDINGS.md` con estado final
- Verificar `npm run build` limpio

---

## Orden de ejecución y dependencias

```
Fase A (TASK-051, 052, 053) ─┐
                              ├──→ Fase D (TASK-059) ──→ TASK-060 ──→ Fase E (TASK-061, 062)
Fase B (TASK-054) ────────────┤
                              │
Fase C (TASK-055, 056, 057, 058) ─┘
```

- Fases A, B, C son **paralelas** entre sí
- Fase D depende de que admin esté completo (Fase C)
- TASK-060 (QA) depende de que haya datos de ejemplo (TASK-059) y páginas públicas listas (A/B)
- Fase E es el cierre final

---

## Decisiones

- TASK-050 (deploy prod) queda **fuera** — no se deployea aún a producción
- TASK-029 (checkout passes/packages + Stripe) sigue **saltada** hasta configurar Stripe keys
- Imágenes: primero buscar en bucket `public-resources`, si faltan usar imágenes libres (Unsplash/Pexels) acorde al tema wellness
- Catálogo: se transforma de **grid marketplace → editorial vertical** tipo revista
- **Precios ocultos** del listado público, solo visibles dentro del detalle de experiencia
- **No testimoniales** ni sección de precios en la landing
- Textos siguen la voz premium wellness definida en `content.instructions.md`

---

## Preguntas abiertas

1. **Imágenes del bucket `public-resources`**: ¿Ya hay imágenes subidas? Necesito listar el contenido para decidir cuáles usar en landing/about/contact.
2. **Formulario de contacto**: ¿Los mensajes se guardan en Appwrite (collection `contact_messages`), se envían por email vía Function, o ambos?
3. **Settings del admin**: ¿Crear collection `site_settings` o dejar la sección como informativa/estática en el MVP?
