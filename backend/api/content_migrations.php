<?php
/**
 * Idempotent editorial content migrations.
 *
 * These migrations are intentionally separate from schema migrations because
 * production is deployed over FTPS without database shell access. Each batch
 * is guarded by a settings key and every article slug remains unique, so a
 * deployment or concurrent request cannot create duplicate stories.
 */

function runEditorialContentMigrations(PDO $db): void {
    $migrationKey = 'content_migration_20261110_multimedia';

    $statusStmt = $db->prepare('SELECT setting_value FROM settings WHERE setting_key = :key LIMIT 1');
    $statusStmt->execute([':key' => $migrationKey]);
    if ($statusStmt->fetchColumn() === 'complete') {
        runEditorialContentMigration20261111($db);
        return;
    }

    $authorStmt = $db->query(
        "SELECT id FROM users ORDER BY CASE role WHEN 'admin' THEN 0 WHEN 'editor' THEN 1 ELSE 2 END, id LIMIT 1"
    );
    $authorId = (int)$authorStmt->fetchColumn();
    if ($authorId < 1) {
        throw new RuntimeException('Editorial migration requires at least one user');
    }

    $articles = [
        [
            'title' => 'KBB Singapura Periode 2025–2029 Dikukuhkan, Diaspora Banjar Diajak Kembangkan Investasi Gaharu',
            'slug' => 'kbb-singapura-2025-2029-dikukuhkan-investasi-gaharu',
            'excerpt' => 'Latief Omar resmi memimpin PWLN KBB Singapura periode 2025–2029. Pengukuhan menjadi momentum memperkuat silaturahmi diaspora Banjar sekaligus membuka percakapan tentang investasi gaharu.',
            'content' => <<<'HTML'
<p>Pengurus Wilayah Luar Negeri Kerukunan Bubuhan Banjar (PWLN KBB) Singapura memasuki masa bakti 2025–2029 setelah dikukuhkan oleh Ketua Umum Pengurus Pusat KBB Sadunia, H. Sahbirin Noor atau Paman Birin. H. Latief Omar dipercaya memimpin kepengurusan tersebut.</p>
<p>Dalam pertemuan itu, Paman Birin menekankan pentingnya KBB sebagai ruang silaturahmi bagi urang Banjar yang tersebar di berbagai negara. Jejaring diaspora dinilai tidak hanya menjaga hubungan kekeluargaan, tetapi juga dapat membuka kerja sama yang bermanfaat bagi Banua.</p>
<h2>Gagasan investasi gaharu</h2>
<p>Salah satu gagasan yang dibawa dalam agenda tersebut adalah peluang investasi penanaman pohon gaharu. Tawaran ini diarahkan sebagai pintu partisipasi diaspora Banjar dalam pengembangan ekonomi yang terhubung dengan daerah asal.</p>
<p>Latief Omar turut mengingatkan jejak panjang masyarakat Banjar di Singapura. Selain aktif dalam perdagangan, sejarah mencatat adanya tokoh Banjar yang pernah mendapat kepercayaan sebagai Mufti Singapura. Catatan ini memperkuat pesan bahwa kepengurusan KBB Singapura memiliki akar sejarah sekaligus tanggung jawab untuk membangun jejaring masa depan.</p>
<p><strong>Catatan redaksi:</strong> tulisan ini merupakan ringkasan redaksi KBB Sadunia berdasarkan laporan Vlood.id yang terbit 24 November 2025. Baca <a href="https://vlood.id/detail/3607/paman-birin-kukuhkan-pengurus-kbb-singapura-gaungkan-investasi-gaharu-untuk-diaspora-banjar" target="_blank" rel="noopener noreferrer">laporan sumber</a> untuk konteks selengkapnya.</p>
HTML,
            'image_url' => '/article_images/curated-202611/kbb-singapura-gaharu.jpg',
            'image_caption' => 'Suasana pertemuan PWLN KBB Singapura yang menandai dimulainya kepengurusan masa bakti 2025–2029.',
            'image_credit' => 'Vlood.id / Dokumentasi KBB Singapura',
            'video_url' => '',
            'category_slug' => 'pelantikan-kbb',
            'featured' => 0,
            'read_time' => '3 menit',
            'source_name' => 'Vlood.id',
            'source_url' => 'https://vlood.id/detail/3607/paman-birin-kukuhkan-pengurus-kbb-singapura-gaungkan-investasi-gaharu-untuk-diaspora-banjar',
            'editor_note' => 'Ringkasan orisinal redaksi dari sumber publik; foto menggunakan gambar utama dari sumber dengan kredit.',
            'meta_title' => 'KBB Singapura 2025–2029 Dikukuhkan, Dorong Investasi Gaharu',
            'meta_description' => 'KBB Singapura periode 2025–2029 dikukuhkan. Diaspora Banjar diajak memperkuat silaturahmi dan menjajaki investasi gaharu.',
            'published_at' => '2026-11-10 10:40:00',
            'tags' => ['KBB Sadunia', 'Pelantikan', 'Diaspora Banjar', 'Singapura', 'Ekonomi'],
        ],
        [
            'title' => 'KBB Arab Saudi dan Kuwait Dikukuhkan di Mekkah, Silaturahmi Diaspora Banjar Diperkuat',
            'slug' => 'kbb-arab-saudi-kuwait-dikukuhkan-di-mekkah',
            'excerpt' => 'Kepengurusan KBB Arab Saudi dan KBB Kuwait periode 2023–2027 dikukuhkan di Mekkah. Warga Banjar di perantauan diajak menjaga kebersamaan dan hubungan dengan Banua.',
            'content' => <<<'HTML'
<p>Pengurus Kerukunan Bubuhan Banjar (KBB) Arab Saudi dan KBB Kuwait periode 2023–2027 dikukuhkan di Mekkah oleh Ketua Umum KBB Sadunia, H. Sahbirin Noor atau Paman Birin. Agenda tersebut sekaligus menjadi ruang pertemuan warga Banjar yang menetap di dua negara.</p>
<p>Paman Birin menyampaikan rasa syukur dapat bertemu langsung dengan bubuhan Banjar di Arab Saudi dan Kuwait. Ia mengajak warga di perantauan terus menjaga kebersamaan, saling membantu, dan tetap menengok Banua melalui silaturahmi.</p>
<h2>Menjaga hubungan dengan Banua</h2>
<p>Dalam sambutannya, Paman Birin menyinggung tradisi merantau urang Banjar yang telah membentuk komunitas di berbagai wilayah Indonesia dan luar negeri. Jaringan tersebut diharapkan menjadi kekuatan sosial yang tetap berakar pada nilai keagamaan, toleransi, dan gotong royong.</p>
<p>Pertemuan juga mengangkat keteladanan ulama Banjar, termasuk Syekh Muhammad Arsyad Al-Banjari dan Abah Guru Sekumpul. Pesan yang dibawa adalah pentingnya menjaga ilmu, persaudaraan, dan manfaat bagi lingkungan tempat warga Banjar bermukim.</p>
<p><strong>Catatan redaksi:</strong> tulisan ini merupakan ringkasan redaksi KBB Sadunia berdasarkan laporan Radar Banjarmasin yang terbit 25 Desember 2023. Baca <a href="https://radarbanjarmasin.jawapos.com/banua/2312250031/di-mekkah-paman-birin-lantik-kerukunan-bubuhan-banjar-di-arab-saudi-dan-kuwait-ajak-selalu-tengok-banua-untuk-silaturahmi" target="_blank" rel="noopener noreferrer">laporan sumber</a>.</p>
HTML,
            'image_url' => '/article_images/curated-202611/kbb-arab-saudi-kuwait.jpg',
            'image_caption' => 'H. Sahbirin Noor bersama pengurus dan warga Banjar setelah pengukuhan KBB Arab Saudi dan KBB Kuwait di Mekkah.',
            'image_credit' => 'Adpim Pemprov Kalsel via Radar Banjarmasin',
            'video_url' => '',
            'category_slug' => 'pelantikan-kbb',
            'featured' => 0,
            'read_time' => '3 menit',
            'source_name' => 'Radar Banjarmasin',
            'source_url' => 'https://radarbanjarmasin.jawapos.com/banua/2312250031/di-mekkah-paman-birin-lantik-kerukunan-bubuhan-banjar-di-arab-saudi-dan-kuwait-ajak-selalu-tengok-banua-untuk-silaturahmi',
            'editor_note' => 'Ringkasan orisinal redaksi dari sumber publik; foto menggunakan gambar utama dari sumber dengan kredit.',
            'meta_title' => 'KBB Arab Saudi dan Kuwait Dikukuhkan di Mekkah',
            'meta_description' => 'KBB Arab Saudi dan Kuwait periode 2023–2027 dikukuhkan di Mekkah untuk memperkuat silaturahmi diaspora Banjar.',
            'published_at' => '2026-11-10 10:30:00',
            'tags' => ['KBB Sadunia', 'Pelantikan', 'Diaspora Banjar', 'Arab Saudi', 'Kuwait'],
        ],
        [
            'title' => 'Pra Kongres II KBB Sadunia di Bogor Satukan Langkah Menuju Kongres Banjarbaru',
            'slug' => 'pra-kongres-ii-kbb-sadunia-bogor-menuju-kongres-banjarbaru',
            'excerpt' => 'Pra Kongres II KBB Sadunia di Puncak, Bogor, mempertemukan pengurus wilayah dari Indonesia, Singapura, dan Malaysia serta menguatkan rencana Kongres II di Banjarbaru.',
            'content' => <<<'HTML'
<p>Pra Kongres II Kerukunan Bubuhan Banjar (KBB) Sadunia berlangsung pada 26–28 Oktober 2026 di Puncak, Bogor, Jawa Barat. Forum ini mempertemukan pengurus wilayah KBB dari berbagai daerah di Indonesia serta perwakilan dari Singapura dan Malaysia.</p>
<p>Ketua Umum PP KBB Sadunia, H. Sahbirin Noor, membuka agenda yang mengusung semangat konsolidasi organisasi: menata kepengurusan, menyatukan langkah, dan meneguhkan arah KBB Sadunia.</p>
<h2>Dari konsolidasi menuju Kongres II</h2>
<p>Pembahasan Pra Kongres mencakup administrasi kepesertaan, verifikasi kepengurusan wilayah, evaluasi organisasi, serta draf usulan perubahan AD/ART. Salah satu arah yang mengemuka adalah kesiapan Banjarbaru menjadi lokasi Kongres II KBB Sadunia.</p>
<p>Wali Kota Banjarbaru, Hj. Erna Lisa Halaby, menyampaikan kesiapan kota tersebut menyambut keluarga besar Banjar dari dalam dan luar negeri. Forum ini diharapkan memperluas jejaring, memperkuat sumber daya manusia, dan menjaga adat Banjar di tengah pergaulan nasional maupun internasional.</p>
<p>Pembukaan turut dimeriahkan atraksi budaya Banjar dan peragaan busana Sasirangan. Video liputan Lintas Banua Banjar TV dapat disaksikan langsung pada pemutar di halaman ini.</p>
<h2>Sumber liputan</h2>
<ul>
  <li><a href="https://inikalsel.id/paman-birin-ajak-peserta-pra-kongres-kerukunan-bubuhan-banjar-kbb-ll-sadunia-sujud-syukur/" target="_blank" rel="noopener noreferrer">Berita inikalsel.id</a></li>
  <li><a href="https://youtube.com/watch?v=NciKVqWGmXo" target="_blank" rel="noopener noreferrer">Video Lintas Banua Banjar TV</a></li>
  <li><a href="https://www.facebook.com/radarbanjarmasin/posts/1753269950133228/" target="_blank" rel="noopener noreferrer">Liputan sosial Radar Banjarmasin</a></li>
</ul>
<p><strong>Catatan redaksi:</strong> artikel ini dirangkum secara orisinal dari sumber-sumber di atas agar berita, video, dan dokumentasi acara tersaji dalam satu halaman tanpa duplikasi.</p>
HTML,
            'image_url' => '/article_images/curated-202611/pra-kongres-ii-bogor.jpg',
            'image_caption' => 'Peserta Pra Kongres II KBB Sadunia melakukan sujud syukur pada pembukaan agenda di Puncak, Bogor.',
            'image_credit' => 'inikalsel.id / Sitti Maryam',
            'video_url' => 'https://youtube.com/watch?v=NciKVqWGmXo',
            'category_slug' => 'kegiatan-sosial',
            'featured' => 1,
            'read_time' => '4 menit',
            'source_name' => 'inikalsel.id & Lintas Banua Banjar TV',
            'source_url' => 'https://inikalsel.id/paman-birin-ajak-peserta-pra-kongres-kerukunan-bubuhan-banjar-kbb-ll-sadunia-sujud-syukur/',
            'editor_note' => 'Liputan multimedia: ringkasan orisinal redaksi, foto sumber, video YouTube, dan tautan unggahan Facebook terkait.',
            'meta_title' => 'Pra Kongres II KBB Sadunia di Bogor Menuju Kongres Banjarbaru',
            'meta_description' => 'Pra Kongres II KBB Sadunia di Bogor menyatukan pengurus wilayah dan memperkuat rencana Kongres II di Banjarbaru.',
            'published_at' => '2026-11-10 10:50:00',
            'tags' => ['KBB Sadunia', 'Pra Kongres', 'Bogor', 'Banjarbaru', 'Budaya Banjar'],
        ],
        [
            'title' => 'Arsip Visual KBB Sadunia: Semangat Sumpah Pemuda 2026 untuk Indonesia',
            'slug' => 'arsip-visual-kbb-sadunia-sumpah-pemuda-2026',
            'excerpt' => 'PP KBB Sadunia menyampaikan semangat Hari Sumpah Pemuda 2026 melalui pesan “Patriotik, Gigih, Berempati: Pemuda untuk Indonesia” dalam balutan identitas budaya Banjar.',
            'content' => <<<'HTML'
<p>Pengurus Pusat KBB Sadunia menyampaikan Selamat Hari Sumpah Pemuda Tahun 2026 dengan tema <strong>“Patriotik, Gigih, Berempati: Pemuda untuk Indonesia.”</strong></p>
<p>Poster resmi memadukan Merah Putih dengan lanskap sungai, rumah Banjar, Menara Pandang 0 Kilometer Banjarmasin, busana tradisional, dan simbol kebersamaan generasi muda. Unsur-unsur tersebut membawa pesan bahwa kecintaan kepada Indonesia dapat berjalan beriringan dengan kebanggaan terhadap akar budaya Banjar.</p>
<h2>Pemuda yang berakar dan bergerak</h2>
<p>Semangat Sumpah Pemuda mengingatkan generasi muda Banjar di mana pun berada untuk menjaga persatuan, bekerja gigih, dan menghadirkan manfaat bagi sesama. Nilai patriotik bukan hanya hadir dalam peringatan, tetapi juga dalam keberanian belajar, berkolaborasi, merawat kebudayaan, dan ikut menyelesaikan persoalan masyarakat.</p>
<p>Melalui semboyan <em>“Bergerak! Banjar Menjemput Dunia”</em>, KBB Sadunia mengajak pemuda tetap berakar pada jati diri sambil membangun jejaring dan karya yang relevan bagi Indonesia dan dunia.</p>
<p><strong>Arsip redaksi:</strong> poster diterima langsung dari pengelola KBB Sadunia dan ditampilkan utuh sebagai dokumentasi visual organisasi.</p>
HTML,
            'image_url' => '/article_images/curated-202611/sumpah-pemuda-2026-kbb.jpg',
            'image_caption' => 'Poster ucapan Hari Sumpah Pemuda 2026 dari PP KBB Sadunia dengan tema “Patriotik, Gigih, Berempati: Pemuda untuk Indonesia”.',
            'image_credit' => 'Dokumentasi PP KBB Sadunia',
            'video_url' => '',
            'category_slug' => 'sosial',
            'featured' => 0,
            'read_time' => '2 menit',
            'source_name' => 'Dokumentasi PP KBB Sadunia',
            'source_url' => '',
            'editor_note' => 'Poster dikirim langsung oleh pengelola; ditampilkan sebagai arsip visual resmi.',
            'meta_title' => 'KBB Sadunia: Semangat Sumpah Pemuda 2026 untuk Indonesia',
            'meta_description' => 'Ucapan Hari Sumpah Pemuda 2026 dari PP KBB Sadunia dengan pesan patriotik, gigih, berempati, dan bangga pada budaya Banjar.',
            'published_at' => '2026-11-10 10:20:00',
            'tags' => ['KBB Sadunia', 'Sumpah Pemuda', 'Pemuda', 'Indonesia', 'Budaya Banjar'],
        ],
    ];

    $categoryStmt = $db->prepare('SELECT id FROM categories WHERE slug = :slug LIMIT 1');
    $insertArticle = $db->prepare(
        'INSERT INTO articles
            (title, slug, excerpt, content, image_url, image_caption, image_credit, video_url,
             category_id, author_id, status, featured, read_time, source_name, source_url,
             editor_note, meta_title, meta_description, published_at)
         SELECT
            :title, :slug, :excerpt, :content, :image_url, :image_caption, :image_credit, :video_url,
            :category_id, :author_id, \'published\', :featured, :read_time, :source_name, :source_url,
            :editor_note, :meta_title, :meta_description, :published_at
         WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = :check_slug)'
    );
    $articleIdStmt = $db->prepare('SELECT id FROM articles WHERE slug = :slug LIMIT 1');
    $upsertTag = $db->prepare(
        'INSERT INTO tags (name, slug) VALUES (:name, :slug)
         ON DUPLICATE KEY UPDATE name = VALUES(name)'
    );
    $tagIdStmt = $db->prepare('SELECT id FROM tags WHERE slug = :slug LIMIT 1');
    $attachTag = $db->prepare('INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (:article_id, :tag_id)');

    foreach ($articles as $article) {
        $categoryStmt->execute([':slug' => $article['category_slug']]);
        $categoryId = $categoryStmt->fetchColumn();

        $insertArticle->execute([
            ':title' => $article['title'],
            ':slug' => $article['slug'],
            ':excerpt' => $article['excerpt'],
            ':content' => $article['content'],
            ':image_url' => $article['image_url'],
            ':image_caption' => $article['image_caption'],
            ':image_credit' => $article['image_credit'],
            ':video_url' => $article['video_url'],
            ':category_id' => $categoryId ?: null,
            ':author_id' => $authorId,
            ':featured' => $article['featured'],
            ':read_time' => $article['read_time'],
            ':source_name' => $article['source_name'],
            ':source_url' => $article['source_url'],
            ':editor_note' => $article['editor_note'],
            ':meta_title' => $article['meta_title'],
            ':meta_description' => $article['meta_description'],
            ':published_at' => $article['published_at'],
            ':check_slug' => $article['slug'],
        ]);

        $articleIdStmt->execute([':slug' => $article['slug']]);
        $articleId = (int)$articleIdStmt->fetchColumn();
        if ($articleId < 1) {
            throw new RuntimeException('Failed to resolve editorial article: ' . $article['slug']);
        }

        foreach ($article['tags'] as $tagName) {
            $tagSlug = strtolower(trim((string)preg_replace('/[^a-z0-9]+/i', '-', $tagName), '-'));
            $upsertTag->execute([':name' => $tagName, ':slug' => $tagSlug]);
            $tagIdStmt->execute([':slug' => $tagSlug]);
            $tagId = (int)$tagIdStmt->fetchColumn();
            if ($tagId > 0) {
                $attachTag->execute([':article_id' => $articleId, ':tag_id' => $tagId]);
            }
        }
    }

    $completeStmt = $db->prepare(
        "INSERT INTO settings (setting_key, setting_value) VALUES (:key, 'complete')
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)"
    );
    $completeStmt->execute([':key' => $migrationKey]);
    runEditorialContentMigration20261111($db);
}

function runEditorialContentMigration20261111(PDO $db): void {
    $migrationKey = 'content_migration_20261111_alwi_as';

    $statusStmt = $db->prepare('SELECT setting_value FROM settings WHERE setting_key = :key LIMIT 1');
    $statusStmt->execute([':key' => $migrationKey]);
    if ($statusStmt->fetchColumn() === 'complete') {
        return;
    }

    $authorStmt = $db->query(
        "SELECT id FROM users ORDER BY CASE role WHEN 'admin' THEN 0 WHEN 'editor' THEN 1 ELSE 2 END, id LIMIT 1"
    );
    $authorId = (int)$authorStmt->fetchColumn();
    if ($authorId < 1) {
        throw new RuntimeException('Editorial migration requires at least one user');
    }

    $categoryStmt = $db->prepare('SELECT id FROM categories WHERE slug = :slug LIMIT 1');
    $categoryStmt->execute([':slug' => 'kegiatan-sosial']);
    $categoryId = $categoryStmt->fetchColumn();

    $article = [
        'title' => 'KBB Sadunia Turut Berduka atas Wafatnya Bapak Alwi A.S., Tokoh Pers Kaltim',
        'slug' => 'kbb-sadunia-berduka-wafatnya-alwi-as-tokoh-pers-kaltim',
        'excerpt' => 'Keluarga besar dan Pengurus Pusat KBB Sadunia menyampaikan duka cita atas wafatnya Bapak Alwi A.S., tokoh pers Kalimantan Timur dan mantan pimpinan Mimbar Masyarakat.',
        'content' => <<<'HTML'
<p>Keluarga besar dan Pengurus Pusat Kerukunan Bubuhan Banjar (KBB) Sadunia menyampaikan duka cita yang mendalam atas wafatnya <strong>Bapak Alwi A.S.</strong>, tokoh pers Kalimantan Timur dan mantan pimpinan surat kabar <em>Mimbar Masyarakat</em>.</p>
<p>Almarhum, yang juga dikenal sebagai Sayid Alwi bin Gholib Alaydrus, berpulang di RSUD Abdul Wahab Sjahranie, Samarinda, pada Selasa malam, 10 November 2026, pukul 23.36 WITA. Kepergiannya menjadi kehilangan besar bagi keluarga, kerabat, dan insan pers di Kalimantan Timur.</p>
<h2>Jejak panjang dalam dunia pers</h2>
<p>Bapak Alwi A.S. dikenal sebagai salah satu figur yang ikut membangun fondasi pers di Kalimantan Timur sejak dekade 1970-an. Melalui Mimbar Masyarakat, ia menjadi pemimpin dan tempat belajar bagi wartawan lintas generasi. Media tersebut juga tercatat sebagai tempat Dahlan Iskan memulai pengalaman jurnalistiknya di Samarinda.</p>
<p>Selain berkarya sebagai wartawan dan pengelola media, almarhum pernah mengemban amanah sebagai anggota DPRD Kalimantan Timur, aktif di Majelis Ulama Indonesia, serta terlibat dalam pengelolaan Islamic Center Kalimantan Timur. Dedikasi panjangnya memperoleh Lifetime Appreciation Award dalam Wartawan Legend Award 2023.</p>
<h2>Doa keluarga besar KBB Sadunia</h2>
<p>Ketua Umum PP KBB Sadunia H. Sahbirin Noor dan Sekretaris Umum H. Taufik Arbain, bersama seluruh keluarga besar KBB Sadunia, mendoakan semoga Allah SWT menerima seluruh amal ibadah almarhum, melapangkan kuburnya, menempatkannya di tempat terbaik di sisi-Nya, serta memberikan ketabahan dan kekuatan kepada keluarga yang ditinggalkan.</p>
<p><em>Inna lillahi wa inna ilaihi raji'un.</em></p>
<p><strong>Catatan redaksi:</strong> poster duka diterima langsung dari pengelola KBB Sadunia. Informasi riwayat dan waktu wafat dirangkum dari <a href="https://mediakaltim.com/tokoh-pers-senior-kaltim-alwi-as-meninggal-dunia-pernah-jadi-atasan-dahlan-iskan/" target="_blank" rel="noopener noreferrer">Media Kaltim</a> dan <a href="https://nomorsatukaltim.disway.id/utama/read/82403/berduka-pers-kaltim-kehilangan-guru-dan-begawan-media-sayid-alwi-alaydrus" target="_blank" rel="noopener noreferrer">Nomor Satu Kaltim</a>.</p>
HTML,
        'image_url' => '/article_images/curated-202611/duka-alwi-as-kbb.jpg',
        'image_caption' => 'Poster duka cita Keluarga Besar dan Pengurus Pusat KBB Sadunia atas wafatnya Bapak Alwi A.S., tokoh pers Kalimantan Timur.',
        'image_credit' => 'Dokumentasi PP KBB Sadunia',
        'category_id' => $categoryId ?: null,
        'author_id' => $authorId,
        'read_time' => '3 menit',
        'source_name' => 'Media Kaltim / Dokumentasi PP KBB Sadunia',
        'source_url' => 'https://mediakaltim.com/tokoh-pers-senior-kaltim-alwi-as-meninggal-dunia-pernah-jadi-atasan-dahlan-iskan/',
        'editor_note' => 'Poster dikirim langsung oleh pengelola; riwayat dan waktu wafat diverifikasi dari dua sumber berita Kaltim.',
        'meta_title' => 'KBB Sadunia Berduka atas Wafatnya Alwi A.S., Tokoh Pers Kaltim',
        'meta_description' => 'KBB Sadunia menyampaikan duka cita atas wafatnya Alwi A.S., tokoh pers Kaltim dan mantan pimpinan Mimbar Masyarakat.',
        'published_at' => '2026-11-11 15:15:00',
        'tags' => ['KBB Sadunia', 'Duka Cita', 'Alwi AS', 'Pers Kaltim', 'Samarinda'],
    ];

    $insertArticle = $db->prepare(
        'INSERT INTO articles
            (title, slug, excerpt, content, image_url, image_caption, image_credit, video_url,
             category_id, author_id, status, featured, read_time, source_name, source_url,
             editor_note, meta_title, meta_description, published_at)
         SELECT
            :title, :slug, :excerpt, :content, :image_url, :image_caption, :image_credit, \'\',
            :category_id, :author_id, \'published\', 0, :read_time, :source_name, :source_url,
            :editor_note, :meta_title, :meta_description, :published_at
         WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = :check_slug)'
    );
    $insertArticle->execute([
        ':title' => $article['title'],
        ':slug' => $article['slug'],
        ':excerpt' => $article['excerpt'],
        ':content' => $article['content'],
        ':image_url' => $article['image_url'],
        ':image_caption' => $article['image_caption'],
        ':image_credit' => $article['image_credit'],
        ':category_id' => $article['category_id'],
        ':author_id' => $article['author_id'],
        ':read_time' => $article['read_time'],
        ':source_name' => $article['source_name'],
        ':source_url' => $article['source_url'],
        ':editor_note' => $article['editor_note'],
        ':meta_title' => $article['meta_title'],
        ':meta_description' => $article['meta_description'],
        ':published_at' => $article['published_at'],
        ':check_slug' => $article['slug'],
    ]);

    $articleIdStmt = $db->prepare('SELECT id FROM articles WHERE slug = :slug LIMIT 1');
    $articleIdStmt->execute([':slug' => $article['slug']]);
    $articleId = (int)$articleIdStmt->fetchColumn();
    if ($articleId < 1) {
        throw new RuntimeException('Failed to resolve editorial article: ' . $article['slug']);
    }

    $upsertTag = $db->prepare(
        'INSERT INTO tags (name, slug) VALUES (:name, :slug)
         ON DUPLICATE KEY UPDATE name = VALUES(name)'
    );
    $tagIdStmt = $db->prepare('SELECT id FROM tags WHERE slug = :slug LIMIT 1');
    $attachTag = $db->prepare('INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (:article_id, :tag_id)');
    foreach ($article['tags'] as $tagName) {
        $tagSlug = strtolower(trim((string)preg_replace('/[^a-z0-9]+/i', '-', $tagName), '-'));
        $upsertTag->execute([':name' => $tagName, ':slug' => $tagSlug]);
        $tagIdStmt->execute([':slug' => $tagSlug]);
        $tagId = (int)$tagIdStmt->fetchColumn();
        if ($tagId > 0) {
            $attachTag->execute([':article_id' => $articleId, ':tag_id' => $tagId]);
        }
    }

    $completeStmt = $db->prepare(
        "INSERT INTO settings (setting_key, setting_value) VALUES (:key, 'complete')
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)"
    );
    $completeStmt->execute([':key' => $migrationKey]);
}

