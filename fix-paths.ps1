# Fix page.tsx: should be ../components/ not ../../components/
$f = "C:\Openclaw\projects\renovation-tracker\src\app\page.tsx"
$c = [System.IO.File]::ReadAllText($f)
$c = $c -replace "from '../../components/", "from '../components/"
[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host "Fixed: page.tsx"

# Fix projects/page.tsx: should be ../../components/
$f = "C:\Openclaw\projects\renovation-tracker\src\app\projects\page.tsx"
$c = [System.IO.File]::ReadAllText($f)
# It was already ../components/ which is wrong, should be ../../components/
$c = $c -replace "from '../components/", "from '../../components/"
[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host "Fixed: projects/page.tsx"

# Fix [projectId]/page.tsx: should be ../../../components/
$f = "C:\Openclaw\projects\renovation-tracker\src\app\projects\[projectId]\page.tsx"
$c = [System.IO.File]::ReadAllText($f)
# It was ../../components/ which is wrong, should be ../../../components/
$c = $c -replace "from '../../components/", "from '../../../components/"
[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host "Fixed: [projectId]/page.tsx"

Write-Host "All done"