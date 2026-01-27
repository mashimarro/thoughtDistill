# 更新日志 - 2026-01-26

## 已完成的7项改进

### 1. ✅ 侧边栏导航 - 参考 Claude.ai 风格
- 创建了 `components/Sidebar.tsx` 侧边栏组件
- **收集箱**和**笔记盒**作为根目录，可点击展开/收起
- 显示想法和笔记的数量标记
- 列表项可点击直接跳转
- 首页不显示侧边栏，其他页面都显示
- 底部固定"记录新想法"按钮

### 2. ✅ 移除语音输入功能
- 注释掉了 `VoiceInput` 组件的导入和使用
- 从记录页面和聊天界面移除了语音输入按钮
- MVP 阶段暂时取消，留待后续迭代

### 3. ✅ 对话加载动画
- 在 `ChatInterface` 组件中添加了等待动画（三个跳动的圆点）
- 在 `organize/[id]/page.tsx` 中增加了 `isWaitingForAI` 状态
- AI 响应延迟时，会显示...动画

### 4. ✅ 移除消息时间戳
- 从聊天消息中移除了时间戳显示
- 界面更简洁，类似 Claude.ai 的对话风格

### 5. ✅ 改进 AI 提问逻辑 - 严格中立，不引导观点
更新了 `lib/ai/prompts.ts` 中的 `getSocraticPrompt`：

**改进内容**：
- **核心原则**：绝对不引导用户观点
- **只针对用户说的话提问**：直接引用用户表述，要求澄清或举例
- **暴露模糊之处**：当用户使用抽象词汇时，要求给出具体定义和例子
- **追问矛盾**：如果用户前后表述不一致，指出并询问
- **不提供答案或建议**：AI 只问问题，不给方向

**提问策略优先级**：
1. 用户使用抽象概念 → "能否举一个具体例子？"
2. 用户表述不清 → "具体指什么？"
3. 用户未说明原因 → "为什么认为XX？基于什么？"
4. 观点可能矛盾 → "XX和YY如何一致？"
5. 论述有跳跃 → "中间的逻辑是什么？"

### 6. ✅ 改进"生成笔记"按钮逻辑
- 修改了按钮显示条件：只有当 `stage === 'ready'` 时才显示
- 在 `handleUserMessage` 中，只有当 AI 明确判断 `readiness.ready === true` 时，才设置为 ready
- 确保 AI 仍在提问时，用户看不到"生成笔记"按钮

### 7. ✅ 集成通义千问 API

新增文件：
- **`lib/ai/qwen.ts`** - 通义千问 API 调用
- **`lib/ai/provider.ts`** - AI 服务提供商统一接口

更新的文件：
- 所有 API 路由（`/api/ideas/route.ts`, `/api/ai/reflect/route.ts`, `/api/ai/clarify/route.ts`, `/api/ai/synthesize/route.ts`）
- 全部改为使用 `callAI` 统一接口

**配置方式**：
在 `.env.local` 中添加：
```env
# 通义千问 API Key（访问 https://dashscope.aliyun.com 获取）
QWEN_API_KEY=sk-xxxxx

# 选择 AI 提供商（deepseek 或 qwen）
AI_PROVIDER=qwen
```

默认使用 DeepSeek，设置 `AI_PROVIDER=qwen` 即可切换到通义千问。

---

## 如何测试通义千问

1. 访问 https://dashscope.aliyun.com
2. 注册并获取 API Key
3. 在 `.env.local` 中添加：
   ```
   QWEN_API_KEY=你的API密钥
   AI_PROVIDER=qwen
   ```
4. 重启开发服务器（`Ctrl+C` 停止，然后 `npm run dev`）
5. 测试记录新想法、AI 对话等功能

---

## 技术细节

### 侧边栏布局结构
```
<div className="flex h-screen">
  <Sidebar /> {/* 固定宽度 256px */}
  <main className="flex-1"> {/* 自适应剩余宽度 */}
    {children}
  </main>
</div>
```

### AI 服务切换原理
通过环境变量 `AI_PROVIDER` 动态选择：
- `deepseek`（默认）→ 调用 DeepSeek API
- `qwen` → 调用通义千问 API

两个 API 的接口已统一，切换时无需修改代码。

---

## 注意事项

1. **侧边栏数据刷新**：点击展开收集箱/笔记盒时，会自动加载最新数据
2. **AI 提问改进**：需要测试 AI 是否真正做到"不引导"，如果还有引导行为，可能需要进一步调整 prompt
3. **通义千问模型**：默认使用 `qwen-plus`，可在 `lib/ai/qwen.ts` 中修改为 `qwen-turbo`（更快更便宜）或 `qwen-max`（更强）

---

## 下一步建议

1. **测试 AI 提问质量**：对比 DeepSeek 和通义千问在提问中立性上的表现
2. **侧边栏优化**：可以考虑添加搜索功能、标签筛选等
3. **移动端适配**：当前侧边栏在小屏幕上可能需要优化（可以改成抽屉式）
