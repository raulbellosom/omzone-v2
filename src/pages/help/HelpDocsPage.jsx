import { lazy } from 'react';
import { useParams } from 'react-router-dom';
import { DocsTOCProvider } from '@/docs/components/DocsTOCContext';

const DocsPageContent = lazy(
  () => import('@/docs/components/DocsPage')
);

export default function HelpDocsPage() {
  const { lang, slug } = useParams();
  
  // Default to 'en' if no language specified
  const currentLang = lang || 'en';
  
  return (
    <DocsTOCProvider>
      <DocsPageContent lang={currentLang} />
    </DocsTOCProvider>
  );
}