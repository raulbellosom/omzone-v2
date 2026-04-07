# TASK-052: About page completa — misión, ubicación y filosofía wellness

## Objetivo

Reescribir la página "About" de OMZONE transformándola de un placeholder de un párrafo a una página editorial completa con hero visual, secciones de misión/visión, referencia a la ubicación en Puerto Vallarta / Bahía de Banderas, filosofía wellness y CTA hacia experiencias. Al completar esta tarea, un visitante entiende quién es OMZONE, dónde opera y qué representa.

## Contexto

- **Fase:** A — Landing & páginas públicas (post-fase 15)
- **Documento maestro:** Sección 3.1 (Sitio público), identidad de marca
- **Estado actual:** `src/pages/public/AboutPage.jsx` es placeholder — título + 1 párrafo + "Full content coming soon" + link a experiencias.
- **Instrucciones de contenido:** `.github/instructions/content.instructions.md`
- **SEO:** `.github/instructions/seo.instructions.md` — posicionamiento local Puerto Vallarta, Bahía de Banderas, Riviera Nayarit

## Alcance

Lo que SÍ incluye esta tarea:

1. **Hero section** con imagen de fondo (paisaje Puerto Vallarta / naturaleza wellness) y título "About OMZONE" con subtítulo evocador.
2. **Sección Misión/Visión** — qué es OMZONE, por qué existe, qué busca ofrecer. Texto editorial premium.
3. **Sección Ubicación** — referencia visual y textual a Puerto Vallarta, Bahía de Banderas, Riviera Nayarit. Puede incluir imagen de la zona. Relevante para SEO local.
4. **Sección Filosofía** — pilares del bienestar que guían las experiencias: transformación, intención, calma, conexión. Con iconos o imágenes.
5. **CTA final** — bloque que invita a explorar experiencias.
6. **Textos bilingües** — EN/ES via i18n.
7. **SEO optimizado** — meta tags con keywords locales (Puerto Vallarta, wellness experiences, etc.).
8. **Responsive** — mobile-first, secciones apiladas en mobile.

## Fuera de alcance

- Información del equipo con fotos/nombres reales.
- Formulario de contacto (TASK-053).
- Timeline de historia de la empresa.
- Mapa interactivo de Google Maps.
- Blog o publicaciones relacionadas.

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)
- [x] Frontend público

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| Ninguna | — | Página estática i18n |

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | — |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `public-resources` | leer | Hero image, imágenes de ubicación/filosofía |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `AboutPage` | público | reescribir | Reescritura completa |
| `AboutHero` | público | crear | Hero con imagen de fondo |
| `MissionSection` | público | crear | Sección misión/visión |
| `LocationSection` | público | crear | Sección ubicación PV |
| `PhilosophySection` | público | crear | Pilares de filosofía wellness |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useLanguage` | usar existente | Textos i18n |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/about` | público | ninguno | Página About |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver página About | ✅ | ✅ | ✅ | ✅ | ✅ |

## Flujo principal

1. El visitante navega a `/about`.
2. Ve hero con imagen de fondo y título "About OMZONE".
3. Lee la misión y visión de OMZONE.
4. Ve referencia visual a Puerto Vallarta como destino.
5. Lee la filosofía wellness con pilares visuales.
6. CTA final hacia `/experiences`.

## Criterios de aceptación

- [ ] La página `/about` muestra un hero con imagen de fondo y título.
- [ ] La sección de misión/visión comunica claramente qué es OMZONE y por qué existe.
- [ ] La sección de ubicación menciona Puerto Vallarta, Bahía de Banderas y/o Riviera Nayarit con imagen.
- [ ] La sección de filosofía muestra 3-4 pilares con icono/imagen y texto.
- [ ] El CTA final navega a `/experiences`.
- [ ] Todos los textos están en i18n (EN/ES).
- [ ] `SEOHead` incluye title con "About OMZONE", description con keywords locales (Puerto Vallarta, wellness).
- [ ] El hero se adapta a mobile con tipografía reducida.
- [ ] Las secciones colapsan a 1 columna en mobile.
- [ ] El tono es editorial premium, no corporativo genérico.
- [ ] La página carga sin errores y `npm run build` pasa limpio.
- [ ] No hay placeholder text visible ("coming soon", "TBD").

## Dependencias

- **TASK-016:** Public layout — provee `PublicLayout`.
- **TASK-046:** i18n — provee estructura i18n.

## Bloquea a

- **TASK-061:** Responsive audit.

## Riesgos y notas

- Textos deben ser redactados con voz premium wellness. Usar copywriter agent.
- Las imágenes de Puerto Vallarta deben ser libres de derechos o del bucket `public-resources`.
- SEO local es importante: incluir menciones a Puerto Vallarta, Riviera Nayarit en los textos y meta tags.
