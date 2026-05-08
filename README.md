# 装修记账本 (Renovation Tracker)

🏠 装修花费追踪管理应用 | iPhone Safari可用 | 云端数据永久存储

## 功能特性

✅ **项目管理** - 创建/编辑/删除装修项目  
✅ **施工板块** - 6大板块：水电/泥瓦/木工/油漆/安装/软装  
✅ **采购管理** - 录入采购项、单位、数量、单价、总价  
✅ **付款追踪** - 记录已付款、付款日期，状态自动计算（未付/部分/已付清）  
✅ **到期提醒** - 设置提前N天提醒，自动计算提醒日期  
✅ **费用统计** - 按板块分类汇总，饼图/柱状图可视化  
✅ **数据导出** - Excel和PDF格式导出  
✅ **移动适配** - iPhone/Android完美支持  

## 技术栈

- **前端**: Next.js 14 + React + TailwindCSS + Recharts  
- **后端**: Next.js API Routes + Prisma ORM  
- **数据库**: PostgreSQL  
- **托管**: Render.com (免费层)  

## 快速部署到 Render

### 步骤1: 创建GitHub仓库

```bash
cd C:\Openclaw\projects\renovation-tracker
git init
git add .
git commit -m "装修记账本"
# 推送到GitHub（需要你手动创建空仓库）
git remote add origin https://github.com/YOUR_USERNAME/renovation-tracker.git
git push -u origin main
```

### 步骤2: 在Render部署

1. 登录 https://render.com
2. 点击 **New +** → **Blueprint**
3. 连接你的GitHub仓库
4. Render会自动检测 `render.yaml` 并部署

### 步骤3: 配置数据库

1. 在Render创建 **PostgreSQL** 数据库（免费层，Singapore区域）
2. 复制Internal Database URL
3. 部署Web Service时添加环境变量 `DATABASE_URL`

### 步骤4: 完成部署

Render会自动：
- 安装依赖
- 生成Prisma Client  
- 构建Next.js应用
- 启动服务

部署完成后，你会获得一个公开URL，例如：
`https://renovation-tracker.onrender.com`

## 本地开发

```bash
cd C:\Openclaw\projects\renovation-tracker
npm install
npx prisma generate
npm run dev
# 访问 http://localhost:3000
```

## 环境变量

`.env.example`:
```
DATABASE_URL="postgresql://username:password@host:5432/dbname"
NODE_ENV=production
```

## 数据库Schema

项目包含6个数据模型：
- **Project** - 装修项目
- **Category** - 施工板块（6大板块）
- **MaterialType** - 材料分类  
- **Item** - 采购项（含付款进度、提醒日期）
- **Expense** - 费用记录
- **Reminder** - 提醒记录

## 核心业务逻辑

**付款状态计算**:
- `paidAmount = 0` → 未付款 (unpaid)
- `0 < paidAmount < totalPrice` → 部分付款 (partial)
- `paidAmount >= totalPrice` → 已付清 (paid)

**提醒日期计算**:
- `reminderDate = expectedDeliveryDate - reminderDays`

**费用统计**:
- 按category分组汇总totalPrice和paidAmount
- 计算总花费、已付款、待付款

---

Made with ❤️ for 装修人