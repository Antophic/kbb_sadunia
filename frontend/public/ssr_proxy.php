<?php
/**
 * HTML awal untuk pengunjung dan perayap. React mengambil alih setelah dimuat.
 * Beranda memuat berita terbit; detail artikel membawa judul, ringkasan, dan metadata sendiri.
 */

$request_uri = $_SERVER['REQUEST_URI'] ?? '/';
$html_file = __DIR__ . '/index.html';
// Check the entry HTML on every visit so old bookmarks receive the current app bundle.
header('Cache-Control: no-cache, max-age=0, must-revalidate');

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

function esc($value): string {
    return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// Replace attributes by name, even when the build changes spacing or the closing slash.
function set_meta(string $html, string $attribute, string $key, string $value): string {
    $pattern = '~<meta\s+' . $attribute . '="' . preg_quote($key, '~') . '"\s+content="[^"]*"\s*/?>~i';
    return preg_replace_callback($pattern, static fn() => '<meta ' . $attribute . '="' . $key . '" content="' . esc($value) . '" />', $html, 1);
}

define('KBB_HTML_PAGE', true);
$origin = configured_origin();
$path = parse_url($request_uri, PHP_URL_PATH) ?: '/';
if ($path[0] !== '/' || preg_match('/[\x00-\x1F\x7F]/', $path)) $path = '/';
$path = rtrim($path, '/') ?: '/';
$isHome = $path === '/';
$isArticle = preg_match('~^/(?:article|artikel|berita)/([^/]+)$~D', $path, $match) === 1;
$canonicalPath = $isArticle ? '/article/' . $match[1] : $path;
if (($path === '/terkini' || preg_match('~^/(?:kategori|tag)/[^/]+$~D', $path)) &&
    ($page = filter_var($_GET['page'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 2]]))) {
    $canonicalPath .= '?page=' . $page;
}
$canonical = $origin . $canonicalPath;
$html = preg_replace_callback('~<link rel="canonical" href="[^"]*"\s*/?>~', static fn() => '<link rel="canonical" href="' . esc($canonical) . '" />', $html, 1);
$html = set_meta($html, 'property', 'og:url', $canonical);
if ($isHome) {
    // index.html already includes the WebSite and publisher for the production domain.
    if ($origin !== 'https://kbbsadunia.com') {
        $html = str_replace('https://kbbsadunia.com/', esc($origin) . '/', $html);
    }
} else {
    $html = preg_replace('~<script id="kbb-site-schema" type="application/ld\+json">.*?</script>~s', '', $html, 1);
}
$privatePage = preg_match('~^/(?:admin|auth|search|tersimpan)(?:/|$)~', $path);
if ($privatePage) $html = set_meta($html, 'name', 'robots', 'noindex, follow');

$nav = '<nav aria-label="Navigasi portal"><a href="/">KBB Sadunia</a> · <a href="/terkini">Berita terkini</a> · <a href="/profil">Profil organisasi</a> · <a href="/perpustakaan">Perpustakaan Banjar</a></nav>';
$body = $isHome ? '<h1>KBB Sadunia</h1><p>Portal resmi Kerukunan Bubuhan Banjar. Ikuti berita Banua, kegiatan bubuhan Banjar di perantauan, dan koleksi perpustakaan digital.</p>' : '';
$title = $description = null;
$image = $origin . '/logo-kbb.png';
$type = 'website';
$config = __DIR__ . '/config/database.php';
if (($isHome || $isArticle) && is_file($config)) {
    try {
        require_once $config;
        $db = Database::getInstance()->getConnection();
        if ($isHome) {
            $stories = $db->query(
                "SELECT a.slug, a.title FROM articles a LEFT JOIN categories c ON c.id = a.category_id
                 WHERE a.status = 'published' AND a.published_at <= NOW() AND (c.slug IS NULL OR c.slug <> 'artikel--opini')
                 ORDER BY a.published_at DESC, a.id DESC LIMIT 6"
            )->fetchAll();
            if ($stories) {
                $body .= '<h2>Berita terkini</h2><ul>';
                foreach ($stories as $story) {
                    $body .= '<li><a href="/article/' . rawurlencode($story['slug']) . '">' . esc($story['title']) . '</a></li>';
                }
                $body .= '</ul>';
            }
        } else {
            $stmt = $db->prepare("SELECT title, excerpt, image_url FROM articles
                                  WHERE slug = ? AND status = 'published' AND published_at <= NOW() LIMIT 1");
            $stmt->execute([rawurldecode($match[1])]);
            $article = $stmt->fetch();
            if ($article) {
                $type = 'article';
                $title = trim($article['title']) . ' - KBB Sadunia';
                $description = trim(html_entity_decode(strip_tags((string)$article['excerpt']), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                $body = '<article><h1>' . esc($article['title']) . '</h1><p>' . esc($description) . '</p></article>';
                $src = trim((string)$article['image_url']);
                if ($src !== '') {
                    $candidate = preg_match('~^https?://~i', $src) ? $src : $origin . '/' . ltrim($src, '/');
                    if (filter_var($candidate, FILTER_VALIDATE_URL)) $image = $candidate;
                }
            } else {
                http_response_code(404);
                $title = 'Artikel tidak ditemukan - KBB Sadunia';
                $body = '<h1>Artikel tidak ditemukan</h1>';
                $html = set_meta($html, 'name', 'robots', 'noindex, follow');
            }
        }
    } catch (Throwable $error) {
        // A temporary outage is not a removal; ask crawlers to try again.
        http_response_code(503);
        header('Retry-After: 300');
        error_log('KBB HTML: unable to load published news');
    }
}
if ($title !== null) {
    $html = preg_replace_callback('~<title>.*?</title>~s', static fn() => '<title>' . esc($title) . '</title>', $html, 1);
    $html = set_meta($html, 'property', 'og:title', $title);
    $html = set_meta($html, 'name', 'twitter:title', $title);
}
if ($description !== null) {
    $html = set_meta($html, 'name', 'description', $description);
    $html = set_meta($html, 'property', 'og:description', $description);
    $html = set_meta($html, 'name', 'twitter:description', $description);
}
$html = set_meta($html, 'property', 'og:type', $type);
$html = set_meta($html, 'property', 'og:image', $image);
$html = set_meta($html, 'name', 'twitter:image', $image);
$initial = $body !== '' ? '<main class="kbb-first-read">' . $body . $nav . '</main>' : '<noscript>' . $nav . '</noscript>';
header('Content-Type: text/html; charset=utf-8');
echo str_replace('<div id="root"></div>', '<div id="root">' . $initial . '</div>', $html);
