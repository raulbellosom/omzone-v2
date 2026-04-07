# TASK-045: Performance — image optimization, lazy loading, code splitting

## Objetivo

Implementar optimizaciones de performance en el sitio público de OMZONE: responsive image sizes via Appwrite Storage preview API, lazy loading de imágenes y componentes, code splitting por ruta con React.lazy + Suspense, bundle analysis, preload de recursos críticos y loading skeletons. Al completar esta tarea, el sitio público carga más rápido, consume menos bandwidth y ofrece mejor UX durante la carga.

## Contexto

- **Fase:** 14 — SEO, performance e i18n
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 14
- **Documento maestro:** Secciones:
  - **RNF-06:** Performance — SEO y experiencia real
- **Modelo de datos:** N/A — esta tarea es de frontend/infraestructura.
- **ADR relacionados:** Ninguno específico.

El sitio público usa imágenes de Appwrite Storage (experiences, publications, addons). Appwrite Storage provee preview API con parámetros `width`, `height` y `quality` que permite servir imágenes optimizadas.

## Alcance

Lo que SÍ incluye esta tarea:

1. Responsive image sizes via Appwrite Storage preview API:
   - Componente `OptimizedImage` que genera `srcSet` con múltiples tamaños
   - Tamaños estándar: thumbnail (200px), card (400px), medium (800px), hero (1200px), full (1600px)
   - Usa `<img srcset>` o `<picture>` para que el browser seleccione el tamaño óptimo
   - Fallback para browsers sin srcset support
2. Lazy loading de imágenes:
   - Imágenes below the fold usan `loading="lazy"` nativo
   - Para imágenes en galerías y secciones: IntersectionObserver-based lazy load
   - Placeholder skeleton mientras carga
3. Route-based code splitting:
   - Cada ruta principal usa `React.lazy()` + `<Suspense>`:
     - Admin routes: lazy loaded
     - Portal routes: lazy loaded
     - Public routes: home cargado directamente, resto lazy
   - `<Suspense fallback>` con loading skeleton o spinner
4. Bundle analysis:
   - Configurar `rollup-plugin-visualizer` o similar en Vite
   - Identificar y documentar los chunks más pesados
   - Verificar que no se importan librerías grandes innecesariamente
5. Preload de recursos críticos:
   - `<link rel="preload">` para fonts principales
   - `<link rel="preload">` para hero image de la home (si es estática)
   - `<link rel="preconnect">` para Appwrite endpoint (`aprod.racoondevs.com`)
6. Loading skeletons:
   - Componente `Skeleton` reutilizable (rectangle, circle, text lines)
   - Skeletons para: experience cards, experience detail, publication page, tables
   - Mostrar skeletons mientras se cargan datos asíncronos

## Fuera de alcance

- Service Worker / PWA.
- CDN setup.
- Image format conversion (WebP/AVIF server-side).
- Server-side rendering (SSR).
- Database query optimization.
- Caching strategies (HTTP cache headers — depende de Appwrite/server config).

## Dominio

- [x] Frontend público
- [x] Infraestructura

## Entidades / tablas implicadas

N/A — tarea de frontend, no modifica tablas.

## Atributos nuevos o modificados

N/A.

## Functions implicadas

Ninguna.

## Buckets / Storage implicados

| Bucket              | Operación          | Notas                  |
| ------------------- | ------------------ | ---------------------- |
| `experience_images` | leer (preview API) | Responsive image sizes |
| `publication_media` | leer (preview API) | Responsive image sizes |
| `addon_images`      | leer (preview API) | Responsive image sizes |
| `package_images`    | leer (preview API) | Responsive image sizes |

## Componentes frontend implicados

| Componente                 | Superficie      | Operación | Notas                                  |
| -------------------------- | --------------- | --------- | -------------------------------------- |
| `OptimizedImage`           | público + admin | crear     | Imagen con srcSet de múltiples tamaños |
| `Skeleton`                 | público + admin | crear     | Placeholder loading skeleton           |
| `ExperienceCardSkeleton`   | público         | crear     | Skeleton para card de experiencia      |
| `ExperienceDetailSkeleton` | público         | crear     | Skeleton para detalle de experiencia   |
| `PublicationSkeleton`      | público         | crear     | Skeleton para página de publicación    |
| `TableSkeleton`            | admin           | crear     | Skeleton para tablas de admin          |

## Hooks implicados

| Hook              | Operación         | Notas                                                     |
| ----------------- | ----------------- | --------------------------------------------------------- |
| `useImagePreview` | crear o modificar | Genera URL de preview con width/height/quality parameters |
| `useLazyLoad`     | crear             | IntersectionObserver hook para lazy loading               |

## Rutas implicadas

N/A — se modifican componentes existentes, no se crean rutas.

## Permisos y labels involucrados

N/A — cambios de performance no afectan permisos.

## Flujo principal

1. Desarrollador configura code splitting en el router con React.lazy + Suspense.
2. Desarrollador implementa `OptimizedImage` con srcSet para todas las imágenes de Appwrite.
3. Desarrollador reemplaza `<img>` directos por `<OptimizedImage>` en pages públicas.
4. Desarrollador agrega `loading="lazy"` a imágenes below the fold.
5. Desarrollador crea `Skeleton` components para estados de loading.
6. Desarrollador agrega preload hints para recursos críticos en `index.html`.
7. Desarrollador ejecuta bundle analysis y documenta resultados.

## Criterios de aceptación

- [x] El componente `OptimizedImage` genera srcSet con al menos 3 tamaños diferentes (400px, 800px, 1200px).
- [x] Las imágenes de experiencias, publicaciones, addons y paquetes usan `OptimizedImage` en lugar de `<img>` directo.
- [x] Las imágenes below the fold usan `loading="lazy"` o IntersectionObserver.
- [x] Las rutas admin están code-split: cargar la home admin no descarga todo el bundle admin.
- [x] Las rutas portal están code-split: separadas del bundle público.
- [x] Cada ruta lazy tiene un `<Suspense fallback>` con skeleton o loading indicator.
- [x] Hay skeletons para: experience card, experience detail, publication page.
- [x] Fonts principales están preloaded con `<link rel="preload">`.
- [x] El endpoint de Appwrite tiene `<link rel="preconnect">` en el head.
- [x] El build de Vite genera chunks separados por ruta (verificar con bundle analysis).
- [ ] La home page pública carga en menos de 3 segundos en 3G simulado (Lighthouse).
- [x] No hay imágenes cargando a full resolution cuando un tamaño más pequeño es suficiente.
- [x] Las imágenes muestran skeleton mientras cargan.
- [x] El bundle analysis se ejecuta y se documenta qué chunks existen y su tamaño.
- [ ] El LCP (Largest Contentful Paint) de la home mejora después de implementar preload de hero image.

## Validaciones de seguridad

- [ ] Las URLs de preview de Appwrite Storage no incluyen API keys ni tokens.
- [ ] El bundle analysis no se incluye en el build de producción (solo en dev).
- [ ] Los preload hints no apuntan a dominios externos inseguros.

## Dependencias

- **TASK-016:** Public layout — provee el shell público donde se aplican optimizaciones.
- **TASK-037:** Storage buckets — provee los buckets con preview API.

## Bloquea a

Ninguna directamente.

## Riesgos y notas

- **Appwrite preview API:** La preview API de Appwrite acepta `width`, `height`, `gravity`, `quality`, `output` como parámetros. Verificar qué formatos de salida soporta (jpeg, png, webp). Si soporta WebP, usarlo como formato preferido para srcSet.
- **Code splitting granularity:** No sobre-splitear. Las rutas principales (home, listing, detail) se cargan directamente o con prefetch. Las secciones admin y portal sí se lazy-loadean.
- **Lighthouse score:** El score depende de muchos factores. El objetivo es mejorar de forma medible, no alcanzar 100.
- **SPA limitations:** Sin SSR, el FCP y LCP dependen de la carga de JS. Code splitting ayuda pero no resuelve el problema fundamental. Si SEO/performance requiere SSR, es tarea futura.
- **Skeleton design:** Los skeletons deben reflejar la estructura real del contenido para no causar layout shift cuando el contenido carga. Usar dimensiones aproximadas.
