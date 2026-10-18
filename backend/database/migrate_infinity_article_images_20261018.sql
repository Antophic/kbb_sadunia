-- Use the exact article photos available on the InfinityFree reference site.
-- The source paths and checksums are recorded in scripts/infinity-article-images-20261018.json.
START TRANSACTION;

UPDATE articles
SET image_url = CASE id
    WHEN 59 THEN '/article_images/infinity-reference-20261018/article_59.jpg'
    WHEN 60 THEN '/article_images/infinity-reference-20261018/article_60.jpg'
    WHEN 61 THEN '/article_images/infinity-reference-20261018/article_61.jpg'
    WHEN 62 THEN '/article_images/infinity-reference-20261018/article_62.jpg'
    WHEN 63 THEN '/article_images/infinity-reference-20261018/article_63.jpg'
    WHEN 64 THEN '/article_images/infinity-reference-20261018/article_64.jpg'
    WHEN 65 THEN '/article_images/infinity-reference-20261018/article_65.jpg'
    WHEN 66 THEN '/article_images/infinity-reference-20261018/article_66.jpg'
    WHEN 67 THEN '/article_images/infinity-reference-20261018/article_67.jpg'
    WHEN 68 THEN '/article_images/infinity-reference-20261018/article_68.jpg'
    WHEN 69 THEN '/article_images/infinity-reference-20261018/article_69.jpg'
    WHEN 70 THEN '/article_images/infinity-reference-20261018/article_70.jpg'
    WHEN 71 THEN '/article_images/infinity-reference-20261018/article_71.jpg'
    WHEN 72 THEN '/article_images/infinity-reference-20261018/article_72.jpg'
    WHEN 73 THEN '/article_images/infinity-reference-20261018/article_73.jpg'
    WHEN 74 THEN '/article_images/infinity-reference-20261018/article_74.jpg'
    WHEN 75 THEN '/article_images/infinity-reference-20261018/article_75.jpg'
    WHEN 76 THEN '/article_images/infinity-reference-20261018/article_76.jpg'
    WHEN 77 THEN '/article_images/infinity-reference-20261018/article_77.jpg'
    WHEN 78 THEN '/article_images/infinity-reference-20261018/article_78.jpg'
    WHEN 79 THEN '/article_images/infinity-reference-20261018/article_79.jpg'
    WHEN 80 THEN '/article_images/infinity-reference-20261018/article_80.jpg'
    WHEN 81 THEN '/article_images/infinity-reference-20261018/article_81.jpg'
    WHEN 82 THEN '/article_images/infinity-reference-20261018/article_82.jpg'
    WHEN 83 THEN '/article_images/infinity-reference-20261018/article_83.jpg'
    WHEN 84 THEN '/article_images/infinity-reference-20261018/article_84.jpg'
    WHEN 85 THEN '/article_images/infinity-reference-20261018/article_85.jpg'
    WHEN 86 THEN '/article_images/infinity-reference-20261018/article_86.jpg'
    WHEN 87 THEN '/article_images/infinity-reference-20261018/article_87.jpg'
    WHEN 88 THEN '/article_images/infinity-reference-20261018/article_88.jpg'
    WHEN 89 THEN '/article_images/infinity-reference-20261018/article_89.jpg'
    WHEN 90 THEN '/article_images/infinity-reference-20261018/article_90.jpg'
    WHEN 91 THEN '/article_images/infinity-reference-20261018/article_91.jpg'
    WHEN 92 THEN '/article_images/infinity-reference-20261018/article_92.jpg'
    WHEN 93 THEN '/article_images/infinity-reference-20261018/article_93.jpg'
    WHEN 94 THEN '/article_images/infinity-reference-20261018/article_94.jpg'
    WHEN 95 THEN '/article_images/infinity-reference-20261018/article_95.jpg'
    WHEN 96 THEN '/article_images/infinity-reference-20261018/article_96.jpg'
    WHEN 97 THEN '/article_images/infinity-reference-20261018/article_97.jpg'
    WHEN 98 THEN '/article_images/infinity-reference-20261018/article_98.jpg'
    WHEN 99 THEN '/article_images/infinity-reference-20261018/article_99.jpg'
    WHEN 101 THEN '/article_images/infinity-reference-20261018/article_101.jpg'
    WHEN 102 THEN '/article_images/infinity-reference-20261018/article_102.jpg'
    WHEN 103 THEN '/article_images/infinity-reference-20261018/article_103.jpg'
    WHEN 104 THEN '/article_images/infinity-reference-20261018/article_104.jpg'
    WHEN 105 THEN '/article_images/infinity-reference-20261018/article_105.jpg'
    WHEN 106 THEN '/article_images/infinity-reference-20261018/article_106.jpg'
    WHEN 107 THEN '/article_images/infinity-reference-20261018/article_107.jpg'
    WHEN 108 THEN '/article_images/infinity-reference-20261018/article_108.jpg'
    WHEN 109 THEN '/article_images/infinity-reference-20261018/article_109.jpg'
    WHEN 110 THEN '/article_images/infinity-reference-20261018/article_110.jpg'
    WHEN 111 THEN '/article_images/infinity-reference-20261018/article_111.jpg'
    WHEN 112 THEN '/article_images/infinity-reference-20261018/article_112.jpg'
    WHEN 113 THEN '/article_images/infinity-reference-20261018/article_113.jpg'
    WHEN 114 THEN '/article_images/infinity-reference-20261018/article_114.jpg'
    WHEN 115 THEN '/article_images/infinity-reference-20261018/article_115.jpg'
    WHEN 116 THEN '/article_images/infinity-reference-20261018/article_116.jpg'
    WHEN 117 THEN '/article_images/infinity-reference-20261018/article_117.jpg'
    WHEN 118 THEN '/article_images/infinity-reference-20261018/article_118.jpg'
    WHEN 119 THEN '/article_images/infinity-reference-20261018/article_119.jpg'
    WHEN 120 THEN '/article_images/infinity-reference-20261018/article_120.jpg'
    WHEN 121 THEN '/article_images/infinity-reference-20261018/article_121.jpg'
    WHEN 122 THEN '/article_images/infinity-reference-20261018/article_122.jpg'
    WHEN 123 THEN '/article_images/infinity-reference-20261018/article_123.jpg'
    WHEN 124 THEN '/article_images/infinity-reference-20261018/article_124.jpg'
    WHEN 125 THEN '/article_images/infinity-reference-20261018/article_125.jpg'
    WHEN 126 THEN '/article_images/infinity-reference-20261018/article_126.jpg'
    WHEN 127 THEN '/article_images/infinity-reference-20261018/article_127.jpg'
    WHEN 128 THEN '/article_images/infinity-reference-20261018/article_128.jpg'
    WHEN 130 THEN '/article_images/infinity-reference-20261018/article_130.jpg'
    ELSE image_url
END
WHERE id IN (
59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 130
);

COMMIT;

SELECT id, title, image_url
FROM articles
WHERE id IN (
59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 130
)
ORDER BY id;
