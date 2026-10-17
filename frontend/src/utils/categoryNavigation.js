export const hiddenCategorySlugs = new Set([
  "artikel--opini",
  "berita",
  "berita-utama",
  "opini",
  "budaya",
  "ekonomi",
  "sosial",
  "kegiatan",
  "kegiatan-dan-gelaran-kbb-sadunia",
]);

const primaryCategorySpecs = [
  { slug: "teknologi", label: "Teknologi", color: "#48230f" },
  { slug: "sosial-dan-kemanusiaan", fallbackSlug: "sosial", label: "Sosial", color: "#0f7f75" },
  { slug: "budaya-banjar", fallbackSlug: "budaya", label: "Budaya Banjar", color: "#0f7f75" },
  { slug: "ekonomi-bubuhan-banjar", fallbackSlug: "ekonomi", label: "Ekonomi", color: "#0f7f75" },
  { slug: "pendidikan", label: "Pendidikan", color: "#2563eb" },
];

function articleCount(category) {
  return Number(category?.article_count || 0);
}

function findCategory(categories, spec) {
  return (
    categories.find((category) => category.slug === spec.slug) ||
    (spec.fallbackSlug ? categories.find((category) => category.slug === spec.fallbackSlug) : null)
  );
}

function uniqueBySlug(categories) {
  const seen = new Set();
  return categories.filter((category) => {
    if (!category?.slug || seen.has(category.slug)) return false;
    seen.add(category.slug);
    return true;
  });
}

export function getCategoryLabel(category) {
  return category.navLabel || category.name;
}

export function getPrimaryNavCategories(categories = []) {
  return uniqueBySlug(
    primaryCategorySpecs.map((spec) => {
      const category = findCategory(categories, spec);
      return {
        ...(category || { slug: spec.slug, name: spec.label, color: spec.color, article_count: 0 }),
        navLabel: spec.label,
      };
    })
  );
}

export function getSecondaryNavCategories(categories = []) {
  const primarySlugs = new Set(getPrimaryNavCategories(categories).map((category) => category.slug));
  return categories
    .filter((category) => !hiddenCategorySlugs.has(category.slug))
    .filter((category) => !primarySlugs.has(category.slug))
    .sort((a, b) => articleCount(b) - articleCount(a) || a.name.localeCompare(b.name));
}

export function getAllCategoryList(categories = []) {
  return uniqueBySlug(categories)
    .filter((category) => category?.slug)
    .sort((a, b) => articleCount(b) - articleCount(a) || a.name.localeCompare(b.name));
}

export function getVisibleCategoryList(categories = []) {
  return uniqueBySlug([...getPrimaryNavCategories(categories), ...getSecondaryNavCategories(categories)]);
}
