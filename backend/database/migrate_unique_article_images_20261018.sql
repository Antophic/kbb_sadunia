-- Replace copied fallback images with audited, article-specific source photos.
-- Static files are tracked in frontend/public/article_images/unique-20261018/.

START TRANSACTION;

UPDATE articles
SET
  image_url = CASE id
    WHEN 60 THEN '/article_images/unique-20261018/article_60.webp'
    WHEN 62 THEN '/article_images/unique-20261018/article_62.webp'
    WHEN 64 THEN '/article_images/unique-20261018/article_64.webp'
    WHEN 66 THEN '/article_images/unique-20261018/article_66.webp'
    WHEN 69 THEN '/article_images/unique-20261018/article_69.webp'
    WHEN 73 THEN '/article_images/unique-20261018/article_73.webp'
    WHEN 74 THEN '/article_images/unique-20261018/article_74.webp'
    WHEN 77 THEN '/article_images/unique-20261018/article_77.webp'
    WHEN 78 THEN '/article_images/unique-20261018/article_78.webp'
    WHEN 81 THEN '/article_images/unique-20261018/article_81.webp'
    WHEN 82 THEN '/article_images/unique-20261018/article_82.webp'
    WHEN 83 THEN '/article_images/unique-20261018/article_83.webp'
    WHEN 84 THEN '/article_images/unique-20261018/article_84.webp'
    WHEN 88 THEN '/article_images/unique-20261018/article_88.webp'
    WHEN 89 THEN '/article_images/unique-20261018/article_89.webp'
    WHEN 90 THEN '/article_images/unique-20261018/article_90.webp'
    WHEN 93 THEN '/article_images/unique-20261018/article_93.webp'
    WHEN 94 THEN '/article_images/unique-20261018/article_94.webp'
    WHEN 95 THEN '/article_images/unique-20261018/article_95.webp'
    WHEN 99 THEN '/article_images/unique-20261018/article_99.webp'
    WHEN 104 THEN '/article_images/unique-20261018/article_104.webp'
    WHEN 106 THEN '/article_images/unique-20261018/article_106.webp'
    WHEN 107 THEN '/article_images/unique-20261018/article_107.webp'
    WHEN 109 THEN '/article_images/unique-20261018/article_109.webp'
    WHEN 110 THEN '/article_images/unique-20261018/article_110.webp'
    WHEN 113 THEN '/article_images/unique-20261018/article_113.webp'
    WHEN 114 THEN '/article_images/unique-20261018/article_114.webp'
    WHEN 116 THEN '/article_images/unique-20261018/article_116.webp'
    WHEN 119 THEN '/article_images/unique-20261018/article_119.webp'
    WHEN 120 THEN '/article_images/unique-20261018/article_120.webp'
    ELSE image_url
  END,
  image_caption = CASE
    WHEN id = 77 THEN 'Diskusi buku Madam dan Jarwa yang membahas tradisi migrasi dan pergulatan identitas Urang Banjar.'
    WHEN id = 78 THEN 'Arsip kehidupan masyarakat sungai Banjar yang mendukung pola migrasi antarkawasan.'
    ELSE image_caption
  END,
  image_credit = CASE
    WHEN id = 77 THEN 'AsyikAsyik.com'
    WHEN id = 78 THEN 'BubuhanBanjar.wordpress.com'
    ELSE image_credit
  END
WHERE id IN (60, 62, 64, 66, 69, 73, 74, 77, 78, 81, 82, 83, 84, 88, 89, 90, 93, 94, 95, 99, 104, 106, 107, 109, 110, 113, 114, 116, 119, 120);

COMMIT;

SELECT id, title, image_url, image_caption, image_credit
FROM articles
WHERE id IN (60, 62, 64, 66, 69, 73, 74, 77, 78, 81, 82, 83, 84, 88, 89, 90, 93, 94, 95, 99, 104, 106, 107, 109, 110, 113, 114, 116, 119, 120)
ORDER BY id;
