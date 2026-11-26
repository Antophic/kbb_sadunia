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
        runEditorialContentMigration20261115($db);
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
    runEditorialContentMigration20261115($db);
}

function runEditorialContentMigration20261115(PDO $db): void {
    $migrationKey = 'content_migration_20261115_tablig_milad_sarasehan';

    $statusStmt = $db->prepare('SELECT setting_value FROM settings WHERE setting_key = :key LIMIT 1');
    $statusStmt->execute([':key' => $migrationKey]);
    if ($statusStmt->fetchColumn() === 'complete') {
        runEditorialContentMigration20261127($db);
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
            'title' => 'Tablig Akbar Bersama Ustaz Aa Hilman, Warga Banua Berdoa untuk Keselamatan Negeri',
            'slug' => 'tablig-akbar-aa-hilman-doa-keselamatan-negeri-banjarbaru',
            'excerpt' => 'Tablig Akbar di Masjid Agung Al-Munawwarah Banjarbaru menghadirkan Ustaz Hilman Fauzi dan mengajak warga Banua memanjatkan doa bagi keselamatan negeri.',
            'content' => <<<'HTML'
<p>Tablig Akbar bertajuk <strong>“Penyejuk Hati dan Doa Keselamatan Negeri serta Presiden RI”</strong> digelar di Masjid Agung Al-Munawwarah, Banjarbaru, Sabtu, 14 November 2026. Jamaah memenuhi ruang utama masjid untuk mengikuti kajian dan doa bersama.</p>
<p>Kegiatan yang diketuai H. Sahbirin Noor atau Paman Birin ini menghadirkan Ustaz Hilman Fauzi, yang dikenal sebagai Aa Hilman. Dalam rangkaian acara juga dijadwalkan lantunan ayat suci Al-Qur'an oleh qari internasional K.H. Muammar Zainal Asyikin serta doa oleh K.H. Muhammad Wildan Salman atau Guru Wildan.</p>
<h2>Doa untuk persatuan dan keselamatan bangsa</h2>
<p>Tablig Akbar menjadi ruang bagi warga Banua untuk memohon keselamatan, kedamaian, dan perlindungan bagi Indonesia. Doa juga dipanjatkan untuk kesehatan dan kekuatan Presiden RI Prabowo Subianto dalam mengemban amanah serta untuk kesejahteraan masyarakat.</p>
<figure>
  <img src="/article_images/curated-202611/tablig-akbar-aa-hilman-2.jpg" alt="Jamaah memenuhi Masjid Agung Al-Munawwarah pada Tablig Akbar" loading="lazy">
  <figcaption>Jamaah mengikuti rangkaian Tablig Akbar dan doa keselamatan negeri di Masjid Agung Al-Munawwarah, Banjarbaru.</figcaption>
</figure>
<p>Dokumentasi yang diterima redaksi memperlihatkan jamaah dari berbagai usia menyimak kajian dengan khidmat. Kehadiran mereka menegaskan semangat kebersamaan dan kepedulian warga Banua terhadap persatuan bangsa.</p>
<h2>Sumber pemberitaan</h2>
<ul>
  <li><a href="https://klikkalsel.com/tablik-akbar-hadirkan-ustadz-aa-hilman-paman-birin-ajak-warga-banua-doakan-keselamatan-negeri-dan-presiden-prabowo/" target="_blank" rel="noopener noreferrer">KlikKalsel, 12 November 2026</a></li>
  <li><a href="https://kalimantandigital.com/index.php/2026/11/12/paman-birin-gelar-tablig-akbar-bersama-ustaz-aa-hilman-doa-untuk-presiden-prabowo-dan-keselamatan-negeri/" target="_blank" rel="noopener noreferrer">Kalimantan Digital, 12 November 2026</a></li>
</ul>
<p><strong>Catatan redaksi:</strong> naskah dirangkum secara orisinal dari dua sumber pemberitaan dan dilengkapi dokumentasi acara yang dikirim langsung kepada pengelola portal KBB Sadunia.</p>
HTML,
            'image_url' => '/article_images/curated-202611/tablig-akbar-aa-hilman-1.jpg',
            'image_caption' => 'Ustaz Hilman Fauzi menyampaikan kajian dalam Tablig Akbar di Masjid Agung Al-Munawwarah, Banjarbaru.',
            'image_credit' => 'Dokumentasi KBB Sadunia',
            'video_url' => '',
            'category_slug' => 'kegiatan-sosial',
            'featured' => 1,
            'read_time' => '3 menit',
            'source_name' => 'KlikKalsel / Kalimantan Digital',
            'source_url' => 'https://klikkalsel.com/tablik-akbar-hadirkan-ustadz-aa-hilman-paman-birin-ajak-warga-banua-doakan-keselamatan-negeri-dan-presiden-prabowo/',
            'editor_note' => 'Ringkasan orisinal dari dua sumber berita dan dua foto dokumentasi asli yang dikirim pengelola.',
            'meta_title' => 'Tablig Akbar Aa Hilman dan Doa Keselamatan Negeri di Banjarbaru',
            'meta_description' => 'Tablig Akbar bersama Ustaz Aa Hilman di Banjarbaru mengajak warga Banua berdoa untuk keselamatan negeri dan persatuan bangsa.',
            'published_at' => '2026-11-15 09:30:00',
            'tags' => ['KBB Sadunia', 'Tablig Akbar', 'Aa Hilman', 'Banjarbaru', 'Religi'],
        ],
        [
            'title' => 'Milad ke-59 H. Sahbirin Noor, Ucapan Mengalir dari Jaringan KBB Nusantara dan Mancanegara',
            'slug' => 'milad-ke-59-sahbirin-noor-ucapan-kbb-nusantara-mancanegara',
            'excerpt' => 'Jaringan Kerukunan Bubuhan Banjar dari Sumatera, Malaysia, hingga Singapura menyampaikan ucapan Milad ke-59 kepada Ketua Umum PP KBB Sadunia H. Sahbirin Noor.',
            'content' => <<<'HTML'
<p>Keluarga besar Kerukunan Bubuhan Banjar (KBB) dari berbagai wilayah menyampaikan ucapan <strong>Milad ke-59</strong> kepada Ketua Umum Pengurus Pusat KBB Sadunia, <strong>Dr. (H.C.) H. Sahbirin Noor, S.Sos., M.H.</strong>, pada 12 November 2026.</p>
<p>Rangkaian ucapan datang dari pengurus KBB di Indonesia dan luar negeri. Setiap poster membawa doa untuk kesehatan, keberkahan, kekuatan dalam mengemban amanah, serta semangat mempererat persaudaraan bubuhan Banjar di mana pun berada.</p>
<h2>Ucapan PW-KBB Sumatera Utara</h2>
<blockquote>
  <p><strong>SELAMAT MILAD KETUA UMUM PP KBB SADUNIA BAPAK H. SAHBIRIN NOOR</strong></p>
  <p>Keluarga Besar dan Pengurus Wilayah Kerukunan Bubuhan Banjar (PW-KBB) Sumatera Utara menyampaikan ucapan selamat ulang tahun kepada Bapak H. Sahbirin Noor.</p>
  <p>Semoga senantiasa diberikan kesehatan, keberkahan, serta kekuatan dalam mengemban setiap amanah. 🤲</p>
</blockquote>
<h2>Galeri ucapan wilayah</h2>
<figure>
  <img src="/article_images/curated-202611/milad-sahbirin-singapura-2026.jpg" alt="Ucapan Milad ke-59 H. Sahbirin Noor dari PWLN KBB Singapura" loading="lazy">
  <figcaption>Ucapan dari PWLN Kerukunan Bubuhan Banjar Singapura.</figcaption>
</figure>
<figure>
  <img src="/article_images/curated-202611/milad-sahbirin-malaysia-2026.jpg" alt="Ucapan Milad H. Sahbirin Noor dari Pertubuhan Banjar Malaysia" loading="lazy">
  <figcaption>Ucapan dari Pertubuhan Banjar Malaysia.</figcaption>
</figure>
<figure>
  <img src="/article_images/curated-202611/milad-sahbirin-sumsel-2026.jpg" alt="Ucapan Milad ke-59 H. Sahbirin Noor dari KBB Sumatera Selatan" loading="lazy">
  <figcaption>Ucapan dari keluarga besar dan Pengurus Wilayah KBB Sumatera Selatan.</figcaption>
</figure>
<p>Ucapan dari KBB Sumatera Barat menjadi gambar utama halaman ini. Bersama poster dari Singapura, Malaysia, Sumatera Selatan, dan pesan PW-KBB Sumatera Utara, dokumentasi tersebut menunjukkan luasnya jaringan persaudaraan KBB Sadunia.</p>
<p><strong>Arsip redaksi:</strong> seluruh poster dan naskah ucapan diterima langsung dari pengelola KBB Sadunia dan ditampilkan sebagai dokumentasi organisasi.</p>
HTML,
            'image_url' => '/article_images/curated-202611/milad-sahbirin-sumbar-2026.jpg',
            'image_caption' => 'Ucapan Selamat Milad kepada H. Sahbirin Noor dari keluarga besar KBB Sumatera Barat.',
            'image_credit' => 'Dokumentasi KBB Sumatera Barat',
            'video_url' => '',
            'category_slug' => 'kegiatan-sosial',
            'featured' => 0,
            'read_time' => '3 menit',
            'source_name' => 'Dokumentasi Pengurus Wilayah KBB',
            'source_url' => '',
            'editor_note' => 'Galeri menggunakan empat poster asli yang dikirim pengelola dan teks ucapan PW-KBB Sumatera Utara tanpa mengubah maksudnya.',
            'meta_title' => 'Milad ke-59 Sahbirin Noor, Ucapan KBB Nusantara dan Mancanegara',
            'meta_description' => 'Galeri ucapan Milad ke-59 H. Sahbirin Noor dari jaringan KBB di Sumatera, Singapura, dan Malaysia.',
            'published_at' => '2026-11-15 09:20:00',
            'tags' => ['KBB Sadunia', 'Sahbirin Noor', 'Milad', 'Diaspora Banjar', 'Galeri'],
        ],
        [
            'title' => 'Saksikan Sarasehan Kebangsaan MPR RI Bersama K.H. Muhammad Mursyid',
            'slug' => 'video-sarasehan-kebangsaan-mpr-ri-kh-muhammad-mursyid',
            'excerpt' => 'Siaran ulang Sarasehan Kebangsaan MPR RI bersama K.H. Muhammad Mursyid, M.Pd.I dapat disaksikan langsung melalui pemutar video portal KBB Sadunia.',
            'content' => <<<'HTML'
<p>Portal KBB Sadunia menghadirkan dokumentasi video <strong>Sarasehan Kebangsaan MPR RI bersama K.H. Muhammad Mursyid, M.Pd.I.</strong> Video ditayangkan melalui kanal YouTube Marbai Inhil dan dapat disaksikan langsung pada pemutar di halaman ini.</p>
<p>Sarasehan kebangsaan menjadi ruang untuk memperkuat wawasan kebangsaan, persaudaraan, dan kepedulian terhadap kehidupan bersama. Dokumentasi ini ditempatkan sebagai konten video tersendiri agar tidak tercampur dengan liputan Tablig Akbar Ustaz Aa Hilman yang merupakan kegiatan berbeda.</p>
<p><strong>Sumber video:</strong> <a href="https://www.youtube.com/live/OOoAHexmokA" target="_blank" rel="noopener noreferrer">Marbai Inhil di YouTube</a>.</p>
HTML,
            'image_url' => 'https://i.ytimg.com/vi/OOoAHexmokA/hqdefault.jpg',
            'image_caption' => 'Cuplikan video Sarasehan Kebangsaan MPR RI bersama K.H. Muhammad Mursyid, M.Pd.I.',
            'image_credit' => 'YouTube / Marbai Inhil',
            'video_url' => 'https://www.youtube.com/watch?v=OOoAHexmokA',
            'category_slug' => 'sosial',
            'featured' => 0,
            'read_time' => '1 menit',
            'source_name' => 'Marbai Inhil',
            'source_url' => 'https://www.youtube.com/live/OOoAHexmokA',
            'editor_note' => 'Konten video dipisahkan dari berita Tablig Akbar karena merupakan acara yang berbeda.',
            'meta_title' => 'Video Sarasehan Kebangsaan MPR RI bersama K.H. Muhammad Mursyid',
            'meta_description' => 'Saksikan Sarasehan Kebangsaan MPR RI bersama K.H. Muhammad Mursyid melalui pemutar video KBB Sadunia.',
            'published_at' => '2026-11-15 09:10:00',
            'tags' => ['KBB Sadunia', 'Sarasehan Kebangsaan', 'MPR RI', 'Muhammad Mursyid', 'Video'],
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
    runEditorialContentMigration20261127($db);
}

function runEditorialContentMigration20261127(PDO $db): void {
    $migrationKey = 'content_migration_20261127_kbb_regional_news';
    $statusStmt = $db->prepare('SELECT setting_value FROM settings WHERE setting_key = :key LIMIT 1');
    $statusStmt->execute([':key' => $migrationKey]);
    if ($statusStmt->fetchColumn() === 'complete') {
        return;
    }

    $authorId = (int)$db->query(
        "SELECT id FROM users ORDER BY CASE role WHEN 'admin' THEN 0 WHEN 'editor' THEN 1 ELSE 2 END, id LIMIT 1"
    )->fetchColumn();
    if ($authorId < 1) {
        throw new RuntimeException('Editorial migration requires at least one user');
    }

    // Original summaries of public reports. Every photo documents the matching event.
    $articles = [
        [
            'title' => 'KBB Riau dan Pemuda Inhil Pererat Silaturahmi di Ponpes Khairul Ummah',
            'slug' => 'kbb-riau-pemuda-inhil-silaturahmi-ponpes-khairul-ummah',
            'excerpt' => 'Pengurus KBB di Riau dan Pemuda Inhil bertemu K.H. Muhammad Mursyid di Pondok Pesantren Khairul Ummah, Indragiri Hulu, untuk memperkuat hubungan antargenerasi.',
            'content' => <<<'HTML'
<p>Pengurus Kerukunan Bubuhan Banjar (KBB) di Riau bersama Pemuda Indragiri Hilir Rayon Indragiri Hulu dan Kuantan Singingi bersilaturahmi dengan <strong>K.H. Muhammad Mursyid, M.Pd.I.</strong> di Pondok Pesantren Khairul Ummah, Desa Batu Gajah, Kecamatan Pasir Penyu, Indragiri Hulu. Mursyid merupakan anggota DPD RI asal Riau sekaligus Ketua KBB Provinsi Riau.</p>
<p>Pertemuan tersebut mempertemukan pengurus KBB dan kelompok pemuda dalam suasana kekeluargaan. Menurut laporan Tran7Riau yang terbit pada 24 November 2026, Mursyid mengajak peserta menjaga persaudaraan dan membuka komunikasi untuk kegiatan bersama yang bermanfaat bagi masyarakat.</p>
<p>Ketua Pemuda Inhil Rayon Inhu–Kuansing, Rieskie Kurniawan, menyampaikan apresiasi atas sambutan yang diterima. Sekretaris KBB Inhu Mansur Sulaiman dan sejumlah anggota kedua kelompok juga hadir. Harapannya, hubungan yang terjalin berlanjut menjadi kerja sama antargenerasi di wilayah Indragiri Hulu dan sekitarnya.</p>
<p><strong>Sumber:</strong> ringkasan redaksi berdasarkan <a href="https://tran7riau.com/silaturahmi-ke-ponpes-khairul-ummah-pemuda-inhil-temui-anggota-dpd-ri-kh-muhammad-mursyid/" target="_blank" rel="noopener noreferrer">liputan Tran7Riau, 24 November 2026</a>.</p>
HTML,
            'image_url' => '/article_images/curated-202611/silaturahmi-kbb-riau-pemuda-inhil-20261124.webp',
            'image_caption' => 'Foto bersama dalam silaturahmi pengurus KBB dan Pemuda Inhil di Ponpes Khairul Ummah, Indragiri Hulu.',
            'image_credit' => 'Foto: Tran7Riau',
            'category_slug' => 'kegiatan-sosial',
            'read_time' => '2 menit',
            'source_name' => 'Tran7Riau',
            'source_url' => 'https://tran7riau.com/silaturahmi-ke-ponpes-khairul-ummah-pemuda-inhil-temui-anggota-dpd-ri-kh-muhammad-mursyid/',
            'editor_note' => 'Ringkasan orisinal dari liputan Tran7Riau; foto acara dari sumber tersebut.',
            'published_at' => '2026-11-24 21:40:00',
            'tags' => ['KBB Riau', 'Pemuda Inhil', 'Muhammad Mursyid', 'Silaturahmi'],
        ],
        [
            'title' => 'Pengurus KBB Langkat Temui Plt Bupati, Bahas Sinergi dan Rencana Pelantikan',
            'slug' => 'pengurus-kbb-langkat-audiensi-plt-bupati-rencana-pelantikan',
            'excerpt' => 'Pengurus KBB Langkat beraudiensi dengan Plt Bupati Tiorita Br Surbakti. Pertemuan membahas kerja sama kemasyarakatan dan rencana pelantikan kepengurusan 2026–2031.',
            'content' => <<<'HTML'
<p>Pengurus Kerukunan Bubuhan Banjar (KBB) Kabupaten Langkat yang dipimpin ketua terpilih <strong>H. Mansyur</strong> beraudiensi dengan Pelaksana Tugas Bupati Langkat, Tiorita Br Surbakti, pada Kamis, 19 November 2026. Pertemuan berlangsung di kantor bupati sebagai langkah awal membangun komunikasi dengan pemerintah daerah.</p>
<p>Dalam pertemuan itu, kedua pihak membahas peluang kerja sama di bidang sosial kemasyarakatan dan penguatan persatuan warga. Tiorita menyampaikan harapan agar KBB aktif memberi manfaat bagi masyarakat Langkat serta menjaga hubungan baik dengan berbagai kelompok di daerah.</p>
<p>Menurut laporan Binjai Langkat Today, pengurus KBB juga membahas rencana pelantikan masa bakti 2026–2031 yang <em>direncanakan</em> pada 17 Desember 2026 di Jentera Malay. Tanggal itu masih merupakan agenda yang disampaikan dalam audiensi, bukan laporan bahwa pelantikan sudah berlangsung.</p>
<p><strong>Sumber:</strong> ringkasan redaksi berdasarkan <a href="https://www.binjailangkattoday.com/2026/11/plt-bupati-tiorita-ajak-bubuhan-banjar.html" target="_blank" rel="noopener noreferrer">liputan Binjai Langkat Today, 20 November 2026</a>.</p>
HTML,
            'image_url' => '/article_images/curated-202611/audiensi-kbb-langkat-20261119.jpg',
            'image_caption' => 'Pertemuan pengurus KBB Langkat dengan Plt Bupati Langkat di kantor bupati.',
            'image_credit' => 'Foto: Binjai Langkat Today',
            'category_slug' => 'kegiatan-sosial',
            'read_time' => '2 menit',
            'source_name' => 'Binjai Langkat Today',
            'source_url' => 'https://www.binjailangkattoday.com/2026/11/plt-bupati-tiorita-ajak-bubuhan-banjar.html',
            'editor_note' => 'Ringkasan orisinal; tanggal pelantikan disebut sebagai rencana, bukan kepastian.',
            'published_at' => '2026-11-20 10:44:00',
            'tags' => ['KBB Langkat', 'Audiensi', 'Sumatera Utara', 'Pelantikan'],
        ],
        [
            'title' => 'Sarasehan Kebangsaan KBB Inhil Bahas Peran DPD RI dan Aspirasi Daerah',
            'slug' => 'sarasehan-kebangsaan-kbb-inhil-peran-dpd-ri',
            'excerpt' => 'KBB Indragiri Hilir mengikuti sarasehan kebangsaan bersama K.H. Muhammad Mursyid di Tembilahan. Forum membahas peran DPD RI dan penyampaian aspirasi daerah.',
            'content' => <<<'HTML'
<p>Pengurus Kerukunan Bubuhan Banjar (KBB) Indragiri Hilir dan Ikatan Wanita Bubuhan Banjar Riau (IWABBRI) menghadiri Sarasehan Kebangsaan bersama <strong>K.H. Muhammad Mursyid, M.Pd.I.</strong> di Hotel Top 5, Tembilahan, pada pertengahan November 2026. Tokoh masyarakat, tokoh agama, kalangan pemuda, dan sejumlah pejabat daerah turut mengikuti forum tersebut.</p>
<p>Mursyid menjelaskan peran DPD RI dalam menyerap aspirasi daerah dan menjaga konstitusi. Dialog memberi ruang bagi peserta untuk membahas bagaimana kebutuhan masyarakat di daerah dapat disampaikan melalui wakilnya di tingkat nasional.</p>
<p>Ketua KBB Inhil yang akrab disapa Julak Aqil berharap kegiatan tersebut membantu warga memahami tugas dan fungsi DPD RI. Liputan ini melengkapi <a href="https://kbbsadunia.com/article/video-sarasehan-kebangsaan-mpr-ri-kh-muhammad-mursyid">rekaman video sarasehan</a> yang sudah tersedia di portal KBB Sadunia.</p>
<p><strong>Sumber:</strong> ringkasan redaksi berdasarkan <a href="https://koranindragiripos.com/daerah/17/11/2026/kh-muhammad-mursyid-gelar-sarasehan-kebangsaan-bersama-kbb-inhil.html" target="_blank" rel="noopener noreferrer">Koran Indragiri Pos, 17 November 2026</a> dan <a href="https://kabarlah.com/berita/nasional/2026/11/15/tokoh-banjar-inhil-bersatu-sambut-hangat-senator-riau-k-h-muhammad-mursyid-dalam-sarasehan-kbb/" target="_blank" rel="noopener noreferrer">Kabarlah, 15 November 2026</a>.</p>
HTML,
            'image_url' => '/article_images/curated-202611/sarasehan-kbb-inhil-20261115.jpg',
            'image_caption' => 'Suasana Sarasehan Kebangsaan bersama K.H. Muhammad Mursyid di Tembilahan.',
            'image_credit' => 'Foto: Kabarlah',
            'category_slug' => 'sosial',
            'read_time' => '2 menit',
            'source_name' => 'Koran Indragiri Pos / Kabarlah',
            'source_url' => 'https://koranindragiripos.com/daerah/17/11/2026/kh-muhammad-mursyid-gelar-sarasehan-kebangsaan-bersama-kbb-inhil.html',
            'editor_note' => 'Liputan acara, berbeda dari arsip video; foto dokumentasi dari Kabarlah.',
            'published_at' => '2026-11-17 07:38:00',
            'tags' => ['KBB Inhil', 'Sarasehan Kebangsaan', 'Muhammad Mursyid', 'DPD RI'],
        ],
        [
            'title' => 'KBB dan Pemko Banjarbaru Gelar Salat Istisqa, Doakan Hujan dan Keselamatan',
            'slug' => 'kbb-pemko-banjarbaru-salat-istisqa-doa-hujan-2026',
            'excerpt' => 'DPC KBB Kota Banjarbaru bersama pemerintah kota menggelar Salat Istisqa di halaman Balai Kota pada 2 November 2026 sebagai doa menghadapi dampak karhutla.',
            'content' => <<<'HTML'
<p>Dewan Pengurus Cabang Kerukunan Bubuhan Banjar (KBB) Kota Banjarbaru bekerja sama dengan Pemerintah Kota Banjarbaru menggelar <strong>Salat Istisqa berjamaah</strong> di halaman Balai Kota, Senin, 2 November 2026. Kegiatan ini menjadi ikhtiar bersama untuk memohon hujan dan keselamatan saat daerah menghadapi dampak kebakaran hutan dan lahan.</p>
<p>Salat dipimpin Tuan Guru K.H. Muhammad Wildan Salman dan diikuti warga, tokoh agama, serta jajaran pemerintah daerah. Wali Kota Banjarbaru Hj. Erna Lisa Halaby dan Ketua Umum KBB Sadunia H. Sahbirin Noor hadir dalam kegiatan tersebut.</p>
<p>Media Center Banjarbaru melaporkan bahwa pemkot dan KBB mengadakan kegiatan ini secara bersama. Selain berdoa agar kondisi kabut asap membaik, pemerintah kota menyampaikan langkah antisipasi banjir dalam peralihan ke musim hujan, termasuk penanganan saluran drainase.</p>
<p><strong>Sumber:</strong> ringkasan redaksi berdasarkan <a href="https://mediacenter.banjarbarukota.go.id/2026/11/02/doa-bersama-akhiri-karhutla-pemko-banjarbaru-dan-kerukunan-bubuhan-banjar-gelar-salat-istisqa-berjamaah/" target="_blank" rel="noopener noreferrer">Media Center Banjarbaru, 2 November 2026</a>.</p>
HTML,
            'image_url' => '/article_images/curated-202611/salat-istisqa-kbb-banjarbaru-20261102.jpg',
            'image_caption' => 'Kegiatan Salat Istisqa bersama KBB dan Pemko Banjarbaru di halaman Balai Kota.',
            'image_credit' => 'Foto: Media Center Banjarbaru',
            'category_slug' => 'sosial',
            'read_time' => '2 menit',
            'source_name' => 'Media Center Banjarbaru',
            'source_url' => 'https://mediacenter.banjarbarukota.go.id/2026/11/02/doa-bersama-akhiri-karhutla-pemko-banjarbaru-dan-kerukunan-bubuhan-banjar-gelar-salat-istisqa-berjamaah/',
            'editor_note' => 'Ringkasan orisinal dari sumber resmi Pemko Banjarbaru; foto acara dari sumber tersebut.',
            'published_at' => '2026-11-02 12:00:00',
            'tags' => ['KBB Banjarbaru', 'Salat Istisqa', 'Karhutla', 'Sosial'],
        ],
    ];

    $categoryStmt = $db->prepare('SELECT id FROM categories WHERE slug = :slug LIMIT 1');
    $insertArticle = $db->prepare(
        'INSERT IGNORE INTO articles
            (title, slug, excerpt, content, image_url, image_caption, image_credit, video_url,
             category_id, author_id, status, featured, read_time, source_name, source_url,
             editor_note, meta_title, meta_description, published_at)
         SELECT
            :title, :slug, :excerpt, :content, :image_url, :image_caption, :image_credit, NULL,
            :category_id, :author_id, \'published\', 0, :read_time, :source_name, :source_url,
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
        $categoryId = (int)$categoryStmt->fetchColumn();
        if ($categoryId < 1) {
            throw new RuntimeException('Editorial migration missing category: ' . $article['category_slug']);
        }
        $insertArticle->execute([
            ':title' => $article['title'],
            ':slug' => $article['slug'],
            ':excerpt' => $article['excerpt'],
            ':content' => $article['content'],
            ':image_url' => $article['image_url'],
            ':image_caption' => $article['image_caption'],
            ':image_credit' => $article['image_credit'],
            ':category_id' => $categoryId,
            ':author_id' => $authorId,
            ':read_time' => $article['read_time'],
            ':source_name' => $article['source_name'],
            ':source_url' => $article['source_url'],
            ':editor_note' => $article['editor_note'],
            ':meta_title' => $article['title'],
            ':meta_description' => $article['excerpt'],
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
}

