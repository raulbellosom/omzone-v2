import { useMemo, useState, useEffect } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import DocsLayout from './DocsLayout';
import DocsPrevNext from './DocsPrevNext';
import DocsCopyPageButton from './DocsCopyPageButton';
import DocsNotFound from './DocsNotFound';
import CodeBlock from './CodeBlock';
import { getAllPages, getLocalizedTitle } from '@/docs/config/navigation';
import { useDocsTOC } from './DocsTOCContext';

// Normalize text for URL-safe IDs (remove accents, convert to ASCII)
function normalizeForId(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks (accents)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Extract headings from markdown content for TOC
function extractHeadings(content) {
  if (!content) return [];
  const headingRegex = /^#{2,3}\s+(.+)$/gm;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[1].trim();
    const level = match[0].startsWith('###') ? 3 : 2;
    const id = normalizeForId(text);
    
    headings.push({ text, id, level });
  }
  
  return headings;
}

// Custom rehype plugin to normalize heading IDs (remove accents for URL safety)
function rehypeNormalizeIds() {
  return (tree) => {
    const visit = (node) => {
      if (node.type === 'element' && /^h[1-6]$/.test(node.tagName)) {
        const idIndex = node.properties.id?.indexOf('user-content-') === 0 
          ? 'user-content-'.length 
          : 0;
        const id = node.properties.id?.slice(idIndex);
        if (id) {
          node.properties.id = normalizeForId(id);
        }
      }
      if (node.children) {
        node.children.forEach(visit);
      }
    };
    visit(tree);
  };
}

export default function DocsPageContent({ lang = 'en', slug: propSlug }) {
  const { slug: routeSlug } = useParams();
  const slug = propSlug ?? routeSlug;
  const location = useLocation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);
  const allPages = getAllPages();
  
  // Extract headings from content - must be called unconditionally before any early returns
  const headings = useMemo(() => extractHeadings(content), [content]);
  
  // Share headings with layout via context
  const { setHeadings } = useDocsTOC();
  
  // Update context when headings change
  useEffect(() => {
    setHeadings(headings);
  }, [headings, setHeadings]);
  
  // Handle hash navigation and highlighting
  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;
    
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      const element = document.querySelector(hash);
      if (element) {
        // Scroll to element with offset for sticky header
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Add highlight animation
        element.classList.add('highlight-target');
        setTimeout(() => {
          element.classList.remove('highlight-target');
        }, 2000);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.hash, content]);

  // Load content from language-specific manifest
  useEffect(() => {
    setLoading(true);
    setPageInfo(null);
    
    // Load from language-specific manifest
    fetch(`/docs/${lang}/content-manifest.json`)
      .then(res => res.json())
      .then(data => {
        const pageData = data[slug];
        if (pageData) {
          setContent(pageData.body || '');
        } else {
          setContent('');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load content:', err);
        setLoading(false);
      });
      
    // Also load search index for i18n page info (titles, headings)
    fetch('/docs/search-index.json')
      .then(res => res.json())
      .then(data => {
        const pageData = data.find(p => p.slug === slug);
        if (pageData) {
          setPageInfo(pageData);
        }
      })
      .catch(err => {
        console.error('Failed to load page info:', err);
      });
  }, [slug, lang]);

  if (!slug) {
    return <Navigate to={`/help/docs/${lang}/introduction`} replace />;
  }
  
  const currentPage = allPages.find(p => p.slug === slug);

  if (!currentPage) {
    return (
      <DocsLayout currentPage={null} lang={lang}>
        <DocsNotFound />
      </DocsLayout>
    );
  }

  // Get localized title from search index, fallback to nav title
  const localizedTitle = pageInfo?.title?.[lang] || getLocalizedTitle(currentPage.title, lang);

  if (loading) {
    return (
      <DocsLayout currentPage={currentPage} lang={lang}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded w-1/3"></div>
          <div className="h-4 bg-stone-200 rounded w-full"></div>
          <div className="h-4 bg-stone-200 rounded w-5/6"></div>
          <div className="h-4 bg-stone-200 rounded w-4/6"></div>
        </div>
      </DocsLayout>
    );
  }

  // Get prev/next for navigation
  const currentIndex = allPages.findIndex(p => p.slug === slug);
  const prev = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const next = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  return (
    <DocsLayout currentPage={currentPage} lang={lang}>
      <style>{`
        @keyframes highlight-pulse {
          0% { background-color: transparent; }
          20% { background-color: rgba(251, 191, 36, 0.3); }
          100% { background-color: transparent; }
        }
        .highlight-target {
          animation: highlight-pulse 2s ease-out;
          border-radius: 4px;
          transition: background-color 0.3s;
        }
        @keyframes toast-slide-in {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .toast-enter { animation: toast-slide-in 0.3s ease-out; }
      `}</style>
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 toast-enter">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 
            toast.type === 'info' ? 'bg-stone-700 text-white' : 'bg-stone-700 text-white'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-70"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-stone-800">
          {localizedTitle}
        </h1>
        <DocsCopyPageButton content={content} title={localizedTitle} />
      </div>
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeNormalizeIds]}
        components={{
          pre({ children, ...props }) {
            // Override pre to prevent prose from wrapping block code in p tags
            return <pre className="not-prose" {...props}>{children}</pre>;
          },
          // Custom heading components with copy link on right side
          h2({ children, id, ...props }) {
            const idString = typeof id === 'string' ? id : String(id);
            const isCopied = copiedId === idString;
            return (
              <h2 id={idString} className="group relative scroll-mt-20 pr-8" {...props}>
                {children}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = `${window.location.origin}${window.location.pathname}#${idString}`;
                    navigator.clipboard.writeText(url).then(() => {
                      setCopiedId(idString);
                      setToast({ type: 'success', message: 'Link copied to clipboard' });
                      setTimeout(() => {
                        setCopiedId(null);
                        setToast(null);
                      }, 2000);
                    });
                  }}
                  className={`absolute right-0 top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-stone-100 ${isCopied ? 'text-green-600' : 'text-stone-400 hover:text-stone-600'}`}
                  aria-label="Copy link to section"
                  title={isCopied ? 'Copied!' : 'Copy link'}
                >
                  {isCopied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  )}
                </button>
              </h2>
            );
          },
          h3({ children, id, ...props }) {
            const idString = typeof id === 'string' ? id : String(id);
            const isCopied = copiedId === idString;
            return (
              <h3 id={idString} className="group relative scroll-mt-20 pr-8" {...props}>
                {children}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = `${window.location.origin}${window.location.pathname}#${idString}`;
                    navigator.clipboard.writeText(url).then(() => {
                      setCopiedId(idString);
                      setToast({ type: 'success', message: 'Link copied to clipboard' });
                      setTimeout(() => {
                        setCopiedId(null);
                        setToast(null);
                      }, 2000);
                    });
                  }}
                  className={`absolute right-0 top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-stone-100 ${isCopied ? 'text-green-600' : 'text-stone-400 hover:text-stone-600'}`}
                  aria-label="Copy link to section"
                  title={isCopied ? 'Copied!' : 'Copy link'}
                >
                  {isCopied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  )}
                </button>
              </h3>
            );
          },
          // Custom link component for inline links
          a({ href, children, ...props }) {
            // Handle href that might be an object (e.g., React Router link objects)
            const hrefString = typeof href === 'string' ? href : String(href);
            const isExternal = hrefString?.startsWith('http');
            return (
              <a 
                href={hrefString} 
                className={`text-amber-700 hover:text-amber-900 hover:underline ${isExternal ? 'inline-flex items-center gap-1' : ''}`}
                {...props}
              >
                {children}
                {isExternal && (
                  <svg className="w-3 h-3 inline-block ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </a>
            );
          },
          code({ node, inline, className, children, ...props }) {
            // More robust inline detection:
            // - inline=true explicitly (standard inline code)
            // - no className (block code always has language-xxx class)
            // - no newlines in content (block code has newlines)
            const content = String(children);
            const hasLanguageClass = className?.includes('language-');
            const hasNewlines = content.includes('\n');
            const isInline = inline || (!hasLanguageClass && !hasNewlines);
            
            if (isInline) {
              return (
                <code 
                  className="px-1.5 py-0.5 bg-stone-100 rounded text-sm font-mono" 
                  {...props}
                >
                  {children}
                </code>
              );
            }
            // Block code - render through CodeBlock
            return <CodeBlock className={className}>{content.replace(/\n$/, '')}</CodeBlock>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
      
      <DocsPrevNext prev={prev} next={next} lang={lang} />
    </DocsLayout>
  );
}