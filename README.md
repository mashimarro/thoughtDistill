# ThoughtDistill - AI辅助思路梳理系统

一个帮助用户通过AI对话梳理想法、沉淀结构化笔记的Web应用。

## ✨ 核心功能

- **记录想法**：快速记录灵感和碎片化思考
- **AI对话整理**：
  - 镜像反射：用你的原话重新组织想法
  - 苏格拉底式提问：多维度深入探索
  - 智能判断：自动识别何时可以生成笔记
- **结构化笔记**：自动生成包含核心观点、支撑理由、应用场景的原子笔记
- **笔记管理**：收集箱、笔记盒、归档，支持瀑布流和列表布局
- **管理后台**：查看用户数据和使用统计

## 🛠️ 技术栈

- **前端**：Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **后端**：Next.js API Routes
- **数据库**：Supabase (PostgreSQL)
- **认证**：Supabase Auth (匿名登录)
- **AI集成**：DeepSeek / 通义千问 (可切换)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/mashimarro/thoughtDistill.git
cd thoughtDistill
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入配置：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Provider (deepseek 或 qwen)
AI_PROVIDER=qwen
QWEN_API_KEY=your_qwen_api_key
# 或
DEEPSEEK_API_KEY=your_deepseek_api_key

# 管理后台密码
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

### 3. 初始化数据库

在 Supabase SQL Editor 中执行 `database-setup.sql`

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📖 详细文档

- [配置指南](SETUP.md)
- [下一步操作](NEXT_STEPS.md)
- [更新日志](UPDATE_LOG.md)

## 🎯 产品设计理念

- **降低门槛**：匿名登录，即用即走
- **AI辅助**：不替代思考，而是引导深入
- **原子笔记**：每条笔记都是独立、完整的思考单元
- **MVP优先**：核心功能先行，逐步迭代

## 📝 管理后台

访问 `/admin` 查看：
- 用户统计
- 想法和笔记数据
- 使用量监控

## 🔐 安全特性

- RLS（行级安全策略）保护用户数据
- API密钥后端代理
- 每日用量限制
- 敏感信息环境变量管理

## 📄 License

MIT

---

**仓库地址**: https://github.com/mashimarro/thoughtDistill
