import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getUserFromRequest } from '@/lib/supabase/server';

/**
 * GET /api/notes
 * 获取笔记列表
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // 如果请求归档的笔记，通过 idea 的 status 来过滤
    if (status === 'archived') {
      const { data, error } = await supabaseAdmin
        .from('notes')
        .select('*, ideas!inner(status)')
        .eq('user_id', user.id)
        .eq('ideas.status', 'archived')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取归档笔记失败:', error);
        return NextResponse.json({ error: '获取失败' }, { status: 500 });
      }

      return NextResponse.json({ notes: data });
    }

    // 默认只返回活跃的笔记（关联的 idea 不是 archived）
    const { data, error} = await supabaseAdmin
      .from('notes')
      .select('*, ideas!inner(status)')
      .eq('user_id', user.id)
      .neq('ideas.status', 'archived')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取笔记列表失败:', error);
      return NextResponse.json({ error: '获取失败' }, { status: 500 });
    }

    return NextResponse.json({ notes: data });
  } catch (error) {
    console.error('获取笔记列表异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

/**
 * POST /api/notes
 * 创建新笔记
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const noteData = await request.json();

    const { data, error } = await supabaseAdmin
      .from('notes')
      .insert({
        ...noteData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('创建笔记失败:', error);
      return NextResponse.json({ error: '创建失败' }, { status: 500 });
    }

    // 如果有关联的想法，将想法状态更新为 notebook
    if (noteData.idea_id) {
      await supabaseAdmin
        .from('ideas')
        .update({ status: 'notebook' })
        .eq('id', noteData.idea_id);
    }

    return NextResponse.json({ note: data }, { status: 201 });
  } catch (error) {
    console.error('创建笔记异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
