---
description: "Auditar responsive design de una vista o componente OMZONE. Evalúa breakpoints, touch, overflow, tablas, modales y genera reporte con issues RESP-NNN."
agent: "responsive"
argument-hint: "Vista o componente a auditar (ej: 'ExperienceDetailPage', 'AdminDashboard', 'CheckoutFlow')"
tools: [read, search]
---

Quiero que realices una **auditoría de responsive design** para OMZONE.

---

## Target de la auditoría

- **Vista / componente:** {{TARGET_VIEW}}
- **Superficie:** [pública / admin / client portal]

---

## Contexto del proyecto

| Clave | Valor |
|---|---|
| Proyecto | OMZONE — plataforma de experiencias wellness premium |
| Frontend | React + Vite + TailwindCSS |
| Enfoque | Mobile-first, experiencia premium/editorial |
| Estética | Wellness premium — nunca marketplace genérico |

---

## Breakpoints de evaluación

Evalúa en todos estos breakpoints (TailwindCSS defaults):

| Breakpoint | Ancho | Dispositivo típico |
|---|---|---|
| `xs` | < 640px | Móvil portrait |
| `sm` | 640px | Móvil landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Desktop grande |

---

## Áreas de evaluación

### 1. Layout y grid
- [ ] El layout se adapta correctamente en cada breakpoint
- [ ] No hay contenido cortado ni overflow horizontal
- [ ] Los grids colapsan de multi-columna a single-column en mobile
- [ ] El spacing es proporcional al viewport
- [ ] No hay elementos con ancho fijo que rompan en pantallas pequeñas

### 2. Tipografía
- [ ] Los tamaños de texto son legibles en mobile (mínimo 14px body)
- [ ] Los headings escalan proporcionalmente
- [ ] No hay líneas de texto demasiado largas en desktop (max ~75 caracteres)
- [ ] El line-height es adecuado para cada tamaño

### 3. Imágenes y media
- [ ] Las imágenes son responsive (max-width: 100%)
- [ ] Los aspect ratios se mantienen
- [ ] No hay imágenes que se pixelan al agrandarse
- [ ] Los hero images / banners se adaptan sin recortar contenido importante

### 4. Navegación
- [ ] El menú principal colapsa a hamburger/drawer en mobile
- [ ] Los breadcrumbs se truncan o adaptan en pantallas pequeñas
- [ ] Los tabs/pills hacen scroll horizontal si no caben
- [ ] El bottom navigation (si existe) es accesible con el pulgar

### 5. Tablas y datos
- [ ] Las tablas hacen scroll horizontal con indicador visual en mobile
- [ ] O se transforman a card layout en mobile
- [ ] Los headers de tabla son visibles/accesibles
- [ ] No hay tablas que rompan el layout en ningún breakpoint

### 6. Formularios
- [ ] Los inputs tienen tamaño táctil adecuado (mínimo 44x44px touch target)
- [ ] Los formularios de múltiples columnas colapsan a single-column en mobile
- [ ] Los selects y datepickers funcionan en mobile
- [ ] Los botones de acción son alcanzables con el pulgar

### 7. Modales y overlays
- [ ] Los modales se adaptan al viewport (no más grandes que la pantalla)
- [ ] En mobile, los modales se comportan como full-screen o bottom sheet
- [ ] El scroll dentro del modal funciona correctamente
- [ ] El botón de cerrar es accesible

### 8. Componentes interactivos
- [ ] Los hover states tienen equivalente para touch
- [ ] Los tooltips funcionan en mobile (tap en vez de hover)
- [ ] Los sliders/carousels son swipeable en touch
- [ ] Dropdowns no se salen del viewport

### 9. Experiencia editorial/premium
- [ ] La estética wellness premium se mantiene en todos los breakpoints
- [ ] Las galerías de experiencias se ven aspiracionales en mobile
- [ ] El checkout flow es fluido y confiable en mobile
- [ ] Las cards de experiencia mantienen jerarquía visual

### 10. Performance responsive
- [ ] No se cargan imágenes desktop en mobile
- [ ] Las animaciones no causan jank en mobile
- [ ] Los componentes pesados se renderizan condicionalmente si es necesario

---

## Formato del reporte

Para cada issue encontrado, reportar con este formato:

```markdown
### RESP-001: [Título descriptivo]

- **Severidad:** critical | major | minor | cosmetic
- **Breakpoint(s):** xs / sm / md / lg / xl / 2xl
- **Componente:** nombre del componente o archivo
- **Ubicación:** path/to/file.jsx (líneas aprox.)
- **Descripción:** qué falla y cómo se ve
- **Fix sugerido:** código o approach para corregir
```

### Severidades

| Nivel | Criterio |
|---|---|
| **critical** | Contenido inaccesible, funcionalidad rota, layout completamente destruido |
| **major** | Usabilidad degradada significativamente, overflow visible, touch targets inaccesibles |
| **minor** | Spacing inconsistente, alignment off, experiencia no premium |
| **cosmetic** | Detalles visuales menores, no afectan funcionalidad ni usabilidad |

---

## Output esperado

1. **Resumen ejecutivo** — tabla con total de issues por severidad y breakpoint
2. **Issues detallados** — cada uno con formato RESP-NNN arriba descrito
3. **Componentes sin issues** — lista de los que pasaron sin problemas
4. **Recomendaciones generales** — patrones recurrentes y mejoras sistémicas
