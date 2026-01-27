import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase/server';
import { callAI } from '@/lib/ai/provider';
import { getReflectPrompt } from '@/lib/ai/prompts';
import { checkUserQuota, incrementUserUsage } from '@/lib/rateLimit';

/**
 * POST /api/ai/reflect
 * AI 镜像反射：用用户的原话重新组织，让用户确认
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 检查用量限额
    const hasQuota = await checkUserQuota(user.id);
    if (!hasQuota) {
      return NextResponse.json(
        { error: '今日额度已用完，请明天再试' },
        { status: 429 }
      );
    }

    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: '内容过长（最多5000字）' }, { status: 400 });
    }

    // 调用 AI 进行镜像反射
    const prompt = getReflectPrompt(content);
    const response = await callAI([
      {
        role: 'system',
        content: '你是一个帮助用户梳理思路的助手。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    // 记录用量
    await incrementUserUsage(user.id, response.tokensUsed || 0);

    return NextResponse.json({
      reflection: response.content,
      tokensUsed: response.tokensUsed,
    });
  } catch (error: any) {
    console.error('镜像反射失败:', error);
    return NextResponse.json(
      { error: error.message || 'AI 服务暂时不可用' },
      { status: 500 }
    );
  }
}
