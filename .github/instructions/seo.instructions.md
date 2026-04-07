---
description: "Usar cuando se editen páginas públicas, meta tags, SEO, structured data, sitemap, robots.txt, Open Graph, hreflang, local SEO o posicionamiento de OMZONE en Puerto Vallarta y Bahía de Banderas."
applyTo: "index.html,public/sitemap.xml,public/robots.txt,src/pages/public/**,src/components/common/SEOHead.jsx,src/components/common/StructuredData.jsx,src/hooks/useSEO.js,scripts/generate-sitemap.mjs"
---

# SEO — OMZONE

## 1. Identidad de marca

| Clave               | Valor                                                        |
| ------------------- | ------------------------------------------------------------ |
| Brand               | OMZONE                                                       |
| Tagline EN          | Wellness Experiences                                         |
| Tagline ES          | Experiencias de Bienestar                                    |
| Dominio             | omzone.com                                                   |
| Ubicación principal | Puerto Vallarta & Bahía de Banderas, Jalisco/Nayarit, México |
| Mercado             | Internacional (EN primario) + local (ES secundario)          |

---

## 2. Keyword strategy

### Core keywords (EN — primary)

- wellness experiences Puerto Vallarta
- wellness retreat Bahia de Banderas
- sound healing Puerto Vallarta
- meditation retreat Mexico
- holistic wellness Riviera Nayarit
- breathwork session Puerto Vallarta
- wellness immersion Mexico
- transformative retreat Bahia de Banderas
- mindfulness retreat Puerto Vallarta
- wellness stay Riviera Nayarit

### Core keywords (ES — secondary)

- experiencias de bienestar Puerto Vallarta
- retiro wellness Bahía de Banderas
- meditación Puerto Vallarta
- sanación con sonido Riviera Nayarit
- retiro holístico México
- inmersión de bienestar Puerto Vallarta

### Long-tail / semánticos

- best wellness experiences in Puerto Vallarta
- things to do in Bahia de Banderas wellness
- sound bath near me Puerto Vallarta
- weekend retreat Puerto Vallarta 2026
- luxury wellness retreat Mexico Pacific coast
- experiencias únicas de bienestar en Puerto Vallarta

### Variaciones geográficas (usar naturalmente en copy)

- Puerto Vallarta, Jalisco, Mexico
- Bahía de Banderas, Nayarit, Mexico
- Riviera Nayarit
- Pacific coast of Mexico
- Banderas Bay

---

## 3. Meta tags obligatorios por página

### Todas las páginas públicas

```jsx
<SEOHead
  title="Descriptivo, ≤60 chars, keyword principal"
  description="Accionable, ≤155 chars, keyword + ubicación + CTA implícita"
  canonical={url_absoluta}
  ogImage={imagen_1200x630}
/>
```

### Reglas de title

- Formato: `{Keyword phrase} — OMZONE`
- Máximo 60 caracteres (se trunca en SERP)
- Incluir ubicación geográfica cuando sea relevante
- NO repetir "OMZONE" dos veces
- Cada página DEBE tener un title único

### Reglas de description

- Máximo 155 caracteres
- Incluir 1 keyword principal + ubicación
- Tono aspiracional pero informativo
- Incluir call-to-action implícita ("Discover", "Book", "Explore")
- NO repetir description entre páginas

### Ejemplos correctos

| Página      | Title                                                 | Description                                                                                                                                   |
| ----------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Home        | `OMZONE — Wellness Experiences`                       | `Discover transformative wellness experiences in Puerto Vallarta — sessions, immersions, retreats and stays crafted for mind, body and soul.` |
| Experiences | `Wellness Experiences in Puerto Vallarta — OMZONE`    | `Explore sound healing, meditation, breathwork and holistic retreats in Bahía de Banderas. Book your next transformative experience.`         |
| Detail      | `{experience.publicName} in Puerto Vallarta — OMZONE` | `{shortDescription} — Book now in Bahía de Banderas.`                                                                                         |
| About       | `About OMZONE — Wellness in Puerto Vallarta`          | `Premium wellness experiences in Puerto Vallarta and Bahía de Banderas. Our story, philosophy and commitment to transformation.`              |

---

## 4. Local SEO

### Geo meta tags (agregar al index.html o SEOHead)

```html
<meta name="geo.region" content="MX-JAL" />
<meta name="geo.placename" content="Puerto Vallarta" />
<meta name="geo.position" content="20.6534;-105.2253" />
<meta name="ICBM" content="20.6534, -105.2253" />
```

### Organization structured data (JSON-LD global en layout público)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OMZONE",
  "url": "https://omzone.com",
  "logo": "https://omzone.com/images/logo.png",
  "description": "Premium wellness experiences in Puerto Vallarta and Bahía de Banderas",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Puerto Vallarta",
    "addressRegion": "Jalisco",
    "addressCountry": "MX"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 20.6534,
    "longitude": -105.2253
  },
  "areaServed": [
    { "@type": "City", "name": "Puerto Vallarta" },
    { "@type": "City", "name": "Bahía de Banderas" }
  ],
  "sameAs": []
}
```

### Event structured data (ya implementado en useSEO.js)

Cuando un slot tenga ubicación, agregar `location` al JSON-LD:

```json
{
  "location": {
    "@type": "Place",
    "name": "Nombre del venue",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Puerto Vallarta",
      "addressRegion": "Jalisco",
      "addressCountry": "MX"
    }
  }
}
```

---

## 5. Hreflang y multiidioma

### Estrategia

- Página por defecto: inglés (`en`)
- Contenido bilingual: si existe `descriptionEs`, puede usarse para meta alternativa
- Cuando exista versión `/es/` de páginas, agregar hreflang:

```html
<link
  rel="alternate"
  hreflang="en"
  href="https://omzone.com/experiences/slug"
/>
<link
  rel="alternate"
  hreflang="es"
  href="https://omzone.com/es/experiences/slug"
/>
<link
  rel="alternate"
  hreflang="x-default"
  href="https://omzone.com/experiences/slug"
/>
```

### Mientras no exista routing bilingüe

- `lang="en"` en `<html>` (idioma principal del contenido público)
- Meta description en inglés
- Contenido visible puede incluir español donde sea natural (nombres de experiencias, localizaciones)

---

## 6. Imágenes y media

- Todo `<img>` público DEBE tener `alt` descriptivo con keyword cuando aplique
- Formato: `alt="Sound healing session at sunset in Puerto Vallarta — OMZONE"`
- OG images: 1200×630px mínimo, formato JPG/PNG
- Usar `loading="lazy"` en imágenes below-the-fold
- Nombres de archivo descriptivos: `sound-healing-puerto-vallarta.jpg` no `IMG_4521.jpg`

---

## 7. URLs y slugs

- Slugs en inglés, lowercase, kebab-case: `/experiences/sound-healing-sunset`
- NO usar IDs en URLs públicas
- NO usar parámetros de query para contenido indexable
- Máximo 3-4 palabras por slug
- Incluir keyword cuando sea natural

---

## 8. Performance SEO

- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Prerender / SSR para páginas críticas de SEO (considerar Appwrite Sites o prerender.io)
- `<link rel="preload">` para fuentes y hero images críticas
- Minificar CSS/JS (Vite lo hace por default)
- Comprimir imágenes con Appwrite preview transforms

---

## 9. Sitemap y robots

### sitemap.xml

- Regenerar en cada build (`scripts/generate-sitemap.mjs`)
- Incluir TODAS las páginas públicas indexables
- Incluir experiencias publicadas con slug
- Incluir publicaciones del CMS
- `<lastmod>` debe reflejar fecha real de actualización
- NO incluir páginas de admin, portal, checkout, auth

### robots.txt

- Mantener bloqueo de `/admin/*`, `/portal/*`, `/checkout/*`, `/login`, `/register`
- Apuntar a sitemap: `Sitemap: https://omzone.com/sitemap.xml`
- NO bloquear assets CSS/JS (Google los necesita para renderizar)

---

## 10. Checklist por página pública nueva

- [ ] Title único, ≤60 chars, con keyword
- [ ] Description única, ≤155 chars, con keyword + ubicación
- [ ] Canonical URL absoluta
- [ ] OG tags completos (title, description, image, type, url)
- [ ] Twitter card tags
- [ ] Alt text en todas las imágenes
- [ ] Structured data JSON-LD apropiado
- [ ] Slug descriptivo en kebab-case
- [ ] Agregada al sitemap
- [ ] Verificar que no tiene `noindex` accidental
- [ ] Heading hierarchy (un solo `<h1>` por página)
