import { supabase } from './client';

/**
 * 获取或创建匿名用户会话
 */
export async function ensureAuth() {
  try {
    // 检查是否已有会话
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      return session;
    }

    // 如果没有会话，创建匿名用户
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error('创建匿名用户失败:', error);
      throw error;
    }

    return data.session;
  } catch (error) {
    console.error('认证失败:', error);
    throw error;
  }
}

/**
 * 获取当前用户的访问令牌
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('获取访问令牌失败:', error);
    return null;
  }
}
