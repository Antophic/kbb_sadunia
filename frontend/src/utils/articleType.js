export function isOpinionArticle(article) {
  const marker = [
    article?.category_slug,
    article?.category_name,
    article?.slug,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return marker.includes("opini") || marker.includes("artikel--opini");
}
