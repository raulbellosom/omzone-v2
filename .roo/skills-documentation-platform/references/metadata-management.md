# Metadata Management Skill

Manages author attribution, timestamps, and version tracking metadata for documentation files.

## Overview

This skill handles all metadata operations including reading, writing, and maintaining frontmatter, as well as tracking document lifecycle information.

## When to Use

- Updating document metadata
- Batch updating author information
- Tracking document changes over time
- Managing version-specific metadata

## Frontmatter Schema

### Required Fields
```yaml
---
title: string (required)
description: string (required, max 160 chars)
category: string (required)
---
```

### Optional Fields
```yaml
---
title: string
description: string
category: string
tags: [string]
order: number
version: string
author: string
createdAt: ISO8601 timestamp
updatedAt: ISO8601 timestamp
lastReviewedAt: ISO8601 timestamp
reviewedBy: string
deprecated: boolean
deprecatedAt: ISO8601 timestamp
draft: boolean
---
```

### Extended Fields
```yaml
---
title: string
description: string
category: string
tags: [string]
order: number
version: string

# Authorship
author: string
authorEmail: string
contributors: [string]

# Timestamps
createdAt: ISO8601 timestamp
updatedAt: ISO8601 timestamp
lastReviewedAt: ISO8601 timestamp
reviewedBy: string

# Status
draft: boolean
deprecated: boolean
deprecatedAt: ISO8601 timestamp
replacementPath: string

# Classification
audience: [string]  # internal, external, admin, user
difficulty: string    # beginner, intermediate, advanced
readingTime: number  # minutes

# Relations
relatedLinks: [object]
parentPage: string
childPages: [string]
---
```

## Operations

### Read Metadata
```javascript
function readMetadata(filePath) {
  const content = readFile(filePath);
  const frontmatter = parseFrontmatter(content);
  return frontmatter;
}

// Returns:
// {
//   title: "Authentication Guide",
//   author: "Jane Developer",
//   updatedAt: "2024-01-15T10:30:00Z",
//   ...
// }
```

### Write Metadata
```javascript
function writeMetadata(filePath, metadata) {
  const content = readFile(filePath);
  const existingMeta = parseFrontmatter(content);
  
  const updatedMeta = {
    ...existingMeta,
    ...metadata,
    updatedAt: new Date().toISOString()
  };
  
  const updatedContent = updateFrontmatter(content, updatedMeta);
  writeFile(filePath, updatedContent);
}
```

### Batch Update
```javascript
async function batchUpdateMetadata(patterns, updates) {
  const files = await glob(patterns);
  
  for (const file of files) {
    const current = readMetadata(file);
    
    if (updates.author && !current.author) {
      current.author = updates.author;
    }
    
    if (updates.version) {
      current.version = updates.version;
    }
    
    writeMetadata(file, current);
  }
}
```

## Author Management

### Author Attribution
```javascript
{
  author: "Jane Developer",
  authorEmail: "jane@example.com",
  contributors: ["John Smith", "Alice Johnson"]
}
```

### Author Profiles
```yaml
# .docs/authors.yaml
authors:
  jane-developer:
    name: Jane Developer
    email: jane@example.com
    avatar: /authors/jane.jpg
    bio: "Senior Developer Relations Engineer"
    social:
      github: janedev
      twitter: janedev
    
  john-smith:
    name: John Smith
    email: john@example.com
    avatar: /authors/john.jpg
    bio: "Technical Writer"
```

### Contributor Lists
```markdown
## Contributors

This documentation was made possible by our amazing contributors:

- [Jane Developer](./authors/jane.md) - Primary author
- [John Smith](./authors/john.md) - Technical review
```

## Timestamp Management

### Automatic Updates
```javascript
// Update timestamp on content change
function onContentChange(filePath, newContent) {
  const frontmatter = parseFrontmatter(content);
  frontmatter.updatedAt = new Date().toISOString();
  
  if (!frontmatter.lastReviewedAt || hasSignificantChanges(original, newContent)) {
    frontmatter.lastReviewedAt = new Date().toISOString();
  }
  
  return updateFrontmatter(newContent, frontmatter);
}
```

### Timestamp Display Formats
| Format | Display | Example |
|--------|---------|---------|
| Relative | "3 days ago" | Updated 3 days ago |
| Full | Complete date | Updated January 15, 2024 |
| Short | Month + day | Updated Jan 15 |
| Version | Associated version | Updated in v2.1.0 |

## Version Tracking

### Version Metadata
```yaml
---
version: v2.1.0
versions:
  v2.1.0:
    releasedAt: 2024-01-15
    changes: Added new authentication methods
  v2.0.0:
    releasedAt: 2023-06-01
    changes: Major rewrite
---
```

### Version History
```markdown
## Version History

| Version | Date | Changes |
|---------|------|---------|
| v2.1.0 | 2024-01-15 | Added OAuth 2.0 support |
| v2.0.0 | 2023-06-01 | Major rewrite |
| v1.5.0 | 2022-03-01 | Initial release |
```

## Deprecation Management

### Deprecation Notice
```yaml
---
deprecated: true
deprecatedAt: 2024-01-15
replacementPath: /docs/v2/authentication
deprecationReason: "Replaced by improved authentication flow in v2"
---
```

### Visual Deprecation
```javascript
function renderDeprecationBanner(doc) {
  if (!doc.deprecated) return '';
  
  return `
    <div class="deprecation-banner">
      <strong>Deprecation Notice:</strong>
      This document is deprecated as of ${formatDate(doc.deprecatedAt)}.
      See <a href="${doc.replacementPath}">the new version</a> for updated information.
    </div>
  `;
}
```

## Metadata Validation

### Schema Validation
```javascript
const metadataSchema = {
  required: ["title", "description", "category"],
  optional: {
    tags: { type: "array", items: { type: "string" } },
    order: { type: "number", min: 0 },
    version: { type: "string", pattern: /^v\d+\.\d+\.\d+$/ },
    author: { type: "string" },
    createdAt: { type: "string", format: "ISO8601" },
    updatedAt: { type: "string", format: "ISO8601" }
  }
};

function validateMetadata(metadata) {
  const errors = [];
  
  for (const field of metadataSchema.required) {
    if (!metadata[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

### Cross-Document Validation
```javascript
// Ensure order numbers are unique within category
function validateOrderNumbers(docs) {
  const byCategory = groupBy(docs, 'category');
  const errors = [];
  
  for (const [category, categoryDocs] of Object.entries(byCategory)) {
    const orders = categoryDocs.map(d => d.order);
    const duplicates = findDuplicates(orders);
    
    if (duplicates.length > 0) {
      errors.push(`Duplicate order numbers in ${category}: ${duplicates.join(', ')}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

## Integration Points

- **create-document**: Writes initial metadata on creation
- **template-scaffolding**: Applies default metadata from templates
- **version-tracking**: Updates version-specific metadata
- **multi-format-export**: Preserves metadata in exports