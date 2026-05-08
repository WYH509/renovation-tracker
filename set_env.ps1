$dbUrl = "postgres://postgres.gktybeixadifuxyoober:tNEW4f8phM12tJ6G@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
$vercelToken = $env:VERCEL_TOKEN
if (-not $vercelToken) {
    Write-Host "VERCEL_TOKEN not found, using OIDC token from .env.local"
}
$headers = @{ "Authorization" = "Bearer $vercelToken" }
$body = @{
    keys = @{
        DATABASE_URL = @{
            value = $dbUrl
            type = "encrypted"
        }
    }
} | ConvertTo-Json -Depth 10
$projectId = "prj_8oG4vjtUpT7piLLttMTFMVpvPkrv"
$url = "https://api.vercel.com/v2/projects/$projectId/env?teamId=team_dU26c4Ro8k8Kon6F99hTE6Al"
Invoke-RestMethod -Uri $url -Method POST -Headers $headers -ContentType "application/json" -Body $body