-- KBB Sadunia deploy compatibility migration
-- Jalankan ini di phpMyAdmin jika database lama sudah pernah diimport.

USE kbbs_db;

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) AFTER image_url,
  ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255) AFTER read_time,
  ADD COLUMN IF NOT EXISTS meta_description TEXT AFTER meta_title,
  MODIFY published_at TIMESTAMP NULL DEFAULT NULL;

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO settings (setting_key, setting_value) VALUES
('site_name', 'KBB Sadunia'),
('site_description', 'Portal berita dan informasi KBB Sadunia')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);


-- CMS WordPress-like article improvements
ALTER TABLE articles
  MODIFY status ENUM('draft', 'published', 'scheduled', 'archived') DEFAULT 'draft',
  MODIFY published_at TIMESTAMP NULL DEFAULT NULL;
