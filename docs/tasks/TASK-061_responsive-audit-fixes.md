# TASK-061: Responsive audit — Verificación y correcciones en todos los breakpoints

## Objetivo

Auditar y corregir la adaptación responsive de todas las páginas y componentes de OMZONE en los breakpoints 375px (mobile), 768px (tablet), 1024px (laptop) y 1280px (desktop). Al completar esta tarea, la plataforma funciona impecablemente en todos los tamaños de pantalla, sin overflow, con jerarquía visual correcta y usabilidad táctil adecuada.

## Contexto

- **Fase:** D — Datos de demostración y QA (post-fase 15)
- **Documento maestro:** Principio 6 — "Responsive real: la experiencia debe funcionar impecable en móvil, tablet y desktop."
- **Estado actual:** Los componentes fueron implementados con responsiveness parcial durante las tareas originales, pero no se ha hecho una auditoría integral dedicada.
- **Instrucciones:** `.github/instructions/responsive.instructions.md` define los estándares.
- **Skill:** `responsive-auditor` disponible para guiar la auditoría.

## Alcance

Lo que SÍ incluye esta tarea:

1. **Auditoría sistemática** de cada vista en los 4 breakpoints:
   - **Público:** Landing, About, Contact, Catálogo, Detalle, Checkout, Publicaciones.
   - **Admin:** Dashboard, Experiencias, Ediciones, Pricing, Addons, Paquetes, Pases, Agenda, Recursos, Órdenes, Tickets, Clientes, Media, Settings, Check-in, Venta asistida, Publicaciones.
   - **Portal:** Dashboard, Órdenes, Tickets, Pases, Perfil.

2. **Categorías de verificación:**
   - Overflow horizontal (ninguna página debe tener scroll horizontal).
   - Tablas: se convierten a cards o scroll horizontal contenido en mobile.
   - Modales/drawers: no se desbordan, tienen scroll interno.
   - Navegación: sidebar colapsa a hamburger/drawer en mobile.
   - Tipografía: tamaños escalados correctamente.
   - Touch targets: mínimo 44px en elementos interactivos.
   - Imágenes: no desbordan, aspect-ratio preservado.
   - Forms: inputs full-width en mobile, labels visibles.
   - Botones: tamaño adecuado, no cortados.
   - Spacing: márgenes y paddings proporcionales.

3. **Correcciones:** Aplicar fixes para cada problema encontrado.

4. **Reporte:** Documentar estado antes/después de correcciones.

## Fuera de alcance

- Rediseño de componentes (solo ajustes responsive).
- Testing en dispositivos reales (se usa DevTools responsive mode).
- Testing de orientación landscape en mobile.
- Accesibilidad formal (WCAG).
- Performance (Core Web Vitals).

## Dominio

- [x] Frontend público
- [x] Frontend admin
- [x] Frontend portal

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| Todos los componentes | público / admin / portal | modificar (si tienen issues) | Ajustes de clases Tailwind responsive |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| N/A — tarea de frontend | — | — | — | — | — |

## Flujo principal

1. Cargar el sitio en Chrome DevTools responsive mode.
2. Para cada vista y cada breakpoint (375, 768, 1024, 1280):
   - Verificar overflow horizontal.
   - Verificar layout de tabla → cards.
   - Verificar navegación (sidebar, header).
   - Verificar modales y drawers.
   - Verificar forms y inputs.
   - Verificar imágenes y galería.
   - Verificar tipografía y spacing.
   - Verificar touch targets.
3. Documentar issues con ruta, breakpoint y descripción.
4. Aplicar correcciones (clases Tailwind responsive).
5. Re-verificar cada corrección.
6. Compilar reporte final.

## Criterios de aceptación

- [ ] Ninguna página tiene overflow horizontal en ningún breakpoint.
- [ ] Todas las tablas admin se transforman a cards o tienen scroll contenido en mobile.
- [ ] Los modales no se desbordan de la pantalla en ningún breakpoint.
- [ ] El sidebar admin colapsa correctamente en mobile/tablet.
- [ ] El header público funciona correctamente en mobile (hamburger menu).
- [ ] Todos los touch targets tienen al menos 44px en mobile.
- [ ] Las imágenes no desbordan su contenedor.
- [ ] Los formularios son usables en mobile (inputs full-width, labels visibles).
- [ ] La tipografía es legible en todos los breakpoints.
- [ ] La landing page funciona y se ve premium en mobile.
- [ ] El checkout es usable en mobile (formularios, resumen, botones).
- [ ] El portal de cliente es usable en mobile.
- [ ] `npm run build` pasa limpio.

## Dependencias

- **TASK-051 a TASK-058:** Páginas deben estar implementadas para auditar.
- **TASK-059:** Datos de demostración para verificar con contenido real.

## Bloquea a

- **TASK-062:** Limpieza y cierre.

## Riesgos y notas

- La auditoría puede revelar problemas en componentes compartidos (layouts, headers) que afecten a muchas páginas cuando se corrijan.
- Algunos componentes de terceros (e.g., date pickers, modales de `@dnd-kit`) pueden tener problemas responsive difíciles de corregir.
- Usar el skill `responsive-auditor` para seguir el checklist estándar.
- Considerar priorizar: público > portal > admin (el público es lo más visible para el usuario final).
