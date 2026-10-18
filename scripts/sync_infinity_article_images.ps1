param(
    [string]$ReferenceBaseUrl = 'https://kbb-banjarsadunia.site.je',
    [string]$ProductionBaseUrl = 'https://kbbsadunia.com',
    [string]$OutputDirectory = 'frontend/public/article_images/infinity-reference-20261018',
    [string]$ManifestPath = 'scripts/infinity-article-images-20261018.json',
    [string]$SqlPath = 'backend/database/migrate_infinity_article_images_20261018.sql'
)

$ErrorActionPreference = 'Stop'

function ConvertFrom-HexString {
    param([Parameter(Mandatory)][string]$Hex)

    $bytes = New-Object byte[] ($Hex.Length / 2)
    for ($index = 0; $index -lt $bytes.Length; $index++) {
        $bytes[$index] = [Convert]::ToByte($Hex.Substring($index * 2, 2), 16)
    }
    return $bytes
}

function Get-InfinityCookieFromChallenge {
    param([Parameter(Mandatory)][string]$ChallengeHtml)

    $matches = [regex]::Matches($ChallengeHtml, 'toNumbers\("([0-9a-f]{32})"\)')
    if ($matches.Count -lt 3) {
        throw 'InfinityFree challenge values were not found.'
    }

    $key = ConvertFrom-HexString $matches[0].Groups[1].Value
    $iv = ConvertFrom-HexString $matches[1].Groups[1].Value
    $cipherText = ConvertFrom-HexString $matches[2].Groups[1].Value

    $aes = [System.Security.Cryptography.Aes]::Create()
    $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
    $aes.Padding = [System.Security.Cryptography.PaddingMode]::None
    $aes.Key = $key
    $aes.IV = $iv
    try {
        $plainText = $aes.CreateDecryptor().TransformFinalBlock($cipherText, 0, $cipherText.Length)
    }
    finally {
        $aes.Dispose()
    }

    return ([BitConverter]::ToString($plainText)).Replace('-', '').ToLowerInvariant()
}

function Get-InfinityChallengeCookie {
    param([Parameter(Mandatory)][string]$BaseUrl)

    $challenge = (Invoke-WebRequest -Uri "$BaseUrl/" -UseBasicParsing -TimeoutSec 30).Content
    return Get-InfinityCookieFromChallenge -ChallengeHtml $challenge
}

function Get-ReferenceBytes {
    param(
        [Parameter(Mandatory)][string]$Url,
        [Parameter(Mandatory)][string]$CookieValue
    )

    $currentCookie = $CookieValue
    $requestUrl = $Url

    for ($attempt = 1; $attempt -le 3; $attempt++) {
        $request = [System.Net.HttpWebRequest]::Create($requestUrl)
        $request.CookieContainer = New-Object System.Net.CookieContainer
        $request.CookieContainer.Add((New-Object System.Net.Cookie('__test', $currentCookie, '/', 'kbb-banjarsadunia.site.je')))
        $response = $request.GetResponse()
        try {
            $contentType = $response.ContentType
            $stream = $response.GetResponseStream()
            $memory = New-Object System.IO.MemoryStream
            try {
                $stream.CopyTo($memory)
                $bytes = $memory.ToArray()
            }
            finally {
                $memory.Dispose()
                $stream.Dispose()
            }
        }
        finally {
            $response.Dispose()
        }

        if ($contentType -like 'image/*') {
            return [pscustomobject]@{
                Bytes = $bytes
                ContentType = $contentType
            }
        }

        if ($contentType -notlike 'text/html*') {
            throw "Unexpected reference content type: $contentType"
        }

        $challengeHtml = [System.Text.Encoding]::UTF8.GetString($bytes)
        $currentCookie = Get-InfinityCookieFromChallenge -ChallengeHtml $challengeHtml
        $separator = if ($Url.Contains('?')) { '&' } else { '?' }
        $requestUrl = $Url + $separator + 'i=' + $attempt
    }

    throw "Reference image challenge did not resolve after 3 attempts: $Url"
}

$cookieValue = Get-InfinityChallengeCookie -BaseUrl $ReferenceBaseUrl
$webSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$webSession.Cookies.Add((New-Object System.Net.Cookie('__test', $cookieValue, '/', 'kbb-banjarsadunia.site.je')))

$referenceResponse = Invoke-WebRequest `
    -Uri "$ReferenceBaseUrl/api/articles?per_page=100&i=1" `
    -WebSession $webSession `
    -UseBasicParsing `
    -TimeoutSec 30
$referenceArticles = ($referenceResponse.Content | ConvertFrom-Json).data
$productionArticles = ((Invoke-WebRequest `
    -Uri "$ProductionBaseUrl/api/articles?per_page=100" `
    -UseBasicParsing `
    -TimeoutSec 30).Content | ConvertFrom-Json).data

$productionByTitle = @{}
foreach ($article in $productionArticles) {
    $productionByTitle[$article.title] = $article
}

$resolvedOutput = Join-Path (Get-Location) $OutputDirectory
New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null

$sha256 = [System.Security.Cryptography.SHA256]::Create()
$manifest = @()
$skipped = @()

try {
    foreach ($referenceArticle in ($referenceArticles | Sort-Object id)) {
        $productionArticle = $productionByTitle[$referenceArticle.title]
        if ($null -eq $productionArticle) {
            throw "Production article was not found: $($referenceArticle.title)"
        }

        $download = Get-ReferenceBytes `
            -Url ($ReferenceBaseUrl + $referenceArticle.image_url) `
            -CookieValue $cookieValue

        if ($download.ContentType -notlike 'image/*') {
            $skipped += [pscustomobject]@{
                production_id = $productionArticle.id
                reference_id = $referenceArticle.id
                title = $referenceArticle.title
                source_path = $referenceArticle.image_url
                content_type = $download.ContentType
            }
            continue
        }

        $sourcePath = ([string]$referenceArticle.image_url).Split('?')[0]
        $extension = [System.IO.Path]::GetExtension($sourcePath).ToLowerInvariant()
        if ($extension -notin @('.jpg', '.jpeg', '.png', '.webp', '.gif')) {
            throw "Unexpected image extension for article $($productionArticle.id): $extension"
        }

        $fileName = "article_$($productionArticle.id)$extension"
        $destination = Join-Path $resolvedOutput $fileName
        [System.IO.File]::WriteAllBytes($destination, $download.Bytes)
        $hash = ([BitConverter]::ToString($sha256.ComputeHash($download.Bytes))).Replace('-', '').ToLowerInvariant()

        $manifest += [pscustomobject]@{
            production_id = $productionArticle.id
            reference_id = $referenceArticle.id
            title = $referenceArticle.title
            source_url = $ReferenceBaseUrl + $referenceArticle.image_url
            deployed_path = "/article_images/infinity-reference-20261018/$fileName"
            content_type = $download.ContentType
            bytes = $download.Bytes.Length
            sha256 = $hash
        }
    }
}
finally {
    $sha256.Dispose()
}

$duplicateGroups = $manifest | Group-Object sha256 | Where-Object Count -gt 1
if ($duplicateGroups.Count -gt 0) {
    throw "Reference download contains $($duplicateGroups.Count) duplicate image groups."
}
if ($manifest.Count -ne 82 -or $skipped.Count -ne 0) {
    throw "Expected 82 valid reference images but downloaded $($manifest.Count) and skipped $($skipped.Count)."
}

$manifestDocument = [ordered]@{
    reference_base_url = $ReferenceBaseUrl
    generated_at = (Get-Date).ToString('o')
    downloaded_count = $manifest.Count
    skipped_count = $skipped.Count
    images = $manifest
    skipped = $skipped
}
$manifestDocument | ConvertTo-Json -Depth 5 | Set-Content -Path $ManifestPath -Encoding utf8

$sqlLines = @(
    '-- Use the exact article photos available on the InfinityFree reference site.',
    '-- The source paths and checksums are recorded in scripts/infinity-article-images-20261018.json.',
    'START TRANSACTION;',
    '',
    'UPDATE articles',
    'SET image_url = CASE id'
)
foreach ($image in ($manifest | Sort-Object production_id)) {
    $sqlLines += "    WHEN $($image.production_id) THEN '$($image.deployed_path)'"
}
$sqlLines += @(
    '    ELSE image_url',
    'END',
    'WHERE id IN (' + (($manifest.production_id | Sort-Object) -join ', ') + ');',
    '',
    'COMMIT;',
    '',
    'SELECT id, title, image_url',
    'FROM articles',
    'WHERE id IN (' + (($manifest.production_id | Sort-Object) -join ', ') + ')',
    'ORDER BY id;'
)
$sqlLines | Set-Content -Path $SqlPath -Encoding utf8

Write-Host "Downloaded $($manifest.Count) unique reference images."
Write-Host "Skipped $($skipped.Count) unavailable reference images."
Write-Host "Manifest: $ManifestPath"
Write-Host "SQL migration: $SqlPath"
