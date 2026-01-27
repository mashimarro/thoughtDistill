import { ensureAuth } from './supabase/auth';

/**
 * 封装的 API 调用函数，自动处理认证
 */
export async function apiCall(url: string, options: RequestInit = {}) {
  try {
    // 确保用户已认证
    const session = await ensureAuth();
    
    if (!session) {
      throw new Error('无法创建用户会话');
    }

    // 添加认证头
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  } catch (error) {
    console.error('API 调用失败:', error);
    throw error;
  }
}
