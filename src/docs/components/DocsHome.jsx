import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  CalendarDays, 
  ShoppingCart, 
  FileText, 
  Settings,
  Users,
  ArrowRight,
  Lightbulb,
  Wrench
} from 'lucide-react';
import { docsNavigation, getLocalizedTitle } from '../config/navigation';
import DocsSearch from './DocsSearch';

const SECTION_ICONS = {
  gettingStarted: BookOpen,
  catalog: Sparkles,
  operations: CalendarDays,
  sales: ShoppingCart,
  content: FileText,
  system: Settings,
  reference: Lightbulb,
};

export default function DocsHome({ lang = 'en' }) {
  const sections = Object.entries(docsNavigation)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key, section]) => ({
      key,
      title: getLocalizedTitle(section.title, lang),
      pages: section.pages,
    }));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold text-stone-800 mb-3">
          {lang === 'es' ? 'Centro de Documentación' : 'Documentation Center'}
        </h1>
        <p className="text-stone-600 text-lg">
          {lang === 'es' 
            ? 'Bienvenido a la documentación de OMZONE. Explora las secciones abaixo para aprender cómo usar la plataforma.'
            : 'Welcome to the OMZONE documentation. Explore the sections below to learn how to use the platform.'}
        </p>
      </div>

      {/* Search */}
      <div className="mb-10">
        <DocsSearch lang={lang} />
      </div>

      {/* Quick Links */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-stone-700 mb-4">
          {lang === 'es' ? 'Acceso Rápido' : 'Quick Links'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to={`/help/docs/${lang}/introduction`}
            className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-stone-800">
              {lang === 'es' ? 'Introducción' : 'Introduction'}
            </span>
            <ArrowRight className="w-4 h-4 text-amber-600 ml-auto" />
          </Link>
          <Link
            to={`/help/docs/${lang}/experiences`}
            className="flex items-center gap-3 p-4 rounded-lg bg-sage/10 border border-sage/20 hover:bg-sage/20 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-sage-dark" />
            <span className="font-medium text-stone-800">
              {lang === 'es' ? 'Experiencias' : 'Experiences'}
            </span>
            <ArrowRight className="w-4 h-4 text-sage-dark ml-auto" />
          </Link>
          <Link
            to={`/help/docs/${lang}/orders`}
            className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-stone-800">
              {lang === 'es' ? 'Órdenes' : 'Orders'}
            </span>
            <ArrowRight className="w-4 h-4 text-blue-600 ml-auto" />
          </Link>
          <Link
            to={`/help/docs/${lang}/glossary`}
            className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors"
          >
            <Lightbulb className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-stone-800">
              {lang === 'es' ? 'Glosario' : 'Glossary'}
            </span>
            <ArrowRight className="w-4 h-4 text-purple-600 ml-auto" />
          </Link>
        </div>
      </div>

      {/* All Sections */}
      <div className="space-y-8">
        {sections.map((section) => {
          const Icon = SECTION_ICONS[section.key] || BookOpen;
          return (
            <div key={section.key}>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-700 mb-4">
                <Icon className="w-5 h-5 text-stone-500" />
                {section.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {section.pages.map((page) => (
                  <Link
                    key={page.slug}
                    to={`/help/docs/${lang}/${page.slug}`}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-stone-400" />
                    <span className="text-sm text-stone-700">{getLocalizedTitle(page.title, lang)}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Links */}
      <div className="mt-12 pt-8 border-t border-stone-200">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-700 mb-4">
          <Wrench className="w-5 h-5 text-stone-500" />
          {lang === 'es' ? 'Recursos de Soporte' : 'Support Resources'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to={`/help/docs/${lang}/troubleshooting`}
            className="flex items-center gap-3 p-4 rounded-lg bg-stone-100 border border-stone-200 hover:bg-stone-200 transition-colors"
          >
            <Wrench className="w-5 h-5 text-stone-600" />
            <div>
              <span className="font-medium text-stone-800 block">
                {lang === 'es' ? 'Solución de Problemas' : 'Troubleshooting'}
              </span>
              <span className="text-xs text-stone-500">
                {lang === 'es' ? 'Soluciones a problemas comunes' : 'Solutions to common problems'}
              </span>
            </div>
          </Link>
          <Link
            to={`/help/docs/${lang}/known-limitations`}
            className="flex items-center gap-3 p-4 rounded-lg bg-stone-100 border border-stone-200 hover:bg-stone-200 transition-colors"
          >
            <Users className="w-5 h-5 text-stone-600" />
            <div>
              <span className="font-medium text-stone-800 block">
                {lang === 'es' ? 'Limitaciones Conocidas' : 'Known Limitations'}
              </span>
              <span className="text-xs text-stone-500">
                {lang === 'es' ? 'Restricciones conocidas del sistema' : 'Known system constraints'}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
