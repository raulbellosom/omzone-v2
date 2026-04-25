import { useState, useEffect, useMemo } from 'react';
import { createDocsSearcher } from './docsSearchCore';

function useDebouncedValue(value, delay = 180) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function useDocsSearch(query) {
  const [index, setIndex] = useState([]);
  const [crossRef, setCrossRef] = useState([]);
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    // Load both search index and cross-reference
    Promise.all([
      fetch('/docs/search-index.json').then(res => res.json()),
      fetch('/docs/cross-ref.json').then(res => res.json()).catch(() => [])
    ]).then(([data, crossData]) => {
      setIndex(data);
      setCrossRef(crossData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load search index:', err);
      setLoading(false);
    });
  }, []);

  const searchDocs = useMemo(() => {
    if (!index.length) return null;
    return createDocsSearcher({ index, crossRef });
  }, [index, crossRef]);

  const results = useMemo(() => {
    if (!debouncedQuery || !searchDocs || debouncedQuery.length < 2) return [];
    return searchDocs(debouncedQuery);
  }, [debouncedQuery, searchDocs]);

  return { results, loading };
}
