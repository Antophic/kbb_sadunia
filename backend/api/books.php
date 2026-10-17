<?php

function booksRequireContentManager($allowedRoles = ['admin', 'editor', 'author']) {
    $authHeader = getAuthHeader();
    if (strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return false;
    }

    $token = substr($authHeader, 7);
    $payload = verifyToken($token);
    if (!$payload || !in_array($payload['role'] ?? '', $allowedRoles, true)) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        return false;
    }

    return $payload;
}

function booksCleanText($value, $maxLength = 255) {
    $value = trim(strip_tags((string)$value));
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength);
    }
    return substr($value, 0, $maxLength);
}

function booksCleanPublicUrl($value) {
    $url = trim((string)$value);
    if ($url === '' || preg_match('/[\r\n]/', $url)) return '';
    if (preg_match('#^https?://#i', $url) || $url[0] === '/') {
        return booksCleanText($url, 500);
    }
    return '';
}

function ensureBooksTable($db) {
    $db->exec("CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) DEFAULT '',
        category VARCHAR(100) DEFAULT 'Umum',
        description TEXT,
        cover_url VARCHAR(500) DEFAULT '',
        file_url VARCHAR(500) DEFAULT '',
        file_size INT DEFAULT 0,
        downloads INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_books_category (category),
        INDEX idx_books_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

function getBooks() {
    setPublicCacheHeaders(180);
    $db = Database::getInstance()->getConnection();
    ensureBooksTable($db);

    $search = booksCleanText($_GET['search'] ?? '', 120);
    $category = booksCleanText($_GET['category'] ?? '', 100);
    $params = [];
    $where = [];

    if ($search !== '') {
        $where[] = "(title LIKE :search OR author LIKE :search OR description LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    if ($category !== '' && strtolower($category) !== 'all') {
        $where[] = "category = :category";
        $params[':category'] = $category;
    }

    $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    $stmt = $db->prepare("SELECT id, title, author, category, description, cover_url, file_url, file_size, downloads, created_at, updated_at
        FROM books
        $whereSql
        ORDER BY created_at DESC, id DESC");
    $stmt->execute($params);
    $books = $stmt->fetchAll();

    $categoryStmt = $db->query("SELECT DISTINCT category FROM books WHERE category <> '' ORDER BY category ASC");
    $categories = array_values(array_filter(array_map(function($row) {
        return $row['category'] ?? '';
    }, $categoryStmt->fetchAll())));

    echo json_encode([
        'data' => $books,
        'categories' => $categories,
    ]);
}

function getBook($id) {
    setPublicCacheHeaders(180);
    $db = Database::getInstance()->getConnection();
    ensureBooksTable($db);

    $stmt = $db->prepare("SELECT id, title, author, category, description, cover_url, file_url, file_size, downloads, created_at, updated_at FROM books WHERE id = ?");
    $stmt->execute([(int)$id]);
    $book = $stmt->fetch();

    if (!$book) {
        http_response_code(404);
        echo json_encode(['error' => 'Book not found']);
        return;
    }

    echo json_encode(['data' => $book]);
}

function createBook() {
    requireJsonContentType();
    $payload = booksRequireContentManager(['admin', 'editor', 'author']);
    if (!$payload) return;

    $data = getJsonBody();
    $title = booksCleanText($data['title'] ?? '', 255);
    $fileUrl = booksCleanPublicUrl($data['file_url'] ?? '');

    if ($title === '' || $fileUrl === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Judul dan file buku wajib diisi']);
        return;
    }

    $db = Database::getInstance()->getConnection();
    ensureBooksTable($db);

    $stmt = $db->prepare("INSERT INTO books (title, author, category, description, cover_url, file_url, file_size)
        VALUES (:title, :author, :category, :description, :cover_url, :file_url, :file_size)");
    $stmt->execute([
        ':title' => $title,
        ':author' => booksCleanText($data['author'] ?? '', 255),
        ':category' => booksCleanText($data['category'] ?? 'Umum', 100) ?: 'Umum',
        ':description' => booksCleanText($data['description'] ?? '', 1200),
        ':cover_url' => booksCleanPublicUrl($data['cover_url'] ?? ''),
        ':file_url' => $fileUrl,
        ':file_size' => max(0, (int)($data['file_size'] ?? 0)),
    ]);

    logSecurity('BOOK_CREATE', "User {$payload['user_id']} added book: $title");
    echo json_encode(['message' => 'Book created', 'id' => $db->lastInsertId()]);
}

function updateBook($id) {
    requireJsonContentType();
    $payload = booksRequireContentManager(['admin', 'editor', 'author']);
    if (!$payload) return;

    $data = getJsonBody();
    $title = booksCleanText($data['title'] ?? '', 255);
    $fileUrl = booksCleanPublicUrl($data['file_url'] ?? '');

    if ($title === '' || $fileUrl === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Judul dan file buku wajib diisi']);
        return;
    }

    $db = Database::getInstance()->getConnection();
    ensureBooksTable($db);

    $stmt = $db->prepare("UPDATE books
        SET title = :title,
            author = :author,
            category = :category,
            description = :description,
            cover_url = :cover_url,
            file_url = :file_url,
            file_size = :file_size
        WHERE id = :id");
    $stmt->execute([
        ':title' => $title,
        ':author' => booksCleanText($data['author'] ?? '', 255),
        ':category' => booksCleanText($data['category'] ?? 'Umum', 100) ?: 'Umum',
        ':description' => booksCleanText($data['description'] ?? '', 1200),
        ':cover_url' => booksCleanPublicUrl($data['cover_url'] ?? ''),
        ':file_url' => $fileUrl,
        ':file_size' => max(0, (int)($data['file_size'] ?? 0)),
        ':id' => (int)$id,
    ]);

    echo json_encode(['message' => 'Book updated']);
}

function deleteBook($id) {
    $payload = booksRequireContentManager(['admin', 'editor']);
    if (!$payload) return;

    $db = Database::getInstance()->getConnection();
    ensureBooksTable($db);

    $stmt = $db->prepare("SELECT file_url, cover_url FROM books WHERE id = ?");
    $stmt->execute([(int)$id]);
    $book = $stmt->fetch();

    $stmt = $db->prepare("DELETE FROM books WHERE id = ?");
    $stmt->execute([(int)$id]);

    if ($book) {
        booksDeleteUploadedFiles($book);
    }

    logSecurity('BOOK_DELETE', "User {$payload['user_id']} deleted book ID $id");
    echo json_encode(['message' => 'Book deleted']);
}

function booksDeleteUploadedFiles($book) {
    foreach (['file_url', 'cover_url'] as $field) {
        $url = $book[$field] ?? '';
        if (strpos($url, '/uploads/') !== 0) continue;

        $path = realpath(__DIR__ . '/..' . $url);
        $uploadsRoot = realpath(__DIR__ . '/../uploads');
        if ($path && $uploadsRoot && strpos($path, $uploadsRoot) === 0 && is_file($path)) {
            @unlink($path);
        }
    }
}

function uploadBookFile() {
    $payload = booksRequireContentManager(['admin', 'editor', 'author']);
    if (!$payload) return;

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Tidak ada file buku yang diunggah']);
        return;
    }

    $file = $_FILES['file'];
    if ($file['size'] > 20 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['error' => 'Ukuran PDF terlalu besar. Maksimal 20MB']);
        return;
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $handle = fopen($file['tmp_name'], 'rb');
    $magic = $handle ? fread($handle, 4) : '';
    if ($handle) fclose($handle);

    $allowedMime = ['application/pdf', 'application/x-pdf', 'application/octet-stream'];
    if ($extension !== 'pdf' || $magic !== '%PDF' || !in_array($mimeType, $allowedMime, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'File buku harus berupa PDF yang valid']);
        return;
    }

    $uploadDir = __DIR__ . '/../uploads/books/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $filename = uniqid('book_', true) . '.pdf';
    $destination = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        http_response_code(500);
        echo json_encode(['error' => 'Gagal memindahkan file buku']);
        return;
    }

    logSecurity('BOOK_UPLOAD', "User {$payload['user_id']} uploaded $filename");
    echo json_encode([
        'url' => '/uploads/books/' . $filename,
        'size' => filesize($destination),
        'message' => 'Upload successful',
    ]);
}
