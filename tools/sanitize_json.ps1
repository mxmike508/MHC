param(
    [Parameter(Mandatory=$true)][string]$InputPath,
    [Parameter(Mandatory=$true)][string]$OutputPath,
    [switch]$SkipValidateJson
)

Write-Host "Sanitizing JSON: $InputPath -> $OutputPath" -ForegroundColor Cyan

if (!(Test-Path -LiteralPath $InputPath)) {
    throw "Input file not found: $InputPath"
}

# Read as raw text
$content = Get-Content -LiteralPath $InputPath -Raw

# Remove disallowed control characters (keep tab, newline, carriage-return)
# Range: \x00-\x08, \x0B, \x0C, \x0E-\x1F
$pattern = "[\x00-\x08\x0B\x0C\x0E-\x1F]"
$beforeLen = $content.Length
$sanitized = $content -replace $pattern, ''
$afterLen = $sanitized.Length
$removed = $beforeLen - $afterLen

if (-not $SkipValidateJson) {
    # Validate JSON by parsing; if it fails, throw
    try {
        $obj = $sanitized | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        Write-Error "Sanitized content is still not valid JSON: $($_.Exception.Message)"
        throw
    }
    # Re-emit minified JSON to ensure consistent formatting
    $min = $obj | ConvertTo-Json -Compress -Depth 100
} else {
    Write-Warning "Skipping JSON validation. Writing sanitized raw content."
    $min = $sanitized
}

# Ensure output directory exists
$dir = Split-Path -Parent $OutputPath
if ($dir -and !(Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

# Write output
$min | Set-Content -LiteralPath $OutputPath -Encoding UTF8

Write-Host ("Done. Removed {0} control character(s)." -f $removed) -ForegroundColor Green
