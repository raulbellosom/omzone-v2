import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function DocsCopyPageButton({ content, title }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Build markdown content with title
    const markdown = `# ${title}\n\n${content}`;
    
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors touch-manipulation min-h-[44px] ${
        copied 
          ? 'text-green-600 border-green-200 bg-green-50' 
          : 'text-stone-600 border-stone-300 hover:bg-stone-50 active:bg-stone-100'
      }`}
      aria-label={copied ? 'Page copied!' : 'Copy page as markdown'}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span className="hidden sm:inline">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span className="hidden sm:inline">Copy page</span>
        </>
      )}
    </button>
  );
}