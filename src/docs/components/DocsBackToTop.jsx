import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function DocsBackToTop({ containerRef }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = containerRef?.current;
    
    const toggleVisibility = () => {
      if (scrollContainer) {
        setIsVisible(scrollContainer.scrollTop > 300);
      } else {
        setIsVisible(window.scrollY > 300);
      }
    };

    const handleScroll = () => toggleVisibility();
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [containerRef]);

  const scrollToTop = () => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 p-3 bg-stone-800 text-white rounded-full shadow-lg hover:bg-stone-700 transition-all z-50 cursor-pointer"
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
