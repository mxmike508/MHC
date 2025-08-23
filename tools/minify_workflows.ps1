param(
    [string]$Root = $(Split-Path $PSScriptRoot -Parent)
)

Write-Host "Minifying workflows under: $Root" -ForegroundColor Cyan

# Collect candidate JSON files (skip existing .min.json)
$patterns = @("*Workflow*.json", "Core_Chat_Test*.json")
$files = @{}
foreach ($pattern in $patterns) {
    Get-ChildItem -Path $Root -Include $pattern -Recurse -File |
        Where-Object { $_.Name -notlike "*.min.json" } |
        ForEach-Object { $files[$_.FullName] = $_ }
}

if ($files.Count -eq 0) {
    Write-Host "No workflow JSON files found to minify." -ForegroundColor Yellow
    return
}

$files.Values | ForEach-Object {
    $inPath = $_.FullName
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
    $outPath = Join-Path $_.DirectoryName ("{0}.min.json" -f $baseName)

    try {
        Get-Content -Raw $inPath |
            ConvertFrom-Json |
            ConvertTo-Json -Compress -Depth 100 |
            Set-Content -Path $outPath -Encoding utf8
        Write-Host ("Minified: {0} -> {1}" -f $_.Name, (Split-Path $outPath -Leaf)) -ForegroundColor Green
    }
    catch {
        Write-Warning ("Failed to minify {0}: {1}" -f $inPath, $_)
    }
}

Write-Host "Done." -ForegroundColor Cyan
