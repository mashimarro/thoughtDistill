// 用户类型
export interface User {
  id: string;
  email?: string;
  created_at: string;
}

// 想法状态
export type IdeaStatus = 'inbox' | 'notebook' | 'archived';

// 想法类型
export interface Idea {
  id: string;
  user_id: string;
  title: string;
  content: string;
  status: IdeaStatus;
  created_at: string;
  updated_at: string;
}

// 对话角色
export type ConversationRole = 'user' | 'assistant' | 'system';

// 对话消息
export interface Conversation {
  id: string;
  idea_id: string;
  role: ConversationRole;
  content: string;
  timestamp: string;
  metadata?: {
    quotedText?: string;
    messageId?: string;
    direction?: string;
    direction_status?: 'incomplete' | 'complete';
  };
}

// 笔记类型
export interface Note {
  id: string;
  idea_id?: string;
  user_id: string;
  title: string;
  core_content: string;
  supporting_reasons: string[];
  importance: string;
  applications: string;
  related_notes: Array<{
    id: string;
    relationship: string;
  }>;
  source: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// 用量统计
export interface UserUsage {
  user_id: string;
  requests_today: number;
  tokens_used: number;
  last_reset_date: string;
  created_at: string;
}

// AI 响应类型
export interface AIResponse {
  content: string;
  tokensUsed?: number;
}

// 笔记生成请求
export interface NoteSynthesisRequest {
  ideaId: string;
  conversations: Conversation[];
}

// 笔记生成响应
export interface NoteSynthesisResponse {
  title: string;
  core_content: string;
  supporting_reasons: string[];
  importance: string;
  applications: string;
  source: string;
  tags: string[];
}
