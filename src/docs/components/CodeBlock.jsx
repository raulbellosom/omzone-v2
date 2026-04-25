import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  
  // Extract code content from children
  const code = typeof children === 'string' 
    ? children 
    : children?.props?.children || '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className={`${className} relative bg-stone-800 text-stone-100 font-mono text-sm rounded-lg p-4 overflow-x-auto`}>
        {children}
      </div>
      <button
        onClick={handleCopy}
        className={`absolute top-2 right-2 p-2 sm:p-1.5 rounded transition-all touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center ${
          copied 
            ? 'text-green-500 bg-green-50' 
            : 'text-stone-400 hover:text-stone-200 bg-stone-800 opacity-100 sm:opacity-0 group-hover:opacity-100'
        }`}
        title="Copy code"
        aria-label={copied ? 'Copied!' : 'Copy code'}
      >
        {copied ? (
          <Check className="w-5 h-5 sm:w-4 sm:h-4" />
        ) : (
          <Copy className="w-5 h-5 sm:w-4 sm:h-4" />
        )}
      </button>
    </div>
  );
}