import { Link } from 'react-router-dom';

export default function DocsBreadcrumbs({ currentPage, lang = 'en' }) {
  if (!currentPage) return null;

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-stone-500 mb-6" aria-label="Breadcrumb">
      <Link to={`/help/docs/${lang}`} className="hover:text-stone-700 touch-manipulation">Docs</Link>
      <span aria-hidden="true">/</span>
      <span className="text-stone-900">{currentPage.sectionTitle}</span>
      <span aria-hidden="true">/</span>
      <span className="text-stone-900 truncate">{currentPage.title}</span>
    </nav>
  );
}