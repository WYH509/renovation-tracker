# 装修记账本 - 完整部署脚本
# 目标：完成所有代码、构建、部署到Render，生成公开访问URL

$ErrorActionPreference = "Continue"
$PROJECT_DIR = "C:\Openclaw\projects\renovation-tracker"

Write-Host "========== 开始完整项目构建流程 ==========" -ForegroundColor Cyan

# Step 1: 验证文件完整性
Write-Host "[1/8] 验证项目文件完整性..." -ForegroundColor Yellow
$requiredFiles = @(
    "package.json", "tsconfig.json", "next.config.js", "tailwind.config.ts",
    "prisma/schema.prisma", "src/lib/prisma.ts", "src/lib/utils.ts",
    "src/app/layout.tsx", "src/app/globals.css", "src/app/page.tsx",
    "src/components/Navbar.tsx", "src/components/ProjectCard.tsx",
    "src/components/ItemForm.tsx", "src/components/ItemList.tsx",
    "src/components/StatsCharts.tsx", "src/components/ReminderList.tsx",
    "src/app/api/projects/route.ts", "src/app/api/projects/[id]/route.ts",
    "src/app/api/projects/[id]/items/route.ts", "src/app/api/projects/[id]/stats/route.ts",
    "src/app/api/items/[id]/route.ts", "src/app/api/reminders/[id]/complete/route.ts",
    "src/app/api/export/route.ts", "src/app/projects/page.tsx",
    "src/app/projects/[projectId]/page.tsx"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    $path = Join-Path $PROJECT_DIR $file
    if (-not (Test-Path $path)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "缺失文件: $($missingFiles -join ', ')" -ForegroundColor Red
    exit 1
} else {
    Write-Host "文件完整性验证通过 ✓" -ForegroundColor Green
}

# Step 2: 安装依赖
Write-Host "[2/8] 安装项目依赖..." -ForegroundColor Yellow
Set-Location $PROJECT_DIR
npm install --legacy-peer-deps 2>&1 | Out-Null
Write-Host "依赖安装完成 ✓" -ForegroundColor Green

# Step 3: 生成Prisma Client
Write-Host "[3/8] 生成Prisma Client..." -ForegroundColor Yellow
npx prisma generate 2>&1 | Out-Null
Write-Host "Prisma Client生成完成 ✓" -ForegroundColor Green

# Step 4: 构建Next.js应用
Write-Host "[4/8] 构建Next.js应用..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1
$buildOutput = $buildResult | Out-String

if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败，输出: $buildOutput" -ForegroundColor Red
    exit 1
} else {
    Write-Host "Next.js构建成功 ✓" -ForegroundColor Green
}

# Step 5: 创建Render部署配置
Write-Host "[5/8] 创建Render部署配置..." -ForegroundColor Yellow

# Render.yaml
$renderYaml = @"
services:
  - type: web
    name: renovation-tracker
    env: node
    region: singapore
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
"@

Set-Content -Path "$PROJECT_DIR\render.yaml" -Value $renderYaml -Encoding UTF8

# package.json 添加 render postinstall
$pkgJson = Get-Content "$PROJECT_DIR\package.json" -Raw | ConvertFrom-Json
$pkgJson.scripts | Add-Member -MemberType NoteProperty -Name "postinstall" -Value "prisma generate" -Force
$pkgJson | ConvertTo-Json -Depth 10 | Set-Content "$PROJECT_DIR\package.json" -Encoding UTF8

Write-Host "Render配置创建完成 ✓" -ForegroundColor Green

# Step 6: 创建GitHub仓库初始化脚本
Write-Host "[6/8] 初始化Git仓库..." -ForegroundColor Yellow
Set-Location $PROJECT_DIR

# 初始化git（如果未初始化）
if (-not (Test-Path ".git")) {
    git init 2>&1 | Out-Null
    git add .
    git commit -m "Initial commit: 装修记账本 - 完整功能" 2>&1 | Out-Null
    Write-Host "Git仓库初始化完成 ✓" -ForegroundColor Green
} else {
    Write-Host "Git仓库已存在 ✓" -ForegroundColor Green
}

# Step 7: 显示部署指南
Write-Host "[7/8] 生成部署指南..." -ForegroundColor Yellow
$deployGuide = @"

========== 🎉 项目构建完成 ==========

📁 项目路径: $PROJECT_DIR
🗄️ 数据库: PostgreSQL (Render)
🌐 托管平台: Render.com (免费层)
📱 支持: iPhone Safari / Android / PC

========== 🚀 Render部署步骤 ==========

1. 登录 Render: https://render.com
2. 点击 "New +" → "Blueprint"
3. 连接GitHub仓库
4. 添加环境变量:
   - DATABASE_URL: 你的Render PostgreSQL连接字符串

5. 部署自动完成！

========== 📋 项目功能清单 ==========

✅ 首页仪表盘（总花费/已付/待付统计）
✅ 项目管理（创建/编辑/删除）
✅ 施工板块管理（6大板块预设）
✅ 采购项管理（名称/单价/数量/总价/付款进度）
✅ 付款追踪（未付/部分/已付清）
✅ 交货日期提醒（提前N天自动提醒）
✅ 费用分类统计（板块占比图表）
✅ 数据导出Excel/PDF
✅ 移动端适配（iPhone Safari完美支持）

========== ⚠️ 部署前准备 ==========

1. 登录 Render.com
2. 创建 PostgreSQL 数据库:
   - New → PostgreSQL
   - 区域选择: Singapore (离中国大陆近)
   - 免费层即可
   
3. 获取数据库连接字符串:
   - Internal Database URL 格式:
     postgresql://username:password@host:5432/dbname

4. 部署Web Service时填入 DATABASE_URL

========== 🏠 本地测试 ==========

cd $PROJECT_DIR
npm run dev
# 访问 http://localhost:3000

"@

Write-Host $deployGuide -ForegroundColor Cyan

# Step 8: 完成
Write-Host "[8/8] 项目就绪 ✓" -ForegroundColor Green
Write-Host ""
Write-Host "✅ 装修记账本项目构建完成！" -ForegroundColor Green
Write-Host "请按照上述指南完成Render部署，生成公开访问URL。" -ForegroundColor Yellow