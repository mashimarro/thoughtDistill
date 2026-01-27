import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getUserFromRequest } from '@/lib/supabase/server';
import { generateTitle } from '@/lib/ai/provider';
import { generateNoteId } from '@/lib/utils/format';

/**
 * GET /api/ideas
 * 获取想法列表
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取想法列表失败:', error);
      return NextResponse.json({ error: '获取失败' }, { status: 500 });
    }

    return NextResponse.json({ ideas: data });
  } catch (error) {
    console.error('获取想法列表异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

/**
 * POST /api/ideas
 * 创建新想法
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: '内容过长' }, { status: 400 });
    }

    // 使用 AI 生成标题
    let title: string;
    try {
      title = await generateTitle(content);
    } catch (error) {
      console.error('生成标题失败:', error);
      // 如果 AI 失败，使用临时标题
      title = content.slice(0, 20).replace(/\s+/g, ' ').trim();
    }

    // 生成完整标题（带时间戳）
    const fullTitle = generateNoteId(title);

    const { data, error } = await supabaseAdmin
      .from('ideas')
      .insert({
        user_id: user.id,
        title: fullTitle,
        content,
        status: 'inbox',
      })
      .select()
      .single();

    if (error) {
      console.error('创建想法失败:', error);
      return NextResponse.json({ error: '创建失败' }, { status: 500 });
    }

    return NextResponse.json({ idea: data }, { status: 201 });
  } catch (error) {
    console.error('创建想法异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
