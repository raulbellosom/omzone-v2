# TASK-016: Public layout — header, footer, navigation shell

## Objetivo

Crear el layout público de OMZONE con header responsivo (logo, navegación, botón de auth), footer (info, links, marca) y área de contenido principal. Al completar esta tarea, el sitio público tiene una estructura visual premium y wellness que envuelve todas las páginas públicas, con comportamiento adaptado a mobile (hamburger menu) y detección de sesión para mostrar "Mi Portal" en vez de "Login".

## Contexto

- **Fase:** 4 — Catálogo público
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 4
- **Documento maestro:** Sección 3.1 (Sitio público / catálogo editorial), RNF-04 (UX premium), RNF-05 (Internacionalización preparada)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Superficies y dominios consumidos (sección 4): sitio público consume Editorial (read), Comercial (read), Agenda (read)
- **ADR relacionados:** Ninguno directamente — esta tarea es frontend-only
- **RF relacionados:** RF-01 (Catálogo editorial), RF-04 (Catálogo público)

La superficie pública es donde los visitantes descubren experiencias. El layout debe transmitir bienestar, transformación, estilo de vida y hospitalidad curada — nunca parecer marketplace genérico. Este shell envuelve todas las rutas públicas (`/`, `/experiencias`, `/experiencias/:slug`, `/checkout`).

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear componente `PublicLayout` que envuelve rutas públicas con header, footer y `<main>` content area.
2. Crear componente `PublicHeader` responsivo:
   - Logo OMZONE (clickeable → `/`)
   - Links de navegación: Home, Experiencias, About (placeholder), Contact (placeholder)
   - Botón de auth: "Login" si anónimo, "Mi Portal" si autenticado con label `client`, "Admin" si autenticado con label `admin`/`root`/`operator`
   - Mobile: hamburger menu con overlay/drawer
3. Crear componente `PublicFooter`:
   - Logo o nombre de marca
   - Links: About, Contact, Terms, Privacy (placeholder destinations)
   - Copy de marca: "© 2026 OMZONE. All rights reserved."
   - Diseño premium, no genérico
4. Definir base de tipografía y esquema de color en Tailwind config:
   - Fuente primaria (display/heading)
   - Fuente secundaria (body)
   - Paleta wellness: tonos neutros/cálidos, accent color premium
5. Integrar `PublicLayout` en el router para envolver rutas públicas.
6. Mobile: hamburger icon que abre drawer/overlay con links de navegación y botón de auth.
7. Smooth scroll, transiciones suaves, estética aspiracional.

## Fuera de alcance

- Contenido de páginas internas (Home, About, Contact) — tasks futuras.
- SEO: meta tags, OG tags, structured data.
- Internacionalización (i18n toggle idioma) — futura.
- Imágenes de fondo o hero del home — futura.
- Notificaciones, search bar, cart icon.
- Footer newsletter signup.
- Cookie banner / consent.

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)
- Nota: clasificado como **Frontend público** en el plan maestro.

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| Appwrite Auth (users) | leer | Se lee sesión activa y `user.labels` para determinar qué mostrar en header |

## Atributos nuevos o modificados

N/A — esta tarea no modifica atributos de base de datos.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | Esta tarea es frontend-only |

## Buckets / Storage implicados

N/A — esta tarea no involucra Storage. El logo se gestiona como asset estático del proyecto.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `PublicLayout` | público | crear | Layout wrapper con header + footer + main |
| `PublicHeader` | público | crear | Header responsivo con nav, logo, auth button |
| `PublicFooter` | público | crear | Footer con links, marca, copy |
| `MobileMenu` | público | crear | Drawer/overlay de navegación en mobile |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useAuth` | leer (usar existente) | Se consulta `user`, `isAuthenticated`, `hasLabel()` para mostrar link correcto |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/` | público | ninguno | Home (placeholder) — envuelta por `PublicLayout` |
| `/experiencias` | público | ninguno | Listado (placeholder) — envuelta por `PublicLayout` |
| `/experiencias/:slug` | público | ninguno | Detalle (placeholder) — envuelta por `PublicLayout` |
| `/checkout` | público | `RequireAuth` | Checkout (placeholder) — envuelta por `PublicLayout` |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver header y footer públicos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver link "Mi Portal" en header | ✅ | ✅ | ❌ | ✅ | ❌ |
| Ver link "Admin" en header | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver link "Login" en header | ❌ | ❌ | ❌ | ❌ | ✅ |

## Flujo principal

1. El visitante llega a cualquier ruta pública (`/`, `/experiencias`, etc.).
2. El `PublicLayout` renderiza `PublicHeader` arriba, `<main>{children}</main>`, `PublicFooter` abajo.
3. El header muestra logo, links de navegación y botón de auth según estado de sesión.
4. En mobile (< 768px), los links de navegación se colapsan en un hamburger menu.
5. Al hacer click en el hamburger, se abre un drawer/overlay con los links y botón de auth.
6. Si el usuario hace click en "Login", navega a `/login`.
7. Si el usuario hace click en "Mi Portal", navega a `/portal`.
8. Si el usuario hace click en "Admin", navega a `/admin`.
9. El footer se muestra al final de cada página con links, marca y copy.

## Criterios de aceptación

- [x] `PublicLayout` envuelve todas las rutas públicas (`/`, `/experiencias`, `/experiencias/:slug`, `/checkout`) con header y footer.
- [x] El header muestra el logo OMZONE que navega a `/` al hacer click.
- [x] El header muestra links: Home, Experiencias, About, Contact.
- [x] Si el usuario no está autenticado, el header muestra botón "Login" que navega a `/login`.
- [x] Si el usuario está autenticado con label `client`, el header muestra "Mi Portal" que navega a `/portal`.
- [x] Si el usuario está autenticado con label `admin`, `root` u `operator`, el header muestra "Admin" que navega a `/admin`.
- [x] En viewports < 768px, los links de navegación se colapsan en un hamburger menu.
- [x] El hamburger menu abre un drawer/overlay con todos los links de navegación y botón de auth.
- [x] El footer muestra links: About, Contact, Terms, Privacy.
- [x] El footer muestra texto "© 2026 OMZONE. All rights reserved." (o dinámico con año actual).
- [x] La tipografía y paleta de colores están definidas en `tailwind.config.js` con look premium/wellness.
- [x] El layout no muestra el label `root` en ningún texto visible — un usuario root ve "Admin" igual que un admin.
- [x] El diseño es limpio, aspiracional y no parece marketplace genérico.

## Validaciones de seguridad

- [x] El estado de autenticación se lee del hook `useAuth` (que usa `account.get()` de Appwrite), no de localStorage ni cookies manipulables.
- [x] El label `root` nunca se expone como texto en el header ni en ningún componente visible.
- [x] Los links de admin/portal solo se renderizan condicionalmente — no se ocultan con CSS (no deben existir en el DOM para usuarios sin acceso).

## Dependencias

- **TASK-001:** Scaffold proyecto React + Vite + Tailwind + Appwrite SDK — provee proyecto base, TailwindCSS, routing y Appwrite SDK configurado.
- **TASK-009:** Route guards por label — provee `ProtectedRoute`, `RequireAuth`, `RedirectIfAuth` y `useAuth` con detección de labels.

## Bloquea a

- **TASK-017:** Listado público de experiencias — necesita `PublicLayout` como shell.
- **TASK-018:** Detalle público de experiencia — necesita `PublicLayout` como shell.
- **TASK-020:** UI de checkout — necesita `PublicLayout` como shell.

## Riesgos y notas

- **Fuentes custom:** Si se eligen Google Fonts premium (ej: serif para headings, sans para body), asegurar que se carguen con `font-display: swap` para evitar FOIT.
- **Colores de marca:** Si no hay brand guidelines definitivas, usar paleta wellness provisional (neutrals + sage green o warm gold) y documentar que es ajustable.
- **Logo:** Si no hay SVG del logo OMZONE disponible, usar texto estilizado "OMZONE" como placeholder.
- **About/Contact placeholder:** Los links del header/footer apuntan a rutas que aún no tienen contenido — usar páginas placeholder con "Coming Soon" para no romper navegación.
- **Accesibilidad:** El hamburger menu debe ser accesible con teclado (Tab, Escape para cerrar) y tener `aria-expanded`, `aria-label` apropiados.
