# MathTree — 数学知识图谱

一个可视化的数学知识图谱 Web 应用。将数学概念表示为**图**：节点是数学实体或定理，边是从中萃取出的**性质**。

## 快速开始

```bash
# 安装依赖（建议配置清华镜像）
npm config set registry https://registry.npmmirror.com
npm install

# 启动开发服务器（前后端同时）
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3001
- 首次启动自动加载种子数据（微积分+Fourier分析示例）

## 核心概念

### 节点

| 类型 | 含义 | 示例 |
|------|------|------|
| **I** (Item) | 数学实体、定义 | 实数、L²空间、指数函数 |
| **T** (Theorem) | 定理、结论 | 微积分基本定理、Parseval恒等式 |

### 边

统一的**性质**模型：有向边 A → B (label=P) 表示 **"要推出 B，需要 A 的性质 P"**。

- 边从任意类型节点指向任意类型节点
- 边的标签必须在源节点的性质表中
- 性质表可动态扩展

### 多证明

一个定理可以有多种证明方式，每条入边关联到某个证明。系统自动选择"最浅"的证明作为默认展示。

### M（数学思想）

标注在节点上的数学思想/技巧标签，如 ε-δ、数学归纳法、正交分解。可用于搜索和筛选。

### 域

层级分组标签，用于空间组织（如 分析学 > 微积分 > 导数）。

## 项目结构

```
MathTree/
├── backend/           # Node.js + Express + SQLite
│   └── src/
│       ├── db/        # schema.sql, seed.sql, database.ts
│       ├── routes/    # RESTful API
│       └── lib/       # 校验、布局算法
├── frontend/          # React + Vite + Cytoscape.js
│   └── src/
│       ├── components/
│       │   ├── Graph/        # 图可视化核心
│       │   ├── NodeDetail/   # 节点详情面板
│       │   ├── Dialogs/      # 创建节点/边对话框
│       │   ├── Search/       # 搜索
│       │   └── Layout/       # 整体布局
│       ├── stores/   # Zustand 状态管理
│       └── utils/    # Cytoscape 样式/布局配置
└── package.json      # monorepo 根配置
```

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+N` | 创建新节点 |
| `Ctrl+E` | 创建新边 |
| `Delete` | 删除选中节点/边 |
| `Escape` | 取消选择 |
| `Ctrl+F` | 聚焦搜索框 |
| `Ctrl+S` | 导出图数据 |
| `1` / `2` / `3` | 切换视图（图/列表/域） |

## API 概览

```
GET    /api/nodes                  节点列表
POST   /api/nodes                  创建节点
GET    /api/nodes/:id              节点详情（含性质、证明、域、M标签）
PUT    /api/nodes/:id              更新节点
DELETE /api/nodes/:id              删除节点

POST   /api/edges                  创建边（校验性质表）
DELETE /api/edges/:id              删除边

GET    /api/proofs?theorem_id=     获取证明列表
POST   /api/proofs                 创建证明

GET    /api/properties             全局性质列表
GET    /api/domains                域层级树
GET    /api/math-ideas             M标签列表

GET    /api/search?q=              全文搜索
GET    /api/search/property/:name  性质搜索
GET    /api/graph/export           导出全图
POST   /api/graph/import           导入全图
```

## 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 图可视化 | Cytoscape.js + dagre |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS |
| 数学渲染 | KaTeX + react-markdown |
| 后端 | Node.js + Express |
| 数据库 | SQLite (better-sqlite3) |
