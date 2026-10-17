# Portal KBB Sadunia

Source code Portal Kerukunan Bubuhan Banjar (KBB) Sadunia. Aplikasi terdiri dari frontend React/Vite dan API PHP dengan database MySQL/MariaDB.

## Struktur

- `frontend/` — antarmuka publik dan dashboard pengelola.
- `backend/api/` — endpoint API PHP.
- `backend/config/` — koneksi database dan logger.
- `backend/database/` — schema dan migration database.
- `.github/workflows/ci.yml` — pemeriksaan lint, build, dan sintaks PHP.
- `.github/workflows/deploy-hostinger.yml` — deployment manual ke Hostinger melalui FTPS.

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
npm run lint
npm run build
```

Untuk memeriksa sintaks backend:

```bash
find backend -name "*.php" -print0 | xargs -0 -n1 php -l
```

## Deployment Hostinger

Deployment kode dijalankan manual dari tab **Actions** setelah GitHub Actions Secrets berikut ditambahkan ke repository:

- `HOSTINGER_FTP_SERVER`
- `HOSTINGER_FTP_USERNAME`
- `HOSTINGER_FTP_PASSWORD`
- `HOSTINGER_FTP_PATH`

Nilai `HOSTINGER_FTP_PATH` biasanya `/public_html/` atau path domain yang ditampilkan hPanel. Jangan simpan kredensial langsung di source code.

Migrasi database awal dan pembuatan file `.env` server tetap dilakukan satu kali melalui hPanel. Lihat `HOSTINGER_READY_CHECKLIST.md`.

## Alur update

1. Ubah source code.
2. Jalankan lint dan build.
3. Commit lalu push ke `main`.
4. Pantau workflow **CI** di tab **Actions** GitHub.
5. Bila ingin menerbitkan perubahan ke Hostinger, jalankan workflow **Deploy to Hostinger** secara manual. Workflow ini membangun frontend dan mengunggah perubahan kode tanpa menyentuh `.env` atau isi folder `uploads`.

