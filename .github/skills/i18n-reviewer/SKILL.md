# Skill: i18n Reviewer

## Cuándo usarlo

- Después de agregar nuevas traducciones a los archivos i18n de OMZONE
- Antes de un deploy a producción para validar calidad lingüística
- Cuando se detectan textos que suenan "robóticos" o fuera de la voz de marca
- Al agregar una nueva partición i18n (ej: `portal.json`, `admin.json`)
- Cuando el Copywriter Agent genera textos que deben integrarse a los JSON i18n
- Periódicamente como auditoría de calidad del contenido estático de la plataforma
- Al recibir feedback de usuarios sobre textos confusos o mal traducidos
- Tras modificar `content.instructions.md` para verificar que los textos existentes se alineen

## Cuándo NO usarlo

- Para traducir contenido dinámico almacenado en Appwrite (experiencias, publicaciones CMS) — eso es trabajo del Content Agent y Copywriter Agent
- Para agregar soporte de un tercer idioma — eso requiere decisión arquitectónica
- Para modificar la estructura de claves i18n (renombrar keys) — eso es refactoring de frontend
- Para crear textos nuevos desde cero — usar el Copywriter Agent primero, luego este skill para validar

## Entradas necesarias

- [ ] Acceso a `src/i18n/en/*.json` y `src/i18n/es/*.json`
- [ ] `.github/instructions/content.instructions.md` leído (guía de estilo)
- [ ] `.github/agents/copywriter.agent.md` leído (voz de marca)
- [ ] Contexto del cambio: ¿qué se agregó/modificó? ¿qué partición? ¿qué superficie de la app?
- [ ] (Opcional) `.github/instructions/seo.instructions.md` si los textos afectan meta tags SEO

## Procedimiento paso a paso

### Fase 1: Preparación

1. **Leer las guías de estilo** — cargar `content.instructions.md` y extraer: los 6 pilares de marca, las reglas de voz/tono, los do/don't de redacción, y el glosario de términos fijos.

   ✅ Hecho cuando: se tienen claros los pilares (Bienestar, Transformación, Ritual, Calma, Lujo sutil, Experiencia memorable) y las reglas de voz (cálido, invitador, sensorial).

2. **Inventariar archivos i18n** — listar todos los archivos en `src/i18n/en/` y `src/i18n/es/`. Verificar que cada partición EN tenga su equivalente ES.

   ✅ Hecho cuando: se tiene la lista completa de particiones y se confirma paridad de archivos.

3. **Identificar alcance** — si la auditoría es parcial (solo una partición recién modificada), delimitar el scope. Si es completa, marcar todas las particiones.

   ✅ Hecho cuando: se sabe exactamente qué archivos se van a revisar.

### Fase 2: Análisis de completitud

4. **Comparar claves EN ↔ ES** — para cada partición, extraer todas las claves (con dot-path completo) y compararlas. Reportar claves presentes en un idioma pero ausentes en otro.

   ✅ Hecho cuando: se genera una lista de claves faltantes (puede estar vacía si todo está completo).

5. **Verificar estructura de claves** — confirmar que las claves siguen `camelCase`, pertenecen al namespace correcto de su partición, y no hay claves duplicadas entre particiones.

   ✅ Hecho cuando: estructura de claves validada, sin duplicados ni naming incorrecto.

### Fase 3: Revisión gramatical

6. **Revisar inglés** — para cada value EN, verificar:
   - Ortografía correcta
   - Puntuación apropiada (labels sin punto final, frases con punto si son oraciones)
   - Capitalización consistente (Title Case para labels, sentence case para descripciones)
   - Naturalidad del texto (no suena a template genérico)

   ✅ Hecho cuando: todos los values EN revisados, errores listados.

7. **Revisar español** — para cada value ES, verificar:
   - Ortografía y acentos correctos (sesión, inmersión, información, etc.)
   - Concordancia de género y número
   - Uso consistente de "tú" (informal, cálida)
   - Puntuación y capitalización adaptada a convenciones del español
   - No es traducción literal — suena natural en español

   ✅ Hecho cuando: todos los values ES revisados, errores listados.

### Fase 4: Coherencia terminológica

8. **Verificar glosario** — confirmar que los términos fijos del dominio OMZONE se usan consistentemente:
   - "Experience" / "Experiencia" (nunca "event" / "evento")
   - "Session" / "Sesión" (nunca "clase" ni "class")
   - "Stay" / "Estancia" (nunca "hospedaje" ni "alojamiento")
   - "Addon" / "Complemento" (nunca "extra" ni "agregado")
   - "Booking" / "Reserva" (nunca "cita" ni "appointment")
   - "Wellness" se mantiene en español cuando es concepto de marca

   ✅ Hecho cuando: todos los textos usan terminología del glosario OMZONE.

9. **Verificar consistencia cruzada** — si el mismo concepto aparece en múltiples particiones (ej: "Explore Experiences" en checkout y landing), verificar que el texto sea idéntico.

   ✅ Hecho cuando: no hay variaciones accidentales del mismo texto.

### Fase 5: Evaluación de voz de marca

10. **Evaluar contra pilares** — para cada texto visible al público (landing, checkout), verificar que transmita al menos uno de los pilares: Bienestar, Transformación, Ritual, Calma, Lujo sutil, Experiencia memorable. Los labels funcionales (botones, estados) están exentos.

    ✅ Hecho cuando: textos públicos evaluados contra pilares.

11. **Detectar copy genérico** — identificar textos que suenan a template de e-commerce genérico y proponer alternativas con voz wellness premium. Ejemplo: "No items found" → "No experiences match your current filters."

    ✅ Hecho cuando: textos genéricos identificados con propuestas de mejora.

12. **Consultar al Copywriter Agent** (si necesario) — para textos que requieran reescritura creativa, invocar al subagente `copywriter` con el contexto y la pieza a mejorar.

    ✅ Hecho cuando: textos reescritos se integran correctamente al JSON.

### Fase 6: Validación y entrega

13. **Aplicar correcciones** — editar los archivos JSON con las correcciones autorizadas. Nunca modificar claves (keys), solo valores (values).

    ✅ Hecho cuando: archivos editados con correcciones.

14. **Verificar JSON válido** — ejecutar `npm run build` para confirmar que todos los archivos JSON son parseables y el build pasa.

    ✅ Hecho cuando: build exitoso sin errores.

15. **Generar reporte** — producir el reporte de auditoría con el formato definido en el agent (sección 11 de `i18n.agent.md`).

    ✅ Hecho cuando: reporte generado con todas las categorías.

## Checklist de entrega

- [ ] Paridad de particiones EN ↔ ES verificada
- [ ] 100% de claves presentes en ambos idiomas
- [ ] 0 errores ortográficos en EN
- [ ] 0 errores ortográficos/acentos en ES
- [ ] Concordancia de género/número correcta en ES
- [ ] Uso consistente de "tú" en ES
- [ ] Glosario OMZONE respetado en ambos idiomas
- [ ] Consistencia de textos duplicados entre particiones
- [ ] Voz wellness premium verificada en textos públicos
- [ ] No se expone el label "root" en ningún texto
- [ ] Build pasa sin errores
- [ ] Reporte de auditoría generado

## Errores comunes

❌ Traducir literalmente "Crafted with intention" → "Elaborado con intención"
✅ Adaptación natural: "Creado con intención" — suena orgánico en español

❌ Dejar "Session" como "Session" en español
✅ Usar "Sesión" con tilde — es el término correcto en el glosario OMZONE

❌ Usar "usted" o forma impersonal en textos públicos
✅ OMZONE usa "tú" — cálido, cercano, informal: "Descubre tu experiencia"

❌ Agregar nueva clave solo en `en/landing.json` sin su equivalente en `es/landing.json`
✅ Siempre agregar la clave en ambos idiomas al mismo tiempo

❌ Poner punto final en labels de botones ("Reservar Ahora.")
✅ Labels sin punto: "Reservar Ahora". Frases descriptivas sí llevan punto si son oraciones completas.

❌ Usar "evento" para referirse a una experiencia OMZONE
✅ Siempre "experiencia" — OMZONE no vende eventos, vende experiencias wellness

❌ Capitalizar todas las palabras en español al estilo inglés ("Todas Las Experiencias")
✅ En español solo mayúscula inicial: "Todas las experiencias" (excepto nombres propios)

## Output esperado

1. **Reporte de auditoría** — tabla categorizada con: claves faltantes, errores gramaticales, inconsistencias terminológicas, sugerencias de voz de marca
2. **Archivos corregidos** — JSONs editados si se autorizaron cambios
3. **Glosario actualizado** — si se detectaron nuevos términos que deben fijarse

## Referencias cruzadas

- **Guía de estilo editorial:** `.github/instructions/content.instructions.md`
- **Voz de marca / Copywriter:** `.github/agents/copywriter.agent.md`
- **Agent i18n:** `.github/agents/i18n.agent.md`
- **Instrucciones SEO (meta tags bilingües):** `.github/instructions/seo.instructions.md`
- **Contexto i18n:** `src/contexts/LanguageContext.jsx`
- **Hook de idioma:** `src/hooks/useLanguage.js`
- **Documento maestro:** `docs/core/00_documento_maestro_requerimientos.md`
- **Archivos i18n EN:** `src/i18n/en/*.json`
- **Archivos i18n ES:** `src/i18n/es/*.json`
