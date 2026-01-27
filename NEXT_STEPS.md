# 下一步操作指南

✅ **项目代码已完成**
✅ **依赖已安装**（406 个包）

现在需要配置外部服务才能运行项目。

---

## 📋 必需配置清单

### 1️⃣ 配置 Supabase（5-10 分钟）

**步骤：**

1. 访问 https://supabase.com 并注册/登录
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - Name: 思路梳理（或任意名称）
   - Database Password: 设置一个强密码（请记住）
   - Region: 选择 Northeast Asia (Tokyo) 或 Southeast Asia (Singapore)
4. 等待项目创建完成（约 2 分钟）
5. 在项目主页找到以下信息：
   - Project Settings > API > Project URL（复制）
   - Project Settings > API > anon public（复制）
   - Project Settings > API > service_role（复制，注意保密）

6. **执行数据库初始化：**
   - 点击左侧菜单 "SQL Editor"
   - 点击 "New query"
   - 打开本项目的 `database-setup.sql` 文件
   - 复制所有内容粘贴到 SQL Editor
   - 点击 "Run" 执行
   - 看到 "Success" 表示成功

7. **配置认证设置：**
   - Authentication > Settings
   - 启用 "Email" provider
   - 启用 "Anonymous sign-ins"（重要！支持匿名用户）
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

### 2️⃣ 配置 DeepSeek API（2-3 分钟）

**步骤：**

1. 访问 https://platform.deepseek.com
2. 注册/登录账号
3. 进入 API Keys 页面
4. 点击 "Create API Key"
5. 复制生成的 API Key（以 `sk-` 开头）
6. **充值账户**（DeepSeek 很便宜，充 10 元可以用很久）

### 3️⃣ 填写环境变量（1 分钟）

编辑项目根目录的 `.env.local` 文件：

```env
# 填入 Supabase 的三个配置
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...（很长的字符串）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...（另一个很长的字符串）

# 填入 DeepSeek 的 API Key
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx
```

---

## 🚀 启动项目

配置完成后，在终端运行：

```bash
npm run dev
```

然后访问 http://localhost:3000

---

## ✨ 功能测试流程

### 测试 1：记录新想法
1. 点击首页"记录新想法"按钮
2. 输入一段想法（可以测试语音输入）
3. 点击"保存想法"
4. 选择"立即整理"

### 测试 2：AI 对话整理
1. AI 会用你的原话重新组织（镜像反射）
2. 确认后，AI 开始苏格拉底式提问
3. 回答 AI 的问题，逐步深化思考
4. 当满足条件时，AI 会提示"生成笔记"

### 测试 3：笔记管理
1. 生成笔记后，预览并确认
2. 保存到笔记盒
3. 在笔记盒可以：
   - 切换瀑布流/列表布局
   - 查看笔记详情
   - 编辑/复制/下载笔记
   - 归档笔记

---

## 🐛 常见问题

### Q: 启动时报错 "缺少 Supabase 环境变量"
A: 检查 `.env.local` 文件是否正确填写了所有变量，确保没有多余的引号。

### Q: 保存想法时报 401 错误
A: Supabase 认证未配置，确保在 Authentication > Settings 中启用了 "Anonymous sign-ins"。

### Q: AI 响应时报错 "今日额度已用完"
A: 这是正常的限流机制（每天 50 次），可以在 `lib/rateLimit.ts` 中调整限额。

### Q: 语音输入按钮不显示
A: 需要使用 Chrome/Edge 浏览器，并且在 https 或 localhost 环境下。

### Q: npm run dev 报端口占用
A: 修改端口：`npm run dev -- -p 3001`

---

## 📊 项目完成度

- ✅ 项目结构搭建
- ✅ 所有页面和组件
- ✅ API 路由（ideas, conversations, notes, AI）
- ✅ 数据库设计和迁移脚本
- ✅ 安全防护（用量限制、RLS）
- ✅ 语音输入
- ✅ 笔记导出（Markdown）
- ✅ 响应式设计
- ⏳ 等待配置 Supabase 和 DeepSeek

---

## 📞 需要帮助？

如果遇到问题：
1. 检查 `.env.local` 是否正确填写
2. 确认 Supabase 数据库脚本已执行
3. 查看浏览器控制台错误信息
4. 查看终端错误日志

配置完成后，你将拥有一个功能完整的 AI 辅助想法整理工具！🎉
