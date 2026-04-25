# Multi-Format Export Skill

Exports documentation to HTML, Markdown, PDF, and other formats while preserving styling, interactivity, and navigation.

## Overview

This skill handles exporting documentation to various formats for offline use, printing, or integration with other systems.

## When to Use

- Creating downloadable PDF documentation
- Generating static HTML for hosting anywhere
- Exporting to Markdown for import to other tools
- Creating printed manuals from documentation

## Supported Formats

| Format | Extension | Use Case |
|--------|-----------|----------|
| HTML | `.html` | Static hosting, offline viewing |
| Markdown | `.md` | Import to other tools, git-based storage |
| PDF | `.pdf` | Printing, offline reading |
| JSON | `.json` | Data export, programmatic use |
| ePub | `.epub` | E-reader devices |
| DITA | `.dita` | DITA XML documentation system |

## Export Configuration

### Basic Export
```javascript
{
  format: "html",
  source: "/docs",
  output: "./dist",
  options: {
    navigation: true,
    search: true,
    theme: "dark"
  }
}
```

### PDF Export
```javascript
{
  format: "pdf",
  source: "/docs/getting-started",
  output: "./dist/getting-started.pdf",
  options: {
    pageSize: "A4",
    margins: { top: "2cm", bottom: "2cm", left: "2cm", right: "2cm" },
    includeToc: true,
    includeCode: true,
    syntaxHighlight: true
  }
}
```

## HTML Export

### Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <nav class="sidebar">{navigation}</nav>
  <main class="content">{renderedMarkdown}</main>
  <aside class="context-panel">{toc}</aside>
  <script src="./search.js"></script>
</body>
</html>
```

### Standalone HTML
Single-file export with inlined styles and scripts:
```javascript
{
  standalone: true,
  minify: true,
  inlineStyles: true,
  inlineScripts: true
}
```

## Markdown Export

### Preservation Rules
| Element | Transformation |
|---------|----------------|
| Frontmatter | Comment block at top |
| Headings | Preserved as-is |
| Code blocks | Preserved with language tag |
| Tables | GFM table syntax |
| Links | Relative links preserved |
| Images | Downloaded and re-linked |

### Export Output
```markdown
<!-- Generated from: /docs/guides/authentication.md -->
<!-- Version: v2.0.0 -->
<!-- Exported: 2024-01-15 -->

# Authentication Guide

## Overview

...

## Code Examples

```javascript
const auth = new Auth();
```
```

## PDF Export

### PDF Generation Pipeline
```javascript
async function generatePDF(source, options) {
  // 1. Convert markdown to HTML
  const html = await renderMarkdown(source);
  
  // 2. Apply print styles
  const styledHtml = applyPrintStyles(html, options);
  
  // 3. Generate PDF
  const pdf = await puppeteer.render(styledHtml, {
    format: options.pageSize,
    margin: options.margins,
    printBackground: true
  });
  
  return pdf;
}
```

### Print Stylesheet
```css
@media print {
  .sidebar, .context-panel, .search-box {
    display: none;
  }
  
  .content {
    width: 100%;
    max-width: none;
  }
  
  code {
    background: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
  }
  
  pre {
    white-space: pre-wrap;
    word-break: break-word;
  }
}
```

## Batch Export

### Export Entire Documentation
```javascript
async function exportAll(config) {
  const docs = await collectAllDocuments();
  
  for (const doc of docs) {
    const exported = await exportDocument(doc, config);
    await saveDocument(exported, config.output);
    reportProgress(doc.path);
  }
  
  await generateIndex(config.output);
}
```

### Selective Export
```javascript
{
  include: ["/docs/getting-started/**", "/docs/api-reference/**"],
  exclude: ["/docs/internal/**", "/docs/drafts/**"],
  versions: ["v2"]
}
```

## Navigation Preservation

### In HTML
Internal links converted to relative HTML links:
```html
<a href="./authentication.html">Authentication Guide</a>
```

### In PDF
Internal links converted to bookmarks:
```javascript
{
  bookmarks: [
    { title: "Authentication Guide", page: 5 },
    { title: "Setup", page: 6, parent: 5 }
  ]
}
```

### Cross-Format Links
```javascript
// Link from HTML export to PDF export
<a href="../pdf/getting-started.pdf">Download PDF</a>
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Missing images | Image not accessible | Copy locally or skip with warning |
| Broken links | Target not in export set | Include missing pages or remove link |
| Large PDF | Too many pages | Split into volumes |
| Missing fonts | Font not available | Embed fonts or use fallbacks |

## Integration Points

- **create-document**: Document format determined at creation
- **format-code**: Syntax highlighting preserved in exports
- **version-tracking**: Version selector in exported HTML
- **search-indexing**: Search included in HTML export