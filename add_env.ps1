$dbUrl = "postgres://postgres.gktybeixadifuxyoober:tNEW4f8phM12tJ6G@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
$tmpFile = "$env:TEMP\dburl_$PID.txt"
Set-Content -Path $tmpFile -Value $dbUrl -NoNewline
$inputRaw = Get-Content $tmpFile -Raw
$process = Start-Process -FilePath "vercel" -ArgumentList "env","add","DATABASE_URL","production","--yes" -NoNewWindow -Wait -PassThru -RedirectStandardInput $tmpFile
Remove-Item $tmpFile -ErrorAction SilentlyContinue
exit $process.ExitCode