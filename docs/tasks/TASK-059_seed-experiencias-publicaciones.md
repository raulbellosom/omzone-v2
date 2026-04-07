# TASK-059: Seed — Experiencias, ediciones, publicaciones y media de demostración

## Objetivo

Crear datos de demostración completos para OMZONE: 3-5 experiencias con sus ediciones, pricing, slots y media; 2-3 publicaciones editoriales con secciones de contenido; imágenes subidas al bucket `public-resources` y referenciadas desde los documentos. Al completar esta tarea, la plataforma tiene contenido real para validar la landing, el catálogo, el detalle, el panel admin y el portal de cliente.

## Contexto

- **Fase:** D — Datos de demostración y QA (post-fase 15)
- **Documento maestro:** Todos los dominios — necesitan datos para validar flujos completos.
- **Estado actual:** La base de datos no tiene experiencias, ediciones, publicaciones ni media creados. Solo existen seeds parciales para locations, addons, slots y packages. Las páginas públicas no tienen contenido que mostrar.
- **Scripts existentes:** `seed-test-data.mjs` (locations, addons), `seed-packages.mjs`, `seed-reminder-template.mjs`. Ninguno crea experiencias ni publicaciones.
- **Buckets disponibles:** `experience_media`, `publication_media`, `public-resources` para imágenes.

## Alcance

Lo que SÍ incluye esta tarea:

1. **Script `seed-experiences.mjs`** que cree:
   - 3-5 experiencias variadas:
     - 1 sesión/inmersión (e.g., Sound healing session)
     - 1 retiro (e.g., 3-day mindfulness retreat)
     - 1 estancia (e.g., Wellness weekend getaway)
     - 1 experiencia privada (e.g., Private couples massage)
     - (Opcional) 1 experiencia adicional
   - Cada experiencia con:
     - Título EN/ES, descripción, highlights, tipo, duración, categoría
     - Al menos 1 edición con pricing tiers
     - Al menos 1 slot futuro con capacidad
     - Tags y categorías asignados
     - Imagen de portada (file ID de `public-resources` o `experience_media`)
     - Galería de imágenes (2-3 imágenes por experiencia)
     - Status: publicado
2. **Script `seed-publications.mjs`** que cree:
   - 2-3 publicaciones editoriales:
     - 1 artículo sobre bienestar/wellness (e.g., "The Art of Sound Healing")
     - 1 guía de destino (e.g., "Puerto Vallarta: A Wellness Paradise")
     - 1 historia/experiencia (e.g., "Behind the Retreat: Our Philosophy")
   - Cada publicación con:
     - Contenido real de calidad (no lorem ipsum)
     - 2-3 secciones (text, image, quote)
     - Tags relacionados
     - Status: publicado
3. **Imágenes de demostración**: Subir 10-15 imágenes de stock (wellness, naturaleza, yoga, spa) a `public-resources` o `experience_media`. Pueden ser URLs de Unsplash/Pexels descargadas o referencias si se usa API.
4. **Documentación**: Instrucciones de cómo ejecutar los seeds y qué datos crean.

## Fuera de alcance

- Órdenes de demostración (se crean manualmente vía checkout).
- Tickets de demostración.
- Usuarios/clientes de demostración.
- Datos de producción (estos son solo para dev/staging).
- Copiar contenido con copyright — usar contenido original o libre de derechos.

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)
- [x] Comercial (pricing, addons, paquetes, pases)
- [x] Agenda (slots, recursos, capacidad)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `experiences` | crear | 3-5 experiencias completas |
| `experience_editions` | crear | 1+ edición por experiencia |
| `pricing_tiers` | crear | Tiers por edición |
| `slots` | crear | Slots futuros por edición |
| `tags` | crear | Tags de categoría/tema |
| `publications` | crear | 2-3 publicaciones |
| `publication_sections` | crear | Secciones por publicación |
| Appwrite Storage | crear archivos | Imágenes de demostración |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `experience_media` | subir | Imágenes de experiencias |
| `publication_media` | subir | Imágenes de publicaciones |
| `public-resources` | subir | Imágenes compartidas / hero |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| Ninguno | — | — | Es un script de seed, no un componente |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| Ninguna | — | — | Scripts ejecutados manualmente |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ejecutar seeds | ✅ | ✅ | ❌ | ❌ | ❌ |

## Flujo principal

1. Ejecutar `node scripts/seed-experiences.mjs` — crea experiencias con ediciones, pricing, slots y tags.
2. Ejecutar `node scripts/seed-publications.mjs` — crea publicaciones con secciones y tags.
3. Verificar que las experiencias aparecen en el catálogo público.
4. Verificar que las publicaciones aparecen en la sección editorial.
5. Verificar que las imágenes se muestran correctamente.
6. Verificar que el admin puede ver y editar los datos creados.

## Criterios de aceptación

- [ ] Existen 3-5 experiencias en la base de datos con datos completos (título EN/ES, descripción, tipo, duración, imagen de portada, galería).
- [ ] Cada experiencia tiene al menos 1 edición con pricing tiers.
- [ ] Cada experiencia tiene al menos 1 slot futuro con capacidad > 0.
- [ ] Existen 2-3 publicaciones con secciones de contenido real (no lorem ipsum).
- [ ] Las imágenes se muestran correctamente en la UI.
- [ ] El catálogo público muestra las experiencias seeded.
- [ ] El detalle de experiencia muestra datos completos (hero, pricing, agenda).
- [ ] El admin puede ver y editar todas las entidades seeded.
- [ ] Los scripts son idempotentes — no duplican datos si se ejecutan más de una vez.
- [ ] Los scripts documentan qué datos crean y cómo ejecutarlos.

## Dependencias

- **TASK-003:** Schema editorial.
- **TASK-004:** Schema comercial.
- **TASK-005:** Schema agenda.
- Seeds existentes: `seed-test-data.mjs` (locations, addons) deben ejecutarse primero si las experiencias dependen de locations/addons.

## Bloquea a

- **TASK-051:** Landing page necesita contenido para mostrar experiencias destacadas.
- **TASK-054:** Experiencias listing necesita contenido para validar diseño editorial.
- **TASK-060:** QA integral necesita datos para probar flujos completos.

## Riesgos y notas

- **Imágenes de stock:** Necesitan ser libres de derechos (Unsplash, Pexels) o generadas. Documentar la fuente de cada imagen.
- **Contenido editorial:** Debe reflejar la voz de marca OMZONE (wellness premium, evocador, bilingüe). No usar lorem ipsum — el contenido debe ser realista y aspiracional.
- **IDs hardcoded:** Los scripts de seed deben usar IDs determinísticos (e.g., `exp-sound-healing`, `pub-art-of-healing`) para ser idempotentes y referenciables.
- **Orden de ejecución:** Primero locations/addons (seed-test-data), luego experiencias (seed-experiences), luego publicaciones (seed-publications).
- Considerar agregar instrucciones al README o un script `seed-all.mjs` que ejecute todo en orden.
