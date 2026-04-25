import { useParams } from 'react-router-dom';
import { DocsTOCProvider } from '@/docs/components/DocsTOCContext';
import DocsLayout from '@/docs/components/DocsLayout';
import DocsHome from '@/docs/components/DocsHome';
import DocsPageContent from '@/docs/components/DocsPage';

export default function HelpDocsPage() {
  const { lang, slug } = useParams();
  
  // Determine current language from URL structure
  // /help/docs/en → lang='en', slug=undefined → show home
  // /help/docs/es → lang='es', slug=undefined → show home  
  // /help/docs/en/slug → lang='en', slug='slug'
  // /help/docs/slug → slug='slug', no lang → default to 'en'
  let currentLang = lang;
  let currentSlug = slug;
  
  // Fallback language to 'en' if not determined
  currentLang = currentLang || 'en';
  
  // If no slug, show the docs home page within DocsLayout
  if (!currentSlug) {
    return (
      <DocsTOCProvider>
        <DocsLayout lang={currentLang} currentPage={null}>
          <DocsHome lang={currentLang} />
        </DocsLayout>
      </DocsTOCProvider>
    );
  }
  
  return (
    <DocsTOCProvider>
      <DocsPageContent lang={currentLang} slug={currentSlug} />
    </DocsTOCProvider>
  );
}