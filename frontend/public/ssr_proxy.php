<?php
/**
 * SSR Proxy (SEO Meta Tags Injector)
 * Skrip ini dipanggil oleh .htaccess sebagai fallback untuk SPA React.
 * Tujuannya untuk menyuntikkan OG Tags (gambar, judul, deskripsi) secara dinamis
 * berdasarkan slug artikel, sehingga jika URL dibagikan ke WhatsApp/Facebook,
 * preview gambar akan muncul dengan benar.
 */

$request_uri = $_SERVER['REQUEST_URI'] ?? '/';
$html_file = __DIR__ . '/index.html';

if (!file_exists($html_file)) {
    http_response_code(404);
    die("index.html not found.");
}

$html = file_get_contents($html_file);

function current_origin() {
    $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $scheme . "://" . $host;
}

function replace_meta_tag($html, $pattern, $replacement) {
    return preg_replace($pattern, $replacement, $html, 1);
}

$origin = current_origin();
$canonicalUrl = $origin . strtok($request_uri, '?');
$defaultImage = $origin . '/logo-kbb.png';

$html = replace_meta_tag($html, '/<meta property="og:url" content="[^"]*" \/>/', '<meta property="og:url" content="'.$canonicalUrl.'" />');
$html = replace_meta_tag($html, '/<meta property="og:image" content="[^"]*" \/>/', '<meta property="og:image" content="'.$defaultImage.'" />');
$html = replace_meta_tag($html, '/<meta name="twitter:image" content="[^"]*" \/>/', '<meta name="twitter:image" content="'.$defaultImage.'" />');
$html = replace_meta_tag($html, '/<link rel="canonical" href="[^"]*" \/>/', '<link rel="canonical" href="'.$canonicalUrl.'" />');

// Jika BUKAN rute artikel, kembalikan HTML dengan canonical/OG domain aktif.
if (!preg_match('#^/article/([^/?]+)#', $request_uri, $matches)) {
    echo $html;
    exit;
}

$slug = $matches[1];
$db_config = __DIR__ . '/config/database.php';

// Cek apakah file config database tersedia (artinya kita ada di environment production/deployed)
if (file_exists($db_config)) {
    try {
        require_once $db_config;
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("SELECT title, excerpt, image_url FROM articles WHERE slug = ? AND status = 'published'");
        $stmt->execute([$slug]);
        $article = $stmt->fetch();
        
        if ($article) {
            $title = htmlspecialchars(trim($article['title']) . " - KBB Sadunia");
            // Ambil excerpt atau bersihkan content, batasi max 150 karakter
            $raw_desc = !empty($article['excerpt']) ? $article['excerpt'] : "Portal berita dan artikel terlengkap seputar Kerukunan Bubuhan Banjar.";
            $desc = htmlspecialchars(mb_strimwidth(strip_tags($raw_desc), 0, 150, "..."));
            $image = trim($article['image_url']);
            
            // Konversi URL gambar relatif jadi absolut (penting untuk WhatsApp/Facebook crawler)
            if (strpos($image, 'http') !== 0 && !empty($image)) {
                $image = $origin . (strpos($image, '/') === 0 ? "" : "/") . ltrim($image, '/');
            }

            // Ganti title meta
            $html = preg_replace('/<title>.*?<\/title>/s', "<title>$title</title>", $html, 1);
            
            // Ganti Open Graph (OG) tags
            $html = preg_replace('/<meta property="og:title" content="[^"]*" \/>/', '<meta property="og:title" content="'.$title.'" />', $html);
            $html = preg_replace('/<meta property="og:description" content="[^"]*" \/>/', '<meta property="og:description" content="'.$desc.'" />', $html);
            
            // Ganti Twitter tags
            $html = preg_replace('/<meta name="twitter:title" content="[^"]*" \/>/', '<meta name="twitter:title" content="'.$title.'" />', $html);
            $html = preg_replace('/<meta name="twitter:description" content="[^"]*" \/>/', '<meta name="twitter:description" content="'.$desc.'" />', $html);

            // Ganti image tags jika gambar ada
            if (!empty($image)) {
                $html = preg_replace('/<meta property="og:image" content="[^"]*" \/>/', '<meta property="og:image" content="'.$image.'" />', $html);
                $html = preg_replace('/<meta name="twitter:image" content="[^"]*" \/>/', '<meta name="twitter:image" content="'.$image.'" />', $html);
            }
        }
    } catch (Throwable $e) {
        // Jika gagal koneksi DB atau query (misal belum di-setup), biarkan HTML apa adanya
        error_log("SSR Proxy Error: " . $e->getMessage());
    }
}

// Keluarkan HTML yang sudah di-inject (atau HTML asli jika tidak ada artikel)
echo $html;
