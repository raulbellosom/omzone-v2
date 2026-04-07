# TASK-051: Landing page completa — hero, secciones editoriales y CTA

## Objetivo

Reescribir la página de inicio de OMZONE transformándola de un placeholder de texto centrado a una landing page premium con hero visual impactante, secciones editoriales que comunican la propuesta de valor, preview de tipos de experiencia y CTA hacia el catálogo. Al completar esta tarea, un visitante ve una primera impresión aspiracional que transmite la identidad wellness de OMZONE sin parecer un marketplace genérico.

## Contexto

- **Fase:** A — Landing & páginas públicas (post-fase 15)
- **Documento maestro:** Sección 3.1 (Sitio público), identidad premium wellness
- **ADR relacionados:** ADR-003 (Separación editorial/comercial), ADR-004 (Experience-first)
- **Estado actual:** `src/pages/public/HomePage.jsx` es un placeholder con solo "OMZONE" centrado + texto i18n genérico. Sin imágenes, sin hero, sin secciones, sin CTAs.
- **Instrucciones de contenido:** `.github/instructions/content.instructions.md` — voz premium, narrativa sensorial, wellness
- **Restricciones editoriales:** No precios, no testimoniales, no urgencia agresiva, no estética de marketplace

La landing es la primera impresión de OMZONE. Debe comunicar en 5 segundos: "Esto es una plataforma de experiencias wellness premium en Puerto Vallarta". El diseño debe ser editorial, aspiracional y mobile-first.

## Alcance

Lo que SÍ incluye esta tarea:

1. **Hero section** con imagen de fondo a pantalla completa (desde bucket `public-resources` o imagen libre de derechos wellness/naturaleza). Título evocador, subtítulo y CTA principal hacia `/experiences`.
2. **Sección "Discover"** — preview de tipos de experiencia (sessions, immersions, retreats, stays) con thumbnails o iconos, título descriptivo y breve texto. Cada tipo enlaza a `/experiences` con filtro preseleccionado o como ancla visual.
3. **Sección "Why OMZONE"** — 3-4 pillars de propuesta de valor con icono/imagen y texto (ej: curated experiences, Puerto Vallarta setting, transformative wellness, premium service). Sin testimoniales.
4. **Sección CTA final** — bloque visual con imagen de fondo, texto invitador y botón hacia `/experiences`.
5. **Textos bilingües** — todos los textos en EN/ES via i18n keys en `landing.json`.
6. **Imágenes** — uso de `getPublicImageUrl()` para imágenes del bucket `public-resources`. Si no hay imágenes disponibles, usar imágenes libres de Unsplash/Pexels relacionadas con wellness, naturaleza, Puerto Vallarta.
7. **Responsive** — mobile-first. Hero adapta tipografía y overlay. Secciones colapsan a 1 columna en mobile.
8. **Componentes modulares** — cada sección como componente independiente en `src/components/public/home/`.

## Fuera de alcance

- Precios o pricing visible en la landing.
- Testimoniales o reviews.
- Slider/carrusel de experiencias dinámico desde BD.
- Blog/publicaciones recientes.
- Formulario de newsletter o suscripción.
- Animaciones avanzadas (parallax, scroll-triggered).
- Integración con analytics.

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)
- [x] Frontend público

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| Ninguna | — | Landing es estática/i18n, no consume datos de BD |

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | Página completamente estática |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `public-resources` | leer | Hero image, imágenes decorativas de secciones |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `HomePage` | público | reescribir | Reescritura completa de la página |
| `HeroSection` | público | crear | Hero a pantalla completa con overlay, título y CTA |
| `DiscoverSection` | público | crear | Grid de tipos de experiencia con thumbnails |
| `WhySection` | público | crear | Propuesta de valor en 3-4 pillars |
| `CTASection` | público | crear | Bloque final con imagen de fondo y CTA |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useLanguage` | usar existente | Textos i18n |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/` | público | ninguno | Landing principal |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver landing page | ✅ | ✅ | ✅ | ✅ | ✅ |

## Flujo principal

1. El visitante llega a `/`.
2. Ve un hero a pantalla completa con imagen wellness/naturaleza, título evocador y botón "Explore Experiences".
3. Al scrollear, ve la sección "Discover" con 4 tipos de experiencia (sessions, immersions, retreats, stays) como tarjetas visuales.
4. Continúa scrolleando a la sección "Why OMZONE" con 3-4 pillars de propuesta de valor.
5. Al final, un CTA con imagen de fondo y botón hacia `/experiences`.
6. Toda la página es bilingüe (EN/ES) según el idioma seleccionado.

## Criterios de aceptación

- [ ] La página `/` muestra un hero a pantalla completa con imagen de fondo, título y CTA.
- [ ] El hero tiene overlay oscuro semitransparente para legibilidad del texto sobre la imagen.
- [ ] El CTA principal del hero navega a `/experiences`.
- [ ] La sección "Discover" muestra 4 tipos de experiencia con thumbnail/icono, título y descripción breve.
- [ ] La sección "Why OMZONE" muestra 3-4 pillars de propuesta de valor con icono y texto.
- [ ] La sección CTA final tiene imagen de fondo y botón hacia `/experiences`.
- [ ] Todos los textos están en i18n (EN/ES) via keys en `landing.json`.
- [ ] Las imágenes se cargan desde `public-resources` bucket usando `getPublicImageUrl()` o son imágenes libres referenciadas estáticamente.
- [ ] El hero se adapta a mobile: tipografía reduce tamaño, overlay se mantiene, CTA es tocable (min 44px).
- [ ] Las secciones colapsan a 1 columna en mobile (< 640px).
- [ ] No aparecen precios ni testimoniales en ninguna parte de la landing.
- [ ] El tono de los textos es premium, sensorial y wellness (no marketplace genérico).
- [ ] La página carga sin errores y `npm run build` pasa limpio.
- [ ] `SEOHead` tiene title, description y canonical para la homepage.

## Dependencias

- **TASK-016:** Public layout — provee `PublicLayout` (header + footer) como shell.
- **TASK-037:** Storage buckets — provee bucket `public-resources` configurado. Si no hay imágenes subidas, usar imágenes estáticas libres.
- **TASK-046:** i18n — provee estructura de archivos `landing.json` EN/ES.

## Bloquea a

- **TASK-059:** Seed data — la landing debe estar lista para screenshots y demo.
- **TASK-061:** Responsive audit — se audita la landing.

## Riesgos y notas

- Si el bucket `public-resources` no tiene imágenes wellness subidas, se deben usar imágenes libres (Unsplash/Pexels) como placeholder inicial. Documentar IDs o URLs usadas.
- Los textos deben ser redactados con el tono de `.github/instructions/content.instructions.md` — usar el copywriter agent para generar copy premium.
- La sección "Discover" puede evolucionar a dinámmica (desde BD) en el futuro, pero en esta task es estática i18n.
