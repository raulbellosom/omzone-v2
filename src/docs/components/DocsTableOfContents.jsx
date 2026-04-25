import { useEffect, useState } from 'react';
import { useDocsTOC } from './DocsTOCContext';

export default function DocsTableOfContents() {
  const { headings } = useDocsTOC();
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!headings?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -80% 0%' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!headings?.length) {
    return (
      <div className="text-xs text-stone-400">No headings</div>
    );
  }

  return (
    <nav>
      <h4 className="text-xs font-semibold text-stone-400 uppercase mb-3">
        On this page
      </h4>
      <ul className="space-y-2">
        {headings.map(({ text, id, level }) => (
          <li key={id} style={{ paddingLeft: level === 3 ? '12px' : '0' }}>
            <a
              href={`#${id}`}
              className={`block text-sm py-1 border-l-2 transition-colors ${
                activeId === id
                  ? 'border-stone-600 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}