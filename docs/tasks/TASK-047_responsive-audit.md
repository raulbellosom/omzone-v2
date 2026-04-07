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

- [ ] Todas las páginas públicas se auditan en los 5 breakpoints (375px, 640px, 768px, 1024px, 1280px).
- [ ] Todas las páginas admin se auditan en al menos 3 breakpoints (375px, 768px, 1280px).
- [ ] Todas las páginas portal se auditan en al menos 3 breakpoints (375px, 768px, 1280px).
- [ ] No hay scroll horizontal en ninguna página en ningún breakpoint.
- [ ] Todo texto visible es >= 14px en mobile.
- [ ] Todos los botones e interactivos tienen touch targets >= 44px.
- [ ] Las tablas en admin se transforman en tarjetas o scroll horizontal contenido en mobile (< 768px).
- [ ] Los modales en mobile se muestran como bottom sheet o fullscreen, no como ventana centrada pequeña.
- [ ] La sidebar de admin es colapsable en mobile/tablet.
- [ ] Los formularios se muestran en single-column en mobile.
- [ ] Las imágenes no desbordan su contenedor en ningún breakpoint.
- [ ] Los grids (galerías, cards) adaptan columnas apropiadamente por breakpoint.
- [ ] Se documenta una lista de hallazgos con estado (arreglado/pendiente/aceptado).
- [ ] Todos los hallazgos críticos e importantes están corregidos.
- [ ] No se introducen regresiones en desktop al corregir mobile.

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
