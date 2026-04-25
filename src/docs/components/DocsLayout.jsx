import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import DocsSidebar from './DocsSidebar';
import DocsTopbar from './DocsTopbar';
import DocsBreadcrumbs from './DocsBreadcrumbs';
import DocsMobileDrawer from './DocsMobileDrawer';
import DocsMobileTOC from './DocsMobileTOC';
import DocsBackToTop from './DocsBackToTop';
import DocsTableOfContents from './DocsTableOfContents';

export default function DocsLayout({ children, currentPage, lang = 'en' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileTOCOpen, setMobileTOCOpen] = useState(false);
  const mainContentRef = useRef(null);

  return (
    <div className="h-screen flex flex-col overflow-hidden min-w-0">
      {/* Top Bar - sticky within the layout */}
      <DocsTopbar 
        onMenuClick={() => setMobileOpen(true)} 
        onTOCClick={() => setMobileTOCOpen(true)}
        lang={lang} 
        className="shrink-0" 
      />

      <div className="flex flex-1 overflow-hidden min-w-0">
        {/* Left Sidebar - sticky within the layout */}
        <aside className="hidden md:block w-64 lg:w-72 border-r border-stone-200 bg-white shrink-0 overflow-y-auto min-w-0">
          <DocsSidebar currentPage={currentPage} lang={lang} />
        </aside>

        {/* Mobile Drawer */}
        <DocsMobileDrawer 
          open={mobileOpen} 
          onClose={() => setMobileOpen(false)}
          currentPage={currentPage}
          lang={lang}
        />

        {/* Mobile TOC Drawer */}
        <DocsMobileTOC 
          open={mobileTOCOpen} 
          onClose={() => setMobileTOCOpen(false)}
        />

        {/* Main Content - scrollable */}
        <main ref={mainContentRef} className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-10 pb-12">
            <DocsBreadcrumbs currentPage={currentPage} lang={lang} />
            <article className="max-w-none text-stone-700 
              text-base leading-relaxed
              [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-stone-800 [&_h2]:mt-10 [&_h2]:mb-4
              [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-stone-800 [&_h3]:mt-8 [&_h3]:mb-3
              [&_h4]:font-serif [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-stone-800 [&_h4]:mt-6 [&_h4]:mb-2
              [&_p]:mt-4 [&_p]:mb-4 [&_p]:text-stone-600
              [&_a]:text-stone-700 [&_a]:underline hover:[&_a]:text-stone-900
              [&_code]:text-stone-800 [&_code]:bg-stone-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
              [&_pre]:bg-stone-900 [&_pre]:text-stone-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4
              [&_table]:text-sm [&_table]:w-full [&_table]:border-collapse
              [&_th]:bg-stone-100 [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-stone-300
              [&_td]:p-2 [&_td]:border [&_td]:border-stone-200
              [&_tr]:border-b [&_tr]:border-stone-200 [&_tr]:hover:bg-stone-50
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mt-2 [&_ul]:mb-4 [&_ul_li]:mt-1
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mt-2 [&_ol]:mb-4 [&_ol_li]:mt-1
              [&_li]:text-stone-600
              [&_blockquote]:border-l-4 [&_blockquote]:border-stone-300 [&_blockquote]:italic [&_blockquote]:pl-4 [&_blockquote]:my-4
              [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-stone-300 [&_hr]:my-8
              [&_img]:rounded-lg [&_img]:my-4
              [&_h2:first-child]:mt-0 [&_h3:first-child]:mt-0">
              {children}
            </article>
          </div>
        </main>

        {/* Right Sidebar - sticky within the layout */}
        <aside className="hidden lg:block w-56 xl:w-64 border-l border-stone-200 bg-white shrink-0 overflow-y-auto min-w-0">
          <div className="px-4 py-4">
            <DocsTableOfContents />
          </div>
        </aside>
      </div>

      {/* Back to Top Button */}
      <DocsBackToTop containerRef={mainContentRef} />

      {/* Print styles - injected via style tag for scoped styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          article { font-size: 11pt; }
        }
        
        /* Prevent horizontal overflow on all screens */
        * { 
          overflow-wrap: break-word; 
          word-wrap: break-word;
        }
        html, body {
          overflow-x: hidden;
        }
        
        /* Ensure all hash anchors respect sticky navbar height */
        html {
          scroll-padding-top: 4rem;
        }
        main {
          scroll-margin-top: 0;
        }
        article {
          scroll-margin-top: 5rem;
        }
      `}</style>
    </div>
  );
}