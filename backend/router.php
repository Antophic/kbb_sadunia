<?php
// router.php for local PHP built-in server
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Serve files from uploads directory
if (strpos($uri, '/uploads/') === 0) {
    $filePath = __DIR__ . $uri;
    if (file_exists($filePath) && is_file($filePath)) {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml'
        ];
        
        $mime = $mimeTypes[$extension] ?? mime_content_type($filePath) ?? 'application/octet-stream';
        header("Content-Type: $mime");
        readfile($filePath);
        return true;
    }
    http_response_code(404);
    echo "File not found.";
    return true;
}

// Route all other requests to api/index.php
$_SERVER['SCRIPT_NAME'] = '/api/index.php';
require __DIR__ . '/api/index.php';
