# 思路梳理 - AI 辅助想法整理工具

通过 AI 对话帮助你梳理模糊的想法，沉淀为清晰的卡片笔记。

## 功能特性

- 📝 **记录想法**：快速记录模糊的思绪和灵感
- 🤖 **AI 对话整理**：通过苏格拉底式提问深化思考
- 🎯 **镜像反射**：AI 用你的原话重新组织，确保准确理解
- 📊 **沉淀笔记**：自动生成结构化的卡片笔记
- 🎤 **语音输入**：支持浏览器原生语音识别
- 📦 **三级管理**：收集箱、笔记盒、归档
- 🔒 **来源追溯**：每个观点可追溯到原始对话
- 💾 **多格式导出**：支持 Markdown 下载和复制

## 技术栈

- **前端**：Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **后端**：Next.js API Routes
- **数据库**：Supabase (PostgreSQL)
- **AI**：DeepSeek API
- **认证**：Supabase Auth (支持匿名用户)
- **状态管理**：React Hooks
- **部署**：Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 3. 配置数据库

在 Supabase SQL Editor 中执行 `database-setup.sql`。

详细配置步骤请参考 [SETUP.md](./SETUP.md)。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   │   ├── ideas/         # 想法 CRUD
│   │   ├── conversations/ # 对话记录
│   │   ├── ai/            # AI 相关接口
│   │   └── notes/         # 笔记 CRUD
│   ├── record/            # 记录新想法页面
│   ├── organize/          # 整理想法页面
│   └── notebook/          # 笔记盒页面
├── components/            # React 组件
│   ├── VoiceInput.tsx     # 语音输入组件
│   ├── ChatInterface.tsx  # 对话界面组件
│   └── ...
├── lib/                   # 工具库
│   ├── supabase/          # Supabase 客户端
│   ├── ai/                # AI 相关工具
│   ├── utils/             # 工具函数
│   └── rateLimit.ts       # 用量限制
├── types/                 # TypeScript 类型定义
└── database-setup.sql     # 数据库初始化脚本
```

## 核心功能流程

### 1. 记录新想法
用户输入想法 → AI 生成标题 → 保存到收集箱 → 询问是否立即整理

### 2. 整理想法（核心流程）
加载想法 → **镜像反射**（AI 用原话重组） → **苏格拉底提问**（深化思考） → 判断是否可沉淀 → **生成笔记** → 用户确认 → 保存到笔记盒

### 3. 查看和管理笔记
笔记盒列表（瀑布流/列表布局） → 笔记详情 → 编辑/复制/下载/归档

## AI 原则

1. **不新增**：AI 不得提出任何用户未表达过的观点
2. **可追溯**：每条观点必须附带原话证据
3. **打破砂锅问到底**：出现模糊时必须要求用户澄清
4. **分级论证**：核心观点必须有支撑依据
5. **确认与输出**：只有用户确认的观点才可保存

## 安全防护

- ✅ API Key 存储在服务端，前端无法访问
- ✅ 用量限制：每用户每天 50 次 AI 请求
- ✅ 行级安全策略（RLS）：用户只能访问自己的数据
- ✅ 输入验证：限制内容长度，防止滥用

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

### Supabase 生产环境

在 Supabase Dashboard 中配置：
- Site URL: 你的生产域名
- Redirect URLs: 你的生产域名/**

## 开发计划

- [x] 基础架构搭建
- [x] 记录和整理想法
- [x] AI 对话功能
- [x] 笔记生成和管理
- [x] 语音输入
- [ ] 笔记间关联推荐
- [ ] 图谱可视化
- [ ] 移动端 App (React Native)

## 许可证

MIT

## 联系方式

如有问题或建议，欢迎提 Issue。
