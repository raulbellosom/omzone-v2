# Home administrable y HTML inicial con contenido y SEO

Fecha: 2026-09-16

Estado: implementada y validada localmente; despliegue en VPS pendiente

Base de código revisada: `2e45180`

Plan asociado: [Plan de implementación](../plans/2026-09-16-home-content-seo.md)

## 1. Objetivo y resultado observable

Un administrador de OMZONE debe poder modificar el título y la descripción principal de la Home, además de sus metadatos SEO, desde el panel existente. Appwrite almacena el contenido y la siguiente visita recibe los valores publicados en el HTML inicial, sin ejecutar un build, hacer un push a GitHub o desplegar código por cada cambio editorial.

Al autorizar la implementación, el usuario priorizó producción. El panel y la lectura en navegador funcionan en el Site estático de development; el HTML inicial dinámico se valida con el proceso Node que se desplegará detrás de Nginx. El Site existente no ejecuta SSR. La implementación inicial requiere build y despliegue, además de adaptar cómo se sirve la Home. Esta decisión sustituye la condición inicial de habilitar SSR en ambos hosts; véase [ADR-006](../../architecture/ADR-006_home-content-ssr.md).

El criterio técnico es contenido rastreable en la respuesta HTTP, con metadatos coherentes y URLs accesibles. No se promete que Google indexe una página, conserve un determinado posicionamiento, utilice exactamente el título proporcionado o actualice sus resultados inmediatamente.

## 2. Qué está acordado y qué se propone

### Requerimientos expresados por el usuario

- Edición desde el panel administrativo de OMZONE, sin utilizar Appwrite Console como interfaz editorial.
- Integración dentro de la sección actual del Home Hero.
- Dos pestañas: **Contenido** y **SEO**.
- Edición periódica del título y subtítulo/descripción principal.
- Persistencia en Appwrite y actualización pública sin rebuild por cada cambio.
- Entrega de contenido y metadatos que favorezca su rastreo sin depender exclusivamente de JavaScript.
- Pruebas en development antes de llevar el comportamiento a producción.

### Decisiones propuestas para esta versión

Estas decisiones son parte de esta especificación y no se presentan como aprobaciones previas del usuario:

- Una entidad editorial dedicada, `home_content`, con un documento público de ID `home`.
- EN y ES obligatorios para los cuatro campos de texto: H1, descripción visible, título SEO y meta description.
- Guardado y publicación en una sola acción; sin borradores persistentes ni programación en esta versión.
- Home inglesa en `/` y española en `/es`; el resto del sitio conserva sus rutas actuales.
- Lectura fresca del documento en cada solicitud de HTML, sin caché compartida de Home en la primera versión.
- Objetivo de renderizado limitado a Home, conservando React y Vite siempre que la prueba de hosting lo permita.
- Imagen OpenGraph opcional compartida entre idiomas, seleccionada en la biblioteca multimedia existente.

No se introduce ejecución de servidor en el Appwrite Site estático. Se mantiene como entorno de pruebas del panel y de lectura en navegador.

## 3. Base comprobada

### Código

| Evidencia | Hallazgo |
| --- | --- |
| `src/main.jsx` | `createRoot`, BrowserRouter, providers de idioma/auth/Helmet/Query. |
| `src/pages/public/HomePage.jsx` | Compone Home y fija sus metadatos en inglés. |
| `src/components/public/home/HeroSection.jsx` | Textos centrales mediante `t()`; carrusel mediante `useHeroSlides()`. |
| `src/i18n/en/landing.json`, `src/i18n/es/landing.json` | Fuente actual de `home.hero.title`, `subtitle` y `cta`. |
| `src/hooks/useHeroSlides.js` | CRUD y lectura de slides; no controla el H1 global. |
| `src/pages/admin/HeroSlidesPage.jsx` | Pantalla administrativa existente en `/admin/hero-slides`. |
| `src/contexts/LanguageContext.jsx` | Idioma persistido en localStorage; inglés por defecto. |
| `src/contexts/AuthContext.jsx` | Accesos a `window` al evaluar el módulo; requiere adaptación si entra en un árbol SSR. |
| `src/components/common/SEOHead.jsx` | Metadatos administrados por Helmet después del montaje actual. |
| `src/lib/appwrite.js` | SDK web Databases, Account, Storage y Functions. |
| `appwrite.json` | Tablas y permisos versionados; no existe `home_content`. |
| `vite.config.js` | Build estático y mapeo de variables `APPWRITE_*`/`VITE_*`. |

### Entornos y comprobación remota de esta sesión

| Aspecto | Development | Producción |
| --- | --- | --- |
| Frontend | `https://omzone.sites.aprod.racoondevs.com` | `https://omzone.com`, según contexto/configuración |
| Hosting | Appwrite Site `omzone-v2` | VPS + Nginx, confirmado por el usuario |
| Proyecto Appwrite | `omzone-dev`, confirmado en variables del Site | `omzone`, según `.env.prod`; comprobar configuración efectiva antes del despliegue |
| Base | `omzone_db` | `omzone_db`, según configuración local |
| Despliegue | GitHub `main` → `npm run build` → `./dist` | Build y copia de `dist`, según el usuario |

La consulta remota a development encontró 37 tablas sin diferencias en los campos y permisos comparados con el manifiesto local, 7 buckets y las 19 Functions esperadas. Esto no certifica que el código desplegado de las Functions coincida con el repositorio.

`hero_slides` tiene lectura anónima; `settings` devuelve 401 para lectura anónima. Existen documentos `seo_default_*` en settings, pero Home no los consume. No se ampliarán los permisos de settings para resolver este requerimiento.

El Site usa framework `react`, adaptador `static`, runtime de build `node-21.0`, fallback `index.html`. El catálogo consultado de esta instancia ofrece únicamente `static` para `react` y `other`. La respuesta HTTP de Home contiene `#root` vacío y ningún H1.

El Site configura actualmente `VITE_SITE_URL=https://omzone.com`. Debe distinguirse el origen público de desarrollo del de producción al introducir metadatos por entorno.

No hay configuración operativa de Nginx versionada. La presencia de una cabecera HTTP `Server: nginx` en development no demuestra control directo sobre su enrutamiento interno.

## 4. Alcance

### Incluido

1. Ampliar `/admin/hero-slides` conservando su URL y permisos.
2. Formulario bilingüe de contenido y SEO, validación y guardado.
3. Entidad y lectura pública del contenido publicado.
4. HTML inicial de Home con H1, descripción y head consistentes.
5. Arranque de React sin reemplazar el contenido con valores antiguos ni cambiar automáticamente el idioma de la URL.
6. Dos URLs estables para las versiones de Home, canonical y hreflang.
7. Ejecución reproducible en development y producción, con configuración por entorno.
8. Pruebas de publicación sin rebuild, permisos, fallos y regresiones principales.

### Fuera de alcance

- Convertir todo el catálogo, publicaciones, portal y administración a SSR.
- Migrar globalmente a Next.js, TanStack Start u otro framework como decisión implícita.
- CMS general para todas las páginas, edición libre de HTML o JavaScript, nuevos tipos de bloques.
- Cambiar el checkout, precios, snapshots, usuarios, tickets o Functions transaccionales.
- Borradores persistentes, historial de revisiones, publicación programada o edición colaborativa.
- Actualizar por push el texto de una pestaña pública que ya está abierta.
- Reparar todos los problemas SEO previos del repositorio.
- Garantizar posicionamiento, indexación o apariencia de resultados en un buscador.

## 5. Experiencia administrativa

### Navegación y pestañas

La ruta sigue siendo `/admin/hero-slides`; el nombre visible pasa a describir la sección completa, por ejemplo **Home / Hero**, traducido mediante i18n.

| Pestaña | Contenido |
| --- | --- |
| Contenido | Título principal EN/ES, descripción visible EN/ES y gestión existente del carrusel. |
| SEO | Título SEO EN/ES, meta description EN/ES e imagen social opcional. |

Los controles EN/ES se agrupan dentro de cada pestaña. Cambiar la pestaña o el idioma de edición no debe descartar valores. El idioma de edición no cambia involuntariamente el idioma de la interfaz administrativa.

La gestión del carrusel conserva sus propias operaciones de crear, editar, ordenar, mostrar y eliminar. El guardado del formulario de textos no modifica slides; editar un slide no publica cambios pendientes del formulario. La interfaz distinguirá claramente ambos controles de guardado.

### Flujo de publicación

1. Cargar el documento publicado y mostrar un estado de carga explícito.
2. Editar cualquiera de los campos en ambas pestañas.
3. Mostrar errores junto al campo y señalar la pestaña que contiene errores.
4. Pulsar **Guardar y publicar**; validar el formulario completo, incluidas las pestañas no visibles.
5. Actualizar todos los campos de contenido/SEO del documento en una operación.
6. Confirmar el guardado solo después de recibir éxito de Appwrite; conservar los valores si falla.
7. Mostrar fecha de última actualización y enlaces a las dos versiones públicas.

La publicación de textos no modifica el despliegue del frontend. Las visitas posteriores consultan el documento guardado; las pestañas públicas abiertas conservan su contenido hasta recarga o una nueva entrada a Home.

El formulario incluye estado modificado, prevención de envíos duplicados y aviso al intentar abandonar cambios pendientes. Si la carga falla, no se sustituye silenciosamente el documento por valores iniciales ni se habilita un guardado que pueda sobrescribirlo.

Una vista previa de título/description es orientativa; no se presenta como reproducción garantizada del resultado de Google.

### Concurrencia

La primera versión utiliza la semántica existente de Appwrite: el último guardado exitoso del documento prevalece. Se muestra `$updatedAt` y se ofrece recargar. No se prometerá detección atómica de conflictos mediante una comparación previa de timestamps: esa comparación por sí sola no impide carreras.

Si se exige evitar sobrescrituras concurrentes, habrá que ampliar el alcance con un mecanismo de escritura condicional probado antes de habilitar edición simultánea.

## 6. Modelo editorial propuesto

Tabla/colección `home_content`, documento de ID fijo `home` en la base de cada entorno. Solo contiene información publicable, sin datos personales ni secretos. No se utiliza una publicación ficticia ni un slide para representar el H1 global.

| Campo | Tipo propuesto | Límite | Regla |
| --- | --- | --- | --- |
| `heroTitle` | string | 160 | Inglés, requerido. |
| `heroTitleEs` | string | 160 | Español, requerido. |
| `heroDescription` | string | 600 | Inglés, requerido. |
| `heroDescriptionEs` | string | 600 | Español, requerido. |
| `seoTitle` | string | 120 | Inglés, requerido, sin añadir manualmente la marca. |
| `seoTitleEs` | string | 120 | Español, requerido. |
| `seoDescription` | string | 320 | Inglés, requerido. |
| `seoDescriptionEs` | string | 320 | Español, requerido. |
| `ogImageId` | string | 255 | Opcional; referencia a Storage. |
| `ogBucketId` | string | 255 | Obligatorio cuando se proporciona imagen. |

Los límites son decisiones del producto propuestas, no límites garantizados de presentación en buscadores. Se mostrarán orientaciones editoriales sobre longitud sin afirmar que Google corta siempre por un número fijo de caracteres.

Se reutilizan `$id`, `$createdAt` y `$updatedAt`. No hacen falta índices adicionales para lectura por ID. El manifiesto mantendrá formato `tables/columns`, compatible con el API Databases utilizado por la aplicación.

### Permisos

| Actor | Leer documento publicado | Modificar |
| --- | --- | --- |
| Anónimo / cliente | Sí | No |
| Operator | Sí, por ser contenido público | No |
| Admin / root | Sí | Sí |

El despliegue crea el documento inicial. Las sesiones de administrador tendrán `update`; no necesitan `create` ni `delete` en operación normal. El acceso a la pantalla mantiene el guard `admin/root` existente. Las comprobaciones de permisos se hacen también mediante API, sin depender de ocultar botones.

Guardar puede seguir el patrón de SDK directo del proyecto, con restricciones de tipo/longitud y permisos del servidor. Las reglas de validación del formulario no se considerarán una frontera de seguridad: la salida pública siempre debe validar y escapar lo recibido, incluso ante una escritura directa por un administrador.

Los eventos de edición se integran con `auditAction`; su fallo se registra sin fingir que el documento no se guardó. No se promete transacción entre auditoría y publicación. La identidad del administrador no se añade al documento público.

### Valores iniciales y mantenimiento

- El alta inicial copia el H1 y descripción actuales de `landing.json` para cada idioma.
- El SEO EN conserva el contenido actual de `HomePage`; se prepara su equivalente ES para revisión editorial.
- Sin imagen específica, utilizar `${PUBLIC_SITE_URL}/og-home.jpg`.
- El script de alta será idempotente y no sobrescribirá un documento ya editado.
- El CTA principal conserva traducción y destino actuales; no se añade su edición a este alcance.
- Las traducciones originales quedan como respaldo técnico explícito, no como fuente que prevalezca sobre contenido publicado válido.

## 7. Validación y salida segura

- Aplicar trim; bloquear valores requeridos vacíos o compuestos solo por espacios.
- Tratar los campos como texto plano. Las comillas, acentos, signos y caracteres Unicode deben conservarse correctamente.
- No interpretar etiquetas, Markdown ni scripts en estos campos. Escapar texto de HTML, atributos y JSON serializado, incluyendo secuencias como `</script>`.
- Imagen social procedente de un bucket público permitido y resoluble mediante el servidor; no aceptar una URL arbitraria como código o recurso de ejecución.
- Canonical, hreflang, robots, dominio y sufijo de marca se derivan del sistema, no se editan libremente desde el formulario.
- Título final con un único sufijo `— OMZONE`; prevenir su duplicación si el administrador lo introduce.
- Validar el documento completo también al consumirlo. Un documento inválido no debe convertirse en una respuesta 200 con HTML roto.

## 8. Idioma y URLs de Home

Propuesta para hacer direccionables las dos variantes sin reorganizar todas las rutas:

| Ruta | Idioma inicial | Canonical de producción |
| --- | --- | --- |
| `/` | EN | `https://omzone.com/` |
| `/es` | ES | `https://omzone.com/es` |

Ambas respuestas incluyen `hreflang=en`, `hreflang=es` y `hreflang=x-default` apuntando a `/`. El `<html lang>` coincide con la ruta y con el contenido inicial.

La ruta prevalece sobre localStorage durante la carga e hidratación de Home. El selector de Home ofrece enlaces reales entre `/` y `/es`; puede persistir la preferencia para las otras páginas. No redirigir automáticamente en función del user agent, de Accept-Language o de una preferencia almacenada.

Desde una página SPA que está en español, los enlaces de regreso a Home deben llevar a `/es`. Desde inglés, a `/`. También hay que adaptar la detección de rutas con Hero (`heroRoutes`) y comprobar enlaces de logo, footer y navegación.

`/es/` se normaliza a `/es` en el servidor. Parámetros de campaña no generan nuevas variantes canónicas. El resto del sitio conserva su selección actual de idioma y sus rutas inglesas.

La política de idioma es un cambio visible respecto al comportamiento actual: abrir explícitamente `/` mostrará inglés aunque localStorage contenga español. Debe documentarse en la revisión del producto.

## 9. Contrato de HTML y ejecución en el navegador

Para una solicitud exitosa a Home, antes de ejecutar JavaScript deben existir:

- Un H1 visible con el título publicado del idioma solicitado.
- La descripción visible publicada, como texto real del body.
- Un único `<title>`, meta description y canonical efectivos.
- OpenGraph y Twitter con títulos/descripciones derivados del SEO del mismo idioma e imagen absoluta.
- `html lang`, alternates de idioma y el JSON-LD Organization coherente con el entorno.
- Enlaces HTML utilizables para cambiar idioma y acceder a experiencias.

Contenido y head se derivan de la misma lectura del documento. No consultar por separado una versión para el H1 y otra para los metadatos.

No se aceptan como sustituto un texto oculto para bots, un `<noscript>` duplicado, reemplazar únicamente metatags o inyectar un H1 que `createRoot()` elimine al arrancar. Humanos y crawlers reciben el mismo contenido público.

La frontera elegida renderiza la Home completa con React 19 y `StaticRouter`, compartiendo presentación y normalización con el navegador. React 19 coloca metadatos en head y `hydrateRoot` hidrata el contenido de `#root` a partir del documento serializado. El resto de rutas conserva renderizado SPA.

Los datos iniciales se entregan serializados de forma segura al cliente. La primera renderización del navegador utiliza exactamente ese idioma y contenido. Auth se resuelve después del estado público inicial; no se serializan sesiones, cookies o información personal en HTML público. El carrusel y demás interacciones mantienen su funcionamiento.

Al navegar desde otra página SPA a Home debe obtenerse contenido actual o realizarse navegación de documento al renderer. No basta con validar únicamente el acceso directo. No usar `hydrateRoot` para un árbol que no coincida con el HTML enviado.

## 10. Arquitectura objetivo y decisión de hosting pendiente

```text
Panel /admin/hero-slides
  → Guardar y publicar con sesión admin/root
  → Appwrite home_content/home

GET / o /es
  → Host del entorno
  → Renderer de Home
  → Lectura pública de home_content/home
  → HTML + head + datos iniciales del mismo documento
  → React activa interacciones sin reemplazar los textos
```

### Contrato portable

El núcleo de lectura, validación, selección de idioma y renderizado no depende de Appwrite Sites. Se ejecuta con Node localmente para verificación y detrás de Nginx en producción.

En producción, el SSR propuesto exige un proceso de servidor. Nginx sirve assets y dirige Home a ese proceso; las rutas SPA restantes conservan su fallback. Copiar el `dist` estático actual por sí solo no cumple este contrato.

### P0 resuelta: alcance priorizado a producción

El Site React actual solo ofrece adaptador estático. No se planifica convertirlo a un supuesto modo SSR no anunciado por la instancia.

La instancia solo ofrece adaptador estático para React/Other. Tras la indicación del usuario de priorizar producción, la prueba de SSR se realiza con el servidor Node equivalente al que irá detrás de Nginx. El Site conserva el flujo estático para probar administración y lectura en navegador.

El [ADR-006](../../architecture/ADR-006_home-content-ssr.md) registra entradas, artefactos, responsabilidades y limitaciones. No se introduce otro framework ni se cambia el adaptador del Site.

La implementación usa lectura por solicitud y no genera archivos HTML al publicar.

La validación local demuestra el contrato del renderer; el proxy y las cabeceras del dominio productivo deben comprobarse al desplegar. No se presenta esa validación como un despliegue ya realizado.

## 11. Publicación, frescura y errores

### Primera versión sin caché de HTML compartida

- Leer el documento publicado una vez por solicitud de Home.
- Emitir `Cache-Control: no-store` para HTML y evitar caché de ese HTML en Nginx o CDN. Verificar las cabeceras efectivas del host productivo al desplegar.
- Los assets con hash mantienen su política de caché independiente.
- El hook administrativo actualiza su estado/caché local tras guardar. El renderer no comparte ese caché ni depende de su invalidación.
- No hay webhook de rebuild, push a GitHub ni nueva ejecución de build al publicar textos.

Objetivo verificable bajo operación normal: una nueva solicitud iniciada después de confirmar el guardado obtiene los valores nuevos; en las pruebas, comprobarlo dentro de cinco segundos. Una solicitud que comenzó antes del guardado puede terminar con la versión anterior.

La publicación no provoca cambios automáticos en pestañas públicas abiertas ni actualiza resultados de buscadores en cinco segundos.

### Fallos

La lectura de contenido tendrá un timeout propuesto de tres segundos, ajustable mediante configuración de servidor y medido en P0. No introducir reintentos ilimitados.

Si Appwrite falla, falta el documento o su contenido no es válido, no sustituirlo silenciosamente por una Home vacía con HTTP 200. Se puede mostrar el último documento válido disponible en ese proceso o el respaldo inicial para continuidad visual, pero con HTTP 503 y `Retry-After`, sin cachear la respuesta. El registro indicará el motivo y la fuente del respaldo sin incluir credenciales.

El respaldo en memoria no se considera almacenamiento persistente ni permite afirmar que el contenido esté actualizado tras un reinicio. Una política futura de caché duradera o stale-while-revalidate requerirá especificar TTL, invalidación por idioma/entorno y límites de antigüedad.

## 12. Entornos, secretos y operación

- Utilizar `omzone-dev` para pruebas y confirmar el proyecto productivo efectivo antes de cualquier escritura allí.
- La lectura del contenido público puede ser anónima; no necesita la API key administrativa del desarrollador.
- Separar variables de servidor de las expuestas al bundle. El mapeo actual de `APPWRITE_*` en Vite impide tratar ese prefijo como garantía de secreto; revisar que ningún nuevo secreto termine en `define` o assets.
- No importar código del SDK servidor o configuración privada desde módulos compartidos con el cliente.
- Desarrollo usa su origen real y `noindex` en la respuesta inicial, mediante meta y/o cabecera del host. Sus canonical/alternates deben permanecer en ese origen para probar consistencia sin emitir enlaces cruzados accidentales.
- Producción utiliza `https://omzone.com`, sin heredar el `noindex` de pruebas. Verificar también las cabeceras del proxy.
- `robots.txt` no sustituye a `noindex`; la comprobación del HTML de development se realiza aunque no se pretenda indexarlo.
- Añadir `/es` al sitemap público y conservar las entradas existentes. Corregir el comentario del generador que afirma ejecutarse en cada build; no activar una regeneración global que elimine URLs si faltan credenciales.
- Un cambio de código en `main` dispara despliegue de development. La prueba de hosting se realizará en un recurso/preview aislado antes de modificar el Site activo.
- Mantener un procedimiento de rollback del renderer y del frontend. Un rollback de código no elimina la tabla ni sobrescribe contenido publicado.

## 13. Criterios de aceptación

| ID | Escenario | Resultado requerido |
| --- | --- | --- |
| AC-01 | Admin abre `/admin/hero-slides` | Ve Contenido y SEO; el carrusel sigue disponible. |
| AC-02 | Edita ambas pestañas y publica | Una actualización guarda todos los textos; se muestra éxito solo tras persistencia. |
| AC-03 | Vacío, longitud inválida o fallo de guardado | Errores claros, cambios conservados, sin falsa confirmación. |
| AC-04 | Anónimo/client/operator intenta escribir por API | Appwrite rechaza; admin/root puede actualizar. |
| AC-05 | GET `/` sin JavaScript | HTTP 200 con H1, descripción y head EN publicados. |
| AC-06 | GET `/es` sin JavaScript | HTTP 200 con contenido y head ES; idioma y canonical correctos. |
| AC-07 | Activa JavaScript y localStorage tiene otro idioma | No hay cambio inicial de idioma/textos, duplicados ni errores de hidratación. |
| AC-08 | Entra a Home desde una ruta SPA | Obtiene contenido actual y metadatos coherentes. |
| AC-09 | Publica otro texto tras un despliegue ya activo | Nueva solicitud refleja el cambio en ≤5 s en condiciones normales; mismo despliegue y assets. |
| AC-10 | Appwrite no responde / documento inválido | Respuesta controlada 503, respaldo legible, sin secretos ni HTML corrupto. |
| AC-11 | Texto con comillas, acentos o `</script>` | Se muestra como texto; no ejecuta código ni rompe la serialización. |
| AC-12 | Consulta desktop y móvil | El Hero conserva composición, legibilidad, CTA y carrusel; un solo H1 visible. |
| AC-13 | Inspecciona development y producción | Origen, robots y proyecto correctos; no se filtra configuración entre entornos. |
| AC-14 | Prueba de despliegue | Site conserva build estático para panel/CSR; contrato HTML probado con proceso Node portable a Nginx. Confirmar proxy y cabeceras en VPS durante el lanzamiento. |
| AC-15 | Navega admin, portal, catálogo y autenticación | Las rutas/guards existentes conservan comportamiento; no se fuerza SSR global. |
| AC-16 | Ejecuta nuevamente el alta inicial | El documento editado no se sobrescribe. |

## 14. Decisiones a cerrar antes de implementar

| ID | Decisión | Propuesta / condición de cierre |
| --- | --- | --- |
| D-01 | Ejecución en Sites y VPS | Resuelta: Site estático para panel/CSR; Node SSR para producción según prioridad indicada por el usuario. ADR-006. |
| D-02 | URLs por idioma | Adoptar `/` EN y `/es` ES; comprobar impacto sobre navegación y preferencia almacenada. |
| D-03 | Publicación | Guardar y publicar directamente; confirmar si se requiere borrador antes de ampliar alcance. |
| D-04 | Política de frescura | Sin caché HTML compartida en V1; medir latencia y disponibilidad. |
| D-05 | Producción operativa | Identificar responsable/acceso del VPS, configuración de Nginx y gestor del proceso servidor. |

D-01 a D-04 están concretadas en la implementación. D-05 requiere adaptar las plantillas y ejecutar las comprobaciones en el VPS real durante el lanzamiento.

## 15. Fuentes y alcance de la evidencia

Los hechos del repositorio y del entorno se enumeran en la sección 3. Las lecturas remotas fueron realizadas durante esta conversación, sin modificar recursos. No constituyen garantía permanente de sincronización entre entornos.

- [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics): ejecución de JavaScript, HTML inicial y metadatos.
- [Google: sitios multilingües](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites): versiones por idioma con URLs diferenciadas.
- [Vite 6: SSR](https://v6.vite.dev/guide/ssr): soporte y separación de entradas servidor/cliente; integración de bajo nivel.
- [Appwrite Sites: SSR](https://appwrite.io/docs/products/sites/rendering/ssr): capacidades generales; verificar siempre contra los adaptadores de la instancia self-hosted.

Esta especificación no autoriza por sí sola despliegues ni crea recursos. La entrega de esta etapa consiste exclusivamente en documentación revisable.
