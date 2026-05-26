---
title: Ayuda y FAQ
description: La página pública de Ayuda y FAQ de OMZONE — acordeón de preguntas frecuentes y formulario de contacto rápido
section: landing
order: 6
lastUpdated: 2026-05-25
---

# Ayuda y FAQ

La página de **Ayuda y FAQ** (`/help`) es un recurso público para visitantes y clientes que tienen preguntas o necesitan ponerse en contacto. Combina un acordeón de preguntas frecuentes con un formulario de contacto rápido — sin necesidad de iniciar sesión.

---

## Qué hay en la página

### Acordeón de preguntas frecuentes

Una lista de preguntas y respuestas comunes organizadas por tema. Cada elemento se expande al hacer clic para revelar la respuesta.

El contenido del FAQ se gestiona a través de **Publicaciones** — cualquier publicación de blog etiquetada con `faq` se incluye automáticamente. Para agregar o editar entradas del FAQ, crea o actualiza una publicación con la etiqueta `faq` y mantenla en estado **Publicada**. Ver [Publicaciones](../admin/publicaciones.md) para gestionar publicaciones y [Secciones y bloques](../admin/secciones-y-bloques.md) para editar su contenido.

La página incluye datos estructurados JSON-LD (`schema.org/FAQPage`) para SEO, lo que ayuda a que las respuestas aparezcan directamente en los resultados de búsqueda de Google.

### Formulario de contacto rápido

Debajo de la sección de FAQ hay un formulario de contacto embebido para visitantes que no encontraron respuesta:

| Campo                            | Obligatorio | Descripción                         |
| -------------------------------- | ----------- | ----------------------------------- |
| **Nombre**                       | ✅          | Nombre completo del remitente       |
| **Correo**                       | ✅          | Correo de contacto                  |
| **Tema**                         | ✅          | Sobre qué es la pregunta o problema |
| **Teléfono**                     | —           | Número de teléfono opcional         |
| **Mensaje**                      | ✅          | El mensaje completo                 |
| **Método de contacto preferido** | —           | correo, llamada o WhatsApp          |

Se requiere marcar el checkbox de **reCAPTCHA v2** para enviar el formulario.

---

## Cómo se enrutan los envíos

Los envíos del formulario de contacto rápido se envían a través de la Función de Appwrite `submit-contact` y llegan a **Mensajes de contacto** en el panel de administración. La categoría asignada depende del contexto:

- Los envíos desde la página FAQ se asignan por defecto a la categoría **FAQ**.
- Si el usuario describe un problema, puede seleccionar **Soporte**.

Todos los envíos son visibles en la bandeja **Mensajes** del admin. Ver [Mensajes de contacto](../admin/mensajes.md).

---

## Cargar contenido FAQ inicial

El contenido FAQ se carga en desarrollo con:

```bash
APPWRITE_API_KEY=<clave> node scripts/seed-faq-publications.mjs
```

Esto crea un conjunto base de publicaciones FAQ con la etiqueta `faq`. En producción, el contenido del FAQ se gestiona a través del módulo de Publicaciones del admin.

---

## Acceder a la página

La página está disponible en:

- `/help`
- `/faq` (alias)

Está enlazada desde el footer del sitio web y puede enlazarse desde plantillas de correo u otras páginas según sea necesario.
