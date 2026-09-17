# Plan de implementación y lanzamiento: Home administrable

Fecha: 2026-09-16. Estado: implementación local y esquema de development realizados; activación de producción pendiente.

Referencias: [especificación](../specs/2026-09-16-home-content-seo-design.md), [ADR-006](../../architecture/ADR-006_home-content-ssr.md), [guía de despliegue](../../deployment/home-ssr.md).

## P0 — Arquitectura elegida

- [x] Revisar rutas, Hero, SEOHead, i18n, permisos, build y Appwrite.
- [x] Verificar que el Site de development usa adaptador React estático.
- [x] Incorporar la prioridad posterior del usuario: resultado SSR en producción; mantener Site para pruebas de administración y lectura en navegador.
- [x] Elegir Node + Vite SSR para Home completa, sin migrar catálogo, portal ni administración.
- [x] Documentar decisiones y operación en ADR-006.

Esta decisión sustituye la condición original de demostrar SSR en el Site estático. El servidor se valida localmente con los artefactos que usará Nginx; no se modifica el adaptador de Sites.

## P1 — Contrato y persistencia

- [x] Crear `src/lib/homeContent.js`: campos, límites, defaults, validación, idioma, canonical, imagen y serialización segura.
- [x] Añadir `home_content` a ambos manifiestos Appwrite y configuración pública.
- [x] Crear alta idempotente `scripts/seed-home-content.mjs` con proyecto explícito y validación del esquema existente.
- [x] Inicializar `home_content/home` en `omzone-dev`, sin cambiar settings ni slides.
- [x] Comprobar permisos reales con fixtures: lectura pública, update solo admin/root, create/delete denegados a sesiones de usuario; eliminar fixtures.
- [ ] Aplicar el alta selectiva a `omzone` durante el lanzamiento de producción.

## P2 — Editor administrativo

- [x] Conservar `/admin/hero-slides` y sus guards.
- [x] Incorporar pestañas Contenido/SEO, campos EN/ES, imagen social y vista previa.
- [x] Guardar el documento completo en una actualización, con validación de ambas pestañas, feedback y prevención de doble envío.
- [x] Conservar cambios ante errores; indicar modificaciones pendientes y ofrecer recarga del documento publicado.
- [x] Avisar antes de abandonar cambios por navegación, Back/Forward o recarga; usar un router con soporte de bloqueo.
- [x] Mantener operaciones independientes del carrusel y registrar la publicación con el cliente de auditoría existente.
- [x] Actualizar traducciones y ayuda administrativa EN/ES.

La edición concurrente usa último guardado exitoso; no se añaden borradores ni una promesa de control atómico de versiones.

## P3 — Renderer, hidratación y errores

- [x] Compartir providers entre cliente y servidor; retirar accesos a `window` al evaluar AuthContext y hacer determinista el primer render.
- [x] Crear entrada `src/entry-server.jsx`; usar el hoisting nativo de metadatos de React 19 y Helmet 3.
- [x] Leer públicamente Appwrite por solicitud de Home con timeout y datos únicos para body/head/bootstrap.
- [x] Hidratar el HTML con los mismos datos; revalidar al entrar desde navegación SPA.
- [x] Eliminar metadatos estáticos duplicados de la plantilla al inyectar SSR y al iniciar el modo SPA.
- [x] Usar `no-store`; responder 503 + Retry-After con último contenido válido/defaults si falla la lectura.
- [x] Comprobar escape de texto/JSON y ausencia de credenciales en el HTML.
- [x] Separar builds estático, SSR development y SSR producción; compartir build ID cliente/servidor.

## P4 — Idiomas y SEO

- [x] Definir `/` EN y `/es` ES, independientemente de localStorage; normalizar `/es/`.
- [x] Generar title, description, canonical, OpenGraph, Twitter y hreflang de los valores publicados.
- [x] Adaptar logo, navegación, selector de idioma y footer; Home usa navegación de documento donde corresponde.
- [x] Añadir `/es` al sitemap conservando entradas anteriores y actualizar su generador.
- [x] Configurar `noindex` por defecto en el proceso de pruebas y origen público explícito.

## P5 — Verificación

Pruebas reproducibles:

```sh
npm run build:ssr
npm run test:home
node tests/home-browser.mjs
node tests/home-appwrite.mjs
```

`home-browser.mjs` utiliza fixtures de red aislados para probar React y el editor. `home-appwrite.mjs` verifica permisos sobre development con usuarios/documentos temporales; no altera `home`. La guía explica `CHROME_BIN` cuando se usa un navegador instalado.

- [x] Suite HTTP con renderer real: EN/ES, head único, publicación sin rebuild, timeout, fallback, caracteres especiales, HEAD, redirecciones y fallback SPA.
- [x] Navegador: hidratación sin errores, idioma de URL, permisos de ruta, pestañas, validación, error de guardado, publicación y ancho móvil.
- [x] Appwrite real: roles y limpieza de fixtures.
- [x] React Doctor sobre cambios; analizar diagnósticos y separar advertencias de complejidad preexistente.
- [ ] Tras publicar el código en el flujo habitual, comprobar el panel del Site activo y el resultado de la compilación automática de Appwrite.

## P6 — Preparación y activación en producción

- [x] Entregar plantillas `deploy/nginx-home.conf` y `deploy/omzone-home.service`.
- [x] Documentar variables, comandos, artefactos, permisos del proceso, health check y rollback.
- [ ] Confirmar en VPS usuario, rutas, Node, virtual host, TLS y gestor del proceso; adaptar plantillas.
- [ ] Respaldar release/configuración anterior.
- [ ] Ejecutar alta idempotente selectiva contra proyecto `omzone`.
- [ ] Construir `npm run build:production` y trasladar cliente/servidor del mismo build junto con dependencias de ejecución.
- [ ] Arrancar Node, comprobar `/healthz` y Home; configurar proxy de Nginx exclusivamente para `/` y `/es`.
- [ ] Ejecutar `nginx -t`, recargar y verificar desde fuera del VPS.
- [ ] Comprobar ausencia de noindex/caché HTML, canonical/idiomas, imagen pública, sitemap y navegación existente.
- [ ] Publicar un cambio editorial controlado y verificar body/head en HTTP sin rebuild; restaurar el texto aprobado.

Estas casillas corresponden a operaciones reales de lanzamiento. La preparación local no equivale a haberlas ejecutado en el VPS.

## P7 — Criterios de cierre

La implementación queda validada cuando las suites pasan y los artefactos cliente/servidor se construyen correctamente. El lanzamiento queda cerrado solo al comprobar el dominio de producción con el procedimiento anterior. No es suficiente copiar `dist` ni observar el DOM después de ejecutar JavaScript.

Los resultados se registran en [evidencia de implementación](../../deployment/home-ssr-verification.md). Las limitaciones conocidas son el Site estático sin SSR, último guardado ante ediciones simultáneas y ausencia de acceso/configuración del VPS en el repositorio.
