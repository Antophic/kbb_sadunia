-- Complete the remaining public metadata from the InfinityFree reference site.
-- Empty categories and tags are kept because they are exposed by the public API,
-- sitemap, and topic index even when no published article currently uses them.

START TRANSACTION;

INSERT INTO categories (name, slug, color, description) VALUES
    ('Berita', 'berita', '#10b981', NULL),
    ('Ekonomi', 'ekonomi', '#dc2626', NULL),
    ('Kegiatan', 'kegiatan', '#10b981', NULL),
    ('Pariwisata', 'pariwisata', '#059669', NULL),
    ('Sejarah', 'sejarah', '#d97706', NULL)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    color = VALUES(color),
    description = VALUES(description);

INSERT INTO tags (name, slug) VALUES
    ('Bandung Raya', 'bandung-raya'),
    ('banjar', 'banjar'),
    ('Bubuhan Banjar', 'bubuhan-banjar'),
    ('Budaya Banjar', 'budaya-banjar'),
    ('diaspora', 'diaspora'),
    ('Diaspora Banjar', 'diaspora-banjar'),
    ('Halal Bihalal', 'halal-bihalal'),
    ('Jabodetabek', 'jabodetabek'),
    ('Kalteng', 'kalteng'),
    ('kbb sadunia', 'kbb-sadunia'),
    ('kesultanan banjar', 'kesultanan-banjar'),
    ('Malaysia', 'malaysia'),
    ('melayu', 'melayu'),
    ('paguyuban', 'paguyuban'),
    ('Pelantikan', 'pelantikan'),
    ('sejarah', 'sejarah'),
    ('Semarang', 'semarang')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- This archive-only author cannot sign in: "!" is deliberately not a valid
-- password hash. It exists only to preserve the public byline from InfinityFree.
INSERT INTO users (username, email, password_hash, display_name, role)
SELECT
    'admin_kbb_sadunia_archive',
    'archive-author@kbbsadunia.invalid',
    '!',
    'Admin KBB Sadunia',
    'author'
WHERE NOT EXISTS (
    SELECT 1 FROM users
    WHERE username = 'admin_kbb_sadunia_archive'
       OR display_name = 'Admin KBB Sadunia'
);

SET @archive_author_id = (
    SELECT id
    FROM users
    WHERE username = 'admin_kbb_sadunia_archive'
       OR display_name = 'Admin KBB Sadunia'
    ORDER BY (username = 'admin_kbb_sadunia_archive') DESC
    LIMIT 1
);

UPDATE articles
SET author_id = @archive_author_id
WHERE id IN (123, 124, 125, 126, 127, 128)
  AND @archive_author_id IS NOT NULL;

COMMIT;
