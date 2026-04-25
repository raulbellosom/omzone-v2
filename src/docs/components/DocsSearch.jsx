import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Hash, FileText, BookOpen, Tag } from 'lucide-react';
import useDocsSearch from '@/hooks/useDocsSearch';

const RESULT_TYPE_ICONS = {
  concept: Hash,
  page: FileText,
  text: BookOpen,
  keyword: Tag
};

const RESULT_TYPE_LABELS = {
  concept: 'Concept',
  page: 'Page',
  text: 'Section',
  keyword: 'Keyword'
};

function SearchSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-4 bg-stone-200 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-stone-100 rounded w-1/2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function DocsSearch({ lang = 'en' }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const { results, loading } = useDocsSearch(query);

  const handleKeyDown = useCallback((e) => {
    // Cmd/Ctrl + K to open
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    
    // Escape to close
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
    
    // Arrow navigation
    if (isOpen && results.length) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const result = results[selectedIndex];
        if (result) {
          handleResultClick(result);
        }
      }
    }
  }, [isOpen, results, selectedIndex, query]);

  const handleResultClick = useCallback((result) => {
    setIsOpen(false);
    setQuery('');
    
    // Build navigation URL with language prefix and optional hash for specific heading
    let url = `/help/docs/${lang}/${result.item.slug}`;
    if (result.targetHeading) {
      url += `#${result.targetHeading.id}`;
    }
    
    navigate(url);
  }, [navigate, lang]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Show recent/suggested when empty
  const showSuggestions = !query || query.length < 2;

  return (
    <div className="relative">
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-500 bg-stone-100 border-none rounded-lg hover:bg-stone-200 w-full max-w-md touch-manipulation"
        aria-label="Search documentation"
      >
        <Search className="w-4 h-4" />
        <span>Search documentation...</span>
        <kbd className="ml-auto hidden sm:inline-flex text-xs bg-stone-200 px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 md:pt-[env(safe-area-inset-top)] md:pb-[env(safe-area-inset-bottom)]"
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => { setIsOpen(false); setQuery(''); }}
          />
          
          {/* Modal - mobile-friendly sizing */}
          <div 
            className="fixed inset-x-4 top-20 bottom-20 md:inset-auto md:top-[15vh] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl md:rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: 'calc(100vh - 10rem)' }}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 border-b border-stone-200 shrink-0">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search documentation..."
                className="flex-1 py-4 text-lg border-none outline-none bg-transparent"
                autoFocus
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="p-2 text-stone-400 hover:text-stone-600 touch-manipulation"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Results - scrollable with touch */}
            <div className="flex-1 overflow-y-auto overscroll-contain touch-action-y">
              {loading ? (
                <SearchSkeleton />
              ) : showSuggestions ? (
                <div className="p-6">
                  <p className="text-xs text-stone-400 uppercase mb-2">
                    Type to search
                  </p>
                  <p className="text-sm text-stone-500">
                    Enter at least 2 characters to search documentation
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-stone-500">
                  No results found for "{query}"
                </div>
              ) : (
                <ul className="py-2">
                  {results.map((result, index) => {
                    const TypeIcon = RESULT_TYPE_ICONS[result.resultType] || FileText;
                    return (
                      <li key={result.item.slug}>
                        <button
                          onClick={() => handleResultClick(result)}
                          className={`w-full text-left flex flex-col gap-1 px-4 py-4 sm:py-3 touch-manipulation transition-colors cursor-pointer ${
                            index === selectedIndex ? 'bg-stone-100' : 'hover:bg-stone-50 active:bg-stone-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-stone-900">
                              {result.item.title?.[lang] || result.item.title?.en || result.item.title}
                            </span>
                            {result.targetHeading && (
                              <span className="inline-flex items-center gap-1 text-xs bg-stone-200 text-stone-600 px-2 py-0.5 rounded">
                                <TypeIcon className="w-3 h-3" />
                                {result.targetHeading.text?.[lang] || result.targetHeading.text?.en || result.targetHeading.text}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-stone-500">
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              <TypeIcon className="w-3 h-3" />
                              {RESULT_TYPE_LABELS[result.resultType]}
                            </span>
                            <span>{result.item.description?.[lang] || result.item.description?.en || result.item.description}</span>
                          </div>
                          {result.relatedConcepts && result.relatedConcepts.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-xs text-stone-400">Related:</span>
                              {result.relatedConcepts.slice(0, 3).map(rel => (
                                <span key={rel.term} className="text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                                  {rel.term}
                                </span>
                              ))}
                            </div>
                          )}
                          <span className="text-xs text-stone-400">
                            {result.item.section}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 shrink-0">
              <span>↑↓ Navigate</span>
              <span>↵ Open</span>
              <span>ESC Close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}