# Search Indexing Skill

Builds and maintains full-text search indexes for documentation with support for semantic search and AI-powered queries.

## Overview

This skill creates and maintains search indexes that power the documentation's search functionality, including text search, code search, and integration with AI search providers.

## When to Use

- Setting up search for new documentation site
- Rebuilding search index after content changes
- Adding semantic search capabilities
- Implementing AI-powered search with Minimax API

## Index Structure

### Document Index
```javascript
{
  documents: [
    {
      id: "auth-guide",
      path: "/docs/guides/authentication",
      title: "Authentication Guide",
      description: "Learn how to implement authentication",
      content: "Full text content of the page...",
      headings: ["Overview", "Setup", "Usage"],
      codeBlocks: ["const auth = new Auth()", "auth.login()"],
      category: "Guides",
      tags: ["auth", "security", "oauth"],
      version: "v2",
      lastUpdated: "2024-01-15"
    }
  ],
  headings: [
    { id: "overview", title: "Overview", path: "/docs/guides/authentication#overview" },
    { id: "setup", title: "Setup", path: "/docs/guides/authentication#setup" }
  ],
  codeIndex: [
    { id: "auth-1", code: "const auth = new Auth()", language: "javascript", path: "/docs/guides/authentication" }
  ]
}
```

## Indexing Pipeline

### Content Extraction
```javascript
async function extractContent(markdownFile) {
  const content = await readFile(markdownFile);
  const frontmatter = extractFrontmatter(content);
  const textContent = stripMarkdown(content);
  const headings = extractHeadings(content);
  const codeBlocks = extractCodeBlocks(content);
  
  return {
    ...frontmatter,
    content: textContent,
    headings,
    codeBlocks
  };
}
```

### Text Processing
```javascript
function processText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ");
}

function tokenize(text) {
  return text.split(/\s+/).filter(t => t.length > 2);
}
```

### Index Updates
```javascript
// Incremental update
function updateIndex(changedPaths) {
  const toRemove = changedPaths.filter(p => p.type === "removed");
  const toAdd = changedPaths.filter(p => p.type === "added" || p.type === "modified");
  
  removeFromIndex(toRemove);
  addToIndex(toAdd);
}

// Full rebuild
function rebuildIndex() {
  const allDocs = await collectAllDocuments();
  return buildIndex(allDocs);
}
```

## Search Features

### Basic Text Search
```javascript
function basicSearch(query, index) {
  const tokens = tokenize(processText(query));
  return index.documents
    .map(doc => ({
      doc,
      score: calculateTFIDF(tokens, doc)
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
```

### Code Search
```javascript
function searchCode(query, index) {
  return index.codeIndex
    .filter(block => block.code.includes(query))
    .map(block => ({
      ...block,
      context: get surrounding context
    }));
}
```

### Semantic Search (Minimax)
```javascript
async function semanticSearch(query, index, apiKey) {
  const embedding = await getEmbedding(query, apiKey);
  
  return index.documents
    .map(doc => ({
      doc,
      score: cosineSimilarity(embedding, doc.embedding)
    }))
    .sort((a, b) => b.score - a.score);
}

async function getEmbedding(text, apiKey) {
  const response = await fetch("https://api.minimax.chat/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "embedding-model",
      input: text
    })
  });
  return response.json();
}
```

## Search UI Integration

### Search Request
```javascript
{
  query: "how do I configure authentication",
  context: {
    currentPath: "/docs/guides/getting-started",
    userId: "user123"
  },
  filters: {
    category: ["Guides"],
    tags: ["auth"],
    version: ["v2"],
    includeCode: true
  },
  options: {
    limit: 10,
    offset: 0,
    highlight: true
  }
}
```

### Search Response
```javascript
{
  results: [
    {
      id: "auth-guide",
      title: "Authentication Guide",
      path: "/docs/guides/authentication",
      snippet: "...how to <em>configure</em> <em>authentication</em> for your application...",
      score: 0.95,
      highlights: [
        { field: "content", matches: ["configure", "authentication"] }
      ],
      breadcrumb: ["Guides", "Authentication"]
    }
  ],
  total: 42,
  suggestions: ["authentication setup", "auth getting started"]
}
```

## Minimax Integration

### Configuration
```javascript
{
  minimax: {
    apiKey: process.env.MINIMAX_API_KEY,
    model: "minimax-search",
    indexType: "documentation"
  }
}
```

### Natural Language Query Handling
```javascript
// Parse natural language queries
function parseQuery(query) {
  const patterns = [
    { regex: /how do i (configure|set up|setup|install) (.+)/i, type: "tutorial" },
    { regex: /show me (examples? of|how to) (.+)/i, type: "examples" },
    { regex: /what is (.+)/i, type: "definition" },
    { regex: /(.+) api/i, type: "api" }
  ];
  
  for (const pattern of patterns) {
    const match = query.match(pattern.regex);
    if (match) {
      return { type: pattern.type, topic: match[2] };
    }
  }
  return { type: "general", topic: query };
}
```

## Index Maintenance

### Scheduled Rebuilds
```javascript
// Rebuild index daily at 3am
cron("0 3 * * *", async () => {
  console.log("Rebuilding search index...");
  const newIndex = await rebuildIndex();
  await saveIndex(newIndex);
  console.log("Index rebuilt successfully");
});
```

### Real-time Updates
```javascript
// Webhook for content changes
app.post("/webhook/content-updated", async (req, res) => {
  const { paths } = req.body;
  await updateIndex(paths);
  res.status(200).send("Index updated");
});
```

## Validation Rules

1. **Index freshness**: Alert if index older than 24 hours
2. **Document count**: Warn if document count drops significantly
3. **Search latency**: Monitor search response times
4. **Result quality**: Track click-through rates on results

## Integration Points

- **create-document**: Indexes new documents automatically
- **format-code**: Code blocks added to code index
- **generate-toc**: Headings indexed for section search
- **version-tracking**: Version-specific filtering