# Format Code Skill

Extracts code blocks from source files and applies syntax highlighting with proper language detection and formatting.

## Overview

This skill handles extraction, formatting, and enhancement of code examples for documentation. It supports automatic language detection, syntax highlighting, and copy-button integration.

## When to Use

- Adding code examples to documentation pages
- Extracting code from source files for documentation
- Formatting code blocks with proper syntax highlighting
- Creating interactive code playgrounds from static examples

## Supported Languages

| Language | Extensions | Highlighters |
|----------|------------|--------------|
| JavaScript | .js, .mjs | prism, shiki |
| TypeScript | .ts, .tsx | prism, shiki |
| Python | .py | prism, highlight.js |
| Bash/Shell | .sh, .bash | prism |
| JSON | .json | prism |
| YAML | .yaml, .yml | prism |
| SQL | .sql | prism |
| HTML | .html, .htm | prism |
| CSS | .css | prism |
| JSX | .jsx | prism, shiki |
| Markdown | .md, .mdx | - |

## Code Block Structure

### Standard Code Block
````markdown
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```
````

### Enhanced Code Block with Meta
````markdown
```javascript title="greeting.js" {3-5}
function greet(name) {
  return `Hello, ${name}!`;
}
// Usage: greet('World')
```
````

### Code Block with Line Highlighting
````markdown
```typescript [3,4]
async function fetchData(url: string): Promise<Data> {
  const response = await fetch(url);
  return response.json();
}
```
````

## Code Extraction Patterns

### From Source Files
Extract the `createUser` function from `src/services/auth.js`:

```javascript
// Input source file
export async function createUser(email, password) {
  const user = await db.users.create({
    email,
    passwordHash: await hashPassword(password)
  });
  return user;
}

export async function loginUser(email, password) {
  // ...
}
```

### From Test Files
Extract test examples showing usage patterns:

```javascript
describe('Authentication', () => {
  it('should create a new user', async () => {
    const user = await createUser('test@example.com', 'password123');
    expect(user.email).toBe('test@example.com');
  });
});
```

## Syntax Highlighting Integration

### With Shiki (Preferred)
```javascript
import { codeToHtml } from 'shiki';

const html = await codeToHtml(`console.log('Hello')`, {
  lang: 'javascript',
  theme: 'github-dark'
});
```

### With Prism
```javascript
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';

const html = Prism.highlight(code, Prism.languages.javascript, 'javascript');
```

## Copy Button Integration

Add copy functionality to code blocks:

```html
<div class="code-block">
  <button class="copy-button" aria-label="Copy to clipboard">
    <svg><!-- copy icon --></svg>
  </button>
  <pre><code>/* code here */</code></pre>
</div>
```

## Code Example Metadata

### Title and File Path
```javascript
{
  title: 'User Authentication',
  filePath: 'src/auth/login.js',
  language: 'javascript',
  showLineNumbers: true,
  highlightLines: [3, 4, 5]
}
```

### Inline Annotations
```javascript
{
  annotations: [
    { line: 3, text: 'Validate input' },
    { line: 4, text: 'Hash password for security' }
  ]
}
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Unknown language | Language not in supported list | Add language to config or use `text` |
| Extraction failed | Source file not found | Verify file path exists |
| Highlighting failed | Syntax error in code | Use `ignoreErrors: true` |

## Integration Points

- **create-document**: Receives code blocks for embedding
- **playground-integration**: Converts static examples to interactive
- **search-indexing**: Indexes code for semantic search
- **multi-format-export**: Preserves highlighting in exports