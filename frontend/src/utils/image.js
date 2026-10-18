/**
 * Normalize an image URL so it always works regardless of where the
 * backend is hosted.
 *
 * Old articles may have URLs stored as absolute localhost addresses
 * (e.g. "http://localhost:8000/uploads/img_xxx.jpg") because the
 * uploadImage endpoint used to embed BACKEND_URL into the stored value.
 * New uploads will return a relative path ("/uploads/img_xxx.jpg").
 *
 * This helper converts both forms into the relative path that the Vite
 * dev proxy (and production webserver) can serve correctly.
 */
export function getImageUrl(url) {
  if (!url) return '/placeholder.jpg';

  // Already a relative uploads path – return as-is.
  if (url.startsWith('/uploads/')) return url;

  // Absolute URL that contains /uploads/ – strip the origin part.
  const match = url.match(/\/uploads\/(.+)$/);
  if (match) return '/uploads/' + match[1];

  // External URL or anything else – return unchanged.
  return url;
}

export function getModernImageUrl(url) {
  const normalized = getImageUrl(url);
  if (!normalized || normalized.startsWith('http') || normalized.startsWith('data:')) return '';
  if (normalized.startsWith('/uploads/')) return '';
  // These files are mirrored exactly from the InfinityFree reference site.
  // JPG entries do not have generated WebP siblings, so requesting one would
  // trigger the article placeholder instead of the real news photo.
  if (normalized.startsWith('/article_images/infinity-reference-20261018/')) return '';
  if (/\.(webp|avif|svg)$/i.test(normalized)) return '';
  if (!/\.(jpe?g|png)$/i.test(normalized)) return '';
  return normalized.replace(/\.(jpe?g|png)$/i, '.webp');
}
