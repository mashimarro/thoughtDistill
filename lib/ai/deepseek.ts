import axios from 'axios';
import { AIResponse } from '@/types';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekOptions {
  temperature?: number;
  max_tokens?: number;
}

/**
 * 调用 DeepSeek API
 */
export async function callDeepSeek(
  messages: DeepSeekMessage[],
  options: DeepSeekOptions = {}
): Promise<AIResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('缺少 DeepSeek API Key');
  }

  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return {
      content: response.data.choices[0].message.content,
      tokensUsed: response.data.usage?.total_tokens,
    };
  } catch (error) {
    console.error('DeepSeek API 调用失败:', error);
    throw new Error('AI 服务暂时不可用，请稍后再试');
  }
}

/**
 * 生成标题（概括内容）
 */
export async function generateTitle(content: string): Promise<string> {
  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: '你是一个标题生成助手。根据用户的想法内容，生成一个简短的标题（少于20字），准确概括核心内容。',
    },
    {
      role: 'user',
      content: `请为以下内容生成一个标题（少于20字）：\n\n${content}`,
    },
  ];

  const response = await callDeepSeek(messages, { temperature: 0.5, max_tokens: 50 });
  return response.content.trim().replace(/^["']|["']$/g, ''); // 移除引号
}
