# 项目配置指南

## 1. 安装依赖

如果 `npm install` 还未完成，请等待它完成。如果遇到问题，可以手动运行：

```bash
npm install
```

## 2. 配置 Supabase

### 2.1 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账号
3. 创建新项目
4. 记录以下信息：
   - Project URL（项目 URL）
   - anon key（匿名密钥）
   - service_role key（服务角色密钥）

### 2.2 执行数据库迁移

在 Supabase 项目的 SQL Editor 中，执行 `database-setup.sql` 文件中的所有 SQL 语句。

## 3. 配置环境变量

1. 复制 `.env.example` 为 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```

2. 编辑 `.env.local`，填入实际的配置：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=你的supabase项目URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
   SUPABASE_SERVICE_ROLE_KEY=你的service_role_key
   DEEPSEEK_API_KEY=你的deepseek_api_key
   ```

## 4. 获取 DeepSeek API Key

1. 访问 [https://platform.deepseek.com](https://platform.deepseek.com)
2. 注册/登录账号
3. 在 API Keys 页面创建新的 API Key
4. 将 API Key 填入 `.env.local`

## 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 6. 测试功能

### 6.1 记录新想法
1. 点击"记录新想法"
2. 输入一段想法（可以使用语音输入）
3. 保存

### 6.2 整理想法
1. 点击"整理已有想法"
2. 选择一个想法开始整理
3. 与 AI 对话，深化思考

### 6.3 查看笔记
1. 整理完成后，笔记会保存到笔记盒
2. 点击"笔记盒"查看所有笔记
3. 可以切换瀑布流/列表布局

## 常见问题

### Q: npm install 安装很慢
A: 可以使用国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Q: 语音输入不工作
A: 语音输入需要 HTTPS 或 localhost 环境，确保使用 Chrome/Edge 浏览器。

### Q: AI 响应很慢
A: DeepSeek API 在国内访问可能较慢，这是正常现象。

### Q: 数据库连接失败
A: 检查 Supabase URL 和 API Keys 是否正确填写在 `.env.local` 中。

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（与 `.env.local` 相同）
4. 部署

## 注意事项

- `.env.local` 文件不会被提交到 Git（已在 .gitignore 中）
- DeepSeek API Key 请妥善保管，不要泄露
- Supabase service_role key 拥有完整数据库权限，仅在服务端使用
