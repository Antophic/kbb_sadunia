# Kebijakan dan Arsitektur Keamanan KBB Sadunia

Dokumen ini menjelaskan kontrol keamanan yang aktif, tanggung jawab operasional, risiko yang masih diterima, dan cara melaporkan kerentanan. Tidak ada sistem yang dapat dijamin kebal 100%; kontrol di bawah dibuat berlapis agar kegagalan satu lapisan tidak langsung membuka seluruh aplikasi.

## Versi yang didukung

Hanya commit terbaru pada branch `main` dan deployment produksi `https://kbbsadunia.com` yang didukung. Perbaikan keamanan diterapkan ke `main` dan diverifikasi oleh CI sebelum/bersamaan dengan deployment Hostinger.

## Melaporkan kerentanan

Jangan mempublikasikan bukti eksploitasi, token, kredensial, data pengguna, atau detail kerentanan melalui issue publik. Laporkan secara privat kepada pengelola repository/website dengan informasi berikut:

- URL atau komponen terdampak;
- langkah reproduksi yang tidak merusak;
- dampak yang diperkirakan;
- bukti secukupnya tanpa mengambil data pihak lain;
- saran mitigasi bila tersedia.

Pengujian tidak boleh menghapus data, melakukan brute force, mengirim spam, mengganggu layanan, atau mengakses akun milik orang lain.

## Kontrol yang diterapkan

### Identitas dan sesi

- Password disimpan dengan `password_hash(..., PASSWORD_BCRYPT)` dan diverifikasi dengan `password_verify`.
- Registrasi publik tidak diekspos; akun redaksi hanya dibuat oleh administrator.
- Password baru memiliki panjang 12–128 karakter dan sedikitnya tiga kelompok karakter.
- Respons login dibuat tahan terhadap perbedaan waktu sederhana untuk akun yang ada/tidak ada.
- Login dibatasi per IP dan akun; kegagalan dicatat tanpa menyimpan email mentah di security log.
- Token autentikasi HS256 berlaku delapan jam dan memiliki `iat`, `exp`, `jti`, serta versi user.
- Setiap token diverifikasi terhadap user dan role terbaru di database. Perubahan password, email, role, atau penghapusan akun membatalkan token lama.
- Logout memasukkan hash token valid ke blacklist sampai kedaluwarsa.
- Cookie autentikasi menggunakan `Secure`, `HttpOnly`, `SameSite=Strict`, dan path `/`.
- Token reset password hanya dapat dipakai sekali; proses validasi, perubahan password, dan penghapusan token dijalankan dalam transaksi database dengan row lock.

### CSRF, CORS, dan request

- POST, PUT, dan DELETE dilindungi token CSRF acak yang ditandatangani HMAC.
- Origin/Referer dibandingkan sebagai origin penuh, bukan hanya hostname.
- Preflight dari origin yang tidak dipercaya ditolak dan header CORS hanya diberikan kepada origin yang cocok.
- JSON harus memakai `application/json`, berukuran maksimal 1 MiB, dan valid secara sintaks.
- Endpoint publik berisiko spam memiliki rate limit berbasis database.

### XSS dan konten

- HTML artikel disanitasi di backend memakai HTMLPurifier yang dikunci oleh `composer.lock` dan ikut dideploy.
- Jika HTMLPurifier tidak tersedia, backend gagal secara aman dengan mengubah konten menjadi teks ter-escape—bukan sanitizer regex.
- Frontend memakai DOMPurify versi yang telah menutup advisory high/critical pada saat hardening ini dibuat.
- CSP membatasi script ke origin sendiri, memblokir object/embed, membatasi frame ke YouTube, serta membatasi base URL dan form action.
- SSR mengabaikan Host header yang tidak dipercaya dan melakukan encoding pada canonical/OG metadata.

### Database dan otorisasi

- Query dengan input pengguna memakai prepared statements PDO dan native prepares.
- Endpoint administratif memverifikasi token serta role pada server; kontrol tampilan frontend bukan sumber otorisasi.
- Daftar pengguna dan email hanya dapat dibaca administrator; navigasi dashboard juga dipisahkan sesuai role.
- Pengaturan situs memakai allowlist key, batas panjang, sanitasi teks, dan validasi URL—bukan menerima pasangan key/value arbitrer.
- Error produksi tidak menampilkan stack trace atau kredensial database.
- File `.env`, SQL, log, vendor, dotfile, dan folder internal diblokir oleh Apache.

### Upload

- Gambar maksimal 5 MiB, hanya JPEG/PNG/WebP, diverifikasi dengan Fileinfo dan `getimagesize`, serta dibatasi sampai 8.000 px per sisi dan 40 megapiksel.
- PDF maksimal 20 MiB, harus berekstensi PDF, memiliki MIME yang diizinkan, header `%PDF`, dan marker `%%EOF`.
- Nama file dibuat dengan 128 bit randomness dari CSPRNG server; nama file pengguna tidak dipakai sebagai path.
- Eksekusi PHP/script dan directory listing di folder upload dinonaktifkan.

### Browser dan transport

- Semua HTTP diarahkan ke HTTPS; TLS lama ditolak oleh hosting/CDN.
- Header mencakup HSTS, CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, dan `X-Permitted-Cross-Domain-Policies`.
- Endpoint API sensitif memakai `Cache-Control: no-store`.

### Supply chain dan CI/CD

- `package-lock.json` dan `composer.lock` wajib di-commit.
- CI menjalankan audit dependency produksi, ESLint, build Vite, Composer audit, PHP lint, dan pemeriksaan konfigurasi header.
- CodeQL menjalankan analisis statis JavaScript dengan query keamanan tambahan.
- Deployment berhenti bila ditemukan advisory high/critical pada dependency produksi.
- GitHub Actions dikunci ke commit SHA, bukan hanya mutable tag.
- Dependabot memeriksa npm, Composer, dan GitHub Actions setiap minggu.
- Kredensial FTPS hanya disimpan sebagai GitHub Actions Secrets dan deployment tidak mengunggah `.env` atau menimpa upload pengguna.

## Tanggung jawab operasional

Kode yang aman tetap memerlukan operasi yang aman:

1. Aktifkan 2FA pada GitHub, Hostinger, dan email administrator.
2. Gunakan password unik melalui password manager untuk akun admin, database, FTP, dan email.
3. Gunakan `API_SECRET_KEY` acak minimal 32 byte; rotasi setelah dugaan insiden. Rotasi otomatis membatalkan seluruh token JWT/CSRF lama.
4. Lindungi branch `main` dengan review dan CI wajib bila repository memiliki lebih dari satu pengelola.
5. Tinjau dan merge pembaruan Dependabot setelah CI lulus.
6. Buat backup database dan upload secara berkala, simpan terenkripsi, dan uji pemulihannya.
7. Tinjau `security.log`, percobaan login, user admin, dan perubahan role secara rutin.
8. Hapus akun yang tidak dipakai dan gunakan role dengan hak paling kecil.

## Risiko tersisa yang diketahui

- Editor Quill masih memiliki advisory npm tingkat **low** pada fitur ekspor HTML. Eksposurnya dibatasi ke dashboard terautentikasi dan hasilnya disanitasi lagi oleh DOMPurify serta HTMLPurifier. Advisory high/critical tidak diterima oleh CI.
- Shared hosting/CDN berada di luar source code. Keamanan akun Hostinger, konfigurasi DNS, backup, WAF, dan patch platform tetap harus dijaga melalui hPanel.
- CSP masih mengizinkan inline style agar tampilan React yang ada tidak rusak; inline script tetap tidak diizinkan.

## Respons insiden singkat

Jika dicurigai terjadi kompromi:

1. Putuskan sesi dengan mengganti `API_SECRET_KEY`.
2. Rotasi password GitHub, Hostinger/FTP, database, email, dan admin website.
3. Nonaktifkan akun mencurigakan dan periksa perubahan role/user.
4. Simpan log dan backup untuk investigasi; jangan menghapus bukti sebelum disalin.
5. Periksa commit/deployment terakhir, file server, database, upload, dan GitHub Actions.
6. Pulihkan dari versi/backup yang diketahui bersih, lalu audit ulang endpoint live.
