# ADR-006: Home administrable con SSR acotado y Nginx

Fecha: 2026-09-16. Estado: implementado; activación en VPS pendiente del despliegue.

El usuario priorizó el resultado en producción después de revisar que el Site de development usa un adaptador React estático. Se conserva ese Site para probar el panel y la lectura en navegador. La prueba de HTML inicial se realiza con el mismo proceso Node que se desplegará detrás de Nginx. No se declara SSR habilitado en el Site existente.

La implementación conserva React 19, Vite 6 y las rutas existentes. `src/entry-server.jsx` renderiza la Home completa con `StaticRouter`; React 19 coloca los metadatos en el head. Helmet 3 utiliza esta capacidad y no genera `context.helmet` en React 19. El navegador hidrata el mismo árbol con los datos serializados del servidor. El router cliente usa `createBrowserRouter` con las declaraciones existentes de `App`, para permitir bloquear navegación con cambios editoriales pendientes.

`server/index.mjs` sirve `/` en inglés y `/es` en español. Cada solicitud consulta públicamente `home_content/home`; no usa sesiones ni API keys. Una lectura produce H1, descripción, title, description, OpenGraph, Twitter, canonical, hreflang y bootstrap consistentes. Los cambios publicados se reflejan en la siguiente solicitud, sin rebuild. No hay caché HTML compartida; la última lectura válida solo es respaldo ante errores. Timeout de tres segundos; errores devuelven 503 y Retry-After, con contenido de respaldo. El fallback de emergencia no se presenta como publicación vigente con HTTP 200.

El documento publicado se mantiene separado de `settings` y `hero_slides`. Lectura pública; actualización por labels `admin`/`root`; sin create/delete desde sesiones de usuario. El alta inicial se hace con un script idempotente. Una publicación actualiza todos los campos EN/ES; el último guardado exitoso prevalece. No hay borradores ni bloqueo de edición concurrente.

Nginx sirve assets y SPA; únicamente las dos URLs de Home usan proxy al proceso Node. Se entregan `dist`, `dist-ssr`, `server`, `src/lib/homeContent.js` y dependencias de ejecución. `npm run build:production` carga el modo `prod` y comprueba el proyecto `omzone`. El build estándar sigue siendo estático para Sites. No se migra el resto de páginas a SSR.

Costes: un proceso Node supervisado, una lectura Appwrite por petición Home y despliegue coordinado de ambos bundles. No se usa un framework nuevo. El proyecto/endpoint están compilados junto con el cliente; `PUBLIC_SITE_URL`, `HOME_NOINDEX`, puerto y timeout son configuración del proceso. El renderer viene con `noindex` activado por defecto.

La guía y comandos operativos están en [Despliegue de Home SSR](../deployment/home-ssr.md). Esa guía distingue las comprobaciones locales de las necesarias en el VPS real.
