import { Link } from 'react-router-dom';
import { docsNavigation } from '@/docs/config/navigation';

export default function DocsSidebar({ currentPage, lang = 'en' }) {
  return (
    <nav className="p-4 sm:p-6 h-full" aria-label="Documentation navigation">
      {/* Logo/Brand */}
      <div className="mb-6">
        <Link 
          to={`/help/docs/${lang}`}
          className="text-base sm:text-lg font-semibold text-stone-800 hover:text-stone-900"
        >
          OMZONE Docs
        </Link>
      </div>

      {/* Navigation Sections */}
      {Object.entries(docsNavigation)
        .sort(([,a], [,b]) => a.order - b.order)
        .map(([sectionKey, section]) => (
          <div key={sectionKey} className="mb-6">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.pages
                .sort((a, b) => a.order - b.order)
                .map(page => (
                  <li key={page.slug}>
                    <Link
                      to={`/help/docs/${lang}/${page.slug}`}
                      className={`block px-3 py-2.5 rounded-lg text-sm transition-colors touch-manipulation ${
                        currentPage?.slug === page.slug
                          ? 'bg-stone-100 text-stone-900 font-medium'
                          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 focus:ring-2 focus:ring-stone-200'
                      }`}
                      aria-current={currentPage?.slug === page.slug ? 'page' : undefined}
                    >
                      {page.title}
                    </Link>
                  </li>
                ))
              }
            </ul>
          </div>
        ))
      }
    </nav>
  );
}