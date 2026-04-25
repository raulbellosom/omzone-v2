import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function DocsCopyCodeButton({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    await navigator.clipboard.writeText(code);
    setCopied(true);
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded transition-colors ${
        copied 
          ? 'text-green-500 bg-green-50' 
          : 'text-stone-400 hover:text-stone-600 bg-white/80'
      }`}
      title="Copy code"
    >
      {copied ? (
        <Check className="w-4 h-4" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}