-- =====================================================
-- 思路梳理产品 - 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此文件
-- =====================================================

-- 创建 ideas 表（想法记录）
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT CHECK (status IN ('inbox', 'notebook', 'archived')) DEFAULT 'inbox',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 conversations 表（对话历史）
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 创建 notes 表（结构化笔记）
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  core_content TEXT NOT NULL,
  supporting_reasons TEXT[],
  importance TEXT,
  applications TEXT,
  related_notes JSONB DEFAULT '[]'::jsonb,
  source TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 user_usage 表（用量统计）
CREATE TABLE IF NOT EXISTS user_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  requests_today INT DEFAULT 0,
  tokens_used INT DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 创建索引以提升查询性能
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_conversations_idea_id ON conversations(idea_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_idea_id ON notes(idea_id);

-- =====================================================
-- 设置行级安全策略 (RLS)
-- =====================================================

-- 启用 RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Ideas 表的 RLS 策略
CREATE POLICY "Users can view own ideas" ON ideas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas" ON ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Conversations 表的 RLS 策略
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (
    idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (
    idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (
    idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid())
  );

-- Notes 表的 RLS 策略
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- User Usage 表的 RLS 策略
CREATE POLICY "Users can view own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON user_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 创建数据库函数
-- =====================================================

-- 用于原子更新用量的函数
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID, p_tokens INT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_usage (user_id, requests_today, tokens_used, last_reset_date)
  VALUES (p_user_id, 1, p_tokens, CURRENT_DATE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    requests_today = CASE
      WHEN user_usage.last_reset_date < CURRENT_DATE THEN 1
      ELSE user_usage.requests_today + 1
    END,
    tokens_used = CASE
      WHEN user_usage.last_reset_date < CURRENT_DATE THEN p_tokens
      ELSE user_usage.tokens_used + p_tokens
    END,
    last_reset_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 配置 Supabase Auth
-- =====================================================

-- 在 Supabase Dashboard > Authentication > Settings 中配置：
-- 
-- 1. 启用 Email Auth
-- 2. 启用 Anonymous Sign-ins (可选登录功能需要)
-- 3. Site URL: http://localhost:3000 (开发环境)
-- 4. Redirect URLs: http://localhost:3000/** (允许所有本地路径)
--
-- 生产环境需要修改为实际域名

-- =====================================================
-- 完成！
-- =====================================================

-- 执行以下查询验证表是否创建成功：
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ideas', 'conversations', 'notes', 'user_usage');

-- 应该返回 4 行结果
