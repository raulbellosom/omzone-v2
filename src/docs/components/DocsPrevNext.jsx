import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getLocalizedTitle } from '@/docs/config/navigation';

export default function DocsPrevNext({ prev, next, lang = 'en' }) {
  return (
    <nav className="flex flex-col sm:flex-row justify-between gap-4 mt-12 pt-8 border-t border-stone-200">
      {prev ? (
        <Link
          to={`/help/docs/${lang}/${prev.slug}`}
          className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>{getLocalizedTitle(prev.title, lang)}</span>
        </Link>
      ) : <div />}

      {next && (
        <Link
          to={`/help/docs/${lang}/${next.slug}`}
          className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto sm:text-right"
        >
          <span>{getLocalizedTitle(next.title, lang)}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </Link>
      )}
    </nav>
  );
}
