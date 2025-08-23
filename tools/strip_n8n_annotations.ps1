param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [string]$OutputPath
)

# Resolve full paths for reliability
$InputPath = (Resolve-Path -LiteralPath $InputPath).Path
if (-not $OutputPath -or $OutputPath.Trim() -eq '') {
  $dir = Split-Path -Parent $InputPath
  $name = [System.IO.Path]::GetFileNameWithoutExtension($InputPath)
  $OutputPath = Join-Path $dir ("$name.SAN-CORE.min.json")
} else {
  $outDir = Split-Path -Parent $OutputPath
  if (-not (Test-Path -LiteralPath $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
  $outFile = Split-Path -Leaf $OutputPath
  $OutputPath = Join-Path $outDir $outFile
}

if (-not (Test-Path -LiteralPath $InputPath)) {
  Write-Error "Input file not found: $InputPath"
  exit 1
}

try {
  $raw = Get-Content -LiteralPath $InputPath -Raw -Encoding UTF8
} catch {
  Write-Error "Failed reading input: $($_.Exception.Message)"
  exit 2
}

try {
  $json = $raw | ConvertFrom-Json
} catch {
  Write-Error "JSON parse failed: $($_.Exception.Message)"
  exit 3
}

$removedSticky = 0
$removedNotes = 0
$removedNotesInFlow = 0
$removedPinData = 0

# Remove top-level pinData if present
if ($json.PSObject.Properties.Name -contains 'pinData') {
  $json.PSObject.Properties.Remove('pinData') | Out-Null
  $removedPinData++
}

# Filter out sticky notes and strip note fields from remaining nodes
$newNodes = @()
foreach ($n in $json.nodes) {
  if ($null -eq $n) { continue }
  if ($n.type -eq 'n8n-nodes-base.stickyNote') {
    $removedSticky++
    continue
  }
  if ($n.PSObject.Properties.Match('notes').Count -gt 0) {
    $n.PSObject.Properties.Remove('notes') | Out-Null
    $removedNotes++
  }
  if ($n.PSObject.Properties.Match('notesInFlow').Count -gt 0) {
    $n.PSObject.Properties.Remove('notesInFlow') | Out-Null
    $removedNotesInFlow++
  }
  $newNodes += $n
}
$json.nodes = $newNodes

# Emit compact JSON
try {
  $out = $json | ConvertTo-Json -Depth 100 -Compress
} catch {
  Write-Error "Failed to serialize JSON: $($_.Exception.Message)"
  exit 4
}

try {
  $out | Set-Content -LiteralPath $OutputPath -Encoding UTF8
} catch {
  Write-Error "Failed writing output: $($_.Exception.Message)"
  exit 5
}

Write-Output ("Done. Output: {0}" -f $OutputPath)
Write-Output ("Removed: stickyNotes={0}, notesFields={1}, notesInFlowFields={2}, pinData={3}" -f $removedSticky, $removedNotes, $removedNotesInFlow, $removedPinData)
