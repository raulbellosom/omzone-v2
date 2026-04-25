# Version Tracking Skill

Manages version-aware documentation updates and change tracking across documentation versions.

## Overview

This skill tracks documentation changes across versions, maintains version history, and ensures users can access docs for specific versions they may be using.

## When to Use

- Tracking changes between documentation versions
- Maintaining versioned API documentation
- Creating changelogs from documentation changes
- Alerting users when topics have changed between versions

## Version Configuration

### Version Definition
```javascript
{
  versions: [
    { id: "v2", name: "Version 2.0", status: "current" },
    { id: "v1", name: "Version 1.0", status: "deprecated" }
  ],
  currentVersion: "v2",
  defaultVersion: "v2"
}
```

### Version Metadata
```yaml
---
title: Authentication Guide
version: v2
versions:
  v2:
    updatedAt: "2024-01-15"
    changes: "Added OAuth 2.0 support"
  v1:
    updatedAt: "2023-06-01"
    changes: "Initial release"
deprecatedAt: null
---
```

## Change Tracking

### Change Types
| Type | Symbol | Description |
|------|--------|-------------|
| Added | ✨ | New content or features |
| Changed | 🔄 | Modified existing content |
| Deprecated | ⚠️ | Content will be removed |
| Removed | 🗑️ | Content deleted in this version |
| Fixed | 🔧 | Bug fixes |

### Change Log Entry
```markdown
## Version 2.1.0 (2024-01-15)

### ✨ Added
- OAuth 2.0 authentication support
- New token refresh endpoint

### 🔄 Changed
- Updated password requirements to include special characters

### 🔧 Fixed
- Fixed token expiry calculation for edge cases
```

## Version-Aware Navigation

### Version Selector Component
```javascript
{
  component: "VersionSelector",
  props: {
    versions: ["v2", "v1"],
    currentVersion: "v2",
    onVersionChange: (v) => navigate(`/docs/${v}/path`)
  }
}
```

### Version-Specific Links
```markdown
<!-- Automatically resolves to current version -->
[Authentication Guide](../authentication.md)

<!-- Explicit version reference -->
[Authentication Guide v1](../v1/authentication.md)

<!-- Always points to latest -->
[Authentication Guide (latest)](../latest/authentication.md)
```

## Diff Generation

### Content Diff
```javascript
function generateDiff(oldContent, newContent) {
  return {
    added: findAddedLines(oldContent, newContent),
    removed: findRemovedLines(oldContent, newContent),
    changed: findChangedLines(oldContent, newContent)
  };
}
```

### Section Change Detection
```javascript
// Compare section hashes to detect changes
function detectSectionChanges(oldSections, newSections) {
  return newSections
    .map(section => ({
      ...section,
      status: compareHash(section.hash, oldSections[section.id]?.hash)
    }));
}
```

## Migration Guides

### Between Version Migration
```markdown
---
title: Migrating from v1 to v2
description: Guide for upgrading from version 1 to version 2
---

# Migrating from v1 to v2

## Breaking Changes

### Authentication
**v1:** Session-based authentication  
**v2:** Token-based with OAuth 2.0

### Migration Steps

1. Update endpoint base URL
2. Replace session cookies with Bearer tokens
3. Update error handling for new response format

## Compatibility Layer

A compatibility layer is available during transition:
```javascript
import { legacySupport } from '@example/compat';
```
```

## Version Alerts

### Banner for Deprecated Versions
```javascript
{
  component: "VersionAlert",
  props: {
    currentVersion: "v2",
    pageVersion: "v1",
    message: "You are viewing documentation for v1, which is deprecated. v2 includes important security updates."
  }
}
```

## Validation Rules

1. **Version exists**: Referenced version must be defined
2. **Valid status**: Status must be current, deprecated, or legacy
3. **Chronological order**: Versions must be ordered newest first
4. **Change documented**: Breaking changes must have migration guide

## Integration Points

- **create-document**: Adds version metadata to frontmatter
- **cross-reference**: Handles version-specific links
- **search-indexing**: Allows filtering by version
- **multi-format-export**: Includes version in exports