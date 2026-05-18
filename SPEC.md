# 资产管家 (Asset Manager) - 产品规格书

## 1. 项目概述

- **项目名称**：资产管家
- **类型**：带飞书多维表格后端数据库的全栈 WebApp
- **核心功能**：装修支出记账、基金持仓管理
- **目标用户**：家庭资产管理，追踪装修花费和基金投资
- **技术栈**：Next.js 14 (前端) + 飞书多维表格 API (数据库) + Tailwind CSS (样式) + Render (部署)
- **GitHub**：https://github.com/WYH509/renovation-tracker
- **在线地址**：https://renovation-tracker-s4wl.onrender.com

---

## 2. 数据架构

### 2.1 装修支出数据库
- **App Token**：`IoG4bZmqraEcKZsHOdVciaA9nyb`
- **Table ID**：`tblZOMEKoLLIDnHV`
- **字段**：装修管理数据库（文本，主键）、项目名称、分类（多选）、金额（数字）、购买日期（日期）、状态（多选）、备注（文本）

### 2.2 基金持仓数据库
- **App Token**：`YKR1bf0p0ae3BcsG4cCcFJN9nIg`
- **Table ID**：`tblU8GoozI25dtPs`
- **字段**：基金持仓数据库（文本，主键）、基金名称、购买日期（日期）、购买金额、上月净值、持仓份额、今日净值、上周净值、年初净值、累计分红

---

## 3. 页面结构

### 3.1 首页 (/)
- 顶部 Tab 切换：总览 / 基金 / 装修
- **总览 Tab**：基金总市值 + 收益、装修总支出 + 已付/待付
- **基金 Tab**：持有基金列表、各基金收益统计
- **装修 Tab**：装修支出分类汇总、状态分布

### 3.2 装修页面 (/renovation)
- 装修支出列表（可查看详情）
- 顶部添加按钮 → 添加支出弹窗
- 支持分类、状态筛选

---

## 4. 技术设计

### 4.1 前端计算模式
- Next.js App Router，所有数据计算在前端完成
- 飞书多维表格仅作原始数据存储
- 前端实时读取飞书数据并计算统计结果

### 4.2 API 路由
- `GET /api/funds` - 获取基金数据及统计
- `GET /api/renovation` - 获取装修数据及统计
- `POST /api/funds` - 新增基金记录
- `POST /api/renovation` - 新增装修记录

### 4.3 认证
- 使用 `tenant_access_token`（飞书自建应用）
- App Token + App Secret 获取
- 需要在 Render Dashboard 配置 `FEISHU_APP_ID` 和 `FEISHU_APP_SECRET`

### 4.4 iOS 风格
- 系统字体（-apple-system）
- iOS 颜色系统（#007AFF 等）
- 卡片式布局、圆角 10px
- 底部 Tab Bar 固定导航
- 触摸友好的大按钮

---

## 5. 环境变量

| 变量 | 说明 | 状态 |
|------|------|------|
| FEISHU_APP_ID | 飞书自建应用 App ID | **需要配置** |
| FEISHU_APP_SECRET | 飞书自建应用 App Secret | **需要配置** |
| FEISHU_FUND_APP_TOKEN | 基金多维表格 App Token | 已配置 |
| FEISHU_FUND_TABLE_ID | 基金多维表格 Table ID | 已配置 |
| FEISHU_RENOVATION_APP_TOKEN | 装修多维表格 App Token | 已配置 |
| FEISHU_RENOVATION_TABLE_ID | 装修多维表格 Table ID | 已配置 |
| NODE_ENV | production | 已配置 |

---

## 6. 部署

### 6.1 Render 部署
- **Service ID**：`srv-d7un1f9j2pic73c2b7d0`
- **Dashboard**：https://dashboard.render.com/web/srv-d7un1f9j2pic73c2b7d0
- **自动部署**：推送到 GitHub main 分支自动触发

### 6.2 部署流程
1. 代码推送到 GitHub
2. Render 自动构建（约 2-3 分钟）
3. 验证 `/api/funds` 和 `/api/renovation` 返回数据

---

## 7. 当前状态

### ✅ 已完成
- 首页三 Tab 架构（总览/基金/装修）
- 基金数据读取和收益计算
- 装修数据读取和支出统计
- iOS 风格 UI
- 飞书多维表格 API 集成

### ⚠️ 阻塞中
- **飞书 App Secret 未配置**：Render 上 FEISHU_APP_SECRET 为占位值
- 需要用户提供真实的飞书自建应用 App ID 和 App Secret

### 📋 待完成（根据需求）
- 大按钮板块式首页（每个板块一张大卡片）
- 基金模块的完整 CRUD
- 装修模块的详情/编辑/删除
- 权限控制（仅房主可编辑）