$file = "C:\Openclaw\projects\renovation-tracker\src\app\projects\[projectId]\page.tsx"
$content = [System.IO.File]::ReadAllText($file)
$content = $content -replace "from '@/components/ItemList'", "from '../../components/ItemList'"
$content = $content -replace "from '@/components/ItemForm'", "from '../../components/ItemForm'"
[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done"