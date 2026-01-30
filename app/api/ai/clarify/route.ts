import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase/server';
import { callAI } from '@/lib/ai/provider';
import { getSocraticPrompt } from '@/lib/ai/prompts';
import { validateJSONResponse } from '@/lib/ai/validation';
import { checkUserQuota, incrementUserUsage } from '@/lib/rateLimit';
import { Conversation } from '@/types';

/**
 * POST /api/ai/clarify
 * 苏格拉底式提问：帮助用户深化思考
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

    const { conversations, ideaContent } = await request.json();

    if (!conversations || !Array.isArray(conversations)) {
      return NextResponse.json({ error: '对话历史格式错误' }, { status: 400 });
    }

    if (!ideaContent) {
      return NextResponse.json({ error: '缺少原始想法内容' }, { status: 400 });
    }

    // 调用 AI 进行苏格拉底式提问
    const prompt = getSocraticPrompt(ideaContent, conversations);
    const response = await callAI([
      {
        role: 'system',
        content: '你是一个苏格拉底式提问助手。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    // 解析 JSON 响应
    const parsed = validateJSONResponse<{
      progress: {
        dimensions: Array<{
          name: string;
          name_incomplete: string;
          status: 'complete' | 'incomplete';
          icon: string;
        }>;
      };
      question: string;
      target_dimension: string;
      ready_for_note: boolean;
    }>(response.content);

    // 记录用量
    await incrementUserUsage(user.id, response.tokensUsed || 0);

    if (!parsed) {
      // 如果解析失败，直接返回文本（AI 可能用自然语言回复）
      return NextResponse.json({
        question: response.content,
        progress: null,
        readiness: { ready: false },
        tokensUsed: response.tokensUsed,
      });
    }

    // 返回包含进度轴的响应
    return NextResponse.json({
      question: parsed.question,
      progress: parsed.progress,
      target_dimension: parsed.target_dimension,
      readiness: {
        ready: parsed.ready_for_note,
        reason: parsed.target_dimension,
      },
      tokensUsed: response.tokensUsed,
    });
  } catch (error: any) {
    console.error('苏格拉底提问失败:', error);
    return NextResponse.json(
      { error: error.message || 'AI 服务暂时不可用' },
      { status: 500 }
    );
  }
}
