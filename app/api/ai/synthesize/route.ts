import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase/server';
import { callAI } from '@/lib/ai/provider';
import { getSynthesizePrompt } from '@/lib/ai/prompts';
import { validateJSONResponse } from '@/lib/ai/validation';
import { checkUserQuota, incrementUserUsage } from '@/lib/rateLimit';
import { NoteSynthesisResponse } from '@/types';

/**
 * POST /api/ai/synthesize
 * 生成结构化笔记
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

    const { conversations } = await request.json();

    if (!conversations || !Array.isArray(conversations)) {
      return NextResponse.json({ error: '对话历史格式错误' }, { status: 400 });
    }

    // 调用 AI 生成笔记
    const prompt = getSynthesizePrompt(conversations);
    const response = await callAI(
      [
        {
          role: 'system',
          content: '你是一个笔记生成助手。严格遵循用户原话，不添加推断。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      { temperature: 0.5 }
    );

    // 解析 JSON 响应
    const parsed = validateJSONResponse<NoteSynthesisResponse>(response.content);

    if (!parsed) {
      console.error('笔记生成 JSON 解析失败');
      return NextResponse.json({ error: '笔记生成失败，请重试' }, { status: 500 });
    }

    // 记录用量
    await incrementUserUsage(user.id, response.tokensUsed || 0);

    return NextResponse.json({
      note: parsed,
      tokensUsed: response.tokensUsed,
    });
  } catch (error: any) {
    console.error('笔记生成失败:', error);
    return NextResponse.json(
      { error: error.message || 'AI 服务暂时不可用' },
      { status: 500 }
    );
  }
}
