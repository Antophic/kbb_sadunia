<?php
// Usage: php scripts/build_favicons.php (PHP GD). Keep the original masthead untouched.
if (PHP_SAPI !== 'cli') exit(1);
$public = dirname(__DIR__) . '/frontend/public';
$logo = imagecreatefrompng("$public/logo-kbb.png");
if (imagesx($logo) !== 502 || imagesy($logo) !== 497) {
    throw new RuntimeException('Recheck the shield bounds for the new logo.');
}
// Isolate the actual shield; the lettering immediately below it is too small for a tab.
imagealphablending($logo, false);
imagefilledrectangle($logo, 305, 241, 352, 265, imagecolorallocatealpha($logo, 0, 0, 0, 127));
$frames = [];
foreach ([16, 32, 48, 96, 180] as $size) {
    $icon = imagecreatetruecolor($size, $size);
    imagealphablending($icon, false);
    imagesavealpha($icon, true);
    imagefill($icon, 0, 0, imagecolorallocatealpha($icon, 0, 0, 0, 127));
    $height = max(1, (int)round($size * 0.96));
    $width = (int)round($height * 204 / 246);
    imagecopyresampled($icon, $logo, intdiv($size - $width, 2), intdiv($size - $height, 2),
        147, 20, $width, $height, 204, 246);
    ob_start();
    imagepng($icon);
    $png = ob_get_clean();
    if ($size <= 48) $frames[$size] = $png;
    if ($size === 96) file_put_contents("$public/favicon-kbb-96.png", $png);
    if ($size === 180) file_put_contents("$public/apple-touch-icon.png", $png);
}
$directory = pack('v3', 0, 1, count($frames));
$offset = 6 + 16 * count($frames);
foreach ($frames as $size => $png) {
    $directory .= pack('C4v2V2', $size, $size, 0, 0, 1, 32, strlen($png), $offset);
    $offset += strlen($png);
}
file_put_contents("$public/favicon.ico", $directory . implode('', $frames));
