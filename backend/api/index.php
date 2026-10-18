<?php
/**
 * KBB Sadunia - REST API
 * Endpoints untuk artikel, kategori, dan komentar
 * Compatible dengan WordPress REST API format
 * 
 * SECURITY: Includes CSRF protection, rate limiting, security headers, and logging
 */

// ============================================
// Production Error Handling
// ============================================
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// ============================================
// Security Headers (OWASP Best Practice)
// ============================================
header_remove('X-Powered-By');
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');

// --------------------------------------------
// Load environment variables early
// --------------------------------------------
// We need access to API_SECRET_KEY and other env vars before we include
// the database config. The database config file is responsible for
// loading the .env file and validating required variables, but when
// generating a CSRF token for GET requests (see below) we reference
// API_SECRET_KEY before that file is required. This caused an issue
// when deploying because the .env values were never loaded and the
// secret fell back to an empty string. To avoid that, we load the
// .env file manually here if it exists. This does not instantiate a
// database connection, it only populates getenv/$_ENV/$_SERVER.
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $linesEnv = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($linesEnv as $lineEnv) {
        if (strpos(trim($lineEnv), '#') === 0) continue;
        if (strpos($lineEnv, '=') === false) continue;
        list($nameEnv, $valueEnv) = explode('=', $lineEnv, 2);
        $nameEnv = trim($nameEnv);
        $valueEnv = trim($valueEnv, " \t\n\r\0\x0B\"'");
        if (!array_key_exists($nameEnv, $_SERVER) && !array_key_exists($nameEnv, $_ENV)) {
            putenv(sprintf('%s=%s', $nameEnv, $valueEnv));
            $_ENV[$nameEnv] = $valueEnv;
            $_SERVER[$nameEnv] = $valueEnv;
        }
    }
}

// CORS - restricted to frontend URL from env
function envValue($key, $default = '') {
    return $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key) ?: $default;
}

$frontend_url = envValue('FRONTEND_URL');
if (!$frontend_url) {
    $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    // Fallback dinamis ke domain saat ini (misal di shared hosting frontend & backend 1 domain)
    $frontend_url = $scheme . '://' . $host;
    
    // Khusus environment lokal untuk development fallback
    if (strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false) {
        $frontend_url = 'http://localhost:5173';
    }
}
header("Access-Control-Allow-Origin: $frontend_url");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none';");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (empty($_COOKIE['csrf_token'])) {
        $token = bin2hex(random_bytes(32));
        $secret = envValue('API_SECRET_KEY');
        $hmac = hash_hmac('sha256', $token, $secret);
        $signed_token = $token . '|' . $hmac;
        
        setcookie('csrf_token', $signed_token, [
            'expires' => time() + 86400,
            'path' => '/',
            'secure' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'),
            'httponly' => false,
            'samesite' => 'Lax'
        ]);
        $_COOKIE['csrf_token'] = $signed_token;
    }
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/Logger.php';

// ============================================
// Security & Performance Helpers
// ============================================

/**
 * Set Cache-Control headers for public GET requests
 * Mempercepat loading di sisi browser dan proxy (Cloudflare/CDN)
 */
function setPublicCacheHeaders($seconds = 300) {
    header("Cache-Control: public, max-age=$seconds, s-maxage=$seconds, stale-while-revalidate=60");
    header("Pragma: public");
    header("Expires: " . gmdate('D, d M Y H:i:s', time() + $seconds) . ' GMT');
}

function getCanonicalBaseUrl() {
    global $frontend_url;
    $host = $_SERVER['HTTP_HOST'] ?? '';
    if ($host && strpos($host, 'localhost') === false && strpos($host, '127.0.0.1') === false) {
        $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
        return $scheme . '://' . $host;
    }
    return rtrim($frontend_url, '/');
}

/**
 * Validate JSON Content-Type
 */
function requireJsonContentType() {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'application/json') === false) {
        http_response_code(415);
        echo json_encode(['error' => 'Content-Type must be application/json']);
        exit;
    }
}

/**
 * Helper to get JSON body
 */
function getJsonBody() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

/**
 * Database-based rate limiter
 * Membatasi request per IP per endpoint menggunakan tabel rate_limits.
 * Lebih stabil di shared hosting dibanding file-based (sys_get_temp_dir).
 */
function checkRateLimit($endpoint, $maxRequests = 10, $windowSeconds = 60) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // Cek apakah IP ini masih diblokir
        $stmt = $db->prepare(
            "SELECT requests, blocked_until FROM rate_limits WHERE ip_address = :ip AND endpoint = :endpoint"
        );
        $stmt->execute([':ip' => $ip, ':endpoint' => $endpoint]);
        $row = $stmt->fetch();
        
        $now = time();
        
        if ($row) {
            // Cek blokir
            if ($row['blocked_until'] && strtotime($row['blocked_until']) > $now) {
                $retryAfter = strtotime($row['blocked_until']) - $now;
                header("Retry-After: $retryAfter");
                http_response_code(429);
                logSecurity('RATE_LIMIT', "Blocked: $ip on $endpoint (retry after {$retryAfter}s)");
                echo json_encode(['error' => 'Too many requests. Please try again later.', 'retry_after' => $retryAfter]);
                exit;
            }
            
            // Cek apakah window sudah kedaluwarsa (reset counter)
            $lastUpdate = strtotime($row['updated_at'] ?? 'now');
            if (($now - $lastUpdate) > $windowSeconds) {
                // Window sudah lewat, reset counter
                $stmt = $db->prepare(
                    "UPDATE rate_limits SET requests = 1, blocked_until = NULL, updated_at = NOW() WHERE ip_address = :ip AND endpoint = :endpoint"
                );
                $stmt->execute([':ip' => $ip, ':endpoint' => $endpoint]);
                return;
            }
            
            // Masih dalam window, tambah counter
            $currentRequests = (int)$row['requests'] + 1;
            
            if ($currentRequests > $maxRequests) {
                // Blokir
                $blockedUntil = date('Y-m-d H:i:s', $now + $windowSeconds);
                $stmt = $db->prepare(
                    "UPDATE rate_limits SET requests = :req, blocked_until = :blocked, updated_at = NOW() WHERE ip_address = :ip AND endpoint = :endpoint"
                );
                $stmt->execute([':req' => $currentRequests, ':blocked' => $blockedUntil, ':ip' => $ip, ':endpoint' => $endpoint]);
                
                header("Retry-After: $windowSeconds");
                http_response_code(429);
                logSecurity('RATE_LIMIT', "Rate limit exceeded: $ip on $endpoint ({$maxRequests}/{$windowSeconds}s)");
                echo json_encode(['error' => 'Too many requests. Please try again later.', 'retry_after' => $windowSeconds]);
                exit;
            }
            
            // Increment
            $stmt = $db->prepare(
                "UPDATE rate_limits SET requests = :req, updated_at = NOW() WHERE ip_address = :ip AND endpoint = :endpoint"
            );
            $stmt->execute([':req' => $currentRequests, ':ip' => $ip, ':endpoint' => $endpoint]);
        } else {
            // Belum ada record, buat baru
            $stmt = $db->prepare(
                "INSERT INTO rate_limits (ip_address, endpoint, requests, blocked_until) VALUES (:ip, :endpoint, 1, NULL)"
            );
            $stmt->execute([':ip' => $ip, ':endpoint' => $endpoint]);
        }
        
        // Bersihkan record lama secara periodik (1% kemungkinan tiap request)
        if (rand(1, 100) === 1) {
            $db->exec("DELETE FROM rate_limits WHERE updated_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)");
        }
    } catch (Exception $e) {
        // Jika database gagal, log tapi jangan blokir request
        error_log('[RATE_LIMIT_ERROR] ' . $e->getMessage());
    }
}

/**
 * Validasi CSRF token untuk POST/PUT/DELETE requests
 * Token dikirim via header X-CSRF-Token
 */
function validateCSRFToken() {
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Hanya cek untuk state-changing methods
    if (!in_array($method, ['POST', 'PUT', 'DELETE'])) {
        return true;
    }

    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (preg_match('#/api/(login|register|forgot-password|reset-password)$#', $uri)) {
        return true;
    }

    
    // 1. Cek Origin/Referer header sebagai first layer defense
    global $frontend_url; // Use global frontend_url calculated at the top
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    
    $allowedOrigin = parse_url($frontend_url, PHP_URL_HOST);
    
    if ($origin) {
        $requestOrigin = parse_url($origin, PHP_URL_HOST);
        if ($requestOrigin !== $allowedOrigin) {
            logSecurity('CSRF_FAIL', "Origin mismatch: expected=$allowedOrigin got=$requestOrigin");
            http_response_code(403);
            echo json_encode(['error' => 'CSRF validation failed: Origin mismatch']);
            exit;
        }
    } elseif ($referer) {
        $refererHost = parse_url($referer, PHP_URL_HOST);
        if ($refererHost !== $allowedOrigin) {
            logSecurity('CSRF_FAIL', "Referer mismatch: expected=$allowedOrigin got=$refererHost");
            http_response_code(403);
            echo json_encode(['error' => 'CSRF validation failed: Referer mismatch']);
            exit;
        }
    }
    
    // 2. Double-Submit Cookie Check
    $cookieToken = $_COOKIE['csrf_token'] ?? '';
    $headerToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    
    if (empty($cookieToken) || empty($headerToken) || !hash_equals($cookieToken, $headerToken)) {
        logSecurity('CSRF_FAIL', "Token mismatch or missing");
        http_response_code(403);
        echo json_encode(['error' => 'CSRF validation failed: Invalid or missing CSRF token']);
        exit;
    }
    
    // 3. Verify HMAC Signature
    $parts = explode('|', $cookieToken);
    if (count($parts) !== 2) {
        logSecurity('CSRF_FAIL', "Invalid token format");
        http_response_code(403);
        echo json_encode(['error' => 'CSRF validation failed: Invalid token format']);
        exit;
    }
    
    list($tokenValue, $hmac) = $parts;
    $secret = envValue('API_SECRET_KEY');
    $expectedHmac = hash_hmac('sha256', $tokenValue, $secret);
    
    if (!hash_equals($expectedHmac, $hmac)) {
        logSecurity('CSRF_FAIL', "Invalid HMAC signature");
        http_response_code(403);
        echo json_encode(['error' => 'CSRF validation failed: Token signature invalid']);
        exit;
    }
    
    return true;
}

/**
 * Security logging — catat event keamanan ke file log
 */
function logSecurity($type, $message) {
    Logger::getInstance()->security($type, $message);
}

/**
 * Log API request (non-security, untuk monitoring)
 */
function logRequest($handler) {
    Logger::getInstance()->info("API Request routed to $handler");
}

// ============================================
// JWT Auth Helpers
// ============================================

function generateToken($user) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $user['id'],
        'role' => $user['role'],
        'exp' => time() + 86400 // 1 day
    ]);
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, envValue('API_SECRET_KEY'), true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    $signature = hash_hmac('sha256', $parts[0] . "." . $parts[1], envValue('API_SECRET_KEY'), true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    if (hash_equals($base64UrlSignature, $parts[2])) {
        // Cek blacklist
        $tokenHash = hash('sha256', $token);
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT 1 FROM token_blacklist WHERE token_hash = ? AND expires_at > NOW()");
        $stmt->execute([$tokenHash]);
        if ($stmt->fetchColumn()) {
            return false;
        }

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
        if ($payload && $payload['exp'] > time()) {
            return $payload;
        }
    }
    return false;
}

function getAuthHeader() {
    if (!empty($_COOKIE['token'])) {
        return 'Bearer ' . $_COOKIE['token'];
    }
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        return $headers['Authorization'] ?? '';
    }
    return '';
}

require_once __DIR__ . '/books.php';

// ============================================
// Apply CSRF protection untuk semua POST/PUT/DELETE
// ============================================
validateCSRFToken();

// ============================================
// Router
// ============================================
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Simple Router
$routes = [
    'GET' => [
        '/api/health' => 'healthCheck',
        '/api/articles/(\d+)/comments' => 'getArticleComments',
        '/api/articles/(\d+)/related' => 'getRelatedArticles',
        '/api/articles/slug/(.+)' => 'getArticleBySlug',
        '/api/articles/(\d+)' => 'getArticle',
        '/api/articles' => 'getArticles',
        '/api/categories' => 'getCategories',
        '/api/trending' => 'getTrending',
        '/api/sitemap' => 'getSitemap',
        '/api/sitemap\.xml' => 'getSitemapXml',
        '/api/rss\.xml' => 'getRssXml',
        '/robots\.txt' => 'getRobotsTxt',
        '/sitemap\.xml' => 'getSitemapXml',
        '/rss\.xml' => 'getRssXml',
        '/api/me' => 'getCurrentUser',
        '/api/comments' => 'getComments',
        '/api/settings' => 'getSettings',
        '/api/tags' => 'getTags',
        '/api/users' => 'getUsers',
        '/api/media' => 'getMediaFiles',
        '/api/books/(\d+)' => 'getBook',
        '/api/books' => 'getBooks',
        '/api/library/(\d+)' => 'getBook',
        '/api/library' => 'getBooks',
    ],
    'POST' => [
        '/api/articles/slug/(.+)/view' => 'incrementArticleView',
        '/api/articles/(\d+)/react' => 'reactToArticle',
        '/api/articles' => 'createArticle',
        '/api/categories' => 'createCategory',
        '/api/comments' => 'createComment',
        '/api/corrections' => 'submitCorrection',
        '/api/newsletter' => 'subscribe',
        '/api/contact' => 'submitContact',
        '/api/login' => 'loginUser',
        '/api/logout' => 'logoutUser',
        // '/api/register' => 'registerUser', // Disabled public registration for security
        '/api/upload' => 'uploadImage',
        '/api/upload-book' => 'uploadBookFile',
        '/api/books' => 'createBook',
        '/api/library' => 'createBook',
        '/api/forgot-password' => 'forgotPassword',
        '/api/reset-password' => 'resetPassword',
        '/api/settings' => 'updateSettings',
        '/api/tags' => 'createTag',
        '/api/users' => 'createUser',
    ],
    'PUT' => [
        '/api/articles/(\d+)' => 'updateArticle',
        '/api/categories/(\d+)' => 'updateCategory',
        '/api/comments/(\d+)' => 'updateCommentStatus',
        '/api/tags/(\d+)' => 'updateTag',
        '/api/users/(\d+)' => 'updateUser',
        '/api/books/(\d+)' => 'updateBook',
        '/api/library/(\d+)' => 'updateBook',
    ],
    'DELETE' => [
        '/api/articles/(\d+)' => 'deleteArticle',
        '/api/categories/(\d+)' => 'deleteCategory',
        '/api/comments/(\d+)' => 'deleteComment',
        '/api/tags/(\d+)' => 'deleteTag',
        '/api/users/(\d+)' => 'deleteUser',
        '/api/media/(.+)' => 'deleteMediaFile',
        '/api/books/(\d+)' => 'deleteBook',
        '/api/library/(\d+)' => 'deleteBook',
    ],
];

// Match route
$handler = null;
$params = [];

if (isset($routes[$method])) {
    foreach ($routes[$method] as $pattern => $fn) {
        $regex = '#^' . $pattern . '$#';
        if (preg_match($regex, $uri, $matches)) {
            $handler = $fn;
            $params = array_slice($matches, 1);
            break;
        }
    }
}

if ($handler && function_exists($handler)) {
    logRequest($handler);
    try {
        call_user_func_array($handler, $params);
    } catch (Throwable $e) {
        logSecurity('SERVER_ERROR', "Exception in $handler: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error']);
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}

// ============================================
// API Handlers
// ============================================

/**
 * Agregasi views dari tabel log ke tabel utama untuk menghindari database lock saat trafik tinggi.
 */
function aggregateArticleViews($db) {
    try {
        // Auto-migrate jika tabel belum ada
        $db->exec("CREATE TABLE IF NOT EXISTS article_views_log (
          id INT AUTO_INCREMENT PRIMARY KEY,
          article_id INT NOT NULL,
          viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_article (article_id)
        ) ENGINE=InnoDB;");

        // Aggregasi jumlah views
        $sql = "UPDATE articles a
                JOIN (
                    SELECT article_id, COUNT(*) as view_count
                    FROM article_views_log
                    GROUP BY article_id
                ) v ON a.id = v.article_id
                SET a.views = a.views + v.view_count";
        $db->exec($sql);
        
        // Bersihkan log setelah selesai
        $db->exec("TRUNCATE TABLE article_views_log");
    } catch (Exception $e) {
        error_log("Gagal melakukan aggregasi views: " . $e->getMessage());
    }
}

/**
 * Health Check — verifikasi backend & database berjalan.
 * GET /api/health
 */
function healthCheck() {
    $status = ['status' => 'ok', 'timestamp' => date('c')];
    
    try {
        $db = Database::getInstance()->getConnection();
        $db->query('SELECT 1');
    } catch (Exception $e) {
        $status['status'] = 'degraded';
        error_log('[HEALTH_CHECK] DB error: ' . $e->getMessage());
    }
    
    echo json_encode($status, JSON_PRETTY_PRINT);
}

function expandArticleSearchToken($token) {
    $token = strtolower(trim((string)$token));
    if (strlen($token) < 2) {
        return [];
    }

    $variants = [$token];
    $replacements = [
        'silahturahmi' => 'silaturahmi',
        'silahtur' => 'silatur',
        'silaturhmi' => 'silaturahmi',
        'kongrs' => 'kongres',
    ];

    foreach ($replacements as $needle => $replacement) {
        if (strpos($token, $needle) !== false) {
            $variants[] = str_replace($needle, $replacement, $token);
        }
    }

    if (strlen($token) >= 6 && preg_match('/^sila?h?tur/', $token)) {
        $variants[] = str_replace('h', '', $token);
    }

    return array_values(array_filter(array_unique($variants), function($variant) {
        return strlen($variant) >= 2;
    }));
}

function buildArticleSearchTokens($search) {
    $normalized = strtolower(trim(preg_replace('/[^a-zA-Z0-9\s]/', ' ', (string)$search)));
    $rawTokens = preg_split('/\s+/', $normalized);
    $tokens = [];

    foreach ($rawTokens as $token) {
        $tokens = array_merge($tokens, expandArticleSearchToken($token));
    }

    if (empty($tokens)) {
        $tokens = expandArticleSearchToken($search);
    }

    return array_values(array_unique($tokens));
}

function getArticleListSelectColumns($includeContent = false) {
    $contentColumn = $includeContent ? 'a.content' : 'NULL AS content';

    return "a.id, a.title, a.slug, a.excerpt, $contentColumn, a.image_url, a.image_caption, a.image_credit,
            a.video_url, a.category_id, a.author_id, a.status, a.featured, a.views, a.read_time,
            a.source_name, a.source_url, a.editor_note, a.meta_title, a.meta_description,
            a.published_at, a.created_at, a.updated_at";
}

function getArticles() {
    $db = Database::getInstance()->getConnection();
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? min(100, max(1, (int)$_GET['per_page'])) : 10;
    $category = $_GET['category'] ?? null;
    $tag = $_GET['tag'] ?? null;
    $date = $_GET['date'] ?? null;
    $search = $_GET['search'] ?? null;
    $statusFilter = $_GET['status'] ?? 'published';
    $offset = ($page - 1) * $perPage;
    $join = "";

    // Check auth for getting non-published articles
    $isAdminOrAuthor = false;
    $userId = null;
    $role = null;
    
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
        $payload = verifyToken($token);
        if ($payload) {
            $userId = $payload['user_id'];
            $role = $payload['role'];
            if (in_array($role, ['admin', 'editor', 'author'])) {
                $isAdminOrAuthor = true;
            }
        }
    }
    
    if ($statusFilter !== 'published' && !$isAdminOrAuthor) {
        $statusFilter = 'published';
    }
    $includeContent = $isAdminOrAuthor && (($_GET['include_content'] ?? '') === '1');

    if ($statusFilter === 'published' && !$isAdminOrAuthor) {
        setPublicCacheHeaders($search ? 120 : 180);
    }
    
    $bindParams = [];
    $searchScoreParams = [];
    $searchScoreSql = "0";
    $orderBySql = "COALESCE(a.published_at, a.created_at) DESC";

    if ($statusFilter === 'all') {
        if ($role === 'admin' || $role === 'editor') {
            $where = "WHERE 1=1";
        } else if ($role === 'author') {
            $where = "WHERE ((a.status = 'published' AND a.published_at IS NOT NULL AND a.published_at <= NOW()) OR a.author_id = :current_user_id)";
            $bindParams[':current_user_id'] = $userId;
        } else {
            $where = "WHERE a.status = 'published' AND a.published_at IS NOT NULL AND a.published_at <= NOW()";
        }
    } else {
        $where = "WHERE a.status = :status";
        $bindParams[':status'] = $statusFilter;
        if ($statusFilter === 'published') {
            $where .= " AND a.published_at IS NOT NULL AND a.published_at <= NOW()";
        }
    }

    if ($category) {
        $where .= " AND c.slug = :category";
        $bindParams[':category'] = $category;
    }

    if ($tag) {
        $join .= " INNER JOIN article_tags at_filter ON a.id = at_filter.article_id INNER JOIN tags t_filter ON at_filter.tag_id = t_filter.id";
        $where .= " AND t_filter.slug = :tag";
        $bindParams[':tag'] = $tag;
    }

    if ($date && preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $where .= " AND DATE(COALESCE(a.published_at, a.created_at)) = :date";
        $bindParams[':date'] = $date;
    }

    if ($search) {
        $tokens = buildArticleSearchTokens($search);
        $searchClauses = [];
        $searchFields = ['a.title', 'a.excerpt', 'a.content', 'a.slug', 'c.name', 'u.display_name'];
        foreach (array_slice($tokens, 0, 6) as $idx => $token) {
            $fieldClauses = [];
            foreach ($searchFields as $fieldIndex => $field) {
                $key = ":search{$idx}_{$fieldIndex}";
                $fieldClauses[] = "$field LIKE $key";
                $bindParams[$key] = '%' . $token . '%';
            }
            $searchClauses[] = "(" . implode(" OR ", $fieldClauses) . ")";
        }
        if (!empty($searchClauses)) {
            $where .= " AND (" . implode(" OR ", $searchClauses) . ")";
        }

        $scoreTokens = array_values(array_filter($tokens, function($token) {
            return strlen($token) >= 3;
        }));
        if (empty($scoreTokens)) {
            $scoreTokens = $tokens;
        }

        $scoreParts = [];
        foreach (array_slice($scoreTokens, 0, 6) as $idx => $token) {
            $scoreFields = [
                'title' => ['field' => 'a.title', 'weight' => 40],
                'slug' => ['field' => 'a.slug', 'weight' => 28],
                'excerpt' => ['field' => 'a.excerpt', 'weight' => 18],
                'category' => ['field' => 'c.name', 'weight' => 10],
                'author' => ['field' => 'u.display_name', 'weight' => 8],
                'source' => ['field' => 'a.source_name', 'weight' => 8],
                'content' => ['field' => 'a.content', 'weight' => 4],
            ];

            foreach ($scoreFields as $name => $config) {
                $key = ":score{$idx}_{$name}";
                $scoreParts[] = "(CASE WHEN {$config['field']} LIKE $key THEN {$config['weight']} ELSE 0 END)";
                $searchScoreParams[$key] = '%' . $token . '%';
            }
        }

        $phrase = trim(preg_replace('/\s+/', ' ', (string)$search));
        if (strlen($phrase) >= 4) {
            $phraseFields = [
                'title_phrase' => ['field' => 'a.title', 'weight' => 120],
                'slug_phrase' => ['field' => 'a.slug', 'weight' => 80],
                'excerpt_phrase' => ['field' => 'a.excerpt', 'weight' => 40],
            ];

            foreach ($phraseFields as $name => $config) {
                $key = ":score_{$name}";
                $scoreParts[] = "(CASE WHEN {$config['field']} LIKE $key THEN {$config['weight']} ELSE 0 END)";
                $searchScoreParams[$key] = '%' . $phrase . '%';
            }
        }

        if (!empty($scoreParts)) {
            $searchScoreSql = implode(" + ", $scoreParts);
            $orderBySql = "search_score DESC, a.featured DESC, COALESCE(a.published_at, a.created_at) DESC";
        }
    }

    $articleColumns = getArticleListSelectColumns($includeContent);
    $sql = "SELECT $articleColumns, c.name as category_name, c.slug as category_slug, c.color as category_color,
                   u.display_name as author_name, ($searchScoreSql) as search_score
            FROM articles a
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN users u ON a.author_id = u.id
            $join
            $where
            ORDER BY $orderBySql
            LIMIT :limit OFFSET :offset";

    $stmt = $db->prepare($sql);
    foreach ($bindParams as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    foreach ($searchScoreParams as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $articles = $stmt->fetchAll();

    // Get total count
    $countSql = "SELECT COUNT(DISTINCT a.id) FROM articles a LEFT JOIN categories c ON a.category_id = c.id LEFT JOIN users u ON a.author_id = u.id $join $where";
    $countStmt = $db->prepare($countSql);
    foreach ($bindParams as $key => $val) {
        $countStmt->bindValue($key, $val);
    }
    $countStmt->execute();
    $total = $countStmt->fetchColumn();

    $json = json_encode([
        'data' => $articles,
        'meta' => [
            'total' => (int)$total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($total / $perPage),
        ],
    ]);
    if ($json === false) {
        array_walk_recursive($articles, function(&$item) {
            if (is_string($item)) {
                $item = mb_convert_encoding($item, 'UTF-8', 'UTF-8');
            }
        });
        echo json_encode([
            'data' => $articles,
            'meta' => [
                'total' => (int)$total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($total / $perPage),
            ],
        ]);
    } else {
        echo $json;
    }
}

function getArticle($id) {
    $db = Database::getInstance()->getConnection();

    $stmt = $db->prepare(
        "SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
                u.display_name as author_name
         FROM articles a
         LEFT JOIN categories c ON a.category_id = c.id
         LEFT JOIN users u ON a.author_id = u.id
         WHERE a.id = :id"
    );
    $stmt->execute([':id' => $id]);
    $article = $stmt->fetch();

    if (!$article) {
        http_response_code(404);
        echo json_encode(['error' => 'Article not found']);
        return;
    }

    if (!canViewArticle($article)) {
        http_response_code(404); // Return 404 to hide drafts/scheduled/private articles
        echo json_encode(['error' => 'Article not found']);
        return;
    }

    // Get tags
    $tagStmt = $db->prepare(
        "SELECT t.name FROM tags t JOIN article_tags at2 ON t.id = at2.tag_id WHERE at2.article_id = :id"
    );
    $tagStmt->execute([':id' => $id]);
    $article['tags'] = $tagStmt->fetchAll(PDO::FETCH_COLUMN);

    // Update view count via log untuk anti-lock
    try {
        $updateStmt = $db->prepare("INSERT INTO article_views_log (article_id) VALUES (:id)");
        $updateStmt->execute([':id' => $article['id']]);
    } catch (Exception $e) {
        $updateStmt = $db->prepare("UPDATE articles SET views = views + 1 WHERE id = :id");
        $updateStmt->execute([':id' => $article['id']]);
    }
    
    // Aggregasi dengan peluang 5%
    if (rand(1, 100) <= 5) {
        aggregateArticleViews($db);
    }

    echo json_encode(['data' => $article]);
}

function getArticleBySlug($slug) {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare(
        "SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
                u.display_name as author_name
         FROM articles a
         LEFT JOIN categories c ON a.category_id = c.id
         LEFT JOIN users u ON a.author_id = u.id
         WHERE a.slug = :slug"
    );
    $stmt->execute([':slug' => $slug]);
    $article = $stmt->fetch();

    if ($article && $article['status'] === 'published' && !empty($article['published_at']) && strtotime($article['published_at']) <= time()) {
        try {
            $updateStmt = $db->prepare("INSERT INTO article_views_log (article_id) VALUES (:id)");
            $updateStmt->execute([':id' => $article['id']]);
        } catch (Exception $e) {
            $updateStmt = $db->prepare("UPDATE articles SET views = views + 1 WHERE id = :id");
            $updateStmt->execute([':id' => $article['id']]);
        }
        
        if (rand(1, 100) <= 5) {
            aggregateArticleViews($db);
        }
    }

    if (!$article) {
        http_response_code(404);
        echo json_encode(['error' => 'Article not found']);
        return;
    }

    if (!canViewArticle($article)) {
        http_response_code(404); // Return 404 to hide drafts/scheduled/private articles
        echo json_encode(['error' => 'Article not found']);
        return;
    }

    $tagStmt = $db->prepare(
        "SELECT t.name, t.slug FROM tags t JOIN article_tags at2 ON t.id = at2.tag_id WHERE at2.article_id = :id ORDER BY t.name"
    );
    $tagStmt->execute([':id' => $article['id']]);
    $article['tags'] = $tagStmt->fetchAll();

    $commentStmt = $db->prepare("SELECT COUNT(*) FROM comments WHERE article_id = :id AND status = 'approved'");
    $commentStmt->execute([':id' => $article['id']]);
    $article['approved_comments_count'] = (int)$commentStmt->fetchColumn();

    echo json_encode(['data' => $article]);
}

function getCategories() {
    setPublicCacheHeaders(300); // Cache for 5 minutes
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query(
        "SELECT c.*, COUNT(a.id) as article_count
         FROM categories c
         LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
         GROUP BY c.id
         ORDER BY c.name"
    );
    echo json_encode(['data' => $stmt->fetchAll()]);
}

function getTrending() {
    setPublicCacheHeaders(300); // Cache for 5 minutes
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query(
        "SELECT a.id, a.title, a.slug, a.views, a.image_url, c.name as category_name
         FROM articles a
         LEFT JOIN categories c ON a.category_id = c.id
         WHERE a.status = 'published' AND a.published_at IS NOT NULL AND a.published_at <= NOW()
         ORDER BY a.views DESC
         LIMIT 5"
    );
    echo json_encode(['data' => $stmt->fetchAll()]);
}

function getSitemap() {
    setPublicCacheHeaders(600);
    $db = Database::getInstance()->getConnection();
    
    // Get all published articles slugs and updated times
    $stmt = $db->query(
        "SELECT slug, updated_at 
         FROM articles 
         WHERE status = 'published' AND published_at IS NOT NULL AND published_at <= NOW() 
         ORDER BY updated_at DESC"
    );
    $articles = $stmt->fetchAll();

    // Get all categories slugs
    $stmt2 = $db->query(
        "SELECT slug 
         FROM categories"
    );
    $categories = $stmt2->fetchAll();

    echo json_encode([
        'data' => [
            'articles' => $articles,
            'categories' => $categories,
            'pages' => [
                ['path' => '/', 'label' => 'Beranda'],
                ['path' => '/terkini', 'label' => 'Terkini'],
                ['path' => '/perpustakaan', 'label' => 'Perpustakaan Digital'],
                ['path' => '/tentang/sejarah', 'label' => 'Sejarah'],
                ['path' => '/tentang/susunan-pengurus', 'label' => 'Dasar Hukum dan Susunan Pengurus'],
                ['path' => '/tentang/pelantikan', 'label' => 'Kegiatan Pelantikan'],
                ['path' => '/tentang/opini', 'label' => 'Artikel dan Opini'],
            ],
        ]
    ]);
}

function loginUser() {
    requireJsonContentType();
    // Basic rate limit
    checkRateLimit('loginUser', 10, 60);

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        return;
    }

    $email = $data['email'];
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $db = Database::getInstance()->getConnection();

    // 1. Check Brute Force Lockout
    // Hitung kegagalan 15 menit terakhir
    $stmt = $db->prepare("SELECT COUNT(*) FROM login_attempts WHERE email = :email AND success = FALSE AND attempted_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)");
    $stmt->execute([':email' => $email]);
    $recentFails = $stmt->fetchColumn();

    if ($recentFails >= 5) {
        logSecurity('BRUTE_FORCE_LOCKOUT', "Account locked for 15 mins due to 5+ failed attempts: $email");
        http_response_code(429);
        header("Retry-After: 900"); // 15 mins
        echo json_encode(['error' => 'Account temporarily locked due to multiple failed login attempts. Please try again after 15 minutes.']);
        return;
    }

    // 2. Process Login
    $stmt = $db->prepare("SELECT id, password_hash, role, display_name FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($data['password'], $user['password_hash'])) {
        // Success
        $stmt = $db->prepare("INSERT INTO login_attempts (email, ip_address, success) VALUES (:email, :ip, TRUE)");
        $stmt->execute([':email' => $email, ':ip' => $ip]);

        $token = generateToken($user);
        
        setcookie('token', $token, [
            'expires' => time() + 86400,
            'path' => '/',
            'secure' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'),
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        
        logSecurity('LOGIN_SUCCESS', "User logged in: $email");
        echo json_encode(['user' => ['id' => $user['id'], 'name' => $user['display_name'], 'role' => $user['role']]]);
    } else {
        // Failed
        $stmt = $db->prepare("INSERT INTO login_attempts (email, ip_address, success) VALUES (:email, :ip, FALSE)");
        $stmt->execute([':email' => $email, ':ip' => $ip]);

        logSecurity('LOGIN_FAIL', "Failed login attempt: $email. Fails in last 15m: " . ($recentFails + 1));
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
}

function forgotPassword() {
    requireJsonContentType();
    // Rate limit: max 3 per menit untuk mencegah spam
    checkRateLimit('forgotPassword', 3, 60); 
    
    $data = getJsonBody();
    if (empty($data['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email is required']);
        return;
    }
    
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT id, display_name FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();
    
    if ($user) {
        $token = bin2hex(random_bytes(32));
        
        // Tabel password_resets sudah dibuat via schema.sql / init_db.php
        try {
            // Hapus token lama untuk email ini, lalu insert token baru
            $stmt = $db->prepare("DELETE FROM password_resets WHERE email = :email");
            $stmt->execute([':email' => $email]);
            
            $stmt = $db->prepare("INSERT INTO password_resets (email, token, created_at) VALUES (:email, :token, NOW())");
            $stmt->execute([':email' => $email, ':token' => $token]);
            
            global $frontend_url;
            $resetLink = rtrim($frontend_url, '/') . '/auth/reset-password?token=' . $token . '&email=' . urlencode($email);
            
            // Ambil domain dari FRONTEND_URL secara dinamis
            $mailDomain = parse_url($frontend_url, PHP_URL_HOST) ?: ($_SERVER['HTTP_HOST'] ?? 'localhost');
            
            $to = $email;
            $subject = "Reset Password - KBB Sadunia";
            $message = "Halo " . $user['display_name'] . ",\n\n";
            $message .= "Seseorang telah meminta untuk mereset kata sandi akun Anda.\n";
            $message .= "Jika ini adalah Anda, silakan klik tautan berikut untuk mereset kata sandi:\n\n";
            $message .= $resetLink . "\n\n";
            $message .= "Tautan ini akan kedaluwarsa dalam 1 jam.\n";
            $message .= "Jika Anda tidak meminta reset kata sandi, abaikan email ini.\n\n";
            $message .= "Salam,\nTim KBB Sadunia";
            
            $headers = "From: noreply@" . $mailDomain . "\r\n";
            $headers .= "Reply-To: support@" . $mailDomain . "\r\n";
            $headers .= "X-Mailer: PHP/" . phpversion();
            
            @mail($to, $subject, $message, $headers);
            logSecurity('FORGOT_PASSWORD', "Reset link sent to: $email");
            
        } catch (Exception $e) {
            error_log("Reset password error: " . $e->getMessage());
        }
    }
    
    // Always return success to prevent email enumeration
    echo json_encode(['message' => 'Jika email Anda terdaftar, link reset password telah dikirimkan.']);
}

function logoutUser() {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
        $tokenHash = hash('sha256', $token);
        
        $parts = explode('.', $token);
        if (count($parts) === 3) {
            $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
            $exp = $payload['exp'] ?? time() + 86400;
            
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("INSERT INTO token_blacklist (token_hash, expires_at) VALUES (?, FROM_UNIXTIME(?))");
            $stmt->execute([$tokenHash, $exp]);
            
            if (rand(1, 10) === 1) {
                $db->query("DELETE FROM token_blacklist WHERE expires_at < NOW()");
            }
        }
    }
    
    // Clear the token cookie
    setcookie('token', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'),
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    
    echo json_encode(['message' => 'Logged out successfully']);
}

function registerUser() {
    requireJsonContentType();
    checkRateLimit('registerUser', 5, 3600); // 5 per hour
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['email']) || empty($data['password']) || empty($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields required']);
        return;
    }
    $db = Database::getInstance()->getConnection();
    
    // Check if email exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $data['email']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Email already registered']);
        return;
    }

    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    $username = explode('@', $data['email'])[0] . rand(100, 999);
    
    $stmt = $db->prepare("INSERT INTO users (username, email, password_hash, display_name, role) VALUES (:u, :e, :p, :n, 'subscriber')");
    $stmt->execute([
        ':u' => $username,
        ':e' => $data['email'],
        ':p' => $hash,
        ':n' => strip_tags($data['name'])
    ]);
    
    logSecurity('REGISTER_SUCCESS', "New user registered: {$data['email']}");
    echo json_encode(['message' => 'Registration successful']);
}

function generateUniqueSlug($db, $baseSlug) {
    $slug = $baseSlug;
    $counter = 1;
    while (true) {
        $stmt = $db->prepare("SELECT id FROM articles WHERE slug = ?");
        $stmt->execute([$slug]);
        if (!$stmt->fetch()) {
            break;
        }
        $slug = $baseSlug . '-' . $counter;
        $counter++;
    }
    return $slug;
}

function normalizeSlug($value) {
    $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', strip_tags((string)$value)));
    return trim($slug, '-') ?: 'artikel';
}

function generateUniqueSlugExcept($db, $baseSlug, $excludeId = null) {
    $slug = $baseSlug;
    $counter = 1;
    while (true) {
        if ($excludeId) {
            $stmt = $db->prepare("SELECT id FROM articles WHERE slug = ? AND id <> ?");
            $stmt->execute([$slug, $excludeId]);
        } else {
            $stmt = $db->prepare("SELECT id FROM articles WHERE slug = ?");
            $stmt->execute([$slug]);
        }
        if (!$stmt->fetch()) break;
        $slug = $baseSlug . '-' . $counter;
        $counter++;
    }
    return $slug;
}

function parsePublishAt($value) {
    if (empty($value)) return null;
    $ts = strtotime((string)$value);
    if ($ts === false) return null;
    return date('Y-m-d H:i:s', $ts);
}

function canViewArticle($article) {
    if (!$article) return false;
    $isLive = $article['status'] === 'published' && !empty($article['published_at']) && strtotime($article['published_at']) <= time();
    if ($isLive) return true;

    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) return false;
    $payload = verifyToken(substr($authHeader, 7));
    if (!$payload) return false;
    return in_array($payload['role'], ['admin', 'editor']) || $payload['user_id'] == ($article['author_id'] ?? null);
}

function sanitizeArticleContent($content) {
    $html = (string)($content ?? '');
    $autoloadPath = __DIR__ . '/../vendor/autoload.php';

    if (file_exists($autoloadPath)) {
        require_once $autoloadPath;
        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'p,br,strong,em,ul,li,ol,h1,h2,h3,h4,h5,h6,blockquote,a[href|title|target],img[src|alt|title]');
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true]);
        $purifier = new HTMLPurifier($config);
        return $purifier->purify($html);
    }

    $allowedTags = '<p><br><strong><em><ul><li><ol><h1><h2><h3><h4><h5><h6><blockquote><a><img>';
    $clean = strip_tags($html, $allowedTags);
    $clean = preg_replace('/\s+on[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $clean);
    $clean = preg_replace('/\s+(href|src)\s*=\s*("|\')?\s*javascript:[^\s>]*\2?/i', ' $1="#"', $clean);
    $clean = preg_replace('/\s+style\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $clean);
    return $clean;
}

function validateArticleMediaContext($db, $data, $excludeId = null) {
    $imageUrl = trim((string)($data['image_url'] ?? ''));
    $imageCaption = trim(strip_tags((string)($data['image_caption'] ?? '')));
    $imageCredit = trim(strip_tags((string)($data['image_credit'] ?? '')));
    $sourceName = trim(strip_tags((string)($data['source_name'] ?? '')));

    if ($imageUrl === '' || strlen($imageCaption) < 12 || strlen($imageCredit) < 2 || $sourceName === '' || empty($data['image_context_confirmed'])) {
        return [
            'status' => 422,
            'error' => 'Foto wajib memiliki caption, kredit, sumber, dan konfirmasi kesesuaian konteks sebelum artikel diterbitkan',
        ];
    }

    $sql = "SELECT id, title FROM articles WHERE image_url = :image";
    $params = [':image' => $imageUrl];
    if ($excludeId !== null) {
        $sql .= " AND id <> :id";
        $params[':id'] = (int)$excludeId;
    }
    $sql .= " LIMIT 1";

    $duplicateImage = $db->prepare($sql);
    $duplicateImage->execute($params);
    if ($existing = $duplicateImage->fetch()) {
        return [
            'status' => 409,
            'error' => "Foto yang sama sudah dipakai pada artikel: {$existing['title']}",
        ];
    }

    return null;
}

function createArticle() {
    requireJsonContentType();
    // Authentication & RBAC Check
    $authHeader = getAuthHeader();
    
    if (strpos($authHeader, 'Bearer ') !== 0) {
        logSecurity('AUTH_FAIL', "Unauthorized attempt to create article. Missing/invalid header.");
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }

    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    
    if (!$payload) {
        logSecurity('AUTH_FAIL', "Invalid token on createArticle");
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        return;
    }

    if (!in_array($payload['role'], ['admin', 'author', 'editor'])) {
        logSecurity('RBAC_FAIL', "User ID {$payload['user_id']} attempted to create article without permission");
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: insufficient permissions']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['title'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Title is required']);
        return;
    }

    $db = Database::getInstance()->getConnection();
    $clean_title = strip_tags($data['title']);
    $baseSlug = normalizeSlug($data['slug'] ?? $clean_title);
    $slug = generateUniqueSlugExcept($db, $baseSlug);

    // Server-side XSS sanitation
    $clean_excerpt = strip_tags($data['excerpt'] ?? '');
    $clean_content = sanitizeArticleContent($data['content'] ?? '');

    $status = in_array($data['status'] ?? '', ['draft', 'review', 'published', 'scheduled', 'archived']) ? $data['status'] : 'draft';
    $publishAt = parsePublishAt($data['published_at'] ?? null);
    if ($status === 'published' && !$publishAt) {
        $publishAt = date('Y-m-d H:i:s');
    }
    if ($status === 'scheduled' && !$publishAt) {
        $status = 'draft';
    }

    if (in_array($status, ['review', 'published', 'scheduled'])) {
        $mediaError = validateArticleMediaContext($db, $data);
        if ($mediaError) {
            http_response_code($mediaError['status']);
            echo json_encode(['error' => $mediaError['error']]);
            return;
        }
    }

    $stmt = $db->prepare(
        "INSERT INTO articles (title, slug, excerpt, content, image_url, image_caption, image_credit, video_url, category_id, author_id, status, featured, read_time, source_name, source_url, editor_note, meta_title, meta_description, published_at)
         VALUES (:title, :slug, :excerpt, :content, :image, :image_caption, :image_credit, :video, :cat, :author, :status, :featured, :read_time, :source_name, :source_url, :editor_note, :meta_title, :meta_description, :published_at)"
    );
    $stmt->execute([
        ':title' => $clean_title,
        ':slug' => $slug,
        ':excerpt' => $clean_excerpt,
        ':content' => $clean_content,
        ':image' => filter_var($data['image_url'] ?? '', FILTER_SANITIZE_URL),
        ':image_caption' => strip_tags($data['image_caption'] ?? ''),
        ':image_credit' => strip_tags($data['image_credit'] ?? ''),
        ':video' => filter_var($data['video_url'] ?? '', FILTER_SANITIZE_URL),
        ':cat' => empty($data['category_id']) ? null : $data['category_id'],
        ':author' => $payload['user_id'], // Force author_id from token, NOT from request
        ':status' => $status,
        ':featured' => ($payload['role'] === 'admin') ? (!empty($data['featured']) ? 1 : 0) : 0, // Only admin can feature
        ':read_time' => strip_tags($data['read_time'] ?? '5 menit'),
        ':source_name' => strip_tags($data['source_name'] ?? ''),
        ':source_url' => filter_var($data['source_url'] ?? '', FILTER_SANITIZE_URL),
        ':editor_note' => strip_tags($data['editor_note'] ?? ''),
        ':meta_title' => strip_tags($data['meta_title'] ?? ''),
        ':meta_description' => strip_tags($data['meta_description'] ?? ''),
        ':published_at' => $publishAt,
    ]);
    $newArticleId = $db->lastInsertId();

    // Handle Tags
    if (isset($data['tags']) && is_array($data['tags'])) {
        $stmtTag = $db->prepare("INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)");
        foreach ($data['tags'] as $tagId) {
            $tagId = (int)$tagId;
            if ($tagId > 0) $stmtTag->execute([$newArticleId, $tagId]);
        }
    }

    logSecurity('ARTICLE_CREATED', "New article: '$clean_title' (slug: $slug)");
    echo json_encode(['data' => ['id' => $newArticleId, 'slug' => $slug], 'message' => 'Article created']);
}

function updateArticle($id) {
    requireJsonContentType();
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return;
    }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'author', 'editor'])) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden']); return;
    }

    $db = Database::getInstance()->getConnection();
    // Validate article exists & ownership
    $stmt = $db->prepare("SELECT author_id, slug, status, published_at FROM articles WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $article = $stmt->fetch();
    if (!$article) {
        http_response_code(404); echo json_encode(['error' => 'Article not found']); return;
    }
    if ($payload['role'] !== 'admin' && $article['author_id'] != $payload['user_id']) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden: You can only edit your own articles']); return;
    }

    $data = getJsonBody();
    if (!$data || !isset($data['title'])) {
        http_response_code(400); echo json_encode(['error' => 'Title is required']); return;
    }

    $clean_title = strip_tags($data['title']);
    $clean_excerpt = strip_tags($data['excerpt'] ?? '');
    $clean_content = sanitizeArticleContent($data['content'] ?? '');

    $status = in_array($data['status'] ?? '', ['draft', 'review', 'published', 'scheduled', 'archived']) ? $data['status'] : 'draft';
    $publishAt = parsePublishAt($data['published_at'] ?? null);
    if ($status === 'published' && !$publishAt) {
        $publishAt = !empty($article['published_at']) ? $article['published_at'] : date('Y-m-d H:i:s');
    }
    if ($status === 'scheduled' && !$publishAt) {
        $status = 'draft';
    }

    if (in_array($status, ['review', 'published', 'scheduled'])) {
        $mediaError = validateArticleMediaContext($db, $data, $id);
        if ($mediaError) {
            http_response_code($mediaError['status']);
            echo json_encode(['error' => $mediaError['error']]);
            return;
        }
    }
    $baseSlug = normalizeSlug($data['slug'] ?? $clean_title);
    $slug = generateUniqueSlugExcept($db, $baseSlug, $id);

    $stmt = $db->prepare(
        "UPDATE articles SET title = :title, slug = :slug, excerpt = :excerpt, content = :content, 
         image_url = :image, image_caption = :image_caption, image_credit = :image_credit, video_url = :video,
         category_id = :cat, status = :status, featured = :featured, read_time = :read_time,
         source_name = :source_name, source_url = :source_url, editor_note = :editor_note,
         meta_title = :meta_title, meta_description = :meta_description, published_at = :published_at, updated_at = NOW() WHERE id = :id"
    );
    $stmt->execute([
        ':title' => $clean_title,
        ':slug' => $slug,
        ':excerpt' => $clean_excerpt,
        ':content' => $clean_content,
        ':image' => filter_var($data['image_url'] ?? '', FILTER_SANITIZE_URL),
        ':image_caption' => strip_tags($data['image_caption'] ?? ''),
        ':image_credit' => strip_tags($data['image_credit'] ?? ''),
        ':video' => filter_var($data['video_url'] ?? '', FILTER_SANITIZE_URL),
        ':cat' => empty($data['category_id']) ? null : $data['category_id'],
        ':status' => $status,
        ':featured' => ($payload['role'] === 'admin') ? (!empty($data['featured']) ? 1 : 0) : 0,
        ':read_time' => strip_tags($data['read_time'] ?? '5 menit'),
        ':source_name' => strip_tags($data['source_name'] ?? ''),
        ':source_url' => filter_var($data['source_url'] ?? '', FILTER_SANITIZE_URL),
        ':editor_note' => strip_tags($data['editor_note'] ?? ''),
        ':meta_title' => strip_tags($data['meta_title'] ?? ''),
        ':meta_description' => strip_tags($data['meta_description'] ?? ''),
        ':published_at' => $publishAt,
        ':id' => $id
    ]);

    // Handle Tags
    if (isset($data['tags']) && is_array($data['tags'])) {
        $db->prepare("DELETE FROM article_tags WHERE article_id = ?")->execute([$id]);
        $stmtTag = $db->prepare("INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)");
        foreach ($data['tags'] as $tagId) {
            $tagId = (int)$tagId;
            if ($tagId > 0) $stmtTag->execute([$id, $tagId]);
        }
    }

    logSecurity('ARTICLE_UPDATED', "Article #$id updated by user {$payload['user_id']}");
    echo json_encode(['message' => 'Article updated successfully']);
}

function deleteArticle($id) {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return;
    }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'author', 'editor'])) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden']); return;
    }

    $db = Database::getInstance()->getConnection();
    // Validate article exists & ownership
    $stmt = $db->prepare("SELECT author_id FROM articles WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $article = $stmt->fetch();
    if (!$article) {
        http_response_code(404); echo json_encode(['error' => 'Article not found']); return;
    }
    if ($payload['role'] !== 'admin' && $article['author_id'] != $payload['user_id']) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden: You can only delete your own articles']); return;
    }

    $stmt = $db->prepare("DELETE FROM articles WHERE id = :id");
    $stmt->execute([':id' => $id]);

    logSecurity('ARTICLE_DELETED', "Article #$id deleted by user {$payload['user_id']}");
    echo json_encode(['message' => 'Article deleted successfully']);
}

function createComment() {
    requireJsonContentType();
    // Rate limiting: max 5 komentar per menit per IP
    checkRateLimit('createComment', 5, 60);
    
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['article_id']) || empty(trim($data['content'] ?? ''))) {
        http_response_code(400);
        echo json_encode(['error' => 'article_id and content are required']);
        return;
    }

    // Validasi panjang input (anti-spam)
    $authorName = trim($data['author_name'] ?? 'Anonymous');
    $content = trim($data['content']);
    
    if (mb_strlen($authorName) > 100) {
        http_response_code(400);
        echo json_encode(['error' => 'Author name too long (max 100 characters)']);
        return;
    }
    
    if (mb_strlen($content) > 5000) {
        http_response_code(400);
        echo json_encode(['error' => 'Comment too long (max 5000 characters)']);
        return;
    }
    
    if (mb_strlen($content) < 2) {
        http_response_code(400);
        echo json_encode(['error' => 'Comment too short (min 2 characters)']);
        return;
    }

    $db = Database::getInstance()->getConnection();
    $author_email = filter_var($data['author_email'] ?? '', FILTER_SANITIZE_EMAIL);
    if ($author_email && !filter_var($author_email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }

    $stmt = $db->prepare(
        "INSERT INTO comments (article_id, author_name, author_email, content) VALUES (:aid, :name, :email, :content)"
    );
    $stmt->execute([
        ':aid' => (int) $data['article_id'],
        ':name' => htmlspecialchars($authorName, ENT_QUOTES, 'UTF-8'),
        ':email' => $author_email,
        ':content' => htmlspecialchars($content, ENT_QUOTES, 'UTF-8'),
    ]);

    logSecurity('COMMENT_CREATED', "New comment on article #{$data['article_id']} by '$authorName'");
    echo json_encode(['message' => 'Comment submitted for review']);
}

function submitContact() {
    requireJsonContentType();
    // Rate limiting: max 3 requests per 5 minutes per IP
    checkRateLimit('contact', 3, 300);

    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['name']) || empty($data['email']) || empty($data['subject']) || empty($data['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields are required']);
        return;
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }

    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (:name, :email, :subject, :message)");
    
    try {
        $stmt->execute([
            ':name' => htmlspecialchars(trim($data['name'])),
            ':email' => htmlspecialchars(trim($data['email'])),
            ':subject' => htmlspecialchars(trim($data['subject'])),
            ':message' => htmlspecialchars(trim($data['message']))
        ]);
        
        logSecurity('CONTACT_MESSAGE', "Message received from: " . $data['email']);
        echo json_encode(['message' => 'Pesan berhasil dikirim.']);
    } catch (PDOException $e) {
        error_log("[CONTACT] DB error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function submitCorrection() {
    requireJsonContentType();
    checkRateLimit('correction', 3, 300);

    $data = getJsonBody();
    $articleTitle = trim(strip_tags($data['article_title'] ?? ''));
    $articleUrl = filter_var($data['article_url'] ?? '', FILTER_SANITIZE_URL);
    $name = trim(strip_tags($data['name'] ?? 'Pembaca'));
    $email = trim($data['email'] ?? '');
    $message = trim(strip_tags($data['message'] ?? ''));

    if (!$message || mb_strlen($message) < 10) {
        http_response_code(400);
        echo json_encode(['error' => 'Isi laporan koreksi minimal 10 karakter']);
        return;
    }
    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email tidak valid']);
        return;
    }

    $subject = "Laporan koreksi artikel" . ($articleTitle ? ": $articleTitle" : "");
    $body = "Artikel: " . ($articleTitle ?: '-') . "\nURL: " . ($articleUrl ?: '-') . "\n\nLaporan:\n" . $message;

    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (:name, :email, :subject, :message)");
    $stmt->execute([
        ':name' => htmlspecialchars($name ?: 'Pembaca', ENT_QUOTES, 'UTF-8'),
        ':email' => htmlspecialchars($email ?: 'redaksi@kbb-sadunia.com', ENT_QUOTES, 'UTF-8'),
        ':subject' => htmlspecialchars($subject, ENT_QUOTES, 'UTF-8'),
        ':message' => htmlspecialchars($body, ENT_QUOTES, 'UTF-8'),
    ]);

    echo json_encode(['message' => 'Laporan koreksi berhasil dikirim']);
}

function subscribe() {
    requireJsonContentType();
    // Rate limiting: max 3 subscribe requests per minute per IP
    checkRateLimit('subscribe', 3, 60);

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email is required']);
        return;
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }

    // Validate email length
    if (mb_strlen($data['email']) > 254) {
        http_response_code(400);
        echo json_encode(['error' => 'Email too long']);
        return;
    }

    // Normalise and sanitise the email address
    $email = strtolower(trim($data['email']));
    $safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');

    // Insert subscriber into database. If the email already exists the
    // ON DUPLICATE KEY UPDATE clause will re-activate the subscriber.
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare(
            "INSERT INTO newsletter_subscribers (email) VALUES (:email)
             ON DUPLICATE KEY UPDATE status = 'active', email = VALUES(email)"
        );
        $stmt->execute([':email' => $email]);
        logSecurity('NEWSLETTER_SUBSCRIBE', "New subscriber: " . $safeEmail);
        echo json_encode(['message' => 'Subscribed successfully', 'email' => $safeEmail]);
    } catch (PDOException $e) {
        error_log("[NEWSLETTER] DB error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to subscribe']);
    }
}

function uploadImage() {
    // Check Auth
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'author', 'editor'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        return;
    }

    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'No image uploaded or upload error']);
        return;
    }

    $file = $_FILES['image'];
    
    // Validate Size (Max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['error' => 'Ukuran gambar terlalu besar. Maksimal 5MB']);
        return;
    }

    // Validate Magic Bytes (MIME type)
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mimeType, $allowedMimeTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, WEBP allowed']);
        return;
    }

    if (@getimagesize($file['tmp_name']) === false) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid image content or corrupt file']);
        return;
    }

    // Generate secure filename
    $extension = '';
    if ($mimeType === 'image/jpeg') $extension = '.jpg';
    elseif ($mimeType === 'image/png') $extension = '.png';
    elseif ($mimeType === 'image/webp') $extension = '.webp';

    $filename = uniqid('img_', true) . $extension;
    $uploadDir = __DIR__ . '/../uploads/';
    $destination = $uploadDir . $filename;

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (move_uploaded_file($file['tmp_name'], $destination)) {
        // Return relative URL so it's not hardcoded to a specific hostname/port.
        // The Vite dev proxy forwards /uploads/* to the backend automatically,
        // and production web servers should alias /uploads → backend/uploads/.
        $url = '/uploads/' . $filename;
        logSecurity('FILE_UPLOAD', "User {$payload['user_id']} uploaded $filename");
        echo json_encode(['url' => $url, 'message' => 'Upload successful']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to move uploaded file']);
    }
}

function getCurrentUser() {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        return;
    }
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT id, display_name as name, role FROM users WHERE id = :id");
    $stmt->execute([':id' => $payload['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    echo json_encode(['user' => $user]);
}

function resetPassword() {
    requireJsonContentType();
    checkRateLimit('resetPassword', 5, 300);
    
    $data = getJsonBody();
    if (empty($data['token']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Token and new password required']);
        return;
    }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT email FROM password_resets WHERE token = :token AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
    $stmt->execute([':token' => $data['token']]);
    $reset = $stmt->fetch();
    
    if (!$reset) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or expired token']);
        return;
    }
    
    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    $updateStmt = $db->prepare("UPDATE users SET password_hash = :hash WHERE email = :email");
    $updateStmt->execute([':hash' => $hash, ':email' => $reset['email']]);
    
    $delStmt = $db->prepare("DELETE FROM password_resets WHERE email = :email");
    $delStmt->execute([':email' => $reset['email']]);
    
    logSecurity('PASSWORD_RESET', "Password reset for: " . $reset['email']);
    echo json_encode(['message' => 'Password reset successfully']);
}

function getSitemapXml() {
    header('Content-Type: application/xml; charset=utf-8');
    $db = Database::getInstance()->getConnection();
    $baseUrl = getCanonicalBaseUrl();
    
    $stmt = $db->query("SELECT slug, updated_at FROM articles WHERE status = 'published' AND published_at IS NOT NULL AND published_at <= NOW() ORDER BY updated_at DESC");
    $articles = $stmt->fetchAll();
    $categories = $db->query("SELECT slug FROM categories ORDER BY slug")->fetchAll();
    $tags = $db->query("SELECT t.slug FROM tags t INNER JOIN article_tags at2 ON t.id = at2.tag_id INNER JOIN articles a ON at2.article_id = a.id WHERE a.status = 'published' GROUP BY t.id ORDER BY t.slug")->fetchAll();
    
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    
    echo "<url><loc>$baseUrl/</loc><priority>1.0</priority></url>";
    echo "<url><loc>$baseUrl/terkini</loc><priority>0.9</priority></url>";
    echo "<url><loc>$baseUrl/perpustakaan</loc><priority>0.7</priority></url>";
    echo "<url><loc>$baseUrl/search</loc><priority>0.4</priority></url>";
    echo "<url><loc>$baseUrl/tentang/sejarah</loc><priority>0.6</priority></url>";
    echo "<url><loc>$baseUrl/tentang/susunan-pengurus</loc><priority>0.5</priority></url>";
    echo "<url><loc>$baseUrl/tentang/pelantikan</loc><priority>0.6</priority></url>";
    echo "<url><loc>$baseUrl/tentang/opini</loc><priority>0.6</priority></url>";
    echo "<url><loc>$baseUrl/tentang/kegiatan</loc><priority>0.5</priority></url>";
    echo "<url><loc>$baseUrl/tentang/administrasi</loc><priority>0.5</priority></url>";
    foreach ($categories as $category) {
        echo "<url><loc>$baseUrl/kategori/{$category['slug']}</loc><priority>0.7</priority></url>";
    }
    foreach ($tags as $tag) {
        echo "<url><loc>$baseUrl/tag/{$tag['slug']}</loc><priority>0.5</priority></url>";
    }
    
    foreach ($articles as $a) {
        $date = date('Y-m-d', strtotime($a['updated_at']));
        echo "<url><loc>$baseUrl/article/{$a['slug']}</loc><lastmod>$date</lastmod><priority>0.8</priority></url>";
    }
    echo '</urlset>';
}

function getRobotsTxt() {
    header('Content-Type: text/plain; charset=utf-8');
    $baseUrl = getCanonicalBaseUrl();

    echo "User-agent: *\n";
    echo "Allow: /\n";
    echo "Disallow: /auth\n";
    echo "Disallow: /admin\n";
    echo "Disallow: /api/\n";
    echo "\n";
    echo "Sitemap: $baseUrl/sitemap.xml\n";
}

function getRssXml() {
    header('Content-Type: application/rss+xml; charset=utf-8');
    $db = Database::getInstance()->getConnection();
    $baseUrl = getCanonicalBaseUrl();
    
    $stmt = $db->query("SELECT a.*, u.display_name as author_name FROM articles a LEFT JOIN users u ON a.author_id = u.id WHERE a.status = 'published' AND a.published_at IS NOT NULL AND a.published_at <= NOW() ORDER BY COALESCE(a.published_at, a.created_at) DESC LIMIT 20");
    $articles = $stmt->fetchAll();
    
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">';
    echo '<channel>';
    echo '<title>KBB Sadunia News</title>';
    echo "<link>$baseUrl/</link>";
    echo '<description>Berita dan Informasi Kerukunan Bubuhan Banjar Sadunia</description>';
    echo "<atom:link href=\"$baseUrl/rss.xml\" rel=\"self\" type=\"application/rss+xml\" />";
    
    foreach ($articles as $a) {
        $date = date(DATE_RSS, strtotime($a['published_at']));
        $title = htmlspecialchars($a['title'], ENT_XML1);
        $excerpt = htmlspecialchars($a['excerpt'] ?: strip_tags(substr($a['content'], 0, 150)), ENT_XML1);
        $link = "$baseUrl/article/{$a['slug']}";
        echo "<item>";
        echo "<title>$title</title>";
        echo "<link>$link</link>";
        echo "<guid>$link</guid>";
        echo "<pubDate>$date</pubDate>";
        echo "<description>$excerpt</description>";
        echo "</item>";
    }
    echo '</channel></rss>';
}

function getComments() {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }
    
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? min(100, max(1, (int)$_GET['per_page'])) : 10;
    $offset = ($page - 1) * $perPage;
    
    $db = Database::getInstance()->getConnection();
    
    // Total count
    $countStmt = $db->query("SELECT COUNT(*) FROM comments");
    $total = $countStmt->fetchColumn();
    
    $stmt = $db->prepare("SELECT c.*, a.title as article_title FROM comments c LEFT JOIN articles a ON c.article_id = a.id ORDER BY c.created_at DESC LIMIT :limit OFFSET :offset");
    $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    echo json_encode([
        'data' => $stmt->fetchAll(),
        'meta' => [
            'total' => (int)$total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($total / $perPage),
        ],
    ]);
}

function getArticleComments($articleId) {
    setPublicCacheHeaders(120);
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare(
        "SELECT id, author_name, content, created_at
         FROM comments
         WHERE article_id = :article_id AND status = 'approved'
         ORDER BY created_at DESC
         LIMIT 50"
    );
    $stmt->execute([':article_id' => $articleId]);
    echo json_encode(['data' => $stmt->fetchAll()]);
}

function updateCommentStatus($id) {
    requireJsonContentType();
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }
    
    $data = getJsonBody();
    if (!isset($data['status']) || !in_array($data['status'], ['approved', 'pending'])) {
        http_response_code(400); echo json_encode(['error' => 'Invalid status']); return;
    }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("UPDATE comments SET status = :status WHERE id = :id");
    $stmt->execute([':status' => $data['status'], ':id' => $id]);
    echo json_encode(['message' => 'Comment status updated']);
}

function deleteComment($id) {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("DELETE FROM comments WHERE id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['message' => 'Comment deleted']);
}

// ============================================
// NEW CMS FEATURES
// ============================================

function incrementArticleView($slug) {
    // Only increment views if not an admin (optional, but good for accuracy)
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
        $payload = verifyToken($token);
        if ($payload && in_array($payload['role'], ['admin', 'editor'])) {
            echo json_encode(['message' => 'View not counted for admin']);
            return; // Skip counting for admins
        }
    }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("UPDATE articles SET views = views + 1 WHERE slug = :slug");
    $stmt->execute([':slug' => $slug]);
    echo json_encode(['message' => 'View incremented']);
}

function getRelatedArticles($articleId) {
    $db = Database::getInstance()->getConnection();
    
    // Get category of the current article
    $stmt = $db->prepare("SELECT category_id FROM articles WHERE id = :id");
    $stmt->execute([':id' => $articleId]);
    $article = $stmt->fetch();
    
    if (!$article) {
        http_response_code(404);
        echo json_encode(['error' => 'Article not found']);
        return;
    }
    
    $stmt = $db->prepare(
        "SELECT DISTINCT a.id, a.title, a.slug, a.excerpt, a.image_url, a.published_at,
                c.name as category_name, c.slug as category_slug, c.color as category_color,
                u.display_name as author_name,
                (CASE WHEN a.category_id = :cat_id THEN 3 ELSE 0 END) +
                (SELECT COUNT(*) FROM article_tags at_current
                 INNER JOIN article_tags at_other ON at_current.tag_id = at_other.tag_id
                 WHERE at_current.article_id = :article_id_tags AND at_other.article_id = a.id) as relevance_score
         FROM articles a
         LEFT JOIN categories c ON a.category_id = c.id
         LEFT JOIN users u ON a.author_id = u.id
         WHERE a.id != :article_id_exclude AND a.status = 'published' AND a.published_at IS NOT NULL AND a.published_at <= NOW()
         HAVING relevance_score > 0
         ORDER BY relevance_score DESC, a.published_at DESC
         LIMIT 6"
    );
    $stmt->execute([
        ':cat_id' => $article['category_id'],
        ':article_id_tags' => $articleId,
        ':article_id_exclude' => $articleId,
    ]);
    echo json_encode(['data' => $stmt->fetchAll()]);
}

function reactToArticle($articleId) {
    requireJsonContentType();
    $data = getJsonBody();
    
    if (empty($data['type']) || !in_array($data['type'], ['like', 'love', 'haha', 'wow', 'sad', 'angry'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid reaction type']);
        return;
    }
    
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $db = Database::getInstance()->getConnection();
    
    try {
        $stmt = $db->prepare("INSERT INTO reactions (article_id, reaction_type, ip_address) VALUES (:article_id, :type, :ip)");
        $stmt->execute([':article_id' => $articleId, ':type' => $data['type'], ':ip' => $ip]);
        echo json_encode(['message' => 'Reaction saved']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            // User already reacted with this type, maybe they want to toggle it off?
            $stmt = $db->prepare("DELETE FROM reactions WHERE article_id = :article_id AND reaction_type = :type AND ip_address = :ip");
            $stmt->execute([':article_id' => $articleId, ':type' => $data['type'], ':ip' => $ip]);
            echo json_encode(['message' => 'Reaction removed']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save reaction']);
        }
    }
}

// Category Management
function createCategory() {
    requireJsonContentType();
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }
    
    $data = getJsonBody();
    if (empty($data['name']) || empty($data['slug'])) {
        http_response_code(400); echo json_encode(['error' => 'Name and slug required']); return;
    }
    
    $db = Database::getInstance()->getConnection();
    try {
        $stmt = $db->prepare("INSERT INTO categories (name, slug, color, description) VALUES (:name, :slug, :color, :desc)");
        $stmt->execute([
            ':name' => $data['name'], 
            ':slug' => $data['slug'],
            ':color' => $data['color'] ?? '#3391ff',
            ':desc' => $data['description'] ?? ''
        ]);
        echo json_encode(['message' => 'Category created', 'id' => $db->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(400); echo json_encode(['error' => 'Failed to create category. Slug might exist.']);
    }
}

function updateCategory($id) {
    requireJsonContentType();
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }
    
    $data = getJsonBody();
    if (empty($data['name']) || empty($data['slug'])) {
        http_response_code(400); echo json_encode(['error' => 'Name and slug required']); return;
    }
    
    $db = Database::getInstance()->getConnection();
    try {
        $stmt = $db->prepare("UPDATE categories SET name = :name, slug = :slug, color = :color, description = :desc WHERE id = :id");
        $stmt->execute([
            ':name' => $data['name'], 
            ':slug' => $data['slug'],
            ':color' => $data['color'] ?? '#3391ff',
            ':desc' => $data['description'] ?? '',
            ':id' => $id
        ]);
        echo json_encode(['message' => 'Category updated']);
    } catch (PDOException $e) {
        http_response_code(400); echo json_encode(['error' => 'Failed to update category.']);
    }
}

function deleteCategory($id) {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("DELETE FROM categories WHERE id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['message' => 'Category deleted']);
}

// ============================================
// WP-Like Features Handlers
// ============================================

function getSettings() {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("SELECT setting_key, setting_value FROM settings");
    $settings = [];
    while ($row = $stmt->fetch()) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    echo json_encode(['data' => $settings]);
}

function updateSettings() {
    requireJsonContentType();
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || $payload['role'] !== 'admin') { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }

    $data = getJsonBody();
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
    
    foreach ($data as $key => $value) {
        $stmt->execute([$key, $value, $value]);
    }
    echo json_encode(['message' => 'Settings updated successfully']);
}

function getTags() {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query(
        "SELECT t.id, t.name, t.slug, COUNT(a.id) as article_count
         FROM tags t
         LEFT JOIN article_tags at2 ON t.id = at2.tag_id
         LEFT JOIN articles a ON at2.article_id = a.id AND a.status = 'published' AND a.published_at IS NOT NULL AND a.published_at <= NOW()
         GROUP BY t.id
         ORDER BY article_count DESC, t.name"
    );
    echo json_encode(['data' => $stmt->fetchAll()]);
}

function createTag() {
    requireJsonContentType();
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor', 'author'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }

    $data = getJsonBody();
    $name = trim(strip_tags($data['name'] ?? ''));
    if ($name === '') {
        http_response_code(400); echo json_encode(['error' => 'Name required']); return;
    }
    $slug = normalizeSlug($data['slug'] ?? $name);
    
    $db = Database::getInstance()->getConnection();
    try {
        $stmt = $db->prepare("INSERT INTO tags (name, slug) VALUES (?, ?)");
        $stmt->execute([$name, $slug]);
        $id = (int)$db->lastInsertId();
        echo json_encode(['message' => 'Tag created', 'data' => ['id' => $id, 'name' => $name, 'slug' => $slug]]);
    } catch (PDOException $e) {
        http_response_code(400); echo json_encode(['error' => 'Failed to create tag. Slug might exist.']);
    }
}

function updateTag($id) {
    requireJsonContentType();
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }

    $data = getJsonBody();
    if (empty($data['name']) || empty($data['slug'])) {
        http_response_code(400); echo json_encode(['error' => 'Name and slug required']); return;
    }
    
    $db = Database::getInstance()->getConnection();
    try {
        $stmt = $db->prepare("UPDATE tags SET name = ?, slug = ? WHERE id = ?");
        $stmt->execute([$data['name'], $data['slug'], $id]);
        echo json_encode(['message' => 'Tag updated']);
    } catch (PDOException $e) {
        http_response_code(400); echo json_encode(['error' => 'Failed to update tag.']);
    }
}

function deleteTag($id) {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }

    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("DELETE FROM tags WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['message' => 'Tag deleted']);
}

function getUsers() {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }

    $db = Database::getInstance()->getConnection();
    // Editors can only see, Admins can edit/delete
    $stmt = $db->query("SELECT id, username, email, display_name, role, created_at FROM users ORDER BY created_at DESC");
    echo json_encode(['data' => $stmt->fetchAll()]);
}

function createUser() {
    requireJsonContentType();
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || $payload['role'] !== 'admin') { http_response_code(403); echo json_encode(['error' => 'Forbidden: Admins only']); return; }

    $data = getJsonBody();
    if (empty($data['email']) || empty($data['password']) || empty($data['display_name']) || empty($data['role'])) {
        http_response_code(400); echo json_encode(['error' => 'All fields required']); return;
    }
    
    $db = Database::getInstance()->getConnection();
    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    $username = explode('@', $data['email'])[0] . rand(100, 999);
    
    try {
        $stmt = $db->prepare("INSERT INTO users (username, email, password_hash, display_name, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$username, $data['email'], $hash, $data['display_name'], $data['role']]);
        echo json_encode(['message' => 'User created']);
    } catch (PDOException $e) {
        http_response_code(400); echo json_encode(['error' => 'Email or username already exists']);
    }
}

function updateUser($id) {
    requireJsonContentType();
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || $payload['role'] !== 'admin') { http_response_code(403); echo json_encode(['error' => 'Forbidden: Admins only']); return; }

    $data = getJsonBody();
    if (empty($data['email']) || empty($data['display_name']) || empty($data['role'])) {
        http_response_code(400); echo json_encode(['error' => 'Missing fields']); return;
    }
    
    $db = Database::getInstance()->getConnection();
    try {
        if (!empty($data['password'])) {
            $hash = password_hash($data['password'], PASSWORD_BCRYPT);
            $stmt = $db->prepare("UPDATE users SET email = ?, display_name = ?, role = ?, password_hash = ? WHERE id = ?");
            $stmt->execute([$data['email'], $data['display_name'], $data['role'], $hash, $id]);
        } else {
            $stmt = $db->prepare("UPDATE users SET email = ?, display_name = ?, role = ? WHERE id = ?");
            $stmt->execute([$data['email'], $data['display_name'], $data['role'], $id]);
        }
        echo json_encode(['message' => 'User updated']);
    } catch (PDOException $e) {
        http_response_code(400); echo json_encode(['error' => 'Failed to update user']);
    }
}

function deleteUser($id) {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || $payload['role'] !== 'admin') { http_response_code(403); echo json_encode(['error' => 'Forbidden: Admins only']); return; }

    // Prevent deleting self
    if ($payload['user_id'] == $id) {
        http_response_code(400); echo json_encode(['error' => 'Cannot delete yourself']); return;
    }

    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['message' => 'User deleted']);
}

function getMediaFiles() {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor', 'author'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }

    $uploadDir = __DIR__ . '/../uploads/';
    $files = [];
    if (is_dir($uploadDir)) {
        $items = scandir($uploadDir);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            $path = $uploadDir . $item;
            if (is_file($path)) {
                // Use a relative URL so the path is not hardcoded to any
                // specific hostname. The Vite dev proxy and production web
                // server alias /uploads → backend/uploads/ automatically.
                $files[] = [
                    'name' => $item,
                    'url'  => '/uploads/' . $item,
                    'size' => filesize($path),
                    'created_at' => filemtime($path)
                ];
            }
        }
    }
    // Sort by created_at desc
    usort($files, function($a, $b) {
        return $b['created_at'] - $a['created_at'];
    });
    
    echo json_encode(['data' => $files]);
}

function deleteMediaFile($filename) {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return; }
    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'], ['admin', 'editor'])) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); return; }

    // Path traversal protection
    $filename = basename($filename);
    $filepath = __DIR__ . '/../uploads/' . $filename;
    
    if (file_exists($filepath)) {
        unlink($filepath);
        echo json_encode(['message' => 'File deleted']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'File not found']);
    }
}
