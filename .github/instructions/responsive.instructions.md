---
description: "Usar cuando se implemente o audite responsive en componentes React de OMZONE: breakpoints, layouts, touch, overflow, tablas, modales, navegación."
applyTo: "src/**/*.jsx,src/**/*.js,src/**/*.css"
---

# Convenciones Responsive — OMZONE

## 1. Enfoque

| Clave | Valor |
|---|---|
| Metodología | **Mobile-first** — escribir clases base para móvil, agregar breakpoints para pantallas mayores |
| Framework CSS | TailwindCSS |
| Objetivo | Experiencia premium en TODOS los dispositivos — móvil no es versión degradada |

---

## 2. Breakpoints de referencia

| Token | Tailwind | Ancho mínimo | Dispositivo típico |
|---|---|---|---|
| base | (sin prefix) | 0px | Móvil pequeño (iPhone SE, 375px) |
| `sm` | `sm:` | 640px | Móvil grande |
| `md` | `md:` | 768px | Tablet vertical |
| `lg` | `lg:` | 1024px | Tablet horizontal / laptop |
| `xl` | `xl:` | 1280px | Desktop |
| `2xl` | `2xl:` | 1536px | Desktop ancho |

### 2.1 Breakpoints obligatorios de prueba
Toda vista debe verificarse en al menos estos 4 anchos:
- **375px** — móvil pequeño (iPhone SE)
- **768px** — tablet vertical (iPad)
- **1024px** — laptop / tablet horizontal
- **1280px** — desktop estándar

---

## 3. Reglas de layout por superficie

### 3.1 Sitio público

| Componente | Móvil (base) | Tablet (md) | Desktop (lg+) |
|---|---|---|---|
| Hero | Full-width, imagen apilada sobre texto | Imagen lado a lado con texto | Layout completo con espacio |
| Grid de experiencias | 1 columna | 2 columnas | 3 columnas |
| Detalle de experiencia | Stack vertical | 2 columnas (contenido + sidebar) | Igual + más espacio |
| Galería | Swiper horizontal | Grid 2 col | Grid 3 col |
| Checkout | Stack vertical | 2 col (form + resumen) | Igual + max-width centrado |
| Navbar | Hamburger + drawer | Igual | Links visibles + CTA |
| Footer | Stack vertical | 2-3 columnas | 4 columnas |

### 3.2 Panel admin

| Componente | Móvil (base) | Tablet (md) | Desktop (lg+) |
|---|---|---|---|
| Sidebar | Drawer off-canvas (toggle) | Sidebar colapsada (icons) | Sidebar expandida |
| Tablas | Cards apiladas o scroll horizontal | Tabla con columnas reducidas | Tabla completa |
| Formularios | 1 columna | 1-2 columnas | 2 columnas |
| Dashboard | Cards apiladas | Grid 2 col | Grid 3-4 col |
| Filtros | Colapsable (toggle "Filtros") | Inline parcial | Inline completo |
| Acciones de fila | Menú contextual (tap) | Botones inline | Botones inline |

### 3.3 Portal de cliente

| Componente | Móvil (base) | Tablet (md) | Desktop (lg+) |
|---|---|---|---|
| Dashboard | Cards apiladas | Grid 2 col | Grid 3 col |
| Lista de órdenes | Cards verticales | Tabla simple | Tabla completa |
| Ticket | Full-width con QR centrado | Card con info lateral | Igual + más espacio |
| Perfil | Formulario 1 col | Formulario 1-2 col | Formulario 2 col + sidebar |
| Navegación | Bottom tabs o hamburger | Sidebar | Sidebar expandida |

---

## 4. Patrones de grid responsive

### 4.1 Grid de cards (experiencias, addons, paquetes)
```html
<!-- Mobile: 1 col, Tablet: 2 col, Desktop: 3 col -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <!-- cards -->
</div>
```

### 4.2 Layout de detalle (contenido + sidebar)
```html
<!-- Mobile: stack, Desktop: 2 col -->
<div class="flex flex-col lg:flex-row gap-6 lg:gap-10">
  <main class="flex-1"><!-- contenido principal --></main>
  <aside class="w-full lg:w-80 lg:flex-shrink-0"><!-- sidebar --></aside>
</div>
```

### 4.3 Formulario de 2 columnas
```html
<!-- Mobile: 1 col, Desktop: 2 col -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div><!-- campo --></div>
  <div><!-- campo --></div>
  <div class="md:col-span-2"><!-- campo ancho completo --></div>
</div>
```

---

## 5. Reglas de tipografía responsive

| Elemento | Móvil (base) | Tablet (md) | Desktop (lg+) |
|---|---|---|---|
| H1 (Hero title) | `text-2xl` | `text-3xl` | `text-4xl md:text-5xl` |
| H2 (Section title) | `text-xl` | `text-2xl` | `text-3xl` |
| H3 (Card title) | `text-lg` | `text-lg` | `text-xl` |
| Body | `text-base` (16px) | `text-base` | `text-base` |
| Small/caption | `text-sm` (14px) | `text-sm` | `text-sm` |

### 5.1 Reglas estrictas
- **Mínimo 14px** (`text-sm`) para cualquier texto legible en móvil.
- **Mínimo 16px** (`text-base`) para body text en móvil (previene zoom en iOS).
- Títulos deben reducirse elegantemente, no truncarse bruscamente.
- Usar `line-clamp-N` para controlar overflow de texto largo en cards.

---

## 6. Imágenes responsive

### 6.1 Patrón de imagen con aspect ratio
```html
<!-- Contenedor con aspect ratio fijo + imagen cover -->
<div class="aspect-[4/3] overflow-hidden rounded-lg">
  <img
    src={url}
    alt="Descripción accesible"
    class="w-full h-full object-cover"
    loading="lazy"
  />
</div>
```

### 6.2 Reglas de imágenes
- Siempre usar `object-cover` para mantener proporciones (no `object-contain` para fotos).
- Siempre definir `aspect-ratio` en el contenedor (no depender del tamaño natural de la imagen).
- Agregar `loading="lazy"` para imágenes below the fold.
- Alt text descriptivo SIEMPRE (accesibilidad + SEO).
- Usar Appwrite preview API para servir tamaños optimizados por breakpoint.

---

## 7. Touch y interactividad móvil

### 7.1 Touch targets
- **Mínimo 44x44px** para cualquier elemento interactivo (botones, links, checkboxes).
- En Tailwind: `min-h-[44px] min-w-[44px]` o padding suficiente.
- Espacio entre targets: mínimo 8px para evitar taps accidentales.

### 7.2 Hover vs Touch
- **Nunca** depender de hover como único medio de interacción.
- Dropdowns: usar click/tap como trigger, no hover-only.
- Tooltips: agregar alternativa touch (tap to show).
- Acciones de fila en tablas: menú contextual en vez de botones visibles solo con hover.

### 7.3 Teclado virtual
- Formularios: asegurar que el CTA principal sea visible cuando el teclado está abierto.
- Usar `scroll-margin-bottom` o posicionar CTA como sticky bottom.
- Input types correctos: `type="email"`, `type="tel"`, `inputmode="numeric"` para mostrar teclado apropiado.

---

## 8. Tablas responsive

### 8.1 Estrategia principal: cards en móvil
```jsx
{/* Desktop: tabla | Móvil: cards */}
<div className="hidden md:block">
  <table>...</table>
</div>
<div className="md:hidden space-y-3">
  {data.map(item => <MobileCard key={item.$id} data={item} />)}
</div>
```

### 8.2 Estrategia alternativa: scroll horizontal controlado
```html
<div class="overflow-x-auto -mx-4 px-4">
  <table class="min-w-[600px] w-full">...</table>
</div>
```
- Solo usar cuando las cards no aplican (datos tabulares puros).
- Agregar indicador visual de scroll (sombra lateral o hint).

### 8.3 Columnas ocultas
- Ocultar columnas secundarias en móvil con `hidden md:table-cell`.
- Nunca ocultar la columna de acciones ni el identificador principal.

---

## 9. Modales y drawers responsive

### 9.1 Modales
```html
<!-- Mobile: full-screen | Desktop: centered -->
<div class="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
            w-full md:w-auto md:max-w-lg md:rounded-xl
            bg-white p-4 md:p-6 overflow-y-auto max-h-screen md:max-h-[85vh]">
  <!-- contenido -->
</div>
```

### 9.2 Reglas de modales
- En móvil: full-screen o bottom sheet, nunca modal flotante pequeño.
- Botón de cerrar siempre visible y tocable (esquina superior, >= 44x44px).
- Contenido scrollable si excede la altura.
- Backdrop dismissable (click fuera cierra).
- Prevenir scroll del body cuando el modal está abierto.

### 9.3 Drawers (sidebar)
```html
<!-- Drawer off-canvas para sidebar en móvil -->
<aside class="fixed inset-y-0 left-0 w-64 bg-white transform -translate-x-full transition-transform
             lg:relative lg:translate-x-0">
  <!-- contenido del sidebar -->
</aside>
```

---

## 10. Navegación responsive

### 10.1 Sitio público
- Móvil: Hamburger → drawer con links + CTA.
- Desktop: Links horizontales + CTA.
- Logo siempre visible.

### 10.2 Admin
- Móvil: Drawer off-canvas con toggle (hamburger en topbar).
- Tablet: Sidebar colapsada (solo iconos).
- Desktop: Sidebar expandida (iconos + labels).

### 10.3 Portal cliente
- Móvil: Bottom tabs o hamburger.
- Desktop: Sidebar o top navigation.

---

## 11. Overflow prevention

### 11.1 Reglas anti-overflow
- Nunca usar `width` fijo en px sin `max-width: 100%`.
- Imágenes: `max-w-full` siempre.
- Text content: `break-words` si puede haber strings largos sin espacios.
- Containers: `overflow-hidden` o `overflow-x-auto` con indicador.
- Testing: verificar en 375px que no hay scroll horizontal.

### 11.2 Patrón de contenedor safe
```html
<div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- contenido con padding responsivo y max-width -->
</div>
```

---

## 12. Checklist responsive por componente

- [ ] Funciona a 375px sin overflow horizontal
- [ ] Funciona a 768px con layout adaptado
- [ ] Funciona a 1024px+ con layout completo
- [ ] Grids colapsan correctamente (multi-col → 1 col)
- [ ] Tipografía legible (body >= 16px en móvil)
- [ ] Imágenes con aspect-ratio + object-cover
- [ ] Touch targets >= 44x44px
- [ ] Sin dependencia de hover para funcionalidad
- [ ] Tablas tienen alternativa móvil (cards o scroll)
- [ ] Modales usables en móvil (full-screen o bottom sheet)
- [ ] Navegación funcional en el breakpoint
- [ ] CTA principal visible sin scroll excesivo
- [ ] Loading/error/empty states legibles en móvil
