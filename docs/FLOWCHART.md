# Flowchart Portal KBB Sadunia

Dokumen ini adalah acuan alur aplikasi `kbbsadunia.com`. Diagram disusun dari route React, endpoint PHP, aturan role, validasi upload, dan workflow GitHub Actions yang benar-benar digunakan oleh aplikasi.

> Catatan keamanan: pembatasan menu di frontend hanya membantu pengalaman pengguna. Keputusan akses yang sebenarnya selalu dilakukan kembali oleh API berdasarkan sesi dan role terbaru di database.

## 1. Arsitektur sistem

```mermaid
flowchart LR
    visitor[Pengunjung] -->|HTTPS| web[React SPA]
    staff[Admin, editor, atau author] -->|HTTPS| web
    web -->|JSON lewat /api| api[PHP API]

    api --> auth[Autentikasi, CSRF, RBAC, dan rate limit]
    auth --> db[(MySQL atau MariaDB)]
    api --> sanitizer[HTMLPurifier]
    api --> storage[(Media dan PDF)]
    api --> mail[Email reset password]

    maintainer[Pengelola kode] -->|push ke main| github[GitHub]
    github --> checks[CI, audit dependency, dan CodeQL]
    checks -->|lulus| deploy[Build release dan FTPS]
    deploy --> host[Hostinger]
    host --> web
    host --> api
```

## 2. Alur pengunjung

```mermaid
flowchart TD
    start([Buka kbbsadunia.com]) --> home[Beranda]
    home --> choice{Tujuan pengunjung}

    choice --> latest[Terkini, kategori, atau tag]
    choice --> search[Pencarian]
    choice --> profile[Profil, program, struktur, galeri, dan kalender]
    choice --> library[Perpustakaan]
    choice --> saved[Artikel tersimpan di perangkat]

    latest --> list[Daftar artikel terbit]
    search --> list
    list --> detail[Detail artikel]
    detail --> render[Konten aman dirender dengan DOMPurify]
    render --> optional{Tindakan lanjutan}
    optional --> share[Bagikan artikel]
    optional --> save[Simpan artikel di perangkat]
    optional --> comment[Kirim komentar]
    comment --> validation[Validasi dan moderasi komentar]

    library --> books[Daftar buku dan PDF yang tersedia]
    profile --> publicPage[Halaman informasi publik]
    saved --> detail
```

## 3. Login, sesi, dan otorisasi

```mermaid
flowchart TD
    login[Pengguna mengirim email dan password] --> limit{Lolos rate limit?}
    limit -->|Tidak| reject429[Tolak dengan 429]
    limit -->|Ya| account{Akun aktif dan password benar?}
    account -->|Tidak| reject401[Tolak dengan 401]
    account -->|Ya| issue[Terbitkan sesi maksimal 8 jam]
    issue --> cookies[Set cookie HttpOnly, Secure, SameSite Strict dan CSRF]
    cookies --> request[Request ke endpoint terlindungi]

    request --> verify{Signature, waktu, jti, dan blacklist valid?}
    verify -->|Tidak| relogin[Minta login ulang]
    verify -->|Ya| live[Ambil akun dan role terbaru dari database]
    live --> version{Akun aktif dan versi sesi cocok?}
    version -->|Tidak| relogin
    version -->|Ya| mutation{Request mengubah data?}
    mutation -->|Ya| csrf{Origin dan token CSRF valid?}
    mutation -->|Tidak| role
    csrf -->|Tidak| reject403[Tolak dengan 403]
    csrf -->|Ya| role{Role diizinkan?}
    role -->|Tidak| rejectRole[Tolak dengan 403]
    role -->|Ya| endpoint[Jalankan endpoint]

    endpoint --> logout{Logout atau akun berubah?}
    logout -->|Ya| revoke[Blacklist sesi dan hapus cookie]
    logout -->|Tidak| response[Kirim response no-store untuk data privat]
```

## 4. Hak akses dashboard

```mermaid
flowchart TD
    dashboard[Masuk ke dashboard] --> role{Role pengguna}

    role -->|Author| author[Artikel sendiri, media, dan buku]
    role -->|Editor| editor[Artikel, media, buku, komentar, kategori, dan tag]
    role -->|Admin| admin[Seluruh fitur editor, pengguna, dan pengaturan situs]

    author --> apiCheck[API memeriksa sesi, role, dan kepemilikan data]
    editor --> apiCheck
    admin --> apiCheck
    apiCheck --> allowed{Akses diizinkan?}
    allowed -->|Ya| action[Proses dan catat hasil]
    allowed -->|Tidak| denied[Tolak dengan 401 atau 403]
```

Ringkasan route dashboard:

| Fitur | Author | Editor | Admin |
| --- | :---: | :---: | :---: |
| Dashboard, artikel, media, buku | Ya | Ya | Ya |
| Komentar, kategori, tag | Tidak | Ya | Ya |
| Pengguna dan pengaturan situs | Tidak | Tidak | Ya |

## 5. Siklus artikel

```mermaid
flowchart TD
    create[Author, editor, atau admin membuat artikel] --> validate[Validasi judul, slug, metadata, kategori, dan sumber]
    validate --> sanitize[Sanitasi HTML di server]
    sanitize --> saveDraft[Simpan sebagai draft]
    saveDraft --> review[Review isi, gambar, sumber, dan hak publikasi]
    review --> decision{Hasil review}
    decision -->|Perlu revisi| revise[Perbaiki artikel]
    revise --> validate
    decision -->|Jadwalkan| scheduled[Simpan waktu publikasi]
    decision -->|Terbitkan| published[Status published]
    scheduled --> due{Waktu publikasi tiba?}
    due -->|Belum| scheduled
    due -->|Ya| published
    published --> public[Artikel tampil pada kanal publik]
    public --> correction{Perlu koreksi atau arsip?}
    correction -->|Koreksi| revise
    correction -->|Arsip| archived[Status archived]
    correction -->|Tidak| public
```

## 6. Upload gambar dan buku

```mermaid
flowchart TD
    upload[Pengelola memilih file] --> session{Sesi, role, origin, dan CSRF valid?}
    session -->|Tidak| reject[Tolak upload]
    session -->|Ya| type{Jenis file}

    type -->|Gambar| imageSize{Maksimal 5 MiB?}
    imageSize -->|Tidak| reject
    imageSize -->|Ya| imageCheck{JPEG, PNG, atau WebP dan dimensi aman?}
    imageCheck -->|Tidak| reject
    imageCheck -->|Ya| randomImage[Nama acak kriptografis]

    type -->|Buku PDF| pdfSize{Maksimal 20 MiB?}
    pdfSize -->|Tidak| reject
    pdfSize -->|Ya| pdfCheck{MIME, header, ekstensi, dan EOF PDF valid?}
    pdfCheck -->|Tidak| reject
    pdfCheck -->|Ya| randomPdf[Nama acak kriptografis]

    randomImage --> store[Simpan pada folder upload yang ditentukan]
    randomPdf --> store
    store --> db[(Simpan metadata ke database)]
    db --> success[Return URL publik yang tervalidasi]
```

## 7. Reset password

```mermaid
flowchart TD
    forgot[Pengguna meminta reset password] --> neutral[Selalu kirim response netral]
    forgot --> known{Email terdaftar?}
    known -->|Tidak| done[Selesai tanpa membocorkan status akun]
    known -->|Ya| token[Buat token acak]
    token --> hash[Simpan hash SHA-256 dan waktu kedaluwarsa]
    hash --> email[Kirim tautan reset sekali pakai]
    email --> submit[Pengguna mengirim token dan password baru]
    submit --> lock[Kunci record token dalam transaksi]
    lock --> valid{Token cocok, belum dipakai, dan belum kedaluwarsa?}
    valid -->|Tidak| fail[Tolak permintaan]
    valid -->|Ya| policy{Password 12 sampai 128 karakter dan memenuhi kebijakan?}
    policy -->|Tidak| fail
    policy -->|Ya| update[Hash password dan tandai token sudah dipakai]
    update --> revoke[Batalkan seluruh sesi lama]
    revoke --> relogin[Pengguna login kembali]
```

## 8. CI/CD ke Hostinger

```mermaid
flowchart TD
    push[Push atau merge ke main] --> ci[Workflow CI]
    push --> codeql[Workflow CodeQL security-extended]
    push --> deployJob[Workflow deployment produksi]

    ci --> ciChecks[Audit npm dan Composer, lint, build, PHP lint, dan pemeriksaan header]
    codeql --> analysis[Analisis statis JavaScript]
    deployJob --> install[Install dependency dari lockfile]
    install --> deployChecks[Ulangi audit, lint, build, dan PHP lint]
    deployChecks --> gate{Pemeriksaan deployment lulus?}
    gate -->|Tidak| stop[Deployment dihentikan]
    gate -->|Ya| release[Susun frontend, API, konfigurasi, dan vendor produksi]
    release --> protect[Pastikan .env dan uploads tidak ikut release]
    protect --> ftps[Unggah release lewat FTPS]
    ftps --> live[Hostinger melayani versi terbaru]
    live --> smoke[Smoke test halaman, API, dan header keamanan]

    ciChecks --> review[Status pemeriksaan terlihat di GitHub Actions]
    analysis --> review
    smoke --> review
```

## 9. Acuan saat mengubah aplikasi

Setiap perubahan route, endpoint, role, status artikel, aturan upload, atau proses deployment harus diikuti pembaruan dokumen ini. Urutan pemeriksaan sebelum perubahan masuk produksi adalah:

1. pastikan flowchart masih sama dengan implementasi;
2. jalankan lint, build, PHP lint, dan audit dependency;
3. cek bahwa API tetap menjadi sumber keputusan otorisasi;
4. push ke `main` dan tunggu seluruh GitHub Actions selesai;
5. lakukan smoke test pada `https://kbbsadunia.com` tanpa mengubah data produksi.
