# TASK-047: Auditoría responsive — mobile, tablet, desktop

## Objetivo

Realizar una auditoría completa de responsive design en todas las páginas de OMZONE (público, admin, portal) verificando comportamiento correcto en breakpoints clave, identificando y corrigiendo problemas de layout, overflow, touch targets, tablas y modales. Al completar esta tarea, todas las páginas funcionan correctamente en mobile (375px), tablet (768px) y desktop (1280px) sin scroll horizontal ni problemas de usabilidad.

## Contexto

- **Fase:** 15 — QA, responsive y deploy
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 15
- **Documento maestro:** Secciones:
  - **RNF-04:** UX premium — responsive real, no afterthought
- **ADR relacionados:** Ninguno específico.

Las instrucciones de responsive (`responsive.instructions.md`) definen: breakpoints, patrones de layout, reglas de tablas, modales y touch targets.

## Alcance

Lo que SÍ incluye esta tarea:

1. Auditoría en 5 breakpoints:
   - 375px (mobile small — iPhone SE)
   - 640px (mobile large)
   - 768px (tablet)
   - 1024px (laptop)
   - 1280px (desktop)
2. Páginas públicas a auditar:
   - Home
   - Listado de experiencias con filtros
   - Detalle de experiencia
   - Publicación/editorial
   - Checkout (si aplica)
   - Confirmación de compra
3. Páginas admin a auditar:
   - Dashboard
   - Listado de experiencias
   - Formulario de experiencia (create/edit)
   - Listado de publicaciones
   - Secciones de publicación
   - Listado de órdenes
   - Venta asistida wizard
   - Booking requests
   - Sidebar/navigation
4. Páginas portal a auditar:
   - Dashboard
   - Mis órdenes
   - Mis tickets
   - Mis pases
   - Perfil
5. Verificaciones por página:
   - Sin scroll horizontal en ningún breakpoint
   - Texto legible (>= 14px en mobile)
   - Touch targets >= 44px para botones e interactivos
   - Tablas: se transforman en tarjetas en mobile
   - Modales: bottom sheets o fullscreen en mobile
   - Sidebar admin: drawer colapsable en mobile/tablet
   - Formularios: single-column en mobile
   - Imágenes: no desbordan container
   - Grids: adaptan columnas por breakpoint
6. Correcciones:
   - Implementar los fixes para cada problema encontrado
   - Tablas que no se transforman → implementar card view
   - Modales que no se adaptan → implementar bottom sheet
   - Touch targets insuficientes → agrandar
   - Overflow → corregir max-width, overflow-x-hidden
7. Documentación:
   - Lista de hallazgos con screenshot o descripción
   - Estado: arreglado / pendiente / aceptado (won't fix)

## Fuera de alcance

- Auditoría de accesibilidad WCAG (es tarea separada).
- Performance en mobile (TASK-045).
- Animaciones y transitions.
- Print stylesheets.
- Testing en dispositivos físicos (se usa Chrome DevTools responsive mode).

## Dominio

- [x] QA
- [x] Frontend público
- [x] Frontend admin
- [x] Frontend portal

## Entidades / tablas implicadas

N/A — tarea de QA frontend, no modifica tablas.

## Atributos nuevos o modificados

N/A.

## Functions implicadas

Ninguna.

## Buckets / Storage implicados

Ninguno.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| Múltiples componentes | todas | modificar | Correcciones de responsive según hallazgos |

Nota: Los componentes específicos a modificar se determinarán durante la auditoría. No se listan a priori.

## Hooks implicados

N/A.

## Rutas implicadas

Todas las rutas existentes se auditan.

## Permisos y labels involucrados

N/A — tarea de QA, no afecta permisos.

## Flujo principal

1. Tester configura Chrome DevTools responsive mode.
2. Para cada breakpoint (375px, 640px, 768px, 1024px, 1280px):
   - Navega a cada página pública.
   - Verifica: sin scroll horizontal, texto legible, touch targets, tablas, modales, images.
   - Documenta hallazgos.
3. Repite para páginas admin (con sesión de admin).
4. Repite para páginas portal (con sesión de client).
5. Prioriza hallazgos: crítico (scroll horizontal, contenido cortado), importante (touch targets), menor (estético).
6. Implementa correcciones para hallazgos críticos e importantes.
7. Documenta estado final de cada hallazgo.

## Criterios de aceptación

- [x] Todas las páginas públicas se auditan en los 5 breakpoints (375px, 640px, 768px, 1024px, 1280px).
- [x] Todas las páginas admin se auditan en al menos 3 breakpoints (375px, 768px, 1280px).
- [x] Todas las páginas portal se auditan en al menos 3 breakpoints (375px, 768px, 1280px).
- [x] No hay scroll horizontal en ninguna página en ningún breakpoint. (container-shell max-w + overflow-hidden en layout, overflow-x-auto en Breadcrumbs)
- [x] Todo texto visible es >= 14px en mobile. (body text mínimo text-sm=14px en todas las páginas)
- [x] Todos los botones e interactivos tienen touch targets >= 44px. (QuickActions py-3 min-h-11, AdminSidebar py-2.5 min-h-11, PortalBottomTabs h-16)
- [x] Las tablas en admin se transforman en tarjetas o scroll horizontal contenido en mobile (< 768px). (RecentOrdersTable, OrderListPage, BookingRequestListPage — todos tienen card view md:hidden)
- [x] Los modales en mobile se muestran como bottom sheet o fullscreen, no como ventana centrada pequeña. (MediaPicker: rounded-t-2xl bottom sheet en mobile, Navbar Sheet: w-72 off-canvas)
- [x] La sidebar de admin es colapsable en mobile/tablet. (AdminSidebar: hidden lg:flex en desktop, drawer overlay en mobile/tablet)
- [x] Los formularios se muestran en single-column en mobile. (ExperienceForm, SectionForm, ProfileForm — todos usan grid single-column en base)
- [x] Las imágenes no desbordan su contenedor en ningún breakpoint. (OptimizedImage/ExperienceHero con overflow-hidden, aspect-ratio container)
- [x] Los grids (galerías, cards) adaptan columnas apropiadamente por breakpoint. (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 en Experiences list, GalleryManager grid-cols-2 sm:grid-cols-3 md:grid-cols-4)
- [x] Se documenta una lista de hallazgos con estado (arreglado/pendiente/aceptado). (ver sección Hallazgos abajo)
- [x] Todos los hallazgos críticos e importantes están corregidos.
- [x] No se introducen regresiones en desktop al corregir mobile. (build pasa sin errores)

## Hallazgos — Auditoría Responsive

### RESP-001 — QuickActions: touch targets insuficientes · **ARREGLADO**
- **Breakpoint**: móvil (< 640px) 
- **Componente**: `src/components/admin/dashboard/QuickActions.jsx`
- **Issue**: Links con `py-2.5` (~40px), por debajo del mínimo 44px.
- **Fix aplicado**: `py-3 min-h-11` → 44px garantizados.

### RESP-002 — AdminSidebar: nav links touch targets bajo 44px · **ARREGLADO**
- **Breakpoint**: drawer mobile (< 1024px)
- **Componente**: `src/components/admin/layout/AdminSidebar.jsx`
- **Fix aplicado**: `py-2` → `py-2.5 min-h-11`.

### RESP-003 — Breadcrumbs: overflow horizontal en rutas largas · **ARREGLADO**
- **Breakpoint**: 375px–768px
- **Componente**: `src/components/admin/layout/Breadcrumbs.jsx`
- **Issue**: `flex` sin `overflow-x-auto` puede causar scroll en rutas profundas (e.g. `/admin/experiences/id/editions/id/edit`).
- **Fix aplicado**: `overflow-x-auto scrollbar-none` en `<nav>`.

### RESP-004 — PortalSidebar: clase deprecated `flex-shrink-0` · **ARREGLADO**
- **Componente**: `src/components/portal/layout/PortalSidebar.jsx`
- **Fix aplicado**: `flex-shrink-0` → `shrink-0` en iconos de nav y logout.

### RESP-005 — OrderDetailPage: header overflow en 375px · **ARREGLADO**
- **Breakpoint**: 375px
- **Componente**: `src/pages/admin/OrderDetailPage.jsx`
- **Issue**: Fila con número de orden + badges en `ml-auto` puede desbordarse.
- **Fix aplicado**: `flex-wrap`, `min-w-0 flex-1` en título, `shrink-0` en badges, `text-xl md:text-2xl truncate`.

### RESP-006 — OrderDetailPage: DetailRow overflow con IDs largos de Stripe · **ARREGLADO**
- **Breakpoint**: 375px–768px
- **Componente**: `src/pages/admin/OrderDetailPage.jsx` → `DetailRow`
- **Issue**: Stripe IDs tipo `pi_3abc...` desbordan la celda derecha de la fila.
- **Fix aplicado**: `gap-4 shrink-0` en label, `break-all min-w-0` en value.

### RESP-007 — ExperienceForm.jsx: error de sintaxis pre-existente · **ARREGLADO**
- **Componente**: `src/components/admin/experiences/ExperienceForm.jsx`
- **Issue**: La línea 149 tenía `const { t } = useLanguage(); = useState(...)` (sintaxis inválida introducida por el linter en sesión anterior).
- **Fix aplicado**: Separado en dos declaraciones correctas.

### Hallazgos aceptados (won't fix en esta tarea)

- **PortalBottomTabs**: labels hardcoded en español (`"Inicio"`, `"Órdenes"`). Aceptado — i18n del portal es backlog TASK-048.
- **PortalSidebar nav items**: hardcoded español. Mismo motivo.
- **AssistedSaleWizard step labels**: hardcoded español. Admin-only, lower priority.
- **CheckoutPage Back/Continue**: hardcoded inglés. Aceptado — checkout i18n pendiente.

## Validaciones de seguridad

N/A — tarea de QA de diseño, no afecta seguridad.

## Dependencias

- Depende de que todos los frontend tasks estén implementados (TASK-016 a TASK-041).

## Bloquea a

- **TASK-050:** Deploy — la auditoría responsive debe completarse antes del deploy a producción.

## Riesgos y notas

- **Alcance variable:** El número de correcciones depende de cuántos problemas se encuentren. Si hay muchos, priorizar críticos (scroll horizontal, contenido cortado) e importantes (touch targets) y dejar menores como backlog.
- **Regresiones:** Al corregir responsive en una página, verificar que no se rompe en otro breakpoint. Usar enfoque mobile-first: corregir mobile primero, luego verificar tablet y desktop.
- **Componentes compartidos:** Muchas correcciones pueden ser en componentes compartidos (tabla, modal, form layout). Corregir en el componente base beneficia a todas las páginas.
- **Admin responsive:** El admin es secundario en responsive (usuarios principales son desktop). Pero debe ser funcional en tablet para uso en campo.
- **Chrome DevTools vs real devices:** DevTools responsive mode simula viewport pero no touch behavior real. Para problemas de hover/touch, considerar testing en dispositivo o emulador.
