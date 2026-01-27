/**
 * 通义千问 API 集成
 */

import { AIResponse } from '@/types';

interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface QwenOptions {
  temperature?: number;
  max_tokens?: number;
}

interface QwenResponse {
  output: {
    choices: Array<{
      message: {
        content: string;
        role: string;
      };
      finish_reason: string;
    }>;
  };
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

/**
 * 调用通义千问 API
 */
export async function callQwen(
  messages: QwenMessage[],
  options: QwenOptions = {}
): Promise<AIResponse> {
  const apiKey = process.env.QWEN_API_KEY;

  if (!apiKey) {
    throw new Error('QWEN_API_KEY 未配置');
  }

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-plus', // 可选：qwen-turbo, qwen-plus, qwen-max
        input: {
          messages,
        },
        parameters: {
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 2000,
          result_format: 'message',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('通义千问 API 错误:', errorText);
      throw new Error(`通义千问 API 返回错误: ${response.status}`);
    }

    const data: QwenResponse = await response.json();
    
    // 通义千问的响应格式
    if (data.output && data.output.choices && data.output.choices.length > 0) {
      return {
        content: data.output.choices[0].message.content,
        tokensUsed: data.usage?.total_tokens,
      };
    }

    throw new Error('通义千问返回数据格式错误');
  } catch (error) {
    console.error('调用通义千问失败:', error);
    throw new Error('AI 服务暂时不可用，请稍后再试');
  }
}

/**
 * 使用通义千问生成标题
 */
export async function generateTitleWithQwen(content: string): Promise<string> {
  const messages: QwenMessage[] = [
    {
      role: 'system',
      content: '你是一个擅长总结的助手。请为用户的想法生成一个简洁的标题，不超过20个字，概括核心内容。',
    },
    {
      role: 'user',
      content: `请为以下想法生成一个简洁标题（不超过20字）：\n\n${content}`,
    },
  ];

  const response = await callQwen(messages, { temperature: 0.5, max_tokens: 50 });
  
  // 清理响应，去除可能的引号和多余空格
  return response.content.trim().replace(/^["']|["']$/g, '').slice(0, 20);
}
