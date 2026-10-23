# Portal KBB Sadunia

Source code Portal Kerukunan Bubuhan Banjar (KBB) Sadunia. Aplikasi terdiri dari frontend React/Vite dan API PHP dengan database MySQL/MariaDB.

## Struktur

- `frontend/` — antarmuka publik dan dashboard pengelola.
- `backend/api/` — endpoint API PHP.
- `backend/config/` — koneksi database dan logger.
- `backend/database/` — schema dan migration database.
- `docs/FLOWCHART.md` — flowchart arsitektur, alur pengunjung, RBAC, artikel, upload, reset password, dan CI/CD.
- `SECURITY.md` — model keamanan, kontrol yang diterapkan, prosedur pelaporan, dan checklist operasional.
- `.github/workflows/ci.yml` — pemeriksaan lint, build, dan sintaks PHP.
- `.github/workflows/deploy-hostinger.yml` — deployment otomatis dari branch `main` ke Hostinger melalui FTPS, dengan opsi jalankan ulang secara manual.

## Menjalankan frontend

```bash
cd frontend
npm ci
npm run dev
```

Salin `frontend/.env.example` menjadi `frontend/.env` untuk konfigurasi lokal. File `.env` tidak boleh di-commit.

## Pemeriksaan sebelum push

```bash
cd frontend
npm ci
npm run security:audit
npm run lint
npm run build

cd ../backend
composer validate --strict
composer install --no-dev --prefer-dist --optimize-autoloader
composer audit --locked
```

Untuk memeriksa sintaks backend:

```bash
find backend -name "*.php" -print0 | xargs -0 -n1 php -l
```

## Deployment Hostinger

Deployment kode berjalan otomatis setiap ada push ke branch `main` setelah GitHub Actions Secrets berikut ditambahkan ke repository. Workflow tetap dapat dijalankan ulang secara manual dari tab **Actions**:

- `HOSTINGER_FTP_SERVER`
- `HOSTINGER_FTP_USERNAME`
- `HOSTINGER_FTP_PASSWORD`
- `HOSTINGER_FTP_PATH`

Nilai `HOSTINGER_FTP_PATH` biasanya `/public_html/` atau path domain yang ditampilkan hPanel. Jangan simpan kredensial langsung di source code.

Migrasi database awal dan pembuatan file `.env` server tetap dilakukan satu kali melalui hPanel. Lihat `HOSTINGER_READY_CHECKLIST.md`.

## Keamanan

Portal menggunakan pertahanan berlapis dan tidak hanya bergantung pada frontend:

- autentikasi memakai cookie `Secure`, `HttpOnly`, `SameSite=Strict` dan token bertanda tangan dengan masa berlaku 8 jam;
- role dan versi akun diverifikasi kembali ke database pada setiap penggunaan token, sehingga penghapusan akun, perubahan role, dan perubahan password membatalkan sesi lama;
- seluruh request perubahan dilindungi CSRF bertanda tangan dan pemeriksaan origin;
- password baru minimal 12 karakter serta harus memakai sedikitnya tiga jenis karakter;
- token reset password disimpan sebagai hash SHA-256, bukan token mentah;
- artikel disanitasi di server dengan HTMLPurifier dan kembali disanitasi di browser dengan DOMPurify;
- query dinamis memakai prepared statements, endpoint sensitif memakai RBAC dan rate limiting;
- menu dashboard dipisahkan berdasarkan role dan data pengguna hanya dapat dibaca admin;
- pengaturan situs dibatasi dengan allowlist field, sanitasi, batas panjang, dan validasi URL;
- upload gambar/PDF dibatasi ukuran, MIME, magic bytes, dimensi, ekstensi, dan nama file acak;
- `.env`, log, database, vendor, dotfile, dan skrip internal diblokir dari web;
- CSP, HSTS, anti-framing, MIME sniffing protection, referrer policy, dan permissions policy dikirim oleh server;
- CI memeriksa audit npm/Composer, lint, build, sintaks PHP, dan keberadaan header keamanan;
- CodeQL menjalankan analisis statis JavaScript pada push, pull request, dan jadwal mingguan;
- Dependabot memantau npm, Composer, dan GitHub Actions setiap minggu;
- GitHub Actions pihak ketiga dikunci ke commit SHA untuk mengurangi risiko supply-chain.

Detail lengkap, asumsi, risiko tersisa, dan prosedur insiden tersedia di [SECURITY.md](SECURITY.md).

## Flowchart sistem

Alur website disusun berdasarkan route dan kontrol yang benar-benar digunakan aplikasi, bukan diagram konseptual terpisah. Diagram arsitektur, perjalanan pengunjung, login dan otorisasi, hak akses dashboard, siklus artikel, upload, reset password, serta deployment tersedia di [docs/FLOWCHART.md](docs/FLOWCHART.md).

Jika route, endpoint, role, aturan upload, atau workflow deployment berubah, implementasi dan flowchart wajib diperbarui dalam commit yang sama agar dokumentasi tetap menjadi acuan yang akurat.

## Alur update

1. Ubah source code.
2. Jalankan lint dan build.
3. Commit lalu push ke `main`.
4. Pantau workflow **CI** di tab **Actions** GitHub.
5. Merge atau push perubahan ke branch `main`. Workflow **Deploy to Hostinger** akan membangun frontend, memasang dependency backend dari `composer.lock`, menjalankan audit keamanan, lalu mengunggah aplikasi secara otomatis tanpa menyentuh `.env` atau isi folder `uploads`. Jika diperlukan, workflow yang sama bisa dijalankan ulang secara manual dari tab **Actions**.

