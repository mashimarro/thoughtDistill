import { supabaseAdmin } from './supabase/server';

const DAILY_REQUEST_LIMIT = 50; // 每个用户每天最多 50 次请求

/**
 * 检查用户今日用量是否超限
 */
export async function checkUserQuota(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 是"未找到记录"的错误码
      console.error('查询用量失败:', error);
      return true; // 出错时允许通过
    }

    // 检查是否需要重置计数器
    const today = new Date().toISOString().split('T')[0];
    
    if (!data || data.last_reset_date !== today) {
      // 第一次使用或新的一天，创建或重置记录
      await supabaseAdmin.from('user_usage').upsert({
        user_id: userId,
        requests_today: 0,
        tokens_used: 0,
        last_reset_date: today,
      });
      return true;
    }

    // 检查是否超过限额
    if (data.requests_today >= DAILY_REQUEST_LIMIT) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('检查用量配额失败:', error);
    return true; // 出错时允许通过
  }
}

/**
 * 递增用户使用次数
 */
export async function incrementUserUsage(userId: string, tokensUsed: number = 0): Promise<void> {
  try {
    const { error } = await supabaseAdmin.rpc('increment_usage', {
      p_user_id: userId,
      p_tokens: tokensUsed,
    });

    if (error) {
      console.error('更新用量失败:', error);
    }
  } catch (error) {
    console.error('递增用量失败:', error);
  }
}

/**
 * 获取用户今日剩余配额
 */
export async function getUserRemainingQuota(userId: string): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_usage')
      .select('requests_today')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return DAILY_REQUEST_LIMIT;
    }

    return Math.max(0, DAILY_REQUEST_LIMIT - data.requests_today);
  } catch (error) {
    console.error('获取剩余配额失败:', error);
    return DAILY_REQUEST_LIMIT;
  }
}
