# Checklist Siap Pindah ke Hostinger

Panduan ini untuk memindahkan KBB Sadunia dari hosting gratis/shared lama ke hosting berbayar seperti Hostinger tanpa mengubah bentuk website secara besar-besaran.

## 1. Kebutuhan Hosting

- PHP 8.1 atau 8.2.
- MySQL/MariaDB aktif.
- Extension PHP: `pdo_mysql`, `mbstring`, `fileinfo`, `json`, `openssl`, `gd`.
- SSL/HTTPS aktif untuk domain utama.
- Akses phpMyAdmin atau fitur import database.

## 2. Struktur Upload

Upload isi build frontend ke `public_html/`.

Folder dan file backend yang tetap diperlukan di server:

- `api/`
- `config/`
- `uploads/`
- `.env`
- `.htaccess`

Folder yang tidak perlu diunggah ke hosting produksi:

- `frontend/src/`
- `node_modules/`
- `work/`
- `scripts/` development
- file sementara seperti `test_*.php`, `debug_*.php`, `fix_*.php`

## 3. Konfigurasi Environment

Salin contoh `backend/.env.hostinger.example` menjadi `.env` di server, lalu isi sesuai data database Hostinger.

Nilai penting:

- `APP_ENV=production`
- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`
- `API_SECRET_KEY` minimal 32 karakter acak
- `FRONTEND_URL=https://domain-anda.com`
- `BACKEND_URL=https://domain-anda.com`

Untuk frontend, salin `frontend/.env.hostinger.example` menjadi `frontend/.env` sebelum build jika domain sudah final.

## 4. Database

- Buat database baru di Hostinger.
- Import `backend/database/schema.sql`.
- Jika sudah ada data dari website lama, ekspor tabel artikel, kategori, user, tag, komentar, dan media dari hosting lama lalu import ke Hostinger.
- Pastikan tabel `rate_limits` ada. Jika belum, jalankan migration `backend/database/migrate_rate_limits.sql`.

## 5. Build Frontend

Jalankan dari folder `frontend`:

```bash
npm install
npm run build
```

Upload seluruh isi `frontend/dist/` ke `public_html/`.

## 6. Keamanan Produksi

Pastikan URL berikut tidak bisa dibaca publik:

- `https://domain-anda.com/.env`
- `https://domain-anda.com/config/database.php`
- `https://domain-anda.com/config/Logger.php`
- `https://domain-anda.com/database/schema.sql`
- `https://domain-anda.com/logs/security.log`

Jika salah satu file terbuka, hentikan migrasi dan periksa `.htaccess`.

## 7. Tes Setelah Upload

- `https://domain-anda.com/` membuka beranda.
- `https://domain-anda.com/api/health` menghasilkan status API.
- `https://domain-anda.com/api/articles?search=banjar` mengembalikan artikel.
- `https://domain-anda.com/tentang/pelantikan` membuka arsip pelantikan KBB Sadunia.
- `https://domain-anda.com/api/sitemap.xml` berisi URL halaman dan artikel.
- Login admin berhasil.
- Upload gambar artikel berhasil.
- Pencarian dari navbar menemukan artikel yang sesuai.

## 8. Backup Rutin

Aktifkan backup Hostinger untuk file dan database. Jika ingin backup tambahan, jalankan script `backend/scripts/backup.php` melalui Cron Job dengan interval harian atau mingguan.

Contoh target aman:

- Backup file: mingguan.
- Backup database: harian.
- Simpan minimal 7 versi terakhir.

## 9. Catatan Konten

Halaman `Tentang > Kegiatan Pelantikan KBB Sadunia` memakai foto dan tanggal dari sumber publik. Jika ada koreksi dari pengurus KBB, cukup perbarui `frontend/src/pages/PelantikanPage.jsx`, jalankan build ulang, lalu upload ulang folder `dist`.
