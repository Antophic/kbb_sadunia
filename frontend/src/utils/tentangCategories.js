/**
 * Category slugs that belong exclusively to the "Tentang" (About) menu.
 * Articles in these categories should NOT appear in general listings
 * like Beranda, Terkini, or Search results.
 * 
 * NOTE: Only truly exclusive categories go here. Categories like
 * budaya-banjar, kegiatan-sosial, pelantikan-kbb are also general
 * news categories visible in the main nav bar, so they should NOT
 * be excluded from general listings.
 */
export const TENTANG_CATEGORY_SLUGS = [
  "artikel--opini",
];

/**
 * Query parameter string to exclude "Tentang" categories from API calls.
 * Usage: apiGetArticles(`?per_page=30&${EXCLUDE_TENTANG_PARAMS}`)
 */
export const EXCLUDE_TENTANG_PARAMS = `exclude_categories=${TENTANG_CATEGORY_SLUGS.join(",")}`;
