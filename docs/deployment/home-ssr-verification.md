# Evidencia de implementación de Home SSR

Fecha: 2026-09-16. Entorno de verificación: Windows, Node 22.12.0, Vite 6.4.1, React 19; navegador Edge mediante Puppeteer. Las pruebas de base de datos usaron únicamente `omzone-dev`.

## Resultados

| Comprobación | Resultado |
| --- | --- |
| `npm run build:ssr` | Cliente y servidor compilan con proyecto `omzone-dev`. La plantilla estática incluye noindex. |
| `npm run build:production` | Cliente y servidor compilan en modo `prod`, proyecto `omzone`; conserva las advertencias de tamaño de chunks existentes. |
| `npm run test:home` | 11 pruebas aprobadas: contrato bilingüe, límites, imagen, normalización, serialización, HTTP SSR, publicación sin rebuild, errores/timeout, escape y rutas. |
| `node tests/home-browser.mjs` con `CHROME_BIN` | Aprobado: hidratación EN/ES, metadatos únicos, preferencia contraria en localStorage, regreso desde About y enlaces de autenticación, guards client/operator, editor admin, pestañas, bloqueo de Atrás con cambios, validación, fallo de guardado, publicación y ancho móvil. |
| `node tests/home-appwrite.mjs` | Permisos reales aprobados: anónimo/client/operator no pueden actualizar; admin/root sí; create/delete denegados a todos estos clientes. Usuarios y documentos temporales eliminados. |
| Alta inicial y repetición del seed | Colección/documento creados en development; segunda ejecución conserva contenido existente. |
| `npm run test:docs-search` | Aprobado; ayuda EN/ES e índices regenerados. |
| React Doctor, archivos nuevos de editor/SSR/router | 100/100, sin incidencias, después de añadir fallback del router. |
| React Doctor, diff completo | Sin errores; tres advertencias de complejidad en SupportWidget, Navbar y el gestor de slides existentes. No se realizó una refactorización general de esos componentes. |
| Revisión de secretos en artefactos | Se buscaron valores sensibles de los archivos de entorno en JS/HTML/JSON de cliente y servidor; sin coincidencias. Los valores no se registraron. |

Las pruebas HTTP/browser de publicaciones cambiantes utilizan fixtures aislados: cambian el documento servido por la API de prueba dentro del mismo proceso y con los mismos assets. No escriben sobre contenido editorial real. Las pruebas de permisos usan usuarios y documentos temporales en Appwrite, no mocks, sin modificar `home`.

## Lectura real de development

El handler compilado consultó públicamente `home_content/home` de `omzone-dev`, sin API key. Resultados observados:

| Ruta | HTTP | H1 inicial | Title inicial | Tiempo de una muestra |
| --- | --- | --- | --- | --- |
| `/` | 200 | Experiences in Puerto Vallarta | Experiences in Puerto Vallarta — OMZONE | 344 ms |
| `/es` | 200 | Experiencias en Puerto Vallarta | Experiencias en Puerto Vallarta — OMZONE | 113 ms |

Ambas respuestas incluyeron `Cache-Control: no-store`. Estos tiempos son muestras locales, no un SLA ni medición de capacidad. Después se arrancó `server/index.mjs` con el build de development: `/healthz`, `/`, `/es` y `/admin/hero-slides` respondieron 200; el proceso emitió `X-Robots-Tag: noindex, nofollow` y se detuvo tras la comprobación.

## Lo que requiere el lanzamiento

Estas comprobaciones se realizaron antes de publicar el código en `main`. No se alteró el adaptador del Site ni se ejecutaron migraciones/despliegues contra producción. La implementación está preparada para construir y desplegar; aún debe activarse la colección en `omzone`, instalar el proceso Node y conectar Nginx en el VPS real.

El procedimiento verificable, las plantillas y el rollback están en [home-ssr.md](home-ssr.md). Solo después de aplicar ese procedimiento se podrá certificar el HTML y las cabeceras de `https://omzone.com/` y `/es` en producción. El Site de development seguirá siendo una SPA, aunque el editor y los textos dinámicos funcionen allí tras publicar el código.
