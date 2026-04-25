# Cross-Reference Skill

Creates bidirectional links between related documentation topics for easy navigation and context discovery.

## Overview

This skill manages the web of connections between documentation pages, creating links in both directions so users can discover related content easily.

## When to Use

- Linking related guides and tutorials
- Connecting API reference to usage examples
- Creating "See Also" sections
- Building knowledge graphs of documentation

## Link Types

### Explicit Links
Manual links in content using markdown syntax:
```markdown
See the [Authentication Guide](../guides/authentication.md) for details.
```

### Implicit Links
Automatically discovered based on:
- Shared category or tags
- Similar keywords in content
- Referenced entities
- Common patterns

### Bidirectional Links
Links created in both directions:
- Page A links to Page B
- Page B automatically links back to Page A

## Link Database Structure

```javascript
{
  links: [
    {
      source: "/docs/guides/authentication",
      target: "/docs/api-reference/auth",
      type: "explicit",
      anchor: "authentication endpoints"
    },
    {
      source: "/docs/guides/authentication",
      target: "/docs/tutorials/social-login",
      type: "implicit",
      confidence: 0.85
    }
  ],
  backlinks: {
    "/docs/api-reference/auth": [
      "/docs/guides/authentication",
      "/docs/tutorials/social-login"
    ]
  }
}
```

## Automatic Link Detection

### By Category
```javascript
// Pages in same category are related
{ category: "API Reference", path: "/docs/api/users" }
{ category: "API Reference", path: "/docs/api/products" }
// → Links created between all API Reference pages
```

### By Tags
```javascript
// Shared tags indicate related content
{ tags: ["authentication", "security"], path: "/docs/guides/auth" }
{ tags: ["authentication", "oauth"], path: "/docs/guides/oauth" }
// → Related due to shared "authentication" tag
```

### By Entity References
```javascript
// Referencing same entities creates links
{ entities: ["User", "Product"], path: "/docs/api/users" }
{ entities: ["User", "Order"], path: "/docs/api/orders" }
// → Related via shared "User" entity
```

## Link Placement

### End of Page "See Also" Section
```markdown
## See Also

- [Related Topic](./related-topic.md) - Brief description
- [Another Topic](./another.md) - Brief description
- [API Reference](../api/reference.md) - For technical details
```

### Inline Contextual Links
```markdown
For authentication, see the [Auth Guide](../guides/auth.md#token-refresh),
which covers token refresh flows in detail.
```

### Sidebar "Related Pages"
```javascript
{
  component: "RelatedPages",
  props: { currentPath: "/docs/guides/auth", limit: 5 }
}
```

## Backlink Management

### Adding Backlinks
```javascript
function addBacklink(source, target, anchor) {
  const existing = getBacklinks(target);
  if (!existing.find(l => l.source === source)) {
    saveBacklink({
      source,
      target,
      anchor: anchor || getTitle(source),
      addedAt: new Date().toISOString()
    });
  }
}
```

### Displaying Backlinks
```markdown
### Pages that link here

- [Authentication Guide](../guides/auth.md) - mentions token refresh
- [Getting Started](../intro.md) - references overview
```

## Link Quality Scoring

| Factor | Weight | Description |
|--------|--------|-------------|
| Explicit link | 1.0 | Manually created link |
| Same category | 0.8 | Pages share category |
| Shared tags (3+) | 0.8 | Many shared tags |
| Shared tags (1-2) | 0.5 | Few shared tags |
| Entity match | 0.7 | Referenced same entity |
| Content similarity | 0.6 | TF-IDF similarity score |

## Validation Rules

1. **Links must exist**: Target page must exist or warning generated
2. **No self-links**: Page cannot link to itself
3. **Relative paths**: Use relative paths for internal links
4. **No broken links**: Verify links on each build

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Broken link | Target doesn't exist | Remove link or create target |
| Circular reference | A→B→A loop | Allowed but noted |
| Missing backlink | Link without reciprocal | May be intentional |

## Integration Points

- **create-document**: Automatically adds related links
- **generate-toc**: Uses links for related topics section
- **search-indexing**: Link structure used for ranking
- **version-tracking**: Links updated when pages move