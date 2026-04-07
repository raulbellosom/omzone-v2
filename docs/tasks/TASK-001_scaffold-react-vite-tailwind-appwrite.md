# TASK-001: Scaffold proyecto React + Vite + TailwindCSS + Appwrite SDK

## Objetivo

Inicializar el proyecto frontend de OMZONE con React + Vite + JavaScript, configurar TailwindCSS, instalar el Appwrite Web SDK apuntando a la instancia self-hosted, establecer la estructura base de carpetas, configurar routing con react-router-dom y crear los layout shells iniciales. Al completar esta tarea, el proyecto corre localmente con routing funcional, layouts vacíos y el SDK de Appwrite listo para consumir.

## Contexto

Esta es la primera tarea del proyecto OMZONE. No existe código previo. Todo lo que se construya después depende de este scaffold.

- **Fase:** 0 — Setup del proyecto
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 0
- **Documento maestro:** Secciones 3 (Visión del sistema), 21 (Estrategia Appwrite 1.9.0)
- **RF relacionados:** Ninguno directamente — esta tarea es infraestructura fundacional.
- **ADR relacionados:** N/A

## Alcance

Lo que SÍ incluye esta tarea:

1. Inicializar proyecto Vite con template React + JavaScript (no TypeScript).
2. Instalar y configurar TailwindCSS (con `tailwind.config.js` y directivas en CSS base).
3. Instalar Appwrite Web SDK (`appwrite`).
4. Crear `src/lib/appwrite.js` con instancias de `Client`, `Account`, `Databases`, `Storage` y `Functions` configuradas con endpoint `https://aprod.racoondevs.com/v1` y project ID `omzone-dev`, leyendo de variables de entorno.
5. Crear estructura base de carpetas:
   - `src/pages/`
   - `src/components/`
   - `src/hooks/`
   - `src/lib/`
   - `src/layouts/`
   - `src/styles/`
6. Instalar `react-router-dom` y configurar routing skeleton con páginas placeholder:
   - `Home` — `/`
   - `Login` — `/login`
   - `Register` — `/register`
   - `AdminDashboard` — `/admin`
   - `ClientPortal` — `/portal`
   - `NotFound` — `*`
7. Crear layout shells (estructura vacía, sin contenido funcional):
   - `PublicLayout` — wrapper para rutas públicas (header/footer placeholder)
   - `AdminLayout` — wrapper para rutas admin (sidebar placeholder)
   - `PortalLayout` — wrapper para rutas de portal de cliente
8. Configurar variables de entorno:
   - `VITE_APPWRITE_ENDPOINT`
   - `VITE_APPWRITE_PROJECT_ID`
9. Crear archivo `.env.example` con las variables requeridas documentadas.
10. Limpiar boilerplate de Vite (assets, estilos, contenido por defecto).

## Fuera de alcance

- Flujo de autenticación (login, register, sesión) — eso es TASK-002.
- Route guards o protección de rutas — eso es TASK-002.
- Contenido en páginas placeholder (más allá de título descriptivo).
- Estilos premium o diseño editorial — se implementará en tasks de UI posteriores.
- Conexión real a Appwrite (llamadas API) — solo configuración del SDK.
- Tests unitarios o e2e.
- Deploy o configuración de producción.
- `appwrite.json` o configuración de Functions/Storage en Appwrite.

## Dominio

- [x] Configuración (settings, templates)
- Nota: clasificado como **Infraestructura** en el plan maestro.

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| Ninguna | — | Esta tarea no interactúa con tablas de Appwrite |

## Atributos nuevos o modificados

N/A — esta tarea no crea ni modifica atributos de base de datos.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | Solo se configura el servicio `Functions` en el SDK |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| Ninguno | — | Solo se configura el servicio `Storage` en el SDK |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `PublicLayout` | público | crear | Shell con `<Outlet />`, header y footer placeholder |
| `AdminLayout` | admin | crear | Shell con `<Outlet />`, sidebar placeholder |
| `PortalLayout` | portal | crear | Shell con `<Outlet />`, nav placeholder |
| `Home` | público | crear | Página placeholder con título |
| `Login` | público | crear | Página placeholder con título |
| `Register` | público | crear | Página placeholder con título |
| `AdminDashboard` | admin | crear | Página placeholder con título |
| `ClientPortal` | portal | crear | Página placeholder con título |
| `NotFound` | público | crear | Página 404 placeholder |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| Ninguno | — | Los hooks se crean en tasks posteriores |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/` | público | ninguno | Página Home |
| `/login` | público | ninguno | Página Login |
| `/register` | público | ninguno | Página Register |
| `/admin` | admin | ninguno (guard en TASK-002) | Página AdminDashboard |
| `/portal` | portal | ninguno (guard en TASK-002) | Página ClientPortal |
| `*` | público | ninguno | Página NotFound (404) |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Acceder a cualquier ruta | ✅ | ✅ | ✅ | ✅ | ✅ |

Nota: En esta tarea no hay guards. Todas las rutas son accesibles sin autenticación. La protección por labels se implementa en TASK-002.

## Flujo principal

1. Desarrollador ejecuta `npm create vite@latest` con template React + JavaScript.
2. Se instalan dependencias: `tailwindcss`, `@tailwindcss/vite`, `appwrite`, `react-router-dom`.
3. Se configura TailwindCSS en `vite.config.js` y se agrega `@import "tailwindcss"` en el CSS base.
4. Se crea `src/lib/appwrite.js` que exporta `client`, `account`, `databases`, `storage`, `functions` usando `import.meta.env.VITE_APPWRITE_ENDPOINT` y `import.meta.env.VITE_APPWRITE_PROJECT_ID`.
5. Se crean las carpetas base: `pages/`, `components/`, `hooks/`, `lib/`, `layouts/`, `styles/`.
6. Se crean los 3 layout shells con `<Outlet />` de react-router-dom.
7. Se crean las 6 páginas placeholder (componentes funcionales con heading descriptivo).
8. Se configura `BrowserRouter` en `main.jsx` con rutas anidadas bajo los layouts correspondientes.
9. Se crea `.env` local y `.env.example` con las variables de entorno.
10. Se limpia boilerplate de Vite (App.css, assets/react.svg, contenido de App.jsx).
11. Se verifica que `npm run dev` levanta la app y la navegación funciona entre rutas.

## Criterios de aceptación

- [ ] `npm run dev` levanta la app sin errores en consola.
- [ ] TailwindCSS funciona: una clase utilitaria como `text-red-500` se aplica correctamente en un elemento de prueba.
- [ ] `src/lib/appwrite.js` exporta `client`, `account`, `databases`, `storage` y `functions` correctamente configurados.
- [ ] Las variables de entorno `VITE_APPWRITE_ENDPOINT` y `VITE_APPWRITE_PROJECT_ID` son leídas desde `.env` y usadas en el SDK.
- [ ] Existe `.env.example` con las dos variables documentadas (sin valores reales).
- [ ] Las 6 rutas (`/`, `/login`, `/register`, `/admin`, `/portal`, `*`) renderizan su página placeholder correspondiente.
- [ ] Cada página placeholder muestra al menos un heading indicando qué página es.
- [ ] Los 3 layouts (`PublicLayout`, `AdminLayout`, `PortalLayout`) renderizan `<Outlet />` y sus rutas hijas aparecen dentro del layout correcto.
- [ ] La navegación entre rutas funciona sin recarga completa de página (SPA routing).
- [ ] La estructura de carpetas `src/pages/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/layouts/`, `src/styles/` existe.
- [ ] No queda boilerplate de Vite (logos, estilos por defecto, contenido de ejemplo).
- [ ] No hay errores en la consola del navegador al navegar entre todas las rutas.

## Validaciones de seguridad

- [ ] Las variables de entorno no contienen valores secretos (endpoint y project ID son públicos por naturaleza en el SDK web).
- [ ] `.env` está en `.gitignore`.
- [ ] `.env.example` no contiene valores reales, solo placeholders.

## Dependencias

Ninguna — esta es la primera tarea del proyecto.

## Bloquea a

- TASK-002: Auth flow — login, registro, sesión y guards por label (requiere SDK configurado, routing y layouts).
- Todas las tasks de Fase 1+ dependen transitivamente de esta tarea.

## Riesgos y notas

- **Versión de Appwrite SDK:** Asegurar que se instala la versión del SDK compatible con Appwrite 1.9.0 self-hosted. Verificar en [docs de Appwrite](https://appwrite.io/docs) la versión del SDK web correspondiente.
- **TailwindCSS v4:** Si se usa TailwindCSS v4, la configuración difiere de v3 (usa `@import "tailwindcss"` en lugar de directivas `@tailwind`). Verificar la versión y seguir las instrucciones correspondientes.
- **Estructura de layouts:** Los layouts son shells vacíos ahora. El diseño real (sidebar, navigation, estilo premium) se implementa en tasks posteriores (TASK-010 para admin, TASK-016 para público). No sobre-diseñar en esta tarea.
- **Sin `.env` commiteado:** Confirmar que `.gitignore` incluye `.env` pero no `.env.example`.
