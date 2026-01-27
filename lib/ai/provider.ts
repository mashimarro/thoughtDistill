/**
 * AI 服务提供商统一接口
 */

import { callDeepSeek, generateTitle as generateTitleDeepSeek } from './deepseek';
import { callQwen, generateTitleWithQwen } from './qwen';
import { AIResponse } from '@/types';

type AIProvider = 'deepseek' | 'qwen';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIOptions {
  temperature?: number;
  max_tokens?: number;
}

/**
 * 获取当前配置的 AI 提供商
 */
function getProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'deepseek';
  return provider as AIProvider;
}

/**
 * 统一的 AI 调用接口
 */
export async function callAI(
  messages: AIMessage[],
  options: AIOptions = {}
): Promise<AIResponse> {
  const provider = getProvider();

  if (provider === 'qwen') {
    return await callQwen(messages, options);
  }

  // 默认使用 DeepSeek
  return await callDeepSeek(messages, options);
}

/**
 * 统一的标题生成接口
 */
export async function generateTitle(content: string): Promise<string> {
  const provider = getProvider();

  if (provider === 'qwen') {
    return await generateTitleWithQwen(content);
  }

  // 默认使用 DeepSeek
  return await generateTitleDeepSeek(content);
}
