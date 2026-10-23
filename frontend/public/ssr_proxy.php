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

function configured_origin() {
    $envFile = __DIR__ . '/.env';
    if (is_readable($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines ?: [] as $line) {
            if (strpos(trim($line), '#') === 0 || strpos($line, '=') === false) continue;
            [$name, $value] = explode('=', $line, 2);
            if (trim($name) !== 'FRONTEND_URL') continue;
            $candidate = trim($value, " \t\n\r\0\x0B\"'");
            $parts = parse_url($candidate);
            if ($parts && in_array(strtolower($parts['scheme'] ?? ''), ['http', 'https'], true) && !empty($parts['host'])) {
                $origin = strtolower($parts['scheme']) . '://' . strtolower($parts['host']);
                if (!empty($parts['port'])) $origin .= ':' . (int)$parts['port'];
                return $origin;
            }
        }
    }

    // Fixed production fallback prevents Host-header poisoning.
    return 'https://kbbsadunia.com';
}

function replace_meta_tag($html, $pattern, $replacement) {
    return preg_replace_callback($pattern, static function () use ($replacement) {
        return $replacement;
    }, $html, 1);
}

$origin = configured_origin();
$requestPath = parse_url($request_uri, PHP_URL_PATH) ?: '/';
if ($requestPath[0] !== '/' || preg_match('/[\x00-\x1F\x7F]/', $requestPath)) $requestPath = '/';
$canonicalUrl = htmlspecialchars($origin . $requestPath, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
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
            $title = htmlspecialchars(trim($article['title']) . " - KBB Sadunia", ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            // Ambil excerpt atau bersihkan content, batasi max 150 karakter
            $raw_desc = !empty($article['excerpt']) ? $article['excerpt'] : "Portal berita dan artikel terlengkap seputar Kerukunan Bubuhan Banjar.";
            $desc = htmlspecialchars(mb_strimwidth(strip_tags($raw_desc), 0, 150, "..."), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            $image = trim($article['image_url']);
            
            // Konversi URL gambar relatif jadi absolut (penting untuk WhatsApp/Facebook crawler)
            if (strpos($image, 'http') !== 0 && !empty($image)) {
                $image = $origin . '/' . ltrim($image, '/');
            }
            $imageParts = parse_url($image);
            if (!$imageParts || !in_array(strtolower($imageParts['scheme'] ?? ''), ['http', 'https'], true)) {
                $image = $defaultImage;
            }
            $image = htmlspecialchars($image, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

            // Ganti title meta
            $html = replace_meta_tag($html, '/<title>.*?<\/title>/s', "<title>$title</title>");
            
            // Ganti Open Graph (OG) tags
            $html = replace_meta_tag($html, '/<meta property="og:title" content="[^"]*" \/>/', '<meta property="og:title" content="'.$title.'" />');
            $html = replace_meta_tag($html, '/<meta property="og:description" content="[^"]*" \/>/', '<meta property="og:description" content="'.$desc.'" />');
            
            // Ganti Twitter tags
            $html = replace_meta_tag($html, '/<meta name="twitter:title" content="[^"]*" \/>/', '<meta name="twitter:title" content="'.$title.'" />');
            $html = replace_meta_tag($html, '/<meta name="twitter:description" content="[^"]*" \/>/', '<meta name="twitter:description" content="'.$desc.'" />');

            // Ganti image tags jika gambar ada
            if (!empty($image)) {
                $html = replace_meta_tag($html, '/<meta property="og:image" content="[^"]*" \/>/', '<meta property="og:image" content="'.$image.'" />');
                $html = replace_meta_tag($html, '/<meta name="twitter:image" content="[^"]*" \/>/', '<meta name="twitter:image" content="'.$image.'" />');
            }
        }
    } catch (Throwable $e) {
        // Jika gagal koneksi DB atau query (misal belum di-setup), biarkan HTML apa adanya
        error_log("SSR Proxy Error: " . $e->getMessage());
    }
}

// Keluarkan HTML yang sudah di-inject (atau HTML asli jika tidak ada artikel)
echo $html;
