---
name: documentation-platform
description: Comprehensive documentation generation, management, and publishing for professional documentation platforms
---

# Documentation Platform Skills

This skill package provides intelligent documentation generation capabilities for the Documentation Platform mode. It handles document creation, code formatting, navigation generation, cross-referencing, version management, and multi-format export.

## Quick Reference

| Task | Skill | Key Action |
|------|-------|------------|
| Create doc from data | `create-document` | Generate markdown from structured input |
| Format code examples | `format-code` | Extract and syntax-highlight code |
| Build table of contents | `generate-toc` | Parse headings and create navigation |
| Link related topics | `cross-reference` | Create bidirectional links |
| Track version changes | `version-tracking` | Maintain version history |
| Integrate playgrounds | `playground-integration` | Add interactive code editors |
| Index for search | `search-indexing` | Build search index |
| Export to formats | `multi-format-export` | Generate HTML/MD/PDF |
| Scaffold templates | `template-scaffolding` | Create from templates |
| Manage metadata | `metadata-management` | Handle attribution and versioning |

## Usage

Select the appropriate skill for your task. Each skill can be used independently or chained together for complex documentation workflows.

### Single Skill Usage
```
Use the [skill-name] skill to [task description]
```

### Chained Workflows
```
Use create-document first to generate base content, then format-code to add syntax highlighting
```

## Skill Details

### [create-document](./references/create-document.md)
Generates documentation from structured data sources including JSON, YAML, or API responses.

### [format-code](./references/format-code.md)
Extracts code blocks from source files and applies syntax highlighting with proper language detection.

### [generate-toc](./references/generate-toc.md)
Automatically generates table of contents based on heading hierarchy (H1-H6).

### [cross-reference](./references/cross-reference.md)
Creates bidirectional links between related documentation topics.

### [version-tracking](./references/version-tracking.md)
Manages version-aware documentation updates and change tracking.

### [playground-integration](./references/playground-integration.md)
Integrates interactive code playgrounds with live examples.

### [search-indexing](./references/search-indexing.md)
Builds and maintains full-text search indexes for documentation.

### [multi-format-export](./references/multi-format-export.md)
Exports documentation to HTML, Markdown, PDF, and other formats.

### [template-scaffolding](./references/template-scaffolding.md)
Creates new documents from consistent templates.

### [metadata-management](./references/metadata-management.md)
Manages author attribution, timestamps, and version tracking.

## Workflow Integration

These skills integrate with the Documentation Platform mode by:

1. Following patterns defined in `.roo/rules-documentation-platform/`
2. Outputting to the correct directory structure (`docs/`, `guides/`, etc.)
3. Using consistent frontmatter format for all markdown files
4. Supporting the navigation hierarchy and sidebar structure
5. Integrating with the AI-powered search system

## Examples

See each skill's reference file for detailed examples and usage patterns.