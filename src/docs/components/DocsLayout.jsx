import { useState } from 'react';
import { Link } from 'react-router-dom';
import DocsSidebar from './DocsSidebar';
import DocsTopbar from './DocsTopbar';
import DocsBreadcrumbs from './DocsBreadcrumbs';
import DocsMobileDrawer from './DocsMobileDrawer';
import DocsBackToTop from './DocsBackToTop';
import DocsTableOfContents from './DocsTableOfContents';

export default function DocsLayout({ children, currentPage, lang = 'en' }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top Bar */}
      <DocsTopbar onMenuClick={() => setMobileOpen(true)} lang={lang} />

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="hidden md:block w-64 lg:w-72 border-r border-stone-200 bg-white sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <DocsSidebar currentPage={currentPage} lang={lang} />
        </aside>

        {/* Mobile Drawer */}
        <DocsMobileDrawer 
          open={mobileOpen} 
          onClose={() => setMobileOpen(false)}
          currentPage={currentPage}
          lang={lang}
        />

        {/* Main Content - scroll-mt-16 accounts for sticky navbar height */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 scroll-mt-16">
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

        {/* Right Sidebar - TOC with independent scroll */}
        <aside className="hidden lg:block w-56 xl:w-64 border-l border-stone-200 bg-white sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-4">
            <DocsTableOfContents />
          </div>
        </aside>
      </div>

      {/* Back to Top Button */}
      <DocsBackToTop />

      {/* Print styles - injected via style tag for scoped styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          article { font-size: 11pt; }
        }
        
        /* Prevent horizontal overflow on all screens */
        @media (max-width: 640px) {
          * { overflow-wrap: break-word; word-wrap: break-word; }
        }
        
        /* Ensure all hash anchors respect sticky navbar height */
        html {
          scroll-padding-top: 4rem;
        }
        article {
          scroll-margin-top: 4rem;
        }
      `}</style>
    </div>
  );
}