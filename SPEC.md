# 装修花费记账管理APP - 产品规格书

## 1. 项目概述

- **项目名称**：装修记账本 (Renovation Tracker)
- **类型**：带后端数据库的全栈WebApp
- **核心功能**：装修项目拆分、材料采购管理、费用跟踪、智能提醒、数据可视化
- **目标用户**：正在进行装修的用户，追踪装修花费和进度
- **技术栈**：Next.js (前端) + Express/Node.js (后端) + PostgreSQL (数据库) + Render (部署)

---

## 2. 数据库设计

### 数据模型

#### 2.1 项目表 (projects)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| name | VARCHAR(255) | 项目名称 |
| description | TEXT | 项目描述 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 2.2 施工板块表 (categories)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| project_id | INTEGER FK | 所属项目 |
| name | VARCHAR(255) | 板块名称（如：水电工程、泥瓦工程） |
| sort_order | INTEGER | 排序 |
| created_at | TIMESTAMP | 创建时间 |

#### 2.3 材料分类表 (material_types)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| project_id | INTEGER FK | 所属项目 |
| name | VARCHAR(255) | 分类名称（如：瓷砖、地板、门窗） |
| parent_id | INTEGER | 父分类（可为空） |
| created_at | TIMESTAMP | 创建时间 |

#### 2.4 采购项目表 (items)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| project_id | INTEGER FK | 所属项目 |
| category_id | INTEGER FK | 施工板块 |
| material_type_id | INTEGER FK | 材料分类 |
| name | VARCHAR(255) | 采购项目名称 |
| unit | VARCHAR(50) | 单位 |
| quantity | DECIMAL(10,2) | 数量 |
| unit_price | DECIMAL(10,2) | 单价 |
| total_price | DECIMAL(10,2) | 总价 |
| paid_amount | DECIMAL(10,2) | 已付款 |
| payment_status | VARCHAR(50) | 付款状态（未付款/部分付款/已付清） |
| payment_date | DATE | 付款日期 |
| expected_delivery_date | DATE | 预计交货日期 |
| actual_completion_date | DATE | 实际完工日期 |
| notes | TEXT | 备注 |
| is_completed | BOOLEAN | 是否完工 |
| reminder_days | INTEGER | 提前提醒天数 |
| reminder_date | DATE | 提醒日期 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 2.5 费用记录表 (expenses)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| project_id | INTEGER FK | 所属项目 |
| item_id | INTEGER FK | 关联采购项目（可为空） |
| category_id | INTEGER FK | 施工板块 |
| amount | DECIMAL(10,2) | 金额 |
| expense_date | DATE | 费用日期 |
| description | VARCHAR(255) | 描述 |
| created_at | TIMESTAMP | 创建时间 |

#### 2.6 提醒表 (reminders)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| item_id | INTEGER FK | 关联采购项目 |
| reminder_date | DATE | 提醒日期 |
| message | TEXT | 提醒内容 |
| is_completed | BOOLEAN | 是否已处理 |
| created_at | TIMESTAMP | 创建时间 |

---

## 3. 页面结构

### 3.1 首页仪表盘 (/)
- 项目总览卡片
- 总花费统计
- 待付款统计
- 即将到期提醒
- 费用分类饼图
- 最近采购列表

### 3.2 项目管理 (/projects)
- 项目列表
- 新增/编辑项目
- 项目详情

### 3.3 施工板块 (/categories/:projectId)
- 板块列表与编辑
- 按板块查看采购项

### 3.4 采购管理 (/items/:projectId)
- 采购项目列表
- 筛选：按板块、按分类、按状态
- 新增/编辑采购项
- 付款进度追踪

### 3.5 数据报表 (/reports/:projectId)
- 费用趋势折线图
- 分类费用占比饼图
- 各板块花费柱状图
- 数据导出Excel/PDF按钮

### 3.6 提醒中心 (/reminders/:projectId)
- 待处理提醒列表
- 已完成提醒历史

---

## 4. 功能详细

### 4.1 项目管理
- 创建装修项目（名称、描述）
- 编辑/删除项目
- 查看项目总览

### 4.2 施工板块管理
- 预设板块：水电工程、泥瓦工程、木工工程、油漆工程、安装工程、软装采购
- 支持自定义板块
- 拖拽排序

### 4.3 材料分类
- 按装修材料类型分类
- 支持多级分类

### 4.4 采购项目
- 手动录入采购项
- 关联施工板块和材料分类
- 填写：名称、单位、数量、单价、总价
- 填写：已付款金额、付款进度、付款日期
- 填写：预计交货日期、完工日期
- 设置提醒（按天数或具体日期）
- 标记完工状态

### 4.5 智能提醒
- 根据设置的提醒日期自动提醒
- 提前N天提醒施工进度
- 提醒供货商交货

### 4.6 数据统计
- 按施工板块分类统计
- 按材料类型分类统计
- 总花费/已付款/待付款
- 费用趋势

### 4.7 数据导出
- 导出Excel（所有数据）
- 导出PDF（报表）

---

## 5. UI设计

### 设计风格
- 现代简约风格，扁平化设计
- 配色方案：
  - 主色：#2563EB（蓝色，专业感）
  - 辅助色：#10B981（绿色，完成状态）
  - 警告色：#F59E0B（橙色，提醒）
  - 危险色：#EF4444（红色，逾期）
  - 背景色：#F8FAFC（浅灰白）
  - 文字色：#1E293B（深灰）

### 字体
- 标题：Inter, -apple-system, sans-serif
- 正文：Inter, -apple-system, sans-serif

### 响应式
- 移动端优先设计
- 支持iPhone Safari访问
- 触摸友好的交互

---

## 6. API设计

### 认证
- 简单token认证（后续扩展）

### 接口列表

```
GET    /api/projects              - 获取所有项目
POST   /api/projects             - 创建项目
GET    /api/projects/:id         - 获取项目详情
PUT    /api/projects/:id         - 更新项目
DELETE /api/projects/:id         - 删除项目

GET    /api/projects/:id/categories     - 获取板块列表
POST   /api/projects/:id/categories      - 创建板块
PUT    /api/categories/:id              - 更新板块
DELETE /api/categories/:id              - 删除板块

GET    /api/projects/:id/items          - 获取采购项列表
POST   /api/projects/:id/items          - 创建采购项
PUT    /api/items/:id                    - 更新采购项
DELETE /api/items/:id                    - 删除采购项

GET    /api/projects/:id/expenses       - 获取费用记录
POST   /api/projects/:id/expenses       - 创建费用记录
DELETE /api/expenses/:id                 - 删除费用记录

GET    /api/projects/:id/reminders      - 获取提醒列表
PUT    /api/reminders/:id/complete      - 标记提醒完成

GET    /api/projects/:id/stats          - 获取统计数据
GET    /api/projects/:id/export/excel    - 导出Excel
GET    /api/projects/:id/export/pdf      - 导出PDF
```

---

## 7. 部署

### 平台
- Render.com（免费层）

### 数据库
- Render PostgreSQL（免费层）

### 部署流程
1. 创建Render Web Service
2. 连接GitHub仓库
3. 配置环境变量
4. 自动部署

---

## 8. 验收标准

- [ ] 可以创建装修项目
- [ ] 可以管理施工板块
- [ ] 可以录入采购项目并关联板块
- [ ] 可以追踪付款进度
- [ ] 可以设置提醒
- [ ] 可以查看数据统计图表
- [ ] 可以导出Excel和PDF
- [ ] 移动端界面美观可用
- [ ] 数据持久化存储在PostgreSQL