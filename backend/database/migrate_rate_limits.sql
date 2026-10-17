-- ============================================
-- Migrasi: Tambah tabel rate_limits & password_resets
-- Jalankan ini di phpMyAdmin jika database sudah ada sebelumnya
-- dan belum memiliki tabel-tabel ini.
-- ============================================

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

-- Password Resets Table
CREATE TABLE IF NOT EXISTS password_resets (
  email VARCHAR(100) NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB;
