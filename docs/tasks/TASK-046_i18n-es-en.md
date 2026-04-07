# TASK-046: i18n — soporte ES/EN en contenido público

## Objetivo

Implementar soporte bilingüe (español/inglés) en el sitio público de OMZONE: contexto de idioma con hook `useLanguage`, language switcher en el header, renderizado condicional de campos ES/EN del contenido, archivos de strings para texto estático de UI y persistencia de preferencia de idioma. Al completar esta tarea, un visitante puede alternar entre español e inglés y todo el contenido público se adapta al idioma seleccionado.

## Contexto

- **Fase:** 14 — SEO, performance e i18n
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 14
- **Documento maestro:** Secciones:
  - **RNF-05:** Internacionalización — sistema listo para español e inglés
- **Modelo de datos:** `docs/architecture/01_data-model.md` — campos `Es` en múltiples tablas: `publicNameEs`, `shortDescriptionEs`, `longDescriptionEs`, `titleEs`, `subtitleEs`, `excerptEs`, `contentEs`, `nameEs`, `descriptionEs`, etc. `user_profiles.language` (enum: `es`, `en`).

La convención del data model es: campo principal en inglés (sin sufijo), campo ES con sufijo `Es`. El sistema debe renderizar el campo apropiado según la preferencia del visitante.

## Alcance

Lo que SÍ incluye esta tarea:

1. Context y Provider de idioma:
   - `LanguageProvider` que envuelve la app
   - `useLanguage` hook que expone: `language` (string: `es` | `en`), `setLanguage(lang)`, `t(key)` para strings estáticos
   - Default: `en`
2. Language switcher component:
   - Toggle o dropdown EN/ES en el header público
   - Visible en todas las páginas públicas
   - Animación sutil al cambiar
3. Renderizado condicional de contenido dinámico:
   - Helper `localizedField(item, fieldName, language)`:
     - Si `language === "es"` y `item[fieldName + "Es"]` tiene valor → retorna campo ES
     - Si campo ES está vacío → fallback a campo EN
     - Si `language === "en"` → retorna campo sin sufijo
   - Aplicar en: experiencias, publicaciones, secciones, addons, paquetes, pases, pricing tiers, tags
4. Archivos de strings estáticos:
   - `src/i18n/en.json` — strings EN para UI (botones, labels, nav, mensajes)
   - `src/i18n/es.json` — strings ES
   - Función `t(key)` resuelve el string del idioma actual
   - Cubrir al menos: navegación, botones comunes (Buy, Back, Next, Submit, Cancel, etc.), labels de formularios públicos, mensajes de error/éxito, estados vacíos
5. Persistencia de preferencia:
   - Guardar idioma en `localStorage` para visitantes anónimos
   - Si el usuario está autenticado y tiene `user_profiles.language`, usarlo como default
   - Al cambiar idioma con el switcher, actualizar `localStorage` y (si autenticado) `user_profiles.language`
6. Páginas que deben soportar i18n:
   - Home
   - Listado de experiencias
   - Detalle de experiencia
   - Publicaciones
   - Checkout (labels y mensajes)
   - Confirmación de compra

## Fuera de alcance

- Más de 2 idiomas (solo ES y EN).
- RTL (right-to-left) support.
- Sistema de gestión de traducciones (admin).
- Traducción automática (machine translation).
- URL routing por idioma (`/en/experiences` vs `/es/experiencias`).
- Admin panel i18n (admin se mantiene en español/mixto según tarea).
- Portal i18n (futuro).

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)
- [x] Frontend público

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `experiences` | leer | `publicName` / `publicNameEs`, `shortDescription` / `shortDescriptionEs`, etc. |
| `publications` | leer | `title` / `titleEs`, `subtitle` / `subtitleEs`, etc. |
| `publication_sections` | leer | `title` / `titleEs`, `content` / `contentEs` |
| `addons` | leer | `name` / `nameEs`, `description` / `descriptionEs` |
| `packages` | leer | `name` / `nameEs`, `description` / `descriptionEs` |
| `passes` | leer | `name` / `nameEs`, `description` / `descriptionEs` |
| `pricing_tiers` | leer | `name` / `nameEs`, `description` / `descriptionEs` |
| `tags` | leer | `name` / `nameEs` |
| `user_profiles` | leer / actualizar | `language` field |

## Atributos nuevos o modificados

N/A — se leen campos `Es` existentes. Se usa `user_profiles.language` que ya existe.

## Functions implicadas

Ninguna.

## Buckets / Storage implicados

Ninguno.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `LanguageProvider` | público | crear | Context provider para idioma |
| `LanguageSwitcher` | público | crear | Toggle/dropdown EN/ES en header |
| `PublicHeader` | público | modificar | Integrar LanguageSwitcher |
| `ExperienceDetailPage` | público | modificar | Usar localizedField para campos |
| `ExperienceCard` | público | modificar | Usar localizedField |
| `PublicationPage` | público | modificar | Usar localizedField |
| `SectionRenderer` | público | modificar | Usar localizedField para secciones |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useLanguage` | crear | Hook central de idioma: language, setLanguage, t() |
| `useLocalizedField` | crear | Helper hook para `localizedField(item, field)` |

## Rutas implicadas

N/A — no se crean rutas nuevas. El idioma se maneja por contexto, no por URL.

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Cambiar idioma | ✅ | ✅ | ✅ | ✅ | ✅ |
| Persistir idioma en perfil | ✅ | ✅ | ✅ | ✅ | ❌ |

## Flujo principal

1. Visitante accede al sitio. Se lee idioma de: (a) `user_profiles.language` si autenticado, (b) `localStorage`, (c) default `en`.
2. El `LanguageProvider` establece el idioma en el contexto.
3. Componentes usan `useLanguage()` para obtener idioma actual y `t(key)` para strings estáticos.
4. Componentes de contenido usan `localizedField(experience, "publicName")` para obtener el texto en el idioma correcto.
5. Si el campo ES está vacío, se usa EN como fallback.
6. Visitante hace click en el language switcher para cambiar a ES.
7. Se actualiza el contexto → todos los componentes re-renderizan con campos ES.
8. Se guarda la preferencia en `localStorage`.
9. Si el usuario está autenticado, se actualiza `user_profiles.language`.

## Criterios de aceptación

- [ ] Existe un `LanguageProvider` que provee el contexto de idioma a toda la app pública.
- [ ] El hook `useLanguage` expone `language`, `setLanguage` y `t(key)`.
- [ ] Hay un `LanguageSwitcher` visible en el header público de todas las páginas.
- [ ] Al cambiar idioma con el switcher, el contenido se actualiza inmediatamente sin reload.
- [ ] El nombre de experiencias se muestra en ES si el idioma es ES y `publicNameEs` tiene valor.
- [ ] Si `publicNameEs` está vacío, se muestra `publicName` (EN) como fallback.
- [ ] Las publicaciones, secciones, addons, paquetes, pases, pricing tiers y tags respetan el idioma seleccionado.
- [ ] Los strings estáticos de UI (botones, labels, nav) cambian de idioma al alternar.
- [ ] Existen archivos `en.json` y `es.json` con al menos: navegación, botones comunes, labels de formularios, mensajes de error/éxito, estados vacíos.
- [ ] La preferencia de idioma se persiste en `localStorage` para visitantes anónimos.
- [ ] Si el usuario está autenticado, la preferencia se persiste en `user_profiles.language`.
- [ ] Al iniciar sesión, si el perfil tiene `language: "es"`, el sitio carga en español.
- [ ] El language switcher funciona en mobile y es accesible (touch target ≥ 44px).
- [ ] Los meta tags SEO (`<title>`, `<meta description>`) usan los campos del idioma seleccionado.

## Validaciones de seguridad

- [ ] El valor de `language` se valida como uno de los valores permitidos (`es`, `en`) antes de usar.
- [ ] La función `t(key)` retorna un string vacío o el key mismo si no encuentra traducción, nunca un error.
- [ ] No se inyectan strings de traducción sin sanitizar en el DOM.
- [ ] La actualización de `user_profiles.language` respeta permisos (solo el propio usuario o admin).

## Dependencias

- **TASK-016:** Public layout — provee el header público donde se integra el switcher.
- **TASK-017:** Listado público de experiencias — página que debe soportar i18n.
- **TASK-018:** Detalle público de experiencia — página que debe soportar i18n.

## Bloquea a

Ninguna directamente.

## Riesgos y notas

- **No usar librería i18n heavy:** Para v1, un contexto simple con JSON files es suficiente. No se necesita `react-i18next` ni `formatjs` a menos que se requieran plurales, interpolación compleja o más idiomas. Mantener simple.
- **Contenido parcialmente traducido:** Muchas experiencias pueden tener solo campos EN. El fallback a EN debe ser transparente — el visitante nunca debe ver un campo vacío porque el ES no está lleno.
- **SEO y idioma:** Los meta tags deben reflejar el idioma seleccionado. Para crawlers, si el sitio no tiene SSR, los meta tags dependen de JavaScript. Considerar `hreflang` tags si se implementa URL routing por idioma en futuro.
- **Admin/portal:** En v1, admin se mantiene sin i18n (mezcla español/inglés según contexto). Portal tampoco. Solo el sitio público tiene i18n.
- **Plurales y formatos:** La función `t(key)` es simple (key→value). Si se necesitan plurales o interpolación (`"Has {{count}} tickets"`), documentar el patrón pero implementar mínimo viable.
