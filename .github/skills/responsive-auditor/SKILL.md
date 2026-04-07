# Skill: Responsive Auditor

## Cuándo usarlo

- Cuando una vista, página o componente de OMZONE necesita auditoría de responsive design
- Al completar una task que incluye UI nueva o modificada y se necesita verificar en todos los breakpoints
- Cuando se detectan problemas de layout, overflow o usabilidad en dispositivos móviles o tablets
- Antes de aprobar un deploy que toca superficies públicas, admin o customer portal
- Cuando se implementa un flujo completo (checkout, detalle de experiencia, dashboard) y hay que garantizar experiencia premium en todos los viewports

**Ejemplos concretos:**
- "Auditar la página de detalle de experiencia en mobile y tablet"
- "Verificar que el formulario de checkout no tiene overflow en xs"
- "Revisar el dashboard de admin en breakpoints md y lg"
- "Validar que la galería de experiencias se ve premium en todos los dispositivos"

## Cuándo NO usarlo

- Para QA funcional completo (permisos, Functions, schema) → usar skill `qa-tester`
- Para validar lógica de checkout → usar skill `checkout-flow-validator`
- Para construir componentes desde cero → usar instrucción `react-components.instructions.md`
- Para auditar solo la parte de Appwrite (schema, permisos) sin UI → usar instrucción `appwrite-schema.instructions.md`

## Entradas necesarias

- [ ] Documento maestro leído: `docs/core/00_documento_maestro_requerimientos.md` — para entender la estética wellness premium esperada
- [ ] Componente o vista target identificada con su ruta de archivo
- [ ] Superficie definida: pública, admin o client portal
- [ ] Instrucción de responsive leída: `.github/instructions/responsive.instructions.md`
- [ ] TailwindCSS breakpoints de referencia disponibles

## Procedimiento paso a paso

### Fase 1: Preparación

**Paso 1 — Identificar el target y su superficie**

Determinar:
- Qué vista/componente se audita
- En qué superficie vive (pública, admin, client portal)
- Qué rol la consume (admin, operator, client, anónimo)
- Si es un flujo de múltiples pasos (checkout, onboarding) o una página estática

> ✅ Hecho cuando: target, superficie y rol definidos.

**Paso 2 — Recopilar archivos involucrados**

Listar todos los archivos que componen la vista:
- Componentes React (`.jsx`)
- Hooks personalizados que manejan estado o data
- Estilos específicos si existen
- Layout wrapper o contenedor padre

> ✅ Hecho cuando: tengo la lista completa de archivos a revisar.

**Paso 3 — Definir breakpoints de evaluación**

Usar los breakpoints estándar de TailwindCSS:

| Breakpoint | Ancho | Dispositivo típico | Prioridad |
|---|---|---|---|
| `xs` | < 640px | Móvil portrait | **Alta** — mobile-first |
| `sm` | ≥ 640px | Móvil landscape | Media |
| `md` | ≥ 768px | Tablet portrait | **Alta** |
| `lg` | ≥ 1024px | Tablet landscape / laptop | Media |
| `xl` | ≥ 1280px | Desktop | **Alta** |
| `2xl` | ≥ 1536px | Desktop grande | Baja |

> ✅ Hecho cuando: breakpoints priorizados según la superficie.

### Fase 2: Ejecución

**Paso 4 — Auditar layout y grid**

- [ ] El layout se adapta correctamente en cada breakpoint
- [ ] No hay contenido cortado ni overflow horizontal (`overflow-x` visible)
- [ ] Los grids colapsan de multi-columna a single-column en mobile
- [ ] El spacing es proporcional al viewport (no padding fijo que aplaste en xs)
- [ ] No hay elementos con ancho fijo (`w-[500px]`) que rompan en pantallas pequeñas
- [ ] Container con `max-w-*` adecuado en desktop para evitar líneas de texto infinitas

> ✅ Hecho cuando: layout revisado en xs, md, xl como mínimo. Issues documentados.

**Paso 5 — Auditar tipografía**

- [ ] Body text mínimo 14px en mobile (legible sin zoom)
- [ ] Headings escalan proporcionalmente: `text-xl` en mobile → `text-3xl` en desktop (ejemplo)
- [ ] Líneas de texto no exceden ~75 caracteres en desktop (`max-w-prose` o equivalente)
- [ ] Line-height adecuado para cada tamaño (mínimo 1.5 para body, 1.2 para headings)
- [ ] Textos largos no rompen layout (truncado con `truncate`/`line-clamp` donde aplique)

> ✅ Hecho cuando: tipografía revisada, issues documentados.

**Paso 6 — Auditar imágenes y media**

- [ ] Imágenes son responsive: `max-w-full` / `w-full` con `object-cover` o `object-contain`
- [ ] Aspect ratios se mantienen (usar `aspect-*` de Tailwind)
- [ ] Hero images/banners se adaptan sin recortar contenido importante
- [ ] No hay imágenes que se pixelan al agrandarse (resolución adecuada)
- [ ] Galerías de experiencias mantienen estética aspiracional/premium en todos los breakpoints

> ✅ Hecho cuando: imágenes y media revisados, issues documentados.

**Paso 7 — Auditar navegación**

- [ ] Menú principal colapsa a hamburger/drawer en mobile
- [ ] Breadcrumbs se truncan o adaptan en pantallas pequeñas
- [ ] Tabs/pills hacen scroll horizontal con indicador si no caben
- [ ] Bottom navigation (si existe) es accesible con el pulgar (zona inferior de pantalla)
- [ ] Links de navegación tienen touch targets de al menos 44x44px

> ✅ Hecho cuando: navegación revisada, issues documentados.

**Paso 8 — Auditar tablas y datos**

- [ ] Tablas hacen scroll horizontal con indicador visual en mobile (`overflow-x-auto` + sombra)
- [ ] O se transforman a card layout en mobile (para tablas de admin o listados)
- [ ] Headers de tabla son visibles/accesibles durante el scroll
- [ ] No hay tablas que rompan el layout del contenedor padre
- [ ] Datos tabulares mantienen legibilidad en xs (no se comprimen hasta ser ilegibles)

> ✅ Hecho cuando: tablas y datos revisados, issues documentados.

**Paso 9 — Auditar formularios**

- [ ] Inputs tienen tamaño táctil adecuado: mínimo 44x44px touch target (h-11 en Tailwind)
- [ ] Formularios multi-columna colapsan a single-column en mobile
- [ ] Selects y datepickers funcionan correctamente en mobile (nativos o con fallback)
- [ ] Botones de acción son alcanzables con el pulgar (no en extremo superior)
- [ ] Labels están visibles y asociados a su input
- [ ] Mensajes de error inline visibles sin scroll

> ✅ Hecho cuando: formularios revisados, issues documentados.

**Paso 10 — Auditar modales y overlays**

- [ ] Modales no exceden el viewport (max-height con scroll interno)
- [ ] En mobile, los modales se comportan como full-screen o bottom sheet
- [ ] Scroll dentro del modal funciona correctamente (no scroll del body debajo)
- [ ] Botón de cerrar accesible y visible
- [ ] Overlays de confirmación (delete, cancel) son usables en mobile

> ✅ Hecho cuando: modales y overlays revisados, issues documentados.

**Paso 11 — Auditar componentes interactivos**

- [ ] Hover states tienen equivalente para touch (`:active` o tap feedback)
- [ ] Tooltips funcionan en mobile (tap en vez de hover, o se reemplazan por info inline)
- [ ] Sliders/carousels son swipeable en touch
- [ ] Dropdowns no se salen del viewport (posicionamiento adaptativo)
- [ ] Animaciones no causan jank en mobile (prefer `transform`/`opacity`)

> ✅ Hecho cuando: interactivos revisados, issues documentados.

**Paso 12 — Auditar experiencia premium/wellness**

Esta es específica de OMZONE — la estética premium debe mantenerse en TODOS los breakpoints:

- [ ] Las galerías de experiencias se ven aspiracionales en mobile (no se degradan a lista plana genérica)
- [ ] El checkout flow se siente fluido y confiable en mobile
- [ ] Las cards de experiencia mantienen jerarquía visual: imagen hero → título → precio → CTA
- [ ] El customer portal no se ve como "admin reducido" en mobile
- [ ] La landing pública tiene presencia editorial en mobile, no solo contenido apilado
- [ ] Suficiente whitespace en todos los breakpoints (no comprimir todo para "que quepa")

> ✅ Hecho cuando: experiencia premium validada en xs, md, xl.

### Fase 3: Validación

**Paso 13 — Compilar issues con formato RESP-NNN**

Cada issue encontrado se documenta con:

```markdown
### RESP-NNN: [Título descriptivo]

- **Severidad:** critical | major | minor | cosmetic
- **Breakpoint(s):** xs / sm / md / lg / xl / 2xl
- **Componente:** nombre del componente
- **Archivo:** path/to/file.jsx (líneas aprox.)
- **Descripción:** qué falla y cómo se ve
- **Fix sugerido:** código o approach para corregir
```

> ✅ Hecho cuando: todos los issues numerados y formateados.

**Paso 14 — Generar reporte final**

Compilar el reporte con:
1. Resumen ejecutivo: tabla de issues por severidad y breakpoint
2. Issues detallados con formato RESP-NNN
3. Componentes que pasaron sin issues
4. Recomendaciones generales: patrones recurrentes, mejoras sistémicas

> ✅ Hecho cuando: reporte completo generado.

## Checklist de entrega

- [ ] Todos los breakpoints prioritarios evaluados: xs, md, xl como mínimo
- [ ] Layout auditado: no overflow horizontal, grids colapsan correctamente
- [ ] Tipografía legible en mobile: mínimo 14px body, line-height adecuado
- [ ] Imágenes responsive: no se pixelan, aspect ratios mantenidos
- [ ] Navegación adaptada: hamburger/drawer en mobile, touch targets 44x44px
- [ ] Tablas adaptadas: scroll horizontal o card layout en mobile
- [ ] Formularios usables en mobile: single-column, inputs táctiles, errores visibles
- [ ] Modales adaptados: full-screen o bottom sheet en mobile
- [ ] Touch targets mínimo 44x44px en elementos interactivos
- [ ] Estética premium/wellness mantenida — no marketplace genérico en ningún breakpoint
- [ ] Issues numerados RESP-NNN con severidad, breakpoint y fix sugerido
- [ ] Reporte incluye resumen ejecutivo + issues + recomendaciones

## Errores comunes

❌ **Auditar solo en desktop y asumir que mobile "se adapta"** → ✅ Empezar siempre desde xs (mobile-first). Los quiebres más graves ocurren en mobile y a menudo son invisibles en desktop.

❌ **Usar anchos fijos en componentes** → ✅ Evitar `w-[500px]` o `min-w-[400px]`. Usar clases responsive de Tailwind: `w-full md:w-1/2 lg:w-1/3`. Si se necesita un ancho máximo, usar `max-w-*`.

❌ **Ignorar overflow horizontal** → ✅ El overflow horizontal en mobile es el error responsive más común y más molesto. Verificar con `overflow-x: hidden` en el body temporal para detectar qué elemento sobresale.

❌ **Degradar la experiencia premium en mobile** → ✅ OMZONE NO es un dashboard admin reducido en mobile. Las experiencias deben verse aspiracionales, con whitespace, jerarquía visual y estética editorial en TODOS los viewports.

❌ **Touch targets menores a 44x44px** → ✅ Botones, links, iconos interactivos deben tener al menos 44x44px de área táctil. En Tailwind: `min-h-[44px] min-w-[44px]` o `p-3` como mínimo.

❌ **Modales que exceden el viewport en mobile** → ✅ En mobile, los modales deben ser full-screen o bottom sheet con `max-h-[90vh]` y scroll interno. Nunca un modal flotante centrado que se corta.

❌ **Tablas que rompen el layout en mobile** → ✅ Tablas con muchas columnas necesitan `overflow-x-auto` con indicador de scroll, o transformarse a card layout en mobile. Nunca dejar que una tabla de 6 columnas comprima todo a 320px.

## Output esperado

```markdown
# Responsive Audit Report: {{TARGET_VIEW}}

## Resumen ejecutivo

| Severidad | xs | sm | md | lg | xl | Total |
|---|---|---|---|---|---|---|
| Critical | N | N | N | N | N | N |
| Major | N | N | N | N | N | N |
| Minor | N | N | N | N | N | N |
| Cosmetic | N | N | N | N | N | N |

## Issues detallados

### RESP-001: [Título]
(formato completo)

## Componentes sin issues
- Lista de componentes que pasaron limpiamente

## Recomendaciones generales
- Patrones recurrentes, mejoras sistémicas
```

### Severidades de referencia

| Nivel | Criterio |
|---|---|
| **critical** | Contenido inaccesible, funcionalidad rota, layout completamente destruido |
| **major** | Usabilidad degradada significativamente, overflow visible, touch targets inaccesibles |
| **minor** | Spacing inconsistente, alignment off, experiencia no premium |
| **cosmetic** | Detalles visuales menores, no afectan funcionalidad ni usabilidad |

## Referencias cruzadas

- Documento maestro: `docs/core/00_documento_maestro_requerimientos.md`
- Instrucción de responsive: `.github/instructions/responsive.instructions.md`
- Instrucción de componentes: `.github/instructions/react-components.instructions.md`
- Prompt de auditoría: `.github/prompts/create-responsive-audit.prompt.md`
- Agente que invoca este skill: `.github/agents/responsive.agent.md`
- Skill complementario: `qa-tester` (cuando la auditoría es parte de QA completo)
