import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getUserFromRequest } from '@/lib/supabase/server';

/**
 * GET /api/ideas/[id]
 * 获取单个想法详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('ideas')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '想法不存在' }, { status: 404 });
    }

    return NextResponse.json({ idea: data });
  } catch (error) {
    console.error('获取想法详情异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

/**
 * PATCH /api/ideas/[id]
 * 更新想法
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const updates = await request.json();

    // 验证更新字段
    const allowedFields = ['status', 'title', 'content'];
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: '没有有效的更新字段' }, { status: 400 });
    }

    filteredUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('ideas')
      .update(filteredUpdates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    return NextResponse.json({ idea: data });
  } catch (error) {
    console.error('更新想法异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

/**
 * DELETE /api/ideas/[id]
 * 删除想法
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { error } = await supabaseAdmin
      .from('ideas')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除想法异常:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
