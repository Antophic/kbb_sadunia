const broadContextWords = new Set([
  "kbb",
  "sadunia",
  "sa",
  "dunia",
  "banjar",
  "bubuhan",
  "kerukunan",
]);

export function normalizeSearchText(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function expandQueryWord(word) {
  const variants = new Set([word]);
  const commonTypos = [
    [/silahturahmi/g, "silaturahmi"],
    [/silahtur/g, "silatur"],
    [/silaturhmi/g, "silaturahmi"],
    [/kongrs/g, "kongres"],
  ];

  for (const [pattern, replacement] of commonTypos) {
    if (pattern.test(word)) variants.add(word.replace(pattern, replacement));
  }

  if (word.length >= 6 && /^sila?h?tur/.test(word)) {
    variants.add(word.replace(/h/g, ""));
  }

  return [...variants].filter((variant) => variant.length >= 2);
}

function queryPhraseVariants(normalizedQuery) {
  if (!normalizedQuery) return [];
  const variants = new Set([normalizedQuery]);
  variants.add(normalizedQuery.replace(/silahturahmi/g, "silaturahmi"));
  variants.add(normalizedQuery.replace(/silahtur/g, "silatur"));
  variants.add(normalizedQuery.replace(/silaturhmi/g, "silaturahmi"));
  variants.add(normalizedQuery.replace(/kongrs/g, "kongres"));
  return [...variants].filter(Boolean);
}

export function tokenizeQuery(value = "") {
  const words = normalizeSearchText(value)
    .split(" ")
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);

  return [...new Set(words.flatMap(expandQueryWord))];
}

export function articleDateValue(article) {
  return new Date(article.published_at || article.created_at || 0).getTime() || 0;
}

function fieldTokens(field) {
  return field.split(" ").filter((word) => word.length >= 3);
}

function isWithinEditDistance(a, b, maxDistance) {
  if (Math.abs(a.length - b.length) > maxDistance) return false;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = current[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      current[j] = value;
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > maxDistance) return false;
    previous = current;
  }

  return previous[b.length] <= maxDistance;
}

function wordMatches(field, word) {
  if (!word) return false;
  if (field.includes(word)) return true;
  if (word.length < 5) return false;

  const threshold = word.length <= 7 ? 1 : 2;
  return fieldTokens(field).some((token) => {
    if (token.startsWith(word) || word.startsWith(token)) return true;
    const tokenPrefix = token.slice(0, Math.min(token.length, word.length + threshold));
    return isWithinEditDistance(tokenPrefix, word, threshold);
  });
}

export function scoreArticle(article, normalizedQuery, words) {
  const fields = {
    title: normalizeSearchText(article.title),
    excerpt: normalizeSearchText(article.excerpt),
    content: normalizeSearchText(article.content),
    category: normalizeSearchText(article.category_name),
    author: normalizeSearchText(article.author_name),
    slug: normalizeSearchText(article.slug),
  };

  const allFields = Object.values(fields);
  const specificWords = words.filter((word) => !broadContextWords.has(word));
  if (words.length > 1 && specificWords.length > 0) {
    const hasSpecificMatch = specificWords.some((word) =>
      allFields.some((field) => wordMatches(field, word))
    );
    if (!hasSpecificMatch) return 0;
  }

  let score = 0;
  for (const phrase of queryPhraseVariants(normalizedQuery)) {
    if (fields.title.includes(phrase)) score += 90;
    if (fields.excerpt.includes(phrase)) score += 45;
    if (fields.content.includes(phrase)) score += 25;
    if (fields.category.includes(phrase)) score += 20;
    if (fields.author.includes(phrase)) score += 18;
  }

  for (const word of words) {
    const weight = broadContextWords.has(word) ? 0.25 : 1;
    if (wordMatches(fields.title, word)) score += 20 * weight;
    if (wordMatches(fields.category, word)) score += 16 * weight;
    if (wordMatches(fields.excerpt, word)) score += 11 * weight;
    if (wordMatches(fields.content, word)) score += 5 * weight;
    if (wordMatches(fields.author, word)) score += 4 * weight;
    if (wordMatches(fields.slug, word)) score += 3 * weight;
  }

  return score;
}

export function uniqueArticles(articles) {
  const seen = new Set();
  return articles.filter((article) => {
    if (!article?.id || seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });
}
