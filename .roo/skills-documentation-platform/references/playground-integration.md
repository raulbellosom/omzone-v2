# Playground Integration Skill

Integrates interactive code playgrounds with live examples for trying code directly in documentation.

## Overview

This skill transforms static code examples into interactive playgrounds where users can edit, run, and see results without leaving the documentation.

## When to Use

- Tutorial pages with runnable examples
- API documentation with live try-it-out functionality
- Component libraries with interactive demos
- Teaching materials requiring practice exercises

## Playground Types

### JavaScript Playground (Browser)
```javascript
{
  type: "js-browser",
  language: "javascript",
  sandbox: "iframe",
  dependencies: ["lodash"]
}
```

### React Playground
```javascript
{
  type: "react",
  language: "jsx",
  sandbox: "iframe",
  dependencies: ["react", "react-dom"],
  preset: "create-react-app"
}
```

### Node.js Playground
```javascript
{
  type: "node",
  language: "javascript",
  sandbox: "web-worker",
  allowNet: false,
  allowFs: false
}
```

## Configuration

### Basic Playground
```markdown
```playground
const greeting = "Hello, World!";
console.log(greeting);
```
```

### React Component Playground
```markdown
```playground {type="react"}
function Button({ label, onClick }) {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  );
}

render(<Button label="Click me" onClick={() => alert("Clicked!")} />);
```
```

### With Custom Configuration
```markdown
```playground
{
  "title": "Array Methods Demo",
  "language": "javascript",
  "initialCode": "const numbers = [1, 2, 3, 4, 5];",
  "readOnly": false,
  "showOutput": true,
  "theme": "dark"
}
const doubled = numbers.map(n => n * 2);
console.log(doubled);
```
```

## Sandbox Security

### Execution Environment
| Environment | Isolation | Capabilities |
|------------|-----------|--------------|
| iframe | Full isolation | DOM, no network |
| web-worker | Process isolation | No DOM, limited |
| service-worker | Background | No DOM |
| wasm | Sandboxed runtime | Varies |

### Security Restrictions
```javascript
{
  // Blocked by default in sandbox
  blocked: [
    "eval",           // No eval
    "Function",       // No Function constructor
    "fetch",          // No network (configurable)
    "XMLHttpRequest", // No XHR
    "importScripts",  // No script loading
    "WebAssembly",   // Limited WASM
  ],
  // Allowed
  allowed: [
    "console.log",    // Output only
    "Math",          // Math operations
    "Array",         // Array methods
    "Object",        // Object methods
    "JSON",          // JSON parsing
  ]
}
```

## UI Components

### Toolbar
```html
<div class="playground-toolbar">
  <button class="run-btn">Run</button>
  <button class="reset-btn">Reset</button>
  <button class="copy-btn">Copy</button>
  <button class="share-btn">Share</button>
  <select class="theme-select">
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
</div>
```

### Output Panel
```html
<div class="playground-output">
  <div class="output-header">Output</div>
  <pre class="output-content"></pre>
  <div class="error-content"></div>
</div>
```

## State Management

### URL State
```javascript
// Encode playground state in URL hash
const state = {
  code: "console.log('Hello')",
  language: "javascript",
  theme: "dark"
};
const hash = btoa(JSON.stringify(state));
window.location.hash = `playground=${hash}`;
```

### Share URL
```
https://docs.example.com/guides/getting-started#playground=eyJjb2RlIjoiY29uc29sZS5sb2coJ0hlbGxvJykiLCJsYW5ndWFnZSI6Impheeqq...
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Timeout | Infinite loop or long-running code | Kill after 5s, show timeout message |
| Security blocked | Dangerous operation attempted | Show blocked message, don't expose details |
| Syntax error | Invalid code entered | Highlight error line, show message |
| Runtime error | Exception during execution | Show stack trace in output |

## Integration Points

- **format-code**: Converts static examples to playgrounds
- **create-document**: Adds playground annotation to code blocks
- **search-indexing**: Indexes playground code for search
- **multi-format-export**: Preserves interactivity where supported