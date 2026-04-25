# Generate TOC Skill

Automatically generates table of contents based on heading hierarchy (H1-H6) extracted from markdown content.

## Overview

This skill parses markdown documents, extracts heading structure, and generates navigation-ready table of contents with proper hierarchy and anchor links.

## When to Use

- Creating navigation sidebars for documentation pages
- Building page-level table of contents
- Generating breadcrumbs for nested sections
- Creating previous/next topic navigation

## Heading Hierarchy Rules

| Level | HTML | Use Case |
|-------|------|----------|
| H1 | `<h1>` | Page title (only one per page) |
| H2 | `<h2>` | Major sections |
| H3 | `<h3>` | Subsections within H2 |
| H4 | `<h4>` | Detailed points |
| H5 | `<h5>` | Fine-grained details (rare) |
| H6 | `<h6>` | Edge cases (rare) |

## Input Processing

### Raw Markdown
```markdown
# Getting Started

## Prerequisites

### Software Requirements

### Account Setup

## Installation

## Quick Start

### Basic Example

### Advanced Configuration
```

### Extracted Structure
```javascript
{
  title: "Getting Started",
  headings: [
    { level: 1, text: "Getting Started", anchor: "getting-started" },
    { level: 2, text: "Prerequisites", anchor: "prerequisites" },
    { level: 3, text: "Software Requirements", anchor: "software-requirements" },
    { level: 3, text: "Account Setup", anchor: "account-setup" },
    { level: 2, text: "Installation", anchor: "installation" },
    { level: 2, text: "Quick Start", anchor: "quick-start" },
    { level: 3, text: "Basic Example", anchor: "basic-example" },
    { level: 3, text: "Advanced Configuration", anchor: "advanced-configuration" }
  ]
}
```

## Output Formats

### Sidebar Navigation Format
```javascript
{
  items: [
    { title: "Prerequisites", anchor: "prerequisites", children: [
      { title: "Software Requirements", anchor: "software-requirements" },
      { title: "Account Setup", anchor: "account-setup" }
    ]},
    { title: "Installation", anchor: "installation" },
    { title: "Quick Start", anchor: "quick-start", children: [
      { title: "Basic Example", anchor: "basic-example" },
      { title: "Advanced Configuration", anchor: "advanced-configuration" }
    ]}
  ]
}
```

### Table of Contents HTML
```html
<nav class="table-of-contents">
  <ul>
    <li><a href="#prerequisites">Prerequisites</a>
      <ul>
        <li><a href="#software-requirements">Software Requirements</a></li>
        <li><a href="#account-setup">Account Setup</a></li>
      </ul>
    </li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#quick-start">Quick Start</a>
      <ul>
        <li><a href="#basic-example">Basic Example</a></li>
        <li><a href="#advanced-configuration">Advanced Configuration</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

### Active Section Tracking
```javascript
{
  activeId: "quick-start",
  activeParents: ["getting-started", "quick-start"]
}
```

## Anchor Generation

### Slugify Algorithm
```javascript
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Examples:
// "Software Requirements" -> "software-requirements"
// "API v2 Endpoints" -> "api-v2-endpoints"
// "What's New?" -> "whats-new"
```

### Collision Handling
```javascript
// When duplicate anchors exist, append numeric suffix
// "Overview" -> "overview"
// "Overview" (duplicate) -> "overview-2"
// "Overview" (third) -> "overview-3"
```

## Scroll-Spy Integration

Track active section based on scroll position:

```javascript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveId(entry.target.id);
      }
    });
  },
  { rootMargin: '-100px 0px -70% 0px' }
);
```

## Validation Rules

1. **One H1 per page**: Multiple H1 headings generate a warning
2. **Sequential nesting**: H4 should not appear directly under H2 (H3 required)
3. **Meaningful headings**: Headings should be at least 3 characters
4. **Unique anchors**: Same-level siblings must have unique anchor texts

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| No H1 found | Page missing title | Add H1 heading or promote existing |
| Deep nesting | H4+ without proper parents | Restructure or flatten content |
| Duplicate anchor | Same heading text twice | Add distinguishing context |

## Integration Points

- **create-document**: TOC generated from headings automatically
- **cross-reference**: Anchor links used for internal linking
- **search-indexing**: Headings indexed for search ranking
- **contextual-panel**: TOC component uses this skill