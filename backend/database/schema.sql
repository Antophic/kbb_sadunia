-- ============================================
-- HuluSungai News - Database Schema
-- MySQL Database Setup
-- ============================================

-- CREATE DATABASE IF NOT EXISTS kbbs_db
--   CHARACTER SET utf8mb4
--   COLLATE utf8mb4_unicode_ci;

-- USE kbbs_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  role ENUM('admin', 'editor', 'author', 'subscriber') DEFAULT 'subscriber',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Password Resets Table
CREATE TABLE IF NOT EXISTS password_resets (
  email VARCHAR(100) NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- Token Blacklist Table (For JWT Revocation)
CREATE TABLE IF NOT EXISTS token_blacklist (
  token_hash VARCHAR(64) PRIMARY KEY,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- Rate Limits Table (REQUIRED — digunakan oleh API untuk membatasi request per IP)
CREATE TABLE IF NOT EXISTS rate_limits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  requests INT DEFAULT 1,
  blocked_until TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_ip_endpoint (ip_address, endpoint)
) ENGINE=InnoDB;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3391ff',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content LONGTEXT,
  image_url VARCHAR(500),
  image_caption VARCHAR(255),
  image_credit VARCHAR(255),
  video_url VARCHAR(500),
  category_id INT,
  author_id INT,
  status ENUM('draft', 'review', 'published', 'scheduled', 'archived') DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  read_time VARCHAR(20),
  source_name VARCHAR(255),
  source_url VARCHAR(500),
  editor_note TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_featured (featured),
  INDEX idx_published (published_at)
) ENGINE=InnoDB;

-- Article Views Log Table (Untuk mencegah database lock saat trafik tinggi)
CREATE TABLE IF NOT EXISTS article_views_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_article (article_id)
) ENGINE=InnoDB;

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Article-Tags Pivot Table
CREATE TABLE IF NOT EXISTS article_tags (
  article_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  user_id INT,
  author_name VARCHAR(100),
  author_email VARCHAR(100),
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'spam') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Article Reactions Table
CREATE TABLE IF NOT EXISTS reactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  reaction_type ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry') NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_reaction (article_id, ip_address, reaction_type)
) ENGINE=InnoDB;

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  status ENUM('active', 'unsubscribed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Digital Library / Books Table
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) DEFAULT '',
  category VARCHAR(100) DEFAULT 'Umum',
  description TEXT,
  cover_url VARCHAR(500) DEFAULT '',
  file_url VARCHAR(500) DEFAULT '',
  file_size INT DEFAULT 0,
  downloads INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_books_category (category),
  INDEX idx_books_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login Attempts Table (Brute Force Protection)
CREATE TABLE IF NOT EXISTS login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100),
  ip_address VARCHAR(45),
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN DEFAULT FALSE,
  INDEX idx_email (email),
  INDEX idx_ip (ip_address),
  INDEX idx_time (attempted_at)
) ENGINE=InnoDB;


-- Website Settings Table
CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO settings (setting_key, setting_value) VALUES
('site_name', 'KBB Sadunia'),
('site_description', 'Portal berita dan informasi KBB Sadunia')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- ============================================
-- Sample Data
-- ============================================

INSERT IGNORE INTO categories (name, slug, color) VALUES
('Budaya', 'budaya', '#8b5cf6'),
('Sejarah', 'sejarah', '#d97706'),
('Pariwisata', 'pariwisata', '#059669'),
('Ekonomi', 'ekonomi', '#dc2626'),
('Pendidikan', 'pendidikan', '#2563eb'),
('Sosial', 'sosial', '#0891b2');

-- ============================================
-- Admin User Setup
-- ============================================
-- JANGAN gunakan admin default! Buat admin lewat CLI:
--   php scripts/create_admin.php
-- Script tersebut akan meminta email, username, dan password yang kuat.

-- ============================================
-- Security: Restricted User Setup
-- Jalankan perintah ini di MySQL console/phpMyAdmin sebagai root
-- ============================================
-- CREATE USER 'hsnews_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON kbbs_db.* TO 'hsnews_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
