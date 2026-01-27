import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getUserFromRequest } from '@/lib/supabase/server';

/**
 * GET /api/conversations?idea_id=xxx
 * 获取对话历史
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('idea_id');

    if (!ideaId) {
      return NextResponse.json({ error: '缺少 idea_id 参数' }, { status: 400 });
    }

    // 验证想法是否属于用户
    const { data: idea } = await supabaseAdmin
      .from('ideas')
      .select('id')
      .eq('id', ideaId)
      .eq('user_id', user.id)
      .single();

    if (!idea) {
      return NextResponse.json({ error: '想法不存在' }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('idea_id', ideaId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('获取对话历史失败:', error);
      return NextResponse.json({ error: '获取失败' }, { status: 500 });
    }

    return NextResponse.json({ conversations: data });
  } catch (error) {
    console.error('获取对话历史异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

/**
 * POST /api/conversations
 * 添加对话记录
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { idea_id, role, content, metadata } = await request.json();

    if (!idea_id || !role || !content) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 验证想法是否属于用户
    const { data: idea } = await supabaseAdmin
      .from('ideas')
      .select('id')
      .eq('id', idea_id)
      .eq('user_id', user.id)
      .single();

    if (!idea) {
      return NextResponse.json({ error: '想法不存在' }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        idea_id,
        role,
        content,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('创建对话记录失败:', error);
      return NextResponse.json({ error: '创建失败' }, { status: 500 });
    }

    return NextResponse.json({ conversation: data }, { status: 201 });
  } catch (error) {
    console.error('创建对话记录异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
