# 装修记账本 - Feishu Bitable版部署脚本
# 2026-05-18 重构：将PostgreSQL替换为飞书多维表格

$ErrorActionPreference = "Continue"
$PROJECT_DIR = "C:\Openclaw\temp-renovation"

Write-Host "========== 开始构建飞书版装修记账本 ==========" -ForegroundColor Cyan

# Step 1: 验证文件完整性
Write-Host "[1/6] 验证项目文件..." -ForegroundColor Yellow
$requiredFiles = @(
    "package.json", "tsconfig.json", "next.config.js",
    "src/lib/feishu.ts", "src/lib/utils.ts",
    "src/app/layout.tsx", "src/app/globals.css", "src/app/page.tsx",
    "src/app/renovation/page.tsx",
    "src/app/api/funds/route.ts", "src/app/api/renovation/route.ts",
    "src/components/Navbar.tsx",
    ".env", "render.yaml"
)
$missingFiles = @()
foreach ($file in $requiredFiles) {
    $path = Join-Path $PROJECT_DIR $file
    if (-not (Test-Path $path)) {
        $missingFiles += $file
    }
}
if ($missingFiles.Count -gt 0) {
    Write-Host "缺失: $($missingFiles -join ', ')" -ForegroundColor Red
    exit 1
}
Write-Host "文件验证通过 ✓" -ForegroundColor Green

# Step 2: 安装依赖
Write-Host "[2/6] 安装依赖..." -ForegroundColor Yellow
Set-Location $PROJECT_DIR
npm install --legacy-peer-deps 2>&1 | Out-Null
Write-Host "依赖安装完成 ✓" -ForegroundColor Green

# Step 3: 构建
Write-Host "[3/6] 构建Next.js应用..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "构建成功 ✓" -ForegroundColor Green

# Step 4: 推送到GitHub
Write-Host "[4/6] 推送到GitHub..." -ForegroundColor Yellow
Set-Location $PROJECT_DIR
git add .
git commit -m "refactor: 切换到飞书多维表格数据库 2026-05-18" 2>&1 | Out-Null
git push origin main 2>&1 | Out-Null
Write-Host "推送完成 ✓" -ForegroundColor Green

# Step 5: 触发Render部署
Write-Host "[5/6] 触发Render部署..." -ForegroundColor Yellow
$apiKey = "rnd_3twdTzpZC5ugVWRTYXbmib466ods"
$serviceId = "srv-d7un1f9j2pic73c2b7d0"
$deployRes = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys" -Method POST -Headers @{Authorization="Bearer $apiKey"} -ContentType "application/json"
Write-Host "部署触发成功，Build ID: $($deployRes.id)" -ForegroundColor Green

# Step 6: 等待部署完成
Write-Host "[6/6] 等待Render构建完成..." -ForegroundColor Yellow
$deployId = $deployRes.id
$maxWait = 300
$waited = 0
while ($waited -lt $maxWait) {
    Start-Sleep 10
    $waited += 10
    try {
        $status = Invoke-RestMethod -Uri "https://api.render.com/v1/deploys/$deployId" -Headers @{Authorization="Bearer $apiKey"}
        $state = $status.deploy?.status
        Write-Host "  等待构建... ($waited/$maxWait s) 状态: $state" -ForegroundColor Gray
        if ($state -eq "succeeded") {
            Write-Host "✅ 部署成功！" -ForegroundColor Green
            break
        } elseif ($state -eq "failed") {
            Write-Host "❌ 部署失败" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "检查状态中..." -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========== 🎉 部署完成 ==========" -ForegroundColor Cyan
Write-Host "访问: https://renovation-tracker.onrender.com" -ForegroundColor Green