# Template Scaffolding Skill

Creates new documents from consistent templates ensuring uniform structure and formatting across documentation.

## Overview

This skill provides document scaffolding with templates for common documentation types, ensuring consistency and reducing setup time.

## When to Use

- Creating new documentation pages quickly
- Enforcing documentation standards
- Setting up new documentation sections
- Generating multiple related pages from structure

## Template Types

### API Reference Template
```yaml
type: api-reference
category: API Reference
filename: api-{resource}.md
```

### Guide Template
```yaml
type: guide
category: Guides
filename: {slug}.md
```

### Tutorial Template
```yaml
type: tutorial
category: Tutorials
filename: tutorial-{number}-{slug}.md
```

### Concept Template
```yaml
type: concept
category: Concepts
filename: {slug}.md
```

## Template Structure

### Frontmatter Template
```yaml
---
title: {title}
description: {description}
category: {category}
tags: [{tags}]
order: {order}
version: {version}
author: {author}
createdAt: {ISO8601timestamp}
updatedAt: {ISO8601timestamp}
---
```

### Content Template
```markdown
# {Title}

## Overview

{Overview content - what this is and why it matters}

## Prerequisites

- List of requirements or prior knowledge

## Steps

### Step 1: {First Step}

{Detailed instructions}

### Step 2: {Second Step}

{Detailed instructions}

## Examples

{Usage examples with code}

## Troubleshooting

{Common issues and solutions}

## See Also

- [Related Topic](./related.md)
- [Another Topic](./another.md)
```

## Scaffolding Commands

### Create New Page
```bash
docs scaffolding create guide \
  --title "User Authentication" \
  --category "Guides" \
  --order 3
```

### Create From Template File
```bash
docs scaffolding create \
  --template ./templates/api-reference.yaml \
  --vars "resource=users,version=v2"
```

### Batch Create
```bash
docs scaffolding batch \
  --template ./templates/resource.yaml \
  --csv ./resources.csv
```

## Template Variables

### Standard Variables
| Variable | Description | Example |
|----------|-------------|---------|
| title | Page title | "User Authentication" |
| slug | URL-safe identifier | "user-authentication" |
| description | Brief description | "Implement secure authentication" |
| category | Navigation category | "Guides" |
| tags | Comma-separated tags | "auth,security,oauth" |
| order | Sort order in category | 3 |
| author | Documentation author | "Jane Developer" |
| version | Documentation version | "v2" |

### Auto-Generated Variables
| Variable | Generated From | Example |
|----------|---------------|----------|
| filename | slug + extension | "user-authentication.md" |
| anchor | slugified heading | "user-authentication" |
| createdAt | Current timestamp | "2024-01-15T10:30:00Z" |
| updatedAt | Current timestamp | "2024-01-15T10:30:00Z" |

### Custom Variables
```yaml
template:
  variables:
    apiVersion: "v2"
    authProvider: "oauth"
    codeLanguage: "javascript"
```

## Template Hierarchy

### Base Template
```
templates/
  base.md
```

### Extending Templates
```markdown
<!-- extends base.md -->

## Content Section

Custom content here...
```

### Template Inheritance
```yaml
# api-reference.yaml
extends: base.md
sections:
  - type: parameters
  - type: responses
  - type: examples
  - type: errors
```

## Directory Structure Generation

### Auto-Create Directories
```javascript
{
  createDirectories: true,
  directoryStructure: [
    "guides",
    "guides/authentication",
    "guides/authentication/examples"
  ]
}
```

### Navigation Integration
```javascript
{
  addToNavigation: true,
  navigationConfig: {
    category: "Guides",
    order: 3,
    icon: "book"
  }
}
```

## Validation

### Template Validation
```javascript
function validateTemplate(template) {
  const errors = [];
  
  if (!template.title) {
    errors.push("Template missing required field: title");
  }
  
  if (!template.content && !template.extends) {
    errors.push("Template must have content or extend another template");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Frontmatter Validation
```javascript
const frontmatterSchema = {
  title: { type: "string", required: true, minLength: 1 },
  description: { type: "string", maxLength: 160 },
  category: { type: "string", required: true },
  tags: { type: "array", items: { type: "string" } },
  order: { type: "number", min: 0 }
};
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Template not found | Path doesn't exist | Check template path |
| Missing variable | Variable not provided | Provide in command or default |
| Invalid frontmatter | Schema violation | Fix frontmatter syntax |
| Duplicate filename | File already exists | Use --force or different name |

## Integration Points

- **create-document**: Uses templates for document creation
- **cross-reference**: Auto-adds related links from template
- **generate-toc**: TOC structure defined in templates
- **metadata-management**: Author/timestamps from user context