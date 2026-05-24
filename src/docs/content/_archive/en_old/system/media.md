---
title: Media
description: Manage images and files
section: system
order: 3
lastUpdated: 2026-04-25
---

# Media

The Media Manager is the central repository for all images, videos, and documents used across the OMZONE platform. It provides upload, organization, search, and delivery capabilities with automatic optimization.

## Storage Buckets

| Bucket | Purpose | Permissions |
|--------|---------|-------------|
| `experiences` | Experience images and gallery | Public read |
| `publications` | Publication and section media | Public read |
| `avatars` | User profile photos | Authenticated read |
| `documents` | Legal documents, contracts | Admin write only |
| `marketing` | Promotional materials | Public read |
| `general` | Misc. files | Public read |

## Accessing Media Manager

Navigate to **System → Media** to access the media library.

### Media Library Interface

- **Grid view** for browsing images visually
- **List view** for detailed file information
- **Search** by filename, tags, or date
- **Filters** by bucket, type, date range

## Upload Guidelines

### Image Requirements

| Type | Recommended Size | Max Size |
|------|-----------------|----------|
| Hero images | 1920 x 1080px | 10MB |
| Thumbnails | 400 x 300px | 2MB |
| Gallery images | 1200 x 800px | 5MB |
| Profile photos | 400 x 400px | 2MB |
| Logos | 200 x 200px | 1MB |

### Supported Formats

| Type | Formats |
|------|---------|
| Images | JPG, JPEG, PNG, WebP, GIF, AVIF |
| Documents | PDF |
| Videos | MP4, WebM |

> **WebP preference:** OMZONE automatically converts uploaded images to WebP format for optimized delivery. Original files are preserved.

### File Size Limits

| Type | Limit |
|------|-------|
| Images | 10MB |
| Documents | 25MB |
| Videos | 100MB |

## Organizing Files

### Folders

| Folder | Contents |
|--------|----------|
| `/experiences` | Experience gallery images |
| `/publications` | Blog posts, editorial content |
| `/marketing` | Campaign materials |
| `/profiles` | User avatars |
| `/documents` | Legal and contracts |

### Tags

Tags enable cross-folder search and filtering:

| Tag Examples | Description |
|-------------|-------------|
| `yoga` | Yoga-related images |
| `beach` | Beach/location imagery |
| `morning` | Morning session photos |
| `retreat` | Retreat content |
| `promotional` | Marketing materials |

## Image Optimization

OMZONE automatically optimizes all uploaded images:

| Process | Description |
|---------|-------------|
| Resizing | Multiple output sizes (thumbnail, medium, large, hero) |
| Format conversion | Convert to WebP with fallbacks |
| Compression | Lossy compression for smaller file sizes |
| Blur placeholders | Generate blur hash for lazy loading |

### Generated Sizes

| Size | Dimensions | Use Case |
|------|-----------|----------|
| `thumb` | 100px width | List thumbnails |
| `small` | 400px width | Card images |
| `medium` | 800px width | Gallery previews |
| `large` | 1200px width | Full gallery |
| `hero` | 1920px width | Hero banners |

## Using Media

### In Experiences

1. Edit Experience
2. Navigate to **Images** section
3. Click **Upload** or **Select from Media Manager**
4. For gallery: Add multiple images, reorder via drag-and-drop

### In Publications

1. Edit Publication
2. Add or edit a **Section**
3. For Hero/Image sections: Upload or select image
4. For Gallery sections: Add multiple images

### In Sections

1. Open Publication Sections tab
2. Add/Edit section
3. Select or upload image/video
4. Set alt text for accessibility

## Media Picker Component

The media picker provides a consistent interface for selecting media across the platform:

### Features

| Feature | Description |
|---------|-------------|
| Search | Find by filename or tags |
| Upload | Drag-and-drop or browse |
| Preview | Lightbox preview |
| Multi-select | Select multiple files |
| Folder browsing | Navigate folder hierarchy |

### Accessibility

| Field | Description |
|-------|-------------|
| Alt Text | Image description for screen readers |
| Caption | Optional visible caption |

## Media in Public Pages

All media URLs are public-read and can be embedded in external sites:

```
https://[bucket].racoondevs.com/[file-id]/[filename]
```

> **CDN delivery:** Media files are served through a CDN for fast global delivery.

## Common Mistakes

- **Oversized uploads:** Large images slow down page loads. Resize before uploading.
- **Missing alt text:** Always add descriptive alt text for accessibility and SEO.
- **Duplicate filenames:** Use descriptive filenames (e.g., `yoga-session-hero.jpg` not `image001.jpg`).
- **Wrong bucket selection:** Upload to the correct bucket for permissions and organization.
- **Not using blur placeholders:** Enable blur placeholders for better perceived performance on image-heavy pages.

## Related Pages

- [Experiences](/docs/catalog/experiences) — Experience image management
- [Publications](/docs/content/publications) — Publication media sections
- [Sections](/docs/content/sections) — Media in section blocks
