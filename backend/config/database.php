<?php
/**
 * KBB Sadunia - Database Connection
 * PHP + MySQL Backend Configuration
 * 
 * CATATAN INFINITYFREE: getenv() diblokir pada hosting InfinityFree.
 * Semua konfigurasi dibaca dari $_ENV yang di-populate oleh loadEnv().
 */

// Helper to load .env file
function loadEnv($path) {
    // Set PHP timezone early
    date_default_timezone_set('Asia/Jakarta');
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value, " \t\n\r\0\x0B\"'");
        // putenv() juga mungkin diblokir di beberapa hosting, tapi $_ENV pasti aman
        @putenv(sprintf('%s=%s', $name, $value));
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}

// Load environment variables
loadEnv(__DIR__ . '/../.env');

// Validasi: credentials HARUS di-set via .env (tidak ada fallback default)
$requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'API_SECRET_KEY'];
foreach ($requiredEnvVars as $var) {
    $val = $_ENV[$var] ?? null;
    if (!$val) {
        http_response_code(500);
        error_log("[CRITICAL] Missing env variable: $var — file .env tidak ditemukan atau variabel belum diisi");
        echo json_encode(['error' => 'Server configuration error']);
        exit;
    }
    if ($var === 'API_SECRET_KEY' && strlen($val) < 32) {
        http_response_code(500);
        error_log("[CRITICAL] API_SECRET_KEY terlalu pendek: " . strlen($val) . " karakter");
        echo json_encode(['error' => 'Server configuration error']);
        exit;
    }
    if (strpos($val, 'GANTI_') === 0 || strpos($val, 'CHANGE_') === 0) {
        http_response_code(500);
        error_log("[CRITICAL] Variabel $var masih menggunakan placeholder");
        echo json_encode(['error' => 'Server configuration error']);
        exit;
    }
}

foreach ($_ENV as $var => $val) {
    if (!is_string($val)) continue;
    if (strpos($val, 'GANTI_') === 0 || strpos($val, 'CHANGE_') === 0 || stripos($val, 'GANTI-DOMAIN') !== false) {
        http_response_code(500);
        error_log("[CRITICAL] Variabel $var masih menggunakan placeholder");
        echo json_encode(['error' => 'Server configuration error']);
        exit;
    }
}

define('DB_HOST', $_ENV['DB_HOST']);
define('DB_NAME', $_ENV['DB_NAME']);
define('DB_USER', $_ENV['DB_USER']);
define('DB_PASS', $_ENV['DB_PASS'] ?? '');
define('DB_CHARSET', 'utf8mb4');
define('APP_ENV', $_ENV['APP_ENV'] ?? 'production');

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            // Set MySQL connection timezone to Indonesia/Jakarta
            $this->pdo->exec("SET time_zone = '+07:00'");
        } catch (PDOException $e) {
            error_log("[DB_ERROR] Connection failed: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->pdo;
    }
}
