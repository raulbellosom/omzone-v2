import { lazy } from 'react';
import { useParams } from 'react-router-dom';
import { DocsTOCProvider } from '@/docs/components/DocsTOCContext';

const DocsPageContent = lazy(
  () => import('@/docs/components/DocsPage')
);

export default function HelpDocsPage() {
  const { lang, slug } = useParams();
  
  // Determine current language from URL structure
  // /help/docs/en → lang='en', slug=undefined → show introduction
  // /help/docs/es → lang='es', slug=undefined → show introduction  
  // /help/docs/en/slug → lang='en', slug='slug'
  // /help/docs/slug → slug='slug', no lang → default to 'en'
  let currentLang = lang;
  let currentSlug = slug;
  
  // Fallback language to 'en' if not determined
  currentLang = currentLang || 'en';
  
  return (
    <DocsTOCProvider>
      <DocsPageContent lang={currentLang} />
    </DocsTOCProvider>
  );
}