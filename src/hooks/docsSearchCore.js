import Fuse from 'fuse.js';

export const FUSE_OPTIONS = {
  keys: [
    { name: 'title', weight: 0.3 },
    { name: 'description', weight: 0.15 },
    { name: 'searchKeywords', weight: 0.35 },
    { name: 'content', weight: 0.2 },
  ],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

const MAX_DIRECT_RESULTS = 20;
const MAX_DISPLAY_RESULTS = 10;
const MAX_RELATED_REFS = 25;
const MAX_RELATED_CONCEPTS = 5;
const MAX_CROSS_REF_RESULTS = 5;

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function getHeadingsForMatch(item, match) {
  const headings = item.headings;
  if (Array.isArray(headings)) return headings;
  if (!headings || typeof headings !== 'object') return [];

  const matchLang = typeof match?.key === 'string' ? match.key.split('.')[1] : null;
  return headings[matchLang] || headings.en || headings.es || [];
}

function getTargetHeading(item, matches) {
  const contentMatch = matches.find((match) => match.key?.startsWith('content'));
  if (!contentMatch?.indices?.length) return null;

  const headings = getHeadingsForMatch(item, contentMatch);
  if (!headings.length) return null;

  const matchPosition = contentMatch.indices[0]?.[0] || 0;
  return headings.find((heading, index) => {
    const nextHeading = headings[index + 1];
    return matchPosition >= heading.position && (!nextHeading || matchPosition < nextHeading.position);
  }) || headings[0];
}

function createMatchTypes(result, query) {
  const matches = result.matches || [];
  const normalizedQuery = normalize(query);
  const headingLists = Array.isArray(result.item.headings)
    ? [result.item.headings]
    : Object.values(result.item.headings || {}).filter(Array.isArray);

  return {
    title: matches.some((match) => match.key?.startsWith('title')),
    keyword: matches.some((match) => match.key?.startsWith('keywords') || match.key === 'searchKeywords'),
    content: matches.some((match) => match.key?.startsWith('content')),
    heading: headingLists.some((headings) =>
      headings.some((heading) => normalize(heading.text).includes(normalizedQuery)),
    ),
  };
}

function processResult(result, query) {
  const matchTypes = createMatchTypes(result, query);
  let resultType = 'text';

  if (matchTypes.heading) {
    resultType = 'concept';
  } else if (matchTypes.keyword) {
    resultType = 'keyword';
  } else if (matchTypes.title) {
    resultType = 'page';
  }

  return {
    ...result,
    matchTypes,
    resultType,
    targetHeading: getTargetHeading(result.item, result.matches || []),
  };
}

function isRelatedRef(ref, normalizedQuery, queryWords) {
  return ref.normalizedTerm.includes(normalizedQuery) ||
    queryWords.some((word) => ref.normalizedTerm.includes(word));
}

function buildRelatedConcepts(relatedRefs, directSlugs) {
  return relatedRefs
    .slice(0, MAX_RELATED_CONCEPTS)
    .map((ref) => ({
      term: ref.term,
      pages: ref.pages.filter((page) => !directSlugs.has(page.slug)),
    }))
    .filter((related) => related.pages.length > 0);
}

function buildCrossRefResults(relatedRefs, directSlugs, pageBySlug) {
  const pageScores = new Map();

  relatedRefs.forEach((ref) => {
    ref.pages.forEach((page) => {
      if (directSlugs.has(page.slug) || !pageBySlug.has(page.slug)) return;
      pageScores.set(page.slug, (pageScores.get(page.slug) || 0) + 1);
    });
  });

  return Array.from(pageScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_CROSS_REF_RESULTS)
    .map(([slug], index) => ({
      item: pageBySlug.get(slug),
      matches: [],
      score: 0.6 + index * 0.01,
    }));
}

export function createDocsSearcher({ index, crossRef = [], fuseFactory } = {}) {
  const docsIndex = Array.isArray(index) ? index : [];
  const pageBySlug = new Map(docsIndex.map((page) => [page.slug, page]));
  const normalizedCrossRef = (Array.isArray(crossRef) ? crossRef : [])
    .filter((ref) => ref?.term && Array.isArray(ref.pages))
    .map((ref) => ({
      ...ref,
      normalizedTerm: normalize(ref.term),
    }));
  const createFuse = fuseFactory || ((items) => new Fuse(items, FUSE_OPTIONS));
  const fuse = docsIndex.length ? createFuse(docsIndex, FUSE_OPTIONS) : null;

  return function searchDocs(query) {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery || normalizedQuery.length < 2 || !fuse) return [];

    const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 2);
    const directResults = fuse.search(query, { limit: MAX_DIRECT_RESULTS });
    const directSlugs = new Set(directResults.map((result) => result.item.slug));
    const relatedRefs = [];

    for (const ref of normalizedCrossRef) {
      if (isRelatedRef(ref, normalizedQuery, queryWords)) {
        relatedRefs.push(ref);
        if (relatedRefs.length >= MAX_RELATED_REFS) break;
      }
    }

    const relatedConcepts = buildRelatedConcepts(relatedRefs, directSlugs);
    const crossRefResults = buildCrossRefResults(relatedRefs, directSlugs, pageBySlug);
    const seen = new Set();
    const mergedResults = [];

    [...directResults, ...crossRefResults].forEach((result) => {
      if (seen.has(result.item.slug)) return;
      seen.add(result.item.slug);
      mergedResults.push(result);
    });

    return mergedResults.slice(0, MAX_DISPLAY_RESULTS).map((result) => {
      const processed = processResult(result, query);
      return {
        ...processed,
        relatedConcepts: relatedConcepts.filter((related) =>
          related.pages.some((page) => page.slug === result.item.slug),
        ),
      };
    });
  };
}
