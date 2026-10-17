<?php
/**
 * KBB Sadunia - Database Backup Script
 * Run this script via CLI to backup the database
 * Usage: php backend/scripts/backup.php
 */

require_once __DIR__ . '/../config/database.php';

if (php_sapi_name() !== 'cli') {
    die("Script ini harus dijalankan dari command line.\n");
}

echo "Starting Database Backup...\n";

$host = DB_HOST;
$user = DB_USER;
$pass = DB_PASS;
$name = DB_NAME;

$backupDir = __DIR__ . '/../backups';
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

$date = date('Y-m-d_H-i-s');
$filename = $backupDir . '/' . $name . '_backup_' . $date . '.sql';

// For XAMPP/Laragon on Windows, mysqldump should be in PATH or we just call it directly.
// In Laragon, the terminal has mysqldump in path.
$passwordArg = empty($pass) ? "" : "-p\"{$pass}\"";
$command = "mysqldump -h {$host} -u {$user} {$passwordArg} {$name} > \"{$filename}\"";

// Hide password in output
$safeCommand = "mysqldump -h {$host} -u {$user} -p**** {$name} > \"{$filename}\"";
echo "Executing: $safeCommand\n";

system($command, $output);

if ($output === 0) {
    echo "✅ Backup Successful!\n";
    echo "File saved to: {$filename}\n";
} else {
    echo "❌ Backup Failed. Exit code: $output\n";
    echo "Make sure 'mysqldump' is installed and added to your system PATH.\n";
}
