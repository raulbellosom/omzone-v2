import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

const FUSE_OPTIONS = {
  keys: [
    { name: 'title', weight: 0.3 },
    { name: 'description', weight: 0.15 },
    { name: 'searchKeywords', weight: 0.35 },
    { name: 'content', weight: 0.2 }
  ],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true
};

export default function useDocsSearch(query) {
  const [index, setIndex] = useState([]);
  const [crossRef, setCrossRef] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fuse = useMemo(() => {
    if (!index.length) return null;
    return new Fuse(index, FUSE_OPTIONS);
  }, [index]);

  const results = useMemo(() => {
    if (!query || !fuse || query.length < 2) return [];
    
    // Normalize query
    const normalizedQuery = query.toLowerCase().trim();
    
    // Direct search for the full query
    const directResults = fuse.search(query);
    
    // Find related concepts from cross-reference
    const relatedConcepts = crossRef
      .filter(ref => {
        const term = ref.term.toLowerCase();
        // Check if query is contained in term or vice versa
        return term.includes(normalizedQuery) || 
               normalizedQuery.split(/\s+/).some(w => term.includes(w) && w.length > 2);
      })
      .slice(0, 5)
      .map(ref => ({
        term: ref.term,
        pages: ref.pages.filter(p => !directResults.find(r => r.item.slug === p.slug))
      }))
      .filter(rel => rel.pages.length > 0);
    
    // For multi-word queries, also try expanding with cross-ref
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length >= 3);
    if (queryWords.length > 1) {
      const expandedTerms = new Set();
      queryWords.forEach(word => {
        crossRef.forEach(ref => {
          if (ref.term.includes(word)) {
            expandedTerms.add(ref.term);
          }
        });
      });
      
      // Search for expanded terms
      const expandedResults = [];
      expandedTerms.forEach(term => {
        const termResults = fuse.search(term);
        termResults.forEach(r => {
          if (!expandedResults.find(e => e.item.slug === r.item.slug)) {
            expandedResults.push(r);
          }
        });
      });
      
      // Merge with direct results
      const seen = new Set(directResults.map(r => r.item.slug));
      const merged = [...directResults];
      expandedResults.forEach(r => {
        if (!seen.has(r.item.slug)) {
          merged.push(r);
          seen.add(r.item.slug);
        }
      });
      
      return merged.slice(0, 10).map(result => ({
        ...result,
        relatedConcepts: relatedConcepts.filter(rel => 
          rel.pages.some(p => p.slug === result.item.slug)
        )
      }));
    }
    
    return directResults.slice(0, 10).map(result => ({
      ...result,
      relatedConcepts: relatedConcepts.filter(rel => 
        rel.pages.some(p => p.slug === result.item.slug)
      )
    }));
  }, [query, fuse, crossRef]);

  // Process results to categorize match types
  const processedResults = useMemo(() => {
    return results.map(result => {
      const matches = result.matches || [];
      
      // Categorize match types
      const matchTypes = {
        title: matches.some(m => m.key === 'title'),
        keyword: matches.some(m => m.key === 'keywords'),
        content: matches.some(m => m.key === 'content'),
        heading: matches.some(m => 
          m.key === 'content' && 
          result.item.headings?.some(h => 
            h.text.toLowerCase().includes(query.toLowerCase())
          )
        )
      };
      
      // Determine result type
      let resultType = 'page';
      if (matchTypes.heading) {
        resultType = 'concept';
      } else if (matchTypes.keyword) {
        resultType = 'keyword';
      } else if (matchTypes.title) {
        resultType = 'page';
      } else {
        resultType = 'text';
      }
      
      // Find the best heading match for navigation
      let targetHeading = null;
      if (result.item.headings && matches.length > 0) {
        const contentMatch = matches.find(m => m.key === 'content');
        if (contentMatch && contentMatch.indices) {
          const matchPos = contentMatch.indices[0]?.[0] || 0;
          targetHeading = result.item.headings.find((h, i) => {
            const nextHeading = result.item.headings[i + 1];
            return matchPos >= h.position && (!nextHeading || matchPos < nextHeading.position);
          }) || result.item.headings[0];
        }
      }
      
      return {
        ...result,
        matchTypes,
        resultType,
        targetHeading
      };
    });
  }, [results, query]);

  return { results: processedResults, loading };
}