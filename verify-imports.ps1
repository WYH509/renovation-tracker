# Verify all component imports
$projectDir = "C:\Openclaw\projects\renovation-tracker"

$files = @(
    "$projectDir\src\app\layout.tsx",
    "$projectDir\src\app\page.tsx",
    "$projectDir\src\app\projects\page.tsx",
    "$projectDir\src\app\projects\[projectId]\page.tsx"
)

foreach ($f in $files) {
    $lines = [System.IO.File]::ReadAllLines($f)
    $imports = $lines | Select-String -Pattern "from.*components" | ForEach-Object { $_.Line }
    Write-Host "$($f.Split('\')[-1]):"
    $imports | ForEach-Object { Write-Host "  $_" }
}